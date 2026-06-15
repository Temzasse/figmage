import fs from "node:fs/promises";
import fsSync from "node:fs";
import assert from "node:assert";
import type { ComponentNode, DropShadowEffect, StyleType } from "@figma/rest-api-spec";
import type { ConsolaInstance } from "consola";
import { FigmaAPI } from "./api";
import { convertColor } from "./color";
import {
  RESERVED_KEYWORDS,
  DEFAULT_BASE_FONT_SIZE,
  DEFAULT_TEXT_FORMAT,
  DEFAULT_COLOR_FORMAT,
  DEFAULT_PROPERTY_FORMAT,
} from "./constants";
import { createProgressLogger } from "./progress";
import { renderJS, renderJSON, renderTS } from "./render";
import { optimizeSvg } from "./svgo";
import { generateSpritesheet } from "./sprite";
import type {
  ColorFormat,
  ColorTokenConfig,
  ComponentPropertyTokenConfig,
  Config,
  DropShadowTokenConfig,
  VectorImageTokenConfig,
  RasterImageTokenConfig,
  PropertyFormat,
  SyncResult,
  TextFormat,
  TextTokenConfig,
  TokenCasing,
  VectorImageSyncResult,
  RasterImageSyncResult,
  SpriteImageSyncResult,
  ColorSyncResult,
  TextSyncResult,
  DropShadowSyncResult,
  ComponentPropertySyncResult,
  CodeSyncResult,
  SpriteImageTokenConfig,
} from "./types";
import { get, isObject, roundToDecimal, toCase, toFixed } from "./utils";

export class Sync {
  private readonly config: Config;
  private readonly tokensToSync: Config["tokens"];
  private readonly api: FigmaAPI;
  private readonly log: ConsolaInstance;
  private readonly progress: ReturnType<typeof createProgressLogger>;
  private readonly only?: string[];
  private readonly skip?: string[];

  private progressTotal = 0;
  private progressCompleted = 0;

  constructor({
    config,
    log,
    only,
    skip,
  }: {
    config: Config;
    log: ConsolaInstance;
    only?: string[];
    skip?: string[];
  }) {
    this.config = config;
    this.log = log;
    this.only = only;
    this.skip = skip;
    this.progress = createProgressLogger(log);
    this.api = new FigmaAPI({ accessToken: config.accessToken, fileId: config.fileId, log });
    this.tokensToSync = this.getTokensToSync();
    this.progressTotal = this.tokensToSync.length + 1;
    this.progressCompleted = 0;
  }

  // Public methods ------------------------------------------------------------

  async run() {
    const total = this.tokensToSync.length;
    if (total === 0) return [];

    this.progress("syncing", {
      current: this.progressCompleted,
      total: this.progressTotal,
    });

    const promises = this.tokensToSync.map((tokenConfig) =>
      this.syncToken(tokenConfig).finally(() => {
        this.incrementProgress();
        this.progress(`synced ${tokenConfig.name}`, {
          current: this.progressCompleted,
          total: this.progressTotal,
        });
      }),
    );

    const result = await Promise.allSettled(promises);

    const fulfilled = result.filter(
      (r) => r.status === "fulfilled" && !!r.value,
    ) as PromiseFulfilledResult<SyncResult>[];

    const rejected = result.filter((r) => r.status === "rejected") as PromiseRejectedResult[];

    if (rejected.length > 0) {
      rejected.forEach((error) => this.log.error(error.reason));
    }

    return fulfilled
      .map((result) => this.applyTokenFilter(result.value))
      .filter((result) => {
        if (result.tokens.length === 0) {
          this.log.debug(
            `No tokens left after applying config filter for token set "${result.config.name}".`,
          );
          return false;
        }
        return true;
      });
  }

  async write(results: SyncResult[]) {
    if (results.length === 0) return;

    this.incrementProgress();
    this.progress("writing files", {
      current: this.progressCompleted,
      total: this.progressTotal,
    });

    const defaultOutputDir = this.config.output?.directory || "./tokens";

    if (!fsSync.existsSync(defaultOutputDir)) {
      await fs.mkdir(defaultOutputDir, { recursive: true });
    }

    await Promise.all(
      results.map(async (result) => {
        const outputDir = result.config.output?.directory || defaultOutputDir;

        if (!fsSync.existsSync(outputDir)) {
          await fs.mkdir(outputDir, { recursive: true });
        }

        this.log.debug(`Writing token ${result.config.name} to ${outputDir}`);

        switch (result.config.type) {
          case "imageVector":
            await this.writeVectorImage(result as VectorImageSyncResult, outputDir);
            break;
          case "imageSprite":
            await this.writeSpriteImage(result as SpriteImageSyncResult, outputDir);
            break;
          case "imageRaster":
            await this.writeRasterImage(result as RasterImageSyncResult, outputDir);
            break;
          default:
            await this.writeCode(result as CodeSyncResult, outputDir);
            break;
        }
      }),
    );

    this.progress("done", {
      current: this.progressCompleted,
      total: this.progressTotal,
      done: true,
    });
  }

  // Private methods ----------------------------------------------------------

  private syncToken(tokenConfig: Config["tokens"][number]) {
    if (tokenConfig.type === "color") {
      return this.syncColorStyle(tokenConfig);
    } else if (tokenConfig.type === "text") {
      return this.syncTextStyle(tokenConfig);
    } else if (tokenConfig.type === "dropShadow") {
      return this.syncDropShadow(tokenConfig);
    } else if (tokenConfig.type === "property") {
      return this.syncComponentProperty(tokenConfig);
    } else if (tokenConfig.type === "imageVector") {
      return this.syncVectorImageAsset(tokenConfig);
    } else if (tokenConfig.type === "imageRaster") {
      return this.syncRasterImageAsset(tokenConfig);
    } else if (tokenConfig.type === "imageSprite") {
      return this.syncSpriteImageAsset(tokenConfig);
    }

    this.log.error("Unsupported token type", tokenConfig);
    throw new Error("Unsupported token type");
  }

  private async syncColorStyle(config: ColorTokenConfig): Promise<ColorSyncResult> {
    const { transform } = config;
    const { stylesById, styleNodes } = await this.getStyles();

    const tokens: ColorSyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (style.type !== "FILL" || !("fills" in doc) || doc.fills.length === 0) {
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
          group: style.group ? this.toCase(style.group, transform?.casing) : "_",
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
        const angle = roundToDecimal((90 - (Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360);

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
          group: style.group ? this.toCase(style.group, transform?.casing) : "_",
          name: this.toCase(style.name, transform?.casing),
          value,
        });
      }
    });

    return { config, tokens };
  }

  private async syncTextStyle(config: TextTokenConfig): Promise<TextSyncResult> {
    const { transform } = config;
    const { stylesById, styleNodes } = await this.getStyles();

    const textFormat = transform?.format || this.config.transform?.defaultTextFormat || "px";

    const tokens: TextSyncResult["tokens"] = [];

    Object.entries(styleNodes).forEach(([id, node]) => {
      const style = stylesById[id];
      const doc = node.document;

      if (style.type === "TEXT" && doc.type === "TEXT") {
        const fontSize = this.toTextFormat(doc.style.fontSize || 16, textFormat);

        const textStyle = {
          fontSize,
          fontFamily: doc.style.fontFamily,
          fontWeight: doc.style.fontWeight,
          textTransform: doc.style.textCase === "UPPER" ? "uppercase" : "none",
          letterSpacing: doc.style.letterSpacing ? toFixed(doc.style.letterSpacing, 2) : undefined,
          lineHeight:
            doc.style.lineHeightPx && doc.style.fontSize
              ? toFixed(doc.style.lineHeightPx / doc.style.fontSize, 3)
              : undefined,
        };

        tokens.push({
          group: style.group ? this.toCase(style.group, transform?.casing) : "_",
          name: this.toCase(style.name, transform?.casing),
          value: textStyle,
        });
      }
    });

    return { config, tokens };
  }

  private async syncDropShadow(config: DropShadowTokenConfig): Promise<DropShadowSyncResult> {
    const { transform } = config;
    const { stylesById, styleNodes } = await this.getStyles();

    const tokens: DropShadowSyncResult["tokens"] = [];

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
          group: style.group ? this.toCase(style.group, transform?.casing) : "_",
          name: this.toCase(style.name, transform?.casing),
          value: boxShadow,
        });
      }
    });

    return { config, tokens };
  }

  private async syncComponentProperty(
    opts: ComponentPropertyTokenConfig,
  ): Promise<ComponentPropertySyncResult> {
    if ("componentSet" in opts.source) {
      return this.syncComponentSetProperty(opts);
    } else if ("frame" in opts.source || "frameId" in opts.source) {
      return this.syncComponentFrameProperty(opts);
    }
    throw new Error("Unknown component property source type");
  }

  private async syncComponentFrameProperty(
    config: ComponentPropertyTokenConfig,
  ): Promise<ComponentPropertySyncResult> {
    const { source, transform } = config;
    assert("frame" in source || "frameId" in source);

    let frameId = source.frameId;

    if (source.frame && !frameId) {
      frameId = await this.getFrameIdByName(source.frame);
    }

    const children = await this.api.fetchNodeChildren(frameId!);

    const tokens: ComponentPropertySyncResult["tokens"] = [];

    children.forEach((component) => {
      const propertyValue = this.readComponentProperty(component, source.property);

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

    return { config, tokens };
  }

  private async syncComponentSetProperty(
    config: ComponentPropertyTokenConfig,
  ): Promise<ComponentPropertySyncResult> {
    const { source, transform } = config;
    assert("componentSet" in source);

    const components = await this.api.fetchComponentSets(source.componentSet);

    const tokens: ComponentPropertySyncResult["tokens"] = [];

    components.forEach((component) => {
      const propertyValue = this.readComponentProperty(component, source.property);

      const componentName = this.cleanComponentSetName(component.name);

      const formattedValue =
        typeof propertyValue === "number"
          ? this.toPropertyFormat(propertyValue, transform?.format)
          : propertyValue;

      tokens.push({
        group: "_",
        name: this.toCase(componentName, transform?.casing),
        value: formattedValue,
      });
    });

    return { config, tokens };
  }

  private async syncVectorImageAsset(
    config: VectorImageTokenConfig,
  ): Promise<VectorImageSyncResult> {
    const { name, source, transform } = config;
    const tokens: VectorImageSyncResult["tokens"] = [];

    let data: { url: string; component: ComponentNode }[] = [];

    if ("componentSet" in source) {
      const components = await this.api.fetchComponentSets(source.componentSet);

      const images = await this.api.fetchImages({
        ids: components.map((c) => c.id),
        format: "svg",
      });

      data = components.map((component, index) => ({
        url: images[index],
        component,
      }));
    } else if ("frame" in source || "frameId" in source) {
      let frameId = source.frameId;

      if (source.frame && !frameId) {
        frameId = await this.getFrameIdByName(source.frame);
      }

      const children = await this.api.fetchNodeChildren(frameId!);
      const filteredChildren = children.filter((child) => child.name);

      const images = await this.api.fetchImages({
        ids: filteredChildren.map((c) => c.id),
        format: "svg",
      });

      data = filteredChildren.map((component, index) => ({
        url: images[index],
        component,
      }));
    }

    if (data.length === 0) {
      this.log.warn(`No images found for token "${name}". Please check the source configuration.`);
      return { config, tokens };
    }

    const imageContents = await Promise.all(
      data
        .map((d) => d.url)
        .filter(Boolean)
        .map((url) => fetch(url).then((res) => res.text())),
    );

    const svgOptimized = imageContents.map((img) => optimizeSvg(img, transform?.optimize));

    svgOptimized.forEach((content, index) => {
      const component = data[index].component;
      const componentName = this.cleanComponentSetName(component.name);
      const tokenName = this.toCase(componentName, transform?.casing);

      tokens.push({ name: tokenName, value: content });
    });

    return { config, tokens };
  }

  private async syncSpriteImageAsset(
    config: SpriteImageTokenConfig,
  ): Promise<SpriteImageSyncResult> {
    const { name, source, transform } = config;

    const result = await this.syncVectorImageAsset({
      type: "imageVector",
      name,
      source,
      transform,
    });

    return { config, tokens: result.tokens };
  }

  private async syncRasterImageAsset(
    config: RasterImageTokenConfig,
  ): Promise<RasterImageSyncResult> {
    const { source, transform } = config;
    const tokens: RasterImageSyncResult["tokens"] = [];
    const format = transform?.format || "png";

    if ("componentSet" in source) {
      const components = await this.api.fetchComponentSets(source.componentSet);

      const images = await this.api.fetchImages({
        ids: components.map((c) => c.id),
        format,
      });

      components.forEach((component, index) => {
        const imageUrl = images[index];

        if (imageUrl) {
          const componentName = this.cleanComponentSetName(component.name);
          const tokenName = this.toCase(componentName, transform?.casing);

          tokens.push({ name: tokenName, value: imageUrl });
        }
      });
    } else if ("frame" in source || "frameId" in source) {
      let frameId = source.frameId;

      if (source.frame && !frameId) {
        frameId = await this.getFrameIdByName(source.frame);
      }

      const children = await this.api.fetchNodeChildren(frameId!);
      const filteredChildren = children.filter((child) => child.name);

      const images = await this.api.fetchImages({
        ids: filteredChildren.map((c) => c.id),
        format,
      });

      filteredChildren.forEach((component, index) => {
        const imageUrl = images[index];

        if (imageUrl) {
          const componentName = this.cleanComponentSetName(component.name);
          const tokenName = this.toCase(componentName, transform?.casing);

          tokens.push({ name: tokenName, value: imageUrl });
        }
      });
    }

    return { config, tokens };
  }

  private getTokensToSync() {
    const allNames = new Set(this.config.tokens.map((token) => token.name));

    let selected = this.config.tokens;

    if (this.only && this.only.length > 0) {
      const unknownOnlyNames = this.only.filter((name) => !allNames.has(name));

      if (unknownOnlyNames.length > 0) {
        this.log.warn(`Unknown token name(s) in --only: ${unknownOnlyNames.join(", ")}`);
      }

      const onlySet = new Set(this.only);
      selected = selected.filter((token) => onlySet.has(token.name));

      if (selected.length === 0) {
        this.log.warn("No tokens matched --only filter.");
        return [];
      }

      this.log.debug(
        `Syncing only selected token(s): ${selected.map((token) => token.name).join(", ")}`,
      );
    }

    if (this.skip && this.skip.length > 0) {
      const unknownSkipNames = this.skip.filter((name) => !allNames.has(name));

      if (unknownSkipNames.length > 0) {
        this.log.warn(`Unknown token name(s) in --skip: ${unknownSkipNames.join(", ")}`);
      }

      const skipSet = new Set(this.skip);
      const before = selected.length;
      selected = selected.filter((token) => !skipSet.has(token.name));

      if (selected.length === 0) {
        this.log.warn("No tokens left to sync after applying --skip filter.");
        return [];
      }

      if (before !== selected.length) {
        this.log.debug(
          `Skipping token(s): ${this.skip.filter((name) => allNames.has(name)).join(", ")}`,
        );
      }
    }

    return selected;
  }

  private applyTokenFilter(result: SyncResult): SyncResult {
    const { config, tokens } = result;
    const filterFn = config.filter;

    if (!filterFn || typeof filterFn !== "function") {
      return result;
    }

    const filteredTokens = tokens.filter((token) => {
      try {
        return filterFn({
          name: token.name,
          value: token.value,
          group: "group" in token ? token.group : undefined,
        });
      } catch (error) {
        throw new Error(
          `Error in filter for token "${token.name}" from token set "${config.name}".`,
          { cause: error },
        );
      }
    });

    if (filteredTokens.length !== tokens.length) {
      this.log.debug(
        `Filtered out ${tokens.length - filteredTokens.length} token(s) from token set "${config.name}".`,
      );
    }

    return { config, tokens: filteredTokens } as SyncResult;
  }

  private async writeCode(result: CodeSyncResult, outputDir: string) {
    const { config, tokens } = result;
    const { name, output } = config;

    const defaultOutputFileType = this.config.output?.fileType || "ts";
    const fileType = output?.fileType ?? defaultOutputFileType;
    const fileName = output?.fileName ?? name;
    const filePath = `${outputDir}/${fileName}.${fileType}`;

    if (fileType === "ts" || fileType === "js") {
      const filteredTokens = tokens.filter((t) => {
        if (RESERVED_KEYWORDS.includes(t.name)) {
          this.log.warn(
            `Token name "${t.name}" is a reserved keyword in JavaScript and will be skipped.`,
          );
          return false;
        }
        return true;
      });

      const content = fileType === "ts" ? renderTS(name, filteredTokens) : renderJS(filteredTokens);

      await fs.writeFile(filePath, content, "utf-8");
    } else if (fileType === "json") {
      const content = renderJSON(tokens);
      await fs.writeFile(filePath, content, "utf-8");
    } else {
      this.log.error(
        `Unsupported file type "${fileType}" for token "${name}", skipping file write.`,
      );
    }
  }

  private async writeVectorImage(result: VectorImageSyncResult, outputDir: string) {
    const { output } = result.config;
    const fileType = output?.fileType ?? "ts";

    // For TS/JS/JSON output, write all tokens into a single file
    if (fileType !== "svg") {
      await this.writeCode(result as unknown as CodeSyncResult, outputDir);
    } else {
      // For SVG output, write each token as a separate SVG file
      await Promise.all(
        result.tokens.map(async (token) => {
          const filePath = `${outputDir}/${token.name}.svg`;
          await fs.writeFile(filePath, token.value, "utf-8");
        }),
      );
    }
  }

  private async writeSpriteImage(result: SpriteImageSyncResult, outputDir: string) {
    const { config, tokens } = result;
    const { name, output } = config;
    const spriteFilename = output?.fileName ?? name;

    let idsEnabled = true;
    let idsDir = outputDir;
    let idsFilename = `${spriteFilename}-ids`;
    let idsFileType: "ts" | "js" | "json" = "ts";

    if (output && isObject(output.ids)) {
      idsEnabled = output.ids.enabled ?? false;
      idsDir = output.ids.directory ?? outputDir;
      idsFilename = output.ids.fileName ?? `${spriteFilename}-ids`;
      idsFileType = output.ids.fileType ?? "ts";

      this.log.debug(
        `Sprite IDs generation enabled: ${idsEnabled}, IDs directory: ${idsDir}, IDs filename: ${idsFilename}`,
      );
    }

    await generateSpritesheet({
      tokens,
      spriteFilename,
      spriteDir: outputDir,
      idsEnabled,
      idsFilename,
      idsFileType,
      idsDir,
    });
  }

  private async writeRasterImage(result: RasterImageSyncResult, outputDir: string) {
    const { config, tokens } = result;
    const { transform } = config;
    const defaultFormat = this.config.transform?.defaultImageRasterFormat || "png";

    await Promise.all(
      tokens.map(async (token) => {
        try {
          const url = new URL(token.value);
          const format = transform?.format || defaultFormat;
          const fileName = `${token.name}.${format}`;
          const filePath = `${outputDir}/${fileName}`;

          await this.api.downloadFile(url, filePath);
          // oxlint-disable-next-line no-unused-vars
        } catch (_) {
          this.log.error(
            `Invalid URL for token "${token.name}": ${token.value}. Skipping download.`,
          );
        }
      }),
    );
  }

  private incrementProgress() {
    this.progressCompleted = Math.min(this.progressCompleted + 1, this.progressTotal);
  }

  private readComponentProperty(component: ComponentNode, propertyPath: string) {
    const propertyValue = get(component, propertyPath);

    if (propertyValue === undefined || propertyValue === null) {
      throw new Error(`Property "${propertyPath}" not found in component "${component.name}"`);
    }

    // TODO: can we support more types?
    if (typeof propertyValue !== "string" && typeof propertyValue !== "number") {
      throw new Error(
        `Property "${propertyPath}" in component "${component.name}" is not a string or number, skipping token creation.`,
      );
    }

    return propertyValue;
  }

  private toCase(name: string, customCasing?: TokenCasing) {
    const casing = customCasing ?? this.config.transform?.defaultCasing ?? "camel";

    return toCase(name, casing);
  }

  private toTextFormat(value: number, format?: TextFormat) {
    const baseFontSize = this.config.transform?.baseFontSize || DEFAULT_BASE_FONT_SIZE;
    const textFormat = format || this.config.transform?.defaultTextFormat || DEFAULT_TEXT_FORMAT;

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
    const colorFormat = format || this.config.transform?.defaultColorFormat || DEFAULT_COLOR_FORMAT;

    return convertColor({ r, g, b, a }, colorFormat);
  }

  private toPropertyFormat(value: number, format?: PropertyFormat) {
    const baseFontSize = this.config.transform?.baseFontSize || DEFAULT_BASE_FONT_SIZE;
    const propertyFormat =
      format || this.config.transform?.defaultPropertyFormat || DEFAULT_PROPERTY_FORMAT;

    if (propertyFormat === "rem") {
      return `${toFixed(value / baseFontSize, 2)}rem`;
    } else if (propertyFormat === "px") {
      return `${toFixed(value, 2)}px`;
    }
    return toFixed(value, 2);
  }

  private cleanComponentSetName(componentSetName: string) {
    // Remove everything up to first `=` in the property name
    return componentSetName.replace(/^[^=]*=/, "").trim();
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
      Record<string, { id: string; name: string; group: string; type: StyleType }>
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
  private framesPromise: ReturnType<typeof this.api.fetchFrameIds> | null = null;
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
