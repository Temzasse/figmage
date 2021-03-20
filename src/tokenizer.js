// @ts-check
import fs from "fs";
import kebabCase from "lodash.kebabcase";
import axios from "axios";
import svgo from "./svgo";
import log from "./log";
import { rgbToHex, roundToDecimal } from "./utils";

export default class Tokenizer {
  constructor({ config, figmaAPI, onlyNew }) {
    this.figmaAPI = figmaAPI;
    this.config = config;
    this.tokens = onlyNew
      ? this.readTokens()
      : config.tokens.reduce((acc, val) => {
          acc[val.name] = { type: val.type, values: {} };
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
      const id = style.node_id;
      acc[id] = {
        id,
        name: this.formatTokenName(style.name),
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
        const { r, g, b } = doc.fills[0].color;
        const hex = rgbToHex(
          Math.round(r * 255),
          Math.round(g * 255),
          Math.round(b * 255)
        );

        this.tokens[this.getTokenNameByType("color")].values[style.name] = hex;
      } else if (
        style.type === "FILL" &&
        doc.fills[0].type === "GRADIENT_LINEAR" &&
        this.hasTokenType("linear-gradient")
      ) {
        // GRADIENTS ------------------------------------------------------------
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

        this.tokens[this.getTokenNameByType("linear-gradient")].values[
          style.name
        ] = colors;
      } else if (style.type === "TEXT" && this.hasTokenType("text")) {
        // TYPOGRAPHY -----------------------------------------------------------
        const textStyle = doc.style;

        this.tokens[this.getTokenNameByType("text")].values[style.name] = {
          fontFamily: textStyle.fontFamily,
          fontWeight: textStyle.fontWeight,
          fontSize: textStyle.fontSize,
          textTransform: textStyle.textCase === "UPPER" ? "uppercase" : "none",
          letterSpacing: textStyle.letterSpacing,
          lineHeight: parseFloat(
            (textStyle.lineHeightPx / textStyle.fontSize).toFixed(3)
          ),
        };
      } else if (
        style.type === "EFFECT" &&
        doc.effects[0].type === "DROP_SHADOW" &&
        this.hasTokenType("drop-shadow")
      ) {
        // SHADOWS -------------------------------------------------------------
        const shadow = doc.effects[0];
        const { r, g, b, a } = shadow.color;
        // TODO: should we manipulate names?
        // const name = style.name.replace("shadow-", "");
        const opacity = parseFloat(a.toFixed(2));
        const hex = rgbToHex(
          Math.round(r * 255),
          Math.round(g * 255),
          Math.round(b * 255)
        );

        this.tokens[this.getTokenNameByType("drop-shadow")].values[
          style.name
        ] = {
          offset: shadow.offset,
          radius: shadow.radius,
          opacity,
          color: {
            hex,
            rgba: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`, // prettier-ignore
          },
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
          this.tokens[this.getTokenNameByNodeId(nodeId)].values[name] =
            node.absoluteBoundingBox.height;
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
          this.tokens[this.getTokenNameByNodeId(nodeId)].values[name] =
            node.absoluteBoundingBox.width;
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
          this.tokens[this.getTokenNameByNodeId(nodeId)].values[name] = {
            height: node.absoluteBoundingBox.height,
            width: node.absoluteBoundingBox.width,
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
          this.tokens[this.getTokenNameByNodeId(nodeId)].values[name] =
            node.children[0].cornerRadius;
        });
      }
    }
  }

  async handleSvg() {
    if (this.hasTokenType("svg")) {
      const nodeIds = this.getAllTokenNodeIds("svg");

      for (const nodeId of nodeIds) {
        const current = this.tokens[this.getTokenNameByNodeId(nodeId)].values;
        const _nodes = await this.figmaAPI.fetchNodeChildren(nodeId);
        const nodes = _nodes.filter((n) => !current[n.name]);

        if (nodes.length === 0) continue;

        const images = await this.figmaAPI.fetchImages(nodes.map((n) => n.id));

        const imageContents = await Promise.all(
          Object.values(images).map((imageUrl) => axios.get(imageUrl))
        );

        const svgOptimized = await Promise.all(
          imageContents.map(async ({ data }) => {
            const optimized = await svgo.optimize(data);
            return optimized.data;
          })
        );

        const svgs = svgOptimized.reduce((acc, svg, index) => {
          const name = this.formatTokenName(nodes[index].name);
          acc[name] = svg;
          return acc;
        }, {});

        this.tokens[this.getTokenNameByNodeId(nodeId)].values = svgs;
      }
    }
  }

  // Helpers ------------------------------------------------------------------

  formatTokenName(name) {
    return kebabCase(name);
  }

  hasTokenType(type) {
    return !!this.config.tokens.find((t) => t.type === type);
  }

  readTokens() {
    try {
      return JSON.parse(fs.readFileSync("tokens/base.json", "utf8"));
    } catch (error) {
      log.error(
        "No tokens found! Make sure to run `figma-tokenizer tokenize` without any flags first."
      );
      throw error;
    }
  }

  getTokenNameByType(type) {
    return this.config.tokens.find((t) => t.type === type).name;
  }

  getTokenNameByNodeId(nodeId) {
    return this.config.tokens.find(
      (t) => decodeURIComponent(t.nodeId) === decodeURIComponent(nodeId)
    ).name;
  }

  getTokenNodeId(type) {
    return decodeURIComponent(
      this.config.tokens.find((t) => t.type === type).nodeId
    );
  }

  getAllTokenNodeIds(type) {
    return this.config.tokens
      .filter((t) => t.type === type)
      .map((t) => decodeURIComponent(t.nodeId));
  }

  write() {
    if (!fs.existsSync("tokens")) {
      fs.mkdirSync("tokens");
    }

    fs.writeFileSync("tokens/base.json", JSON.stringify(this.tokens, null, 2));
  }
}
