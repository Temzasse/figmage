import { consola } from "consola";

export const log = {
  info: (msg: string) => consola.info(msg),
  error: (msg: string) => consola.error(msg),
  warn: (msg: string) => consola.warn(msg),
  start: (msg: string) => consola.start(msg),
  success: (msg: string) => consola.success(msg),
};
