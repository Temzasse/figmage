import type { ConsolaInstance, ConsolaReporter, LogObject } from "consola";
import { colors, stripAnsi } from "consola/utils";

const PROGRESS_MARKER = "__figmageProgress";

type ProgressPayload = {
  [PROGRESS_MARKER]: true;
  current: number;
  total: number;
  msg?: string;
  done?: boolean;
};

class SyncProgressReporter implements ConsolaReporter {
  private lastLineLength = 0;

  log(logObj: LogObject, ctx: { options: { stdout?: NodeJS.WriteStream } }) {
    const payload = logObj.args.find(isProgressPayload);
    if (!payload) return;

    const stream = ctx.options.stdout || process.stdout;

    if (payload.done) {
      if (stream.isTTY) {
        const clearLine = this.lastLineLength > 0 ? " ".repeat(this.lastLineLength) : "";
        stream.write(`\r${clearLine}\r`);
        this.lastLineLength = 0;
      }
      return;
    }

    const total = Math.max(payload.total, 1);
    const current = Math.min(Math.max(payload.current, 0), total);
    const messageSuffix = payload.msg ? ` ${payload.msg}` : "";
    const meta = `${current}/${total}${messageSuffix}`;
    const prefixChar = "▹";

    if (!stream.isTTY) {
      stream.write(`${prefixChar} (${meta})\n`);
      return;
    }

    const barWidth = 20;
    const progressRatio = current / total;
    const filled = Math.round(progressRatio * barWidth);
    const bar = `${colors.blueBright("█".repeat(filled))}${colors.gray("░".repeat(barWidth - filled))}`;
    const percent = `${Math.round(progressRatio * 100)}%`.padStart(4, " ");
    const prefix = colors.blueBright(prefixChar);
    const line = `${prefix} [${bar}] ${percent} ${colors.dim(`(${meta})`)}`;

    const lineLength = stripAnsi(line).length;
    const clearPadding =
      this.lastLineLength > lineLength ? " ".repeat(this.lastLineLength - lineLength) : "";

    stream.write(`\r${line}${clearPadding}`);
    this.lastLineLength = lineLength;
  }
}

export function createProgressLogger(log: ConsolaInstance) {
  const logger = log.create({
    reporters: [new SyncProgressReporter()],
  });

  return (msg: string, payload: Omit<ProgressPayload, typeof PROGRESS_MARKER | "msg">) => {
    logger.info({
      [PROGRESS_MARKER]: true,
      msg,
      ...payload,
    } as ProgressPayload);
  };
}

function isProgressPayload(value: unknown): value is ProgressPayload {
  return Boolean(
    value &&
    typeof value === "object" &&
    PROGRESS_MARKER in value &&
    (value as ProgressPayload)[PROGRESS_MARKER],
  );
}
