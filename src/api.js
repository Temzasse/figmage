// @ts-check
import axios from "axios";

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

  /**
   * @param {string} id
   */
  async fetchNodeChildren(id) {
    const res = await this.api.get(`/files/${this.fileId}/nodes`, {
      params: { ids: id },
    });

    return res.data.nodes[id].document.children.filter(
      (node) => node.type === "COMPONENT"
    );
  }

  /**
   * @param {string} id
   */
  async fetchImages(id) {
    const res = await this.api.get(`/images/${this.fileId}`, {
      params: { ids: id, format: "svg" },
    });

    return res.data.images;
  }

  async fetchStyles() {
    const res = await this.api.get(`/files/${this.fileId}/styles`);
    return res.data.meta.styles;
  }
}
