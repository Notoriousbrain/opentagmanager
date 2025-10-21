export function getApiBase() {
  if (typeof window !== "undefined") {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error("Missing NEXT_PUBLIC_API_URL");
    return base.replace(/\/$/, "");
  }

  const base = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing API_SERVER_URL / NEXT_PUBLIC_API_URL");
  return base.replace(/\/$/, "");
}
