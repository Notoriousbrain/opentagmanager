import { logger } from "./logger";

export function decodeFlexible(rawBody: string): unknown {
  try {
    const parsed = JSON.parse(rawBody);

    if (parsed && typeof parsed === "object" && "d" in parsed) {
      const d = (parsed as any).d;
      if (typeof d !== "string") throw new Error("d is not a string");

      const inner = Buffer.from(d, "base64").toString("utf8");
      return JSON.parse(inner);
    }

    if (parsed && typeof parsed === "object") {
      return parsed;
    }

    throw new Error("Parsed value is not an object");
  } catch (e) {
    logger.error("decodeFlexible failed", {
      error: (e as Error).message,
      rawBody,
    });
    return null;
  }
}
