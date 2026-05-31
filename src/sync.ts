import fs from "node:fs/promises";
import assert from "node:assert";
import type {
  ComponentNode,
  DropShadowEffect,
  StyleType,
} from "@figma/rest-api-spec";
import type { ConsolaInstance } from "consola";
import get from "lodash.get";
import { FigmaAPI } from "./api";
import { convertColor } from "./color";
import {
  RESERVED_KEYWORDS,
  DEFAULT_BASE_FONT_SIZE,
  DEFAULT_TEXT_FORMAT,
  DEFAULT_COLOR_FORMAT,
  DEFAULT_PROPERTY_FORMAT,
  DEFAULT_IMAGE_FORMAT,
} from "./constants";
import { optimizeSvg } from "./svgo";
import {
  renderTemplateJS,
  renderTemplateJSON,
  renderTemplateTS,
} from "./template";
import type {
  ColorFormat,
  ColorTokenConfig,
  ComponentPropertyTokenConfig,
  Config,
  DropShadowTokenConfig,
  ImageAssetTokenConfig,
  PropertyFormat,
  SyncResult,
  TextFormat,
  TextTokenConfig,
  TokenCasing,
} from "./types";
import { roundToDecimal, toCase, toFixed } from "./utils";

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
    const promises: Promise<SyncResult>[] = [];

    // TODO: add partial sync via CLI flag
    this.config.tokens.forEach((opts) => {
      if (opts.type === "color") {
        promises.push(this.syncColorStyle(opts));
      } else if (opts.type === "text") {
        promises.push(this.syncTextStyle(opts));
      } else if (opts.type === "dropShadow") {
        promises.push(this.syncDropShadow(opts));
      } else if (opts.type === "property") {
        promises.push(this.syncComponentProperty(opts));
      } else if (opts.type === "image") {
        promises.push(this.syncImageAsset(opts));
      } else {
        throw new Error("Unknown token");
      }
    });

    const result = await Promise.allSettled(promises);

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
        const fileName = result.output?.fileName || result.name;
        const filePath = `${outputDir}/${fileName}.${fileType}`;

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

  private async syncColorStyle({ name, transform, output }: ColorTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();

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

        const color = this.toColorFormat(
          {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255),
            a: fill.opacity ? toFixed(fill.opacity, 2) : undefined,
          },
          transform?.format,
        );

        tokens.push({
          group: style.group
            ? this.toCase(style.group, transform?.casing)
            : "_",
          name: this.toCase(style.name, transform?.casing),
          value: color,
        });
      } else if (colorType === "GRADIENT_LINEAR") {
        // LINEAR GRADIENTS ----------------------------------------------------
        const { gradientStops, gradientHandlePositions } = doc.fills[0];
        const start = gradientHandlePositions[0];
        const end = gradientHandlePositions[1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = roundToDecimal(
          (90 - (Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
        );

        const stops = gradientStops.map((stop) => {
          const { r, g, b, a } = stop.color;

          const color = this.toColorFormat(
            {
              r: Math.round(r * 255),
              g: Math.round(g * 255),
              b: Math.round(b * 255),
              a: toFixed(a, 2),
            },
            transform?.format,
          );

          return {
            color,
            // Original position is between 0 and 1, convert to percentage and round to 2 decimals
            position: toFixed(stop.position * 100, 2),
          };
        });

        const value = `linear-gradient(${angle}deg, ${stops
          .map((s) => `${s.color} ${s.position}%`)
          .join(", ")})`;

        tokens.push({
          group: style.group
            ? this.toCase(style.group, transform?.casing)
            : "_",
          name: this.toCase(style.name, transform?.casing),
          value,
        });
      }
    });

    return { name, output, tokens };
  }

  private async syncTextStyle({ name, transform, output }: TextTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();

    const textFormat =
      transform?.format || this.config.transform?.defaultTextFormat || "px";

    const tokens: SyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (style.type === "TEXT" && doc.type === "TEXT") {
        const fontSize = this.toTextFormat(
          doc.style.fontSize || 16,
          textFormat,
        );

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
          group: style.group
            ? this.toCase(style.group, transform?.casing)
            : "_",
          name: this.toCase(style.name, transform?.casing),
          value: textStyle,
        });
      }
    });

    return { name, output, tokens };
  }

  private async syncDropShadow({
    name,
    transform,
    output,
  }: DropShadowTokenConfig) {
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
        const getShadow = (shadow: DropShadowEffect) => {
          const color = this.toColorFormat(
            {
              r: Math.round(shadow.color.r * 255),
              g: Math.round(shadow.color.g * 255),
              b: Math.round(shadow.color.b * 255),
              a: toFixed(shadow.color.a, 3),
            },
            transform?.format,
          );

          return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${color}`;
        };

        const boxShadow = doc.effects.map(getShadow).reverse().join(", ");

        tokens.push({
          group: style.group
            ? this.toCase(style.group, transform?.casing)
            : "_",
          name: this.toCase(style.name, transform?.casing),
          value: boxShadow,
        });
      }
    });

    return { name, output, tokens };
  }

  private async syncComponentProperty(opts: ComponentPropertyTokenConfig) {
    if ("componentSet" in opts.source) {
      return this.syncComponentSetProperty(opts);
    } else if ("frame" in opts.source || "frameId" in opts.source) {
      return this.syncComponentFrameProperty(opts);
    }
    throw new Error("Unknown component property source type");
  }

  private async syncComponentFrameProperty({
    name,
    source,
    transform,
    output,
  }: ComponentPropertyTokenConfig) {
    assert("frame" in source || "frameId" in source);

    let frameId = source.frameId;

    if (source.frame && !frameId) {
      frameId = await this.getFrameIdByName(source.frame);
    }

    const children = await this.api.fetchNodeChildren(frameId!);

    const tokens: SyncResult["tokens"] = [];

    children.forEach((component) => {
      const propertyValue = this.readComponentProperty(
        component,
        source.property,
      );

      const formattedValue =
        typeof propertyValue === "number"
          ? this.toPropertyFormat(propertyValue, transform?.format)
          : propertyValue;

      tokens.push({
        group: "_",
        name: this.toCase(component.name, transform?.casing),
        value: formattedValue,
      });
    });

    return { name, output, tokens };
  }

  private async syncComponentSetProperty({
    name,
    source,
    transform,
    output,
  }: ComponentPropertyTokenConfig) {
    assert("componentSet" in source);

    const components = await this.api.fetchComponentSets(source.componentSet);

    const tokens: SyncResult["tokens"] = [];

    components.forEach((component) => {
      const propertyValue = this.readComponentProperty(
        component,
        source.property,
      );

      // Remove everything up to first `=` in the property name
      const valueName = component.name.replace(/^[^=]*=/, "").trim();

      const formattedValue =
        typeof propertyValue === "number"
          ? this.toPropertyFormat(propertyValue, transform?.format)
          : propertyValue;

      tokens.push({
        group: "_",
        name: this.toCase(valueName, transform?.casing),
        value: formattedValue,
      });
    });

    return { name, output, tokens };
  }

  private async syncImageAsset({
    name,
    source,
    transform,
    output,
  }: ImageAssetTokenConfig) {
    const tokens: SyncResult["tokens"] = [];

    // if ("componentSet" in source) {
    //   const components = await this.api.fetchComponentSets(source.componentSet);
    //   const images = await this.api.fetchImages(components.map((c) => c.id));

    //   const imageContents = await Promise.all(
    //     Object.values(images)
    //       .filter(Boolean)
    //       .map((url) => fetch(url).then((res) => res.text())),
    //   );

    //   const svgOptions = {
    //     convertColors: true,
    //     // ...options,
    //   };

    //   const svgOptimized = imageContents.map((img) =>
    //     optimizeSvg(img, svgOptions),
    //   );

    //   // TODO
    // }

    return { name, output, tokens };
  }

  // HELPERS ------------------------------------------------------------------

  private readComponentProperty(
    component: ComponentNode,
    propertyPath: string,
  ) {
    const propertyValue = get(component, propertyPath);

    if (propertyValue === undefined || propertyValue === null) {
      throw new Error(
        `Property "${propertyPath}" not found in component "${component.name}"`,
      );
    }

    // TODO: can we support more types?
    if (
      typeof propertyValue !== "string" &&
      typeof propertyValue !== "number"
    ) {
      throw new Error(
        `Property "${propertyPath}" in component "${component.name}" is not a string or number, skipping token creation.`,
      );
    }

    return propertyValue;
  }

  private toCase(name: string, customCasing?: TokenCasing) {
    const casing =
      customCasing ?? this.config.transform?.defaultCasing ?? "camel";

    return toCase(name, casing);
  }

  private toTextFormat(value: number, format?: TextFormat) {
    const baseFontSize =
      this.config.transform?.baseFontSize || DEFAULT_BASE_FONT_SIZE;
    const textFormat =
      format || this.config.transform?.defaultTextFormat || DEFAULT_TEXT_FORMAT;

    if (textFormat === "rem") {
      return `${toFixed(value / baseFontSize, 2)}rem`;
    } else if (textFormat === "px") {
      return `${toFixed(value, 2)}px`;
    }
    return toFixed(value, 2);
  }

  private toColorFormat(
    { r, g, b, a }: { r: number; g: number; b: number; a?: number },
    format?: ColorFormat,
  ) {
    const colorFormat =
      format ||
      this.config.transform?.defaultColorFormat ||
      DEFAULT_COLOR_FORMAT;

    return convertColor({ r, g, b, a }, colorFormat);
  }

  private toPropertyFormat(value: number, format?: PropertyFormat) {
    const baseFontSize =
      this.config.transform?.baseFontSize || DEFAULT_BASE_FONT_SIZE;
    const propertyFormat =
      format ||
      this.config.transform?.defaultPropertyFormat ||
      DEFAULT_PROPERTY_FORMAT;

    if (propertyFormat === "rem") {
      return `${toFixed(value / baseFontSize, 2)}rem`;
    } else if (propertyFormat === "px") {
      return `${toFixed(value, 2)}px`;
    }
    return toFixed(value, 2);
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

  // Memoization cache for promises
  private framesPromise: ReturnType<typeof this.api.fetchFrameIds> | null =
    null;
  private async getFrameIds() {
    if (this.framesPromise) return this.framesPromise;
    this.framesPromise = this.api.fetchFrameIds();
    return this.framesPromise;
  }

  private async getFrameIdByName(frameName: string) {
    const frameIds = await this.getFrameIds();
    const frameId = frameIds[frameName];

    if (!frameId) {
      throw new Error(`Frame with name "${frameName}" not found`);
    }

    return frameId;
  }
}
