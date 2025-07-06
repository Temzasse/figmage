import fs from "node:fs/promises";
import type { StyleType } from "@figma/rest-api-spec";
import type { ConsolaInstance } from "consola";
import groupBy from "lodash.groupby";
import template from "lodash.template";
import { FigmaAPI } from "./api";
import { convertColor } from "./color";
import { RESERVED_KEYWORDS, TOKEN_TEMPLATE } from "./constants";
import { renderTokensTemplate } from "./template";
import type {
  ColorTokenConfig,
  Config,
  DropShadowTokenConfig,
  ImageTokenConfig,
  OutputConfig,
  PropertyTokenConfig,
  SyncResult,
  TextTokenConfig,
} from "./types";
import { toCase, toFixed } from "./utils";

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
      this.config.tokens.map((token) => {
        switch (token.type) {
          case "COLOR":
            return this.syncColor(token);
          case "TEXT":
            return this.syncText(token);
          case "DROP_SHADOW":
            return this.syncDropShadow(token);
          case "PROPERTY":
            return this.syncProperty(token);
          case "IMAGE":
            return this.syncImage(token);
          default:
            throw new Error("Unknown token");
        }
      })
    );

    const fulfilled = result.filter(
      (r) => r.status === "fulfilled" && !!r.value
    ) as PromiseFulfilledResult<SyncResult>[];

    const rejected = result.filter(
      (r) => r.status === "rejected"
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

        if (fileType === "ts" || fileType === "js") {
          const fileName = `${result.name}.${fileType}`;
          const filePath = `${outputDir}/${fileName}`;

          const filteredTokens = result.tokens
            .filter((t) => {
              if (RESERVED_KEYWORDS.includes(t.name)) {
                this.log.warn(
                  `Token name "${t.name}" is a reserved keyword in JavaScript and will be skipped.`
                );
                return false;
              }
              return true;
            });

          const content = renderTokensTemplate(result.name, filteredTokens);

          await fs.writeFile(filePath, content, "utf-8");
        }
      })
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
    const tokens: { group: string; name: string; value: string }[] = [];

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

        tokens.push({
          group: style.group ? this.toCase(style.group, opts) : "_",
          name: this.toCase(style.name, opts),
          value: convertColor({ r, g, b, a }, opts.format || "hex"),
        });
      } else if (colorType === "GRADIENT_LINEAR") {
        // GRADIENTS -----------------------------------------------------------
        // TODO
      }
    });

    return { name: opts.name, output: opts.output, tokens };
  }

  private async syncText(opts: TextTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();
    // TODO
  }

  private async syncDropShadow(opts: DropShadowTokenConfig) {
    const { stylesById, styleNodes } = await this.getStyles();
    // TODO
  }

  private async syncProperty(opts: PropertyTokenConfig) {
    // const frames = await this.api.fetchFrames();
    // TODO
  }

  private async syncImage(opts: ImageTokenConfig) {
    // TODO
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
