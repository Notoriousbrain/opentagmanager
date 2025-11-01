export type LogLevel = "info" | "warn" | "error" | "debug";

function write(level: LogLevel, module: string, msg: string, extra?: Record<string, unknown>) {
  const log = {
    level,
    ts: new Date().toISOString(),
    module,
    msg,
    ...(extra ?? {}),
  };
  console.log(JSON.stringify(log));
}

export const logger = {
  info: (m: string, e?: Record<string, unknown>) => write("info", inferModule(), m, e),
  warn: (m: string, e?: Record<string, unknown>) => write("warn", inferModule(), m, e),
  error: (m: string, e?: Record<string, unknown>) => write("error", inferModule(), m, e),
  debug: (m: string, e?: Record<string, unknown>) => {
    if (process.env.DEBUG === "true") write("debug", inferModule(), m, e);
  },
};

function inferModule(): string {
  const err = new Error().stack?.split("\n")[3] ?? "";
  const match = err.match(/at (.*) \((.*):\d+:\d+\)/);
  const file = match?.[2]?.split("/").slice(-2).join("/") ?? "unknown";
  return file.replace(/\.js$/, "");
}
