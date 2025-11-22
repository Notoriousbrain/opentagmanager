export function canonicalize(value: any): any {
  if (value === undefined) return null;
  if (value === null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => canonicalize(v));
  }

  if (typeof value === "object") {
    const out: Record<string, any> = {};
    const keys = Object.keys(value).sort();

    for (const k of keys) {
      out[k] = canonicalize(value[k]);
    }
    return out;
  }

  return String(value);
}

export function canonicalStringify(value: any): string {
  return JSON.stringify(canonicalize(value));
}
