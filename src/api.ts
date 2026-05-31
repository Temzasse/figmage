import { createWriteStream } from "node:fs";
import * as stream from "node:stream";
import { promisify } from "node:util";
import type {
  GetFileComponentSetsResponse,
  GetFileNodesResponse,
  GetFileResponse,
  GetFileStylesResponse,
  GetImagesResponse,
  Node,
} from "@figma/rest-api-spec";
import type { ConsolaInstance } from "consola";
import { normalizeFrames } from "./utils";

const streamFinished = promisify(stream.finished);

export class FigmaAPI {
  private readonly fileId: string;
  private readonly baseURL = "https://api.figma.com/v1";
  private readonly headers: Record<string, string>;
  private readonly log: ConsolaInstance;

  constructor({
    accessToken,
    fileId,
    log,
  }: {
    accessToken: string;
    fileId: string;
    log: ConsolaInstance;
  }) {
    this.log = log;
    this.fileId = fileId;
    this.headers = {
      "X-Figma-Token": accessToken,
      "Content-Type": "application/json",
    };
  }

  private async fetchAPI<T>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseURL}/${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const urlString = url.toString();

    this.log.debug(`Fetching: ${urlString}`);

    const response = await fetch(urlString, { headers: this.headers });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText}. ${message}. URL: ${urlString}`,
      );
    }

    return response.json() as T;
  }

  async downloadFile(url: string, outPath: string) {
    const writer = createWriteStream(outPath);

    this.log.debug(`Downloading file from: ${url}`);

    const response = await fetch(url, {
      headers: { "X-Figma-Token": this.headers["X-Figma-Token"] },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `File download HTTP request failed: ${response.status} ${response.statusText}. ${message}. URL: ${url}`,
      );
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const nodeStream = stream.Readable.fromWeb(
      response.body as ReadableStream<Uint8Array>,
    );

    nodeStream.pipe(writer);

    return streamFinished(writer);
  }

  async fetchNodes(ids: string[]) {
    const res = await this.fetchAPI<GetFileNodesResponse>(
      `files/${this.fileId}/nodes`,
      {
        ids: ids.join(","),
      },
    );

    return res.nodes;
  }

  async fetchFrameIds() {
    const res = await this.fetchAPI<GetFileResponse>(
      `files/${this.fileId}?depth=2`,
    );

    return normalizeFrames(res.document);
  }

  async fetchComponentSets(name: string) {
    const res = await this.fetchAPI<GetFileComponentSetsResponse>(
      `files/${this.fileId}/component_sets`,
    );

    const set = res.meta.component_sets.find((s) => s.name === name);

    if (!set) {
      throw new Error(`Component set with name "${name}" not found`);
    }

    const nodes = await this.fetchNodeChildren(set.node_id);
    return nodes;
  }

  async fetchNodeChildren(id: string) {
    const res = await this.fetchAPI<GetFileNodesResponse>(
      `files/${this.fileId}/nodes`,
      {
        ids: id,
      },
    );

    function flattenChildren(node: Node): Node[] {
      const children = "children" in node ? node.children : [];
      const flattened = [node];

      for (const child of children) {
        flattened.push(...flattenChildren(child));
      }

      return flattened;
    }

    const nodes = flattenChildren(res.nodes[id].document).filter(
      (n: Node) => n.type === "COMPONENT",
    );

    return nodes;
  }

  async fetchImages(ids: string[], format = "svg") {
    this.log.debug(
      `Fetching images for IDs: [${ids.join(",")}] with format: ${format}`,
    );
    const res = await this.fetchAPI<GetImagesResponse>(
      `images/${this.fileId}`,
      {
        ids: ids.join(","),
        format,
      },
    );

    return Object.values(res.images).filter(Boolean) as string[];
  }

  async fetchStyles() {
    const res = await this.fetchAPI<GetFileStylesResponse>(
      `files/${this.fileId}/styles`,
    );

    return res.meta.styles;
  }
}
