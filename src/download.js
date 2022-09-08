// @ts-check
import axios from "axios";
import { promisify } from "util";
import { createWriteStream } from "fs";
import * as stream from "stream";

const finished = promisify(stream.finished);

/**
 * @param {string} url
 * @param {string} outputLocationPath
 */
export async function downloadFile(url, outputLocationPath) {
  const writer = createWriteStream(outputLocationPath);
  return axios({ method: "get", url, responseType: "stream" }).then(
    (response) => {
      response.data.pipe(writer);
      return finished(writer);
    }
  );
}
