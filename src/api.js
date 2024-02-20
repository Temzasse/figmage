// @ts-check
import axios from "axios";
import { promisify } from "util";
import { createWriteStream } from "fs";
import * as stream from "stream";
import { normalizeFrames } from "./utils";

const finished = promisify(stream.finished);

export default class FigmaAPI {
  /**
   * @param {{ accessToken: string; fileId: string }} param0
   */
  constructor({ accessToken, fileId }) {
    this.fileId = fileId;
    this.api = axios.create({
      baseURL: "https://api.figma.com/v1",
      headers: { "X-Figma-Token": accessToken },
    });
    this.fileApi = axios.create({
      headers: { "X-Figma-Token": accessToken },
    });
  }

  async downloadFile(url, outPath) {
    const writer = createWriteStream(outPath);

    return this.fileApi
      .get(url, { responseType: "stream" })
      .then((response) => {
        response.data.pipe(writer);
        return finished(writer);
      });
  }

  /**
   * @returns {Promise<string | null>} version
   */
  async fetchLatestVersion() {
    const res = await this.api.get(`/files/${this.fileId}/versions`);
    const versions = (res.data.versions || [])
      .filter((v) => v.label === "Components Published")
      .map((v) => v.id);

    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * @param {string[]} ids
   */
  async fetchNodes(ids) {
    const res = await this.api.get(`/files/${this.fileId}/nodes`, {
      params: { ids: ids.join(",") },
    });

    return res.data.nodes;
  }

  async fetchFrames() {
    const res = await this.api.get(`/files/${this.fileId}?depth=2'`);
    const frames = normalizeFrames(res.data.document);
    return frames;
  }

  /**
   * @param {string} id
   */
  async fetchNodeChildren(id) {
    const res = await this.api.get(`/files/${this.fileId}/nodes`, {
      params: { ids: id },
    });

    function flattenChildren(node) {
      const children = node.children || [];
      const flattened = [node];

      for (const child of children) {
        flattened.push(...flattenChildren(child));
      }

      return flattened;
    }

    const nodes = flattenChildren(res.data.nodes[id].document).filter(
      (n) => n.type === "COMPONENT"
    );

    return nodes;
  }

  /**
   * @param {string[]} ids
   * @param {string} format
   */
  async fetchImages(ids, format = "svg") {
    const res = await this.api.get(`/images/${this.fileId}`, {
      params: { ids: ids.join(","), format },
    });

    return res.data.images;
  }

  async fetchStyles() {
    const res = await this.api.get(`/files/${this.fileId}/styles`);
    return res.data.meta.styles;
  }
}
