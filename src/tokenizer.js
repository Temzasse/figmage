// @ts-check
import fs from "fs";
import axios from "axios";

import { log } from "./log.js";
import { optimizeSvg } from "./svgo.js";
import { isNumber, rgbToHex, roundToDecimal, toFixed } from "./utils.js";

export class Tokenizer {
  constructor({ config, figmaAPI }) {
    this.figmaAPI = figmaAPI;
    this.config = config;
    this.frameIds = {}; // { name: id }
    this.tokens = config.tokenize.tokens.reduce((acc, val) => {
      acc[val.name] = {};
      return acc;
    }, {});
  }

  async tokenize() {
    // If any of the tokens reference a node by name we need to fetch the top
    // level frames to get the node ids
    if (this.config.tokenize.tokens.some((t) => t.nodeName)) {
      this.frameIds = await this.figmaAPI.fetchFrames();
    }

    await Promise.all([
      this.handleStyles(),
      this.handleBorderRadius(),
      this.handleWidth(),
      this.handleHeight(),
      this.handleDimensions(),
      this.handleSvg(),
      this.handlePng(),
    ]);
  }

  async handleStyles() {
    const customTokens = this.config.tokenize.tokens.filter((t) =>
      Boolean(t.nodeId || t.nodeName)
    );

    // If there are no style tokens, return early
    if (this.config.tokenize.tokens.length === customTokens.length) {
      return;
    }

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
        name,
        group: (group || "").trim(),
        type: style.style_type,
      };

      return acc;
    }, {});

    const stylesIds = Object.keys(stylesById);

    if (stylesIds.length === 0) {
      return;
    }

    const nodes = await this.figmaAPI.fetchNodes(stylesIds);

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

        if (isNumber(fill.opacity)) {
          const alpha = toFixed(fill.opacity, 2);
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
          letterSpacing: toFixed(textStyle.letterSpacing, 2),
          lineHeight: toFixed(textStyle.lineHeightPx / textStyle.fontSize, 3),
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
        function getShadow(shadow) {
          const { r, g, b, a } = shadow.color;
          const alpha = toFixed(a, 2);
          const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`; // prettier-ignore
          const hex = rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
          );

          return {
            boxShadow: `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`,
            offset: shadow.offset,
            radius: shadow.radius,
            opacity: alpha,
            color: { hex, rgba },
          };
        }

        const tokenName = this.getTokenNameByType("drop-shadow");
        const shadows = doc.effects.map(getShadow);

        this.tokens[tokenName][style.name] =
          shadows.length === 1 ? shadows[0] : shadows;
      }
    });
  }

  async handleHeight() {
    if (this.hasTokenType("height")) {
      const settings = this.getTokenSettingsForType("height");

      for (const { nodeId, tokenName } of settings) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          this.tokens[tokenName][node.name] = roundToDecimal(
            node.absoluteBoundingBox.height
          );
        });
      }
    }
  }

  async handleWidth() {
    if (this.hasTokenType("width")) {
      const settings = this.getTokenSettingsForType("width");

      for (const { nodeId, tokenName } of settings) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          this.tokens[tokenName][node.name] = roundToDecimal(
            node.absoluteBoundingBox.width
          );
        });
      }
    }
  }

  async handleDimensions() {
    if (this.hasTokenType("dimensions")) {
      const settings = this.getTokenSettingsForType("dimensions");

      for (const { nodeId, tokenName } of settings) {
        const nodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        nodes.forEach((node) => {
          this.tokens[tokenName][node.name] = {
            height: roundToDecimal(node.absoluteBoundingBox.height),
            width: roundToDecimal(node.absoluteBoundingBox.width),
          };
        });
      }
    }
  }

  async handleBorderRadius() {
    if (this.hasTokenType("radius")) {
      const settings = this.getTokenSettingsForType("radius");

      for (const { nodeId, tokenName } of settings) {
        const radiiNodes = await this.figmaAPI.fetchNodeChildren(nodeId);

        radiiNodes.forEach((node) => {
          this.tokens[tokenName][node.name] = roundToDecimal(
            node.children[0].cornerRadius
          );
        });
      }
    }
  }

  async handleSvg() {
    if (this.hasTokenType("svg")) {
      const settings = this.getTokenSettingsForType("svg");

      for (const { nodeId, tokenName, options } of settings) {
        const current = this.tokens[tokenName];
        const _nodes = await this.figmaAPI.fetchNodeChildren(nodeId);
        const nodes = _nodes.filter((n) => !current[n.name]);

        if (nodes.length === 0) continue;

        const images = await this.figmaAPI.fetchImages(nodes.map((n) => n.id));

        const imageContents = await Promise.all(
          Object.values(images).map((imageUrl) => axios.get(imageUrl))
        );

        const svgOptions = {
          convertColors: true,
          ...options,
        };

        const svgOptimized = await Promise.all(
          imageContents.map(({ data }) => optimizeSvg(data, svgOptions))
        );

        const svgs = svgOptimized.reduce((acc, svg, index) => {
          acc[nodes[index].name] = svg;
          return acc;
        }, {});

        this.tokens[tokenName] = svgs;
      }
    }
  }

  async handlePng() {
    if (this.hasTokenType("png")) {
      const settings = this.getTokenSettingsForType("png");

      for (const { nodeId, tokenName } of settings) {
        const current = this.tokens[tokenName];
        const _nodes = await this.figmaAPI.fetchNodeChildren(nodeId);
        const nodes = _nodes.filter((n) => !current[n.name]);

        if (nodes.length === 0) continue;

        const images = await this.figmaAPI.fetchImages(
          nodes.map((n) => n.id),
          "png"
        );

        const pngs = Object.values(images).reduce((acc, url, index) => {
          acc[nodes[index].name] = url;
          return acc;
        }, {});

        this.tokens[tokenName] = pngs;
      }
    }
  }

  // Helpers ------------------------------------------------------------------

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

  getTokenSettingsForType(type) {
    return this.config.tokenize.tokens
      .filter((t) => t.type === type)
      .map((t) => {
        if (t.nodeName) {
          return {
            nodeId: this.frameIds[t.nodeName],
            tokenName: t.name,
            options: t.options || {},
          };
        } else if (t.nodeId) {
          return {
            nodeId: decodeURIComponent(t.nodeId),
            tokenName: t.name,
            options: t.options || {},
          };
        }
        return null;
      })
      .filter(Boolean);
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
