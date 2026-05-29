import fs from "node:fs/promises";
import type { DropShadowEffect, StyleType } from "@figma/rest-api-spec";
import type { ConsolaInstance } from "consola";
import get from "lodash.get";
import { FigmaAPI } from "./api";
import { convertColor } from "./color";
import { RESERVED_KEYWORDS } from "./constants";
import { optimizeSvg } from "./svgo";
import {
  renderTemplateJS,
  renderTemplateJSON,
  renderTemplateTS,
} from "./template";
import type {
  ColorTokenConfig,
  ComponentPropertyTokenConfig,
  ComponentSetPropertyTokenConfig,
  Config,
  DropShadowTokenConfig,
  ImageTokenConfig,
  OutputConfig,
  SyncResult,
  TextTokenConfig,
} from "./types";
import { rgbToHex, roundToDecimal, toCase, toFixed } from "./utils";

export class Sync {
  private readonly config: Config;
  private readonly api: FigmaAPI;
  private readonly log: ConsolaInstance;

  constructor({ config, log }: { config: Config; log: ConsolaInstance }) {
    this.config = config;
    this.log = log;
    this.api = new FigmaAPI({
      accessToken: config.accessToken,
      fileId: config.fileId,
      log,
    });
  }

  async run() {
    const result = await Promise.allSettled(
      this.config.tokens.map((opts) => {
        switch (opts.type) {
          case "color":
            return this.syncColor(opts);
          case "text":
            return this.syncText(opts);
          case "drop-shadow":
            return this.syncDropShadow(opts);
          case "property":
            return this.syncComponentProperty(opts);
          case "image":
            return this.syncImage(opts);
          default:
            throw new Error("Unknown token");
        }
      }),
    );

    const fulfilled = result.filter(
      (r) => r.status === "fulfilled" && !!r.value,
    ) as PromiseFulfilledResult<SyncResult>[];

    const rejected = result.filter(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult[];

    if (rejected.length > 0) {
      this.log.error("Errors occurred during sync:");
      rejected.forEach((error) => this.log.info(error.reason));
    }

    return fulfilled.map((r) => r.value);
  }

  async write(results: SyncResult[]) {
    const outputDir = this.config.output?.directory || "./tokens";

    this.log.debug(`Writing tokens to ${outputDir}`);

    await fs.mkdir(outputDir, { recursive: true });

    await Promise.all(
      results.map(async (result) => {
        const fileType = result.output?.fileType || "ts";
        const fileName = `${result.name}.${fileType}`;
        const filePath = `${outputDir}/${fileName}`;

        if (fileType === "ts" || fileType === "js") {
          const filteredTokens = result.tokens.filter((t) => {
            if (RESERVED_KEYWORDS.includes(t.name)) {
              this.log.warn(
                `Token name "${t.name}" is a reserved keyword in JavaScript and will be skipped.`,
              );
              return false;
            }
            return true;
          });

          const content =
            fileType === "ts"
              ? renderTemplateTS(result.name, filteredTokens)
              : renderTemplateJS(result.name, filteredTokens);

          await fs.writeFile(filePath, content, "utf-8");
        } else if (fileType === "json") {
          const content = renderTemplateJSON(result.tokens);
          await fs.writeFile(filePath, content, "utf-8");
        }
      }),
    );
  }

  private async syncColor(opts: ColorTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();

    /*
      [
        { group: '_', name: 'Neutral 1', value: '#EEEEEE' },
        { group: '_', name: 'Neutral 2', value: '#CCCCCC' },
        { group: 'Primary', name: 'Primary Muted', value: '#F0F0F0' },
        { group: 'Primary', name: 'Primary Contrast', value: '#000000' },
        ...etc.
      ]
    */
    const tokens: SyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (
        style.type !== "FILL" ||
        !("fills" in doc) ||
        doc.fills.length === 0
      ) {
        return; // Skip if not a fill style or no fills available
      }

      const colorType = doc.fills[0].type;

      if (colorType === "SOLID") {
        // SOLID COLOR ---------------------------------------------------------
        const fill = doc.fills[0];
        const r = Math.round(fill.color.r * 255);
        const g = Math.round(fill.color.g * 255);
        const b = Math.round(fill.color.b * 255);
        const a = fill.opacity ? toFixed(fill.opacity, 2) : undefined;
        const color = convertColor({ r, g, b, a }, opts.format || "hex");

        tokens.push({
          group: style.group ? this.toCase(style.group, opts) : "_",
          name: this.toCase(style.name, opts),
          value: color,
        });
      } else if (colorType === "GRADIENT_LINEAR") {
        // GRADIENTS -----------------------------------------------------------
        const { gradientStops, gradientHandlePositions } = doc.fills[0];

        const colors = gradientStops.map((stop) => {
          const { x, y } = gradientHandlePositions[stop.position];
          const { r, g, b, a } = stop.color;

          const color = convertColor(
            {
              r: Math.round(r * 255),
              g: Math.round(g * 255),
              b: Math.round(b * 255),
              a: toFixed(a, 2),
            },
            opts.format || "hex",
          );

          return {
            color,
            x: roundToDecimal(x),
            y: roundToDecimal(y),
          };
        });

        colors.forEach((color) => {
          tokens.push({
            group: style.group ? this.toCase(style.group, opts) : "_",
            name: this.toCase(style.name, opts),
            value: color,
          });
        });
      }
    });

    return { name: opts.name, output: opts.output, tokens };
  }

  private async syncText(opts: TextTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();

    const tokens: SyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (style.type === "TEXT" && doc.type === "TEXT") {
        const fontSizeBase = doc.style.fontSize || 16;
        const fontSize =
          opts.format === "rem" && opts.baseFontSize
            ? `${toFixed(fontSizeBase / opts.baseFontSize, 2)}rem`
            : `${toFixed(fontSizeBase, 2)}px`;

        const textStyle = {
          fontSize,
          fontFamily: doc.style.fontFamily,
          fontWeight: doc.style.fontWeight,
          textTransform: doc.style.textCase === "UPPER" ? "uppercase" : "none",
          letterSpacing: doc.style.letterSpacing
            ? toFixed(doc.style.letterSpacing, 2)
            : undefined,
          lineHeight:
            doc.style.lineHeightPx && doc.style.fontSize
              ? toFixed(doc.style.lineHeightPx / doc.style.fontSize, 3)
              : undefined,
        };

        tokens.push({
          group: style.group ? this.toCase(style.group, opts) : "_",
          name: this.toCase(style.name, opts),
          value: textStyle,
        });
      }
    });

    return { name: opts.name, output: opts.output, tokens };
  }

  private async syncDropShadow(opts: DropShadowTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();

    const tokens: SyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (
        style.type === "EFFECT" &&
        "effects" in doc &&
        doc.effects.every((e) => e.type === "DROP_SHADOW")
      ) {
        function getShadow(shadow: DropShadowEffect) {
          const r = Math.round(shadow.color.r * 255);
          const g = Math.round(shadow.color.g * 255);
          const b = Math.round(shadow.color.b * 255);
          const a = toFixed(shadow.color.a, 3);
          const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;

          return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`;
        }

        const boxShadow = doc.effects.map(getShadow).reverse().join(", ");

        tokens.push({
          group: style.group ? this.toCase(style.group, opts) : "_",
          name: this.toCase(style.name, opts),
          value: boxShadow,
        });
      }
    });

    return { name: opts.name, output: opts.output, tokens };
  }

  private async syncComponentProperty(opts: ComponentPropertyTokenConfig) {
    if (opts.source.componentSetName) {
      return this.syncComponentSetProperty(opts);
    }

    // TODO
  }

  private async syncComponentSetProperty(
    opts: ComponentSetPropertyTokenConfig,
  ) {
    const components = await this.api.fetchComponentSets(
      opts.source.componentSetName,
    );

    const tokens: SyncResult["tokens"] = [];

    components.forEach((component) => {
      const propertyValue = get(component, opts.source.property);

      if (propertyValue === undefined || propertyValue === null) {
        this.log.warn(
          `Property "${opts.source.property}" not found in component "${component.name}"`,
        );
        return;
      }

      // TODO: can we support more types?
      if (
        typeof propertyValue !== "string" &&
        typeof propertyValue !== "number"
      ) {
        this.log.warn(
          `Property "${opts.source.property}" in component "${component.name}" is not a string or number, skipping token creation.`,
        );
        return;
      }

      // Remove everything up to first `=` in the property name
      const name = component.name.replace(/^[^=]*=/, "").trim();

      tokens.push({
        group: "_",
        name: this.toCase(name, opts),
        value: propertyValue,
      });
    });

    return { name: opts.name, output: opts.output, tokens };
  }

  private async syncImage(opts: ImageTokenConfig) {
    const tokens: SyncResult["tokens"] = [];

    if (opts.source.componentSetName) {
      const components = await this.api.fetchComponentSets(
        opts.source.componentSetName,
      );

      const images = await this.api.fetchImages(components.map((c) => c.id));

      const imageContents = await Promise.all(
        Object.values(images)
          .filter(Boolean)
          .map((url) => fetch(url).then((res) => res.text())),
      );

      const svgOptions = {
        convertColors: true,
        // ...options,
      };

      const svgOptimized = imageContents.map((img) =>
        optimizeSvg(img, svgOptions),
      );
    }
  }

  private toCase(name: string, opts?: { output?: OutputConfig }) {
    const casing =
      opts?.output?.tokenCasing ?? this.config.output?.tokenCasing ?? "camel";

    return toCase(name, casing);
  }

  // Memoization cache for promises
  private stylesPromise: ReturnType<typeof this._getStyles> | null = null;
  private async getStyles() {
    if (this.stylesPromise) return this.stylesPromise;
    this.stylesPromise = this._getStyles();
    return this.stylesPromise;
  }

  private async _getStyles() {
    const styles = await this.api.fetchStyles();

    const stylesById = styles.reduce<
      Record<
        string,
        { id: string; name: string; group: string; type: StyleType }
      >
    >((acc, style) => {
      let name = style.name;
      let group = "";

      if (style.name.includes("/")) {
        const parts = style.name.split("/");
        group = (parts.shift() || "").trim();
        name = parts.join(" ");
      }

      const id = style.node_id;

      acc[id] = { id, name, group, type: style.style_type };

      return acc;
    }, {});

    const stylesIds = Object.keys(stylesById);

    const styleNodes = await this.api.fetchNodes(stylesIds);

    return { stylesById, styleNodes };
  }
}
