import { createWriteStream } from "node:fs";
import * as stream from "node:stream";
import { promisify } from "node:util";
import type {
  GetFileNodesResponse,
  GetFileResponse,
  GetFileStylesResponse,
  GetImagesResponse,
  Node,
} from "@figma/rest-api-spec";

import { normalizeFrames } from "./utils.js";

const streamFinished = promisify(stream.finished);

interface FigmaAPIConfig {
  accessToken: string;
  fileId: string;
}

export class FigmaAPI {
  private readonly fileId: string;
  private readonly baseURL = "https://api.figma.com/v1";
  private readonly headers: Record<string, string>;

  constructor({ accessToken, fileId }: FigmaAPIConfig) {
    this.fileId = fileId;
    this.headers = {
      "X-Figma-Token": accessToken,
      "Content-Type": "application/json",
    };
  }

  private async fetchAPI<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), { headers: this.headers });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`);
    }

    return response.json() as T;
  }

  async downloadFile(url: string, outPath: string) {
    const writer = createWriteStream(outPath);

    const response = await fetch(url, {
      headers: { "X-Figma-Token": this.headers["X-Figma-Token"] },
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const nodeStream = stream.Readable.fromWeb(
      response.body as ReadableStream<Uint8Array>
    );

    nodeStream.pipe(writer);

    return streamFinished(writer);
  }

  async fetchNodes(ids: string[]) {
    const res = await this.fetchAPI<GetFileNodesResponse>(
      `/files/${this.fileId}/nodes`,
      { ids: ids.join(",") }
    );

    return res.nodes;
  }

  async fetchFrames() {
    const res = await this.fetchAPI<GetFileResponse>(
      `/files/${this.fileId}?depth=2`
    );

    return normalizeFrames(res.document);
  }

  async fetchNodeChildren(id: string) {
    const res = await this.fetchAPI<GetFileNodesResponse>(
      `/files/${this.fileId}/nodes`,
      { ids: id }
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
      (n: Node) => n.type === "COMPONENT"
    );

    return nodes;
  }

  async fetchImages(ids: string[], format = "svg") {
    const res = await this.fetchAPI<GetImagesResponse>(
      `/images/${this.fileId}`,
      { ids: ids.join(","), format }
    );

    return res.images;
  }

  async fetchStyles() {
    const res = await this.fetchAPI<GetFileStylesResponse>(
      `/files/${this.fileId}/styles`
    );

    return res.meta.styles;
  }
}
