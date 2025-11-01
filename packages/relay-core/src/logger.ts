import { writeLogLine } from "./log-writer";
export type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, msg: string, data?: Record<string, unknown>) {
  writeLogLine({ level, msg, ...data });
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => emit("debug", msg, data),
  info: (msg: string, data?: Record<string, unknown>) => emit("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => emit("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => emit("error", msg, data),
};
