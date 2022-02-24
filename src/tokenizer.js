// @ts-check
import fs from "fs";
import camelCase from "lodash.camelcase";
import axios from "axios";
import log from "./log";
import { optimizeSvg } from "./svgo";
import { rgbToHex, roundToDecimal } from "./utils";

export default class Tokenizer {
  constructor({ config, figmaAPI, onlyNew }) {
    this.figmaAPI = figmaAPI;
    this.config = config;
    this.tokens = onlyNew
      ? this.readTokens()
      : config.tokenize.tokens.reduce((acc, val) => {
          acc[val.name] = {};
          return acc;
        }, {});
  }

  async tokenize() {
    await Promise.all([
      this.handleStyles(),
      this.handleBorderRadius(),
      this.handleWidth(),
      this.handleHeight(),
      this.handleDimensions(),
      this.handleSvg(),
    ]);
  }

  async handleStyles() {
    const styles = await this.figmaAPI.fetchStyles();

    const stylesById = styles.reduce((acc, style) => {
      let name = style.name;
      let group = "";

      if (style.name.includes("/")) {
        const parts = style.name.split("/");
        group = parts.shift();
        name = parts.join(" ");
      }

      const id = style.node_id;

      acc[id] = {
        id,
        group: (group || "").trim().toLowerCase(),
        name: this.formatTokenName(name),
        type: style.style_type,
      };

      return acc;
    }, {});

    const nodes = await this.figmaAPI.fetchNodes(Object.keys(stylesById));

    Object.entries(nodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (
        style.type === "FILL" &&
        doc.fills[0].type === "SOLID" &&
        this.hasTokenType("color")
      ) {
        // COLORS --------------------------------------------------------------
        const tokenName = this.getTokenNameByType("color");
        const fill = doc.fills[0];
        const { r, g, b } = fill.color;

        let color = "";

        if (typeof fill.opacity === "number") {
          const alpha = parseFloat(fill.opacity.toFixed(2));
          color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`; // prettier-ignore
        } else {
          color = rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
          );
        }

        if (style.group) {
          if (!this.tokens[tokenName][style.group]) {
            this.tokens[tokenName][style.group] = {};
          }

          this.tokens[tokenName][style.group][style.name] = color;
        } else {
          this.tokens[tokenName][style.name] = color;
        }
      } else if (
        style.type === "FILL" &&
        doc.fills[0].type === "GRADIENT_LINEAR" &&
        this.hasTokenType("linear-gradient")
      ) {
        // GRADIENTS -----------------------------------------------------------
        const tokenName = this.getTokenNameByType("linear-gradient");
        const { gradientStops, gradientHandlePositions } = doc.fills[0];
        const colors = gradientStops.map((stop) => {
          const { x, y } = gradientHandlePositions[stop.position];
          const { r, g, b } = stop.color;

          const hex = rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
          );

          return {
            hex,
            // TODO: add rgba
            x: roundToDecimal(x),
            y: roundToDecimal(y),
          };
        });

        this.tokens[tokenName][style.name] = colors;
      } else if (style.type === "TEXT" && this.hasTokenType("text")) {
        // TYPOGRAPHY ----------------------------------------------------------
        const tokenName = this.getTokenNameByType("text");
        const textStyle = doc.style;
        const textToken = {
          fontFamily: textStyle.fontFamily,
          fontWeight: textStyle.fontWeight,
          fontSize: textStyle.fontSize,
          textTransform: textStyle.textCase === "UPPER" ? "uppercase" : "none",
          letterSpacing: textStyle.letterSpacing,
          lineHeight: parseFloat(
            (textStyle.lineHeightPx / textStyle.fontSize).toFixed(3)
          ),
        };

        if (style.group) {
          if (!this.tokens[tokenName][style.group]) {
            this.tokens[tokenName][style.group] = {};
          }

          this.tokens[tokenName][style.group][style.name] = textToken;
        } else {
          this.tokens[tokenName][style.name] = textToken;
        }
      } else if (
        style.type === "EFFECT" &&
        doc.effects[0].type === "DROP_SHADOW" &&
        this.hasTokenType("drop-shadow")
      ) {
        // SHADOWS -------------------------------------------------------------
        const tokenName = this.getTokenNameByType("drop-shadow");
        const shadow = doc.effects[0]; // TODO: handle multiple shadows
        const { r, g, b, a } = shadow.color;
        const alpha = parseFloat(a.toFixed(2));
        const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`; // prettier-ignore
        const hex = rgbToHex(
          Math.round(r * 255),
          Math.round(g * 255),
          Math.round(b * 255)
        );

        this.tokens[tokenName][style.name] = {
          boxShadow: `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`,
          offset: shadow.offset,
          radius: shadow.radius,
          opacity: alpha,
          color: { hex, rgba },
        };
      }
    });
  }

  async handleHeight() {
    if (this.hasTokenType("height")) {
      const nodeIds = this.getAllTokenNodeIds("height");

      for (const nodeId of nodeIds) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          const name = this.formatTokenName(node.name);
          const tokenName = this.getTokenNameByNodeId(nodeId);

          this.tokens[tokenName][name] = roundToDecimal(
            node.absoluteBoundingBox.height
          );
        });
      }
    }
  }

  async handleWidth() {
    if (this.hasTokenType("width")) {
      const nodeIds = this.getAllTokenNodeIds("width");

      for (const nodeId of nodeIds) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          const name = this.formatTokenName(node.name);
          const tokenName = this.getTokenNameByNodeId(nodeId);

          this.tokens[tokenName][name] = roundToDecimal(
            node.absoluteBoundingBox.width
          );
        });
      }
    }
  }

  async handleDimensions() {
    if (this.hasTokenType("dimensions")) {
      const nodeIds = this.getAllTokenNodeIds("dimensions");

      for (const nodeId of nodeIds) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          const name = this.formatTokenName(node.name);
          const tokenName = this.getTokenNameByNodeId(nodeId);

          this.tokens[tokenName][name] = {
            height: roundToDecimal(node.absoluteBoundingBox.height),
            width: roundToDecimal(node.absoluteBoundingBox.width),
          };
        });
      }
    }
  }

  async handleBorderRadius() {
    if (this.hasTokenType("radius")) {
      const nodeIds = this.getAllTokenNodeIds("radius");

      for (const nodeId of nodeIds) {
        const radiiNodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        radiiNodes.forEach((node) => {
          const name = this.formatTokenName(node.name);
          const tokenName = this.getTokenNameByNodeId(nodeId);

          this.tokens[tokenName][name] = roundToDecimal(
            node.children[0].cornerRadius
          );
        });
      }
    }
  }

  async handleSvg() {
    if (this.hasTokenType("svg")) {
      const nodeIds = this.getAllTokenNodeIds("svg");

      for (const nodeId of nodeIds) {
        const tokenName = this.getTokenNameByNodeId(nodeId);
        const current = this.tokens[tokenName];
        const _nodes = await this.figmaAPI.fetchNodeChildren(nodeId);
        const nodes = _nodes.filter((n) => !current[n.name]);

        if (nodes.length === 0) continue;

        const images = await this.figmaAPI.fetchImages(nodes.map((n) => n.id));

        const imageContents = await Promise.all(
          Object.values(images).map((imageUrl) => axios.get(imageUrl))
        );

        const svgOptimized = await Promise.all(
          imageContents.map(async ({ data }) => {
            const optimized = await optimizeSvg(data);
            // @ts-ignore
            return optimized.data;
          })
        );

        const svgs = svgOptimized.reduce((acc, svg, index) => {
          const name = this.formatTokenName(nodes[index].name);
          acc[name] = svg;
          return acc;
        }, {});

        this.tokens[tokenName] = svgs;
      }
    }
  }

  // Helpers ------------------------------------------------------------------

  formatTokenName(name) {
    return camelCase(name);
  }

  hasTokenType(type) {
    return !!this.config.tokenize.tokens.find((t) => t.type === type);
  }

  readTokens() {
    const outDir = this.config.outDir || "tokens";

    try {
      return JSON.parse(fs.readFileSync(`${outDir}/tokens.json`, "utf8"));
    } catch (error) {
      log.error(
        "No tokens found! Make sure to run `figmage tokenize` without any flags first."
      );
      throw error;
    }
  }

  getTokenNameByType(type) {
    return this.config.tokenize.tokens.find((t) => t.type === type).name;
  }

  getTokenNameByNodeId(nodeId) {
    return this.config.tokenize.tokens.find(
      (t) => decodeURIComponent(t.nodeId) === decodeURIComponent(nodeId)
    ).name;
  }

  getTokenNodeId(type) {
    return decodeURIComponent(
      this.config.tokenize.tokens.find((t) => t.type === type).nodeId
    );
  }

  getAllTokenNodeIds(type) {
    return this.config.tokenize.tokens
      .filter((t) => t.type === type)
      .map((t) => decodeURIComponent(t.nodeId));
  }

  write() {
    const outDir = this.config.outDir || "tokens";

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    fs.writeFileSync(
      `${outDir}/tokens.json`,
      JSON.stringify(this.tokens, null, 2)
    );
  }
}
