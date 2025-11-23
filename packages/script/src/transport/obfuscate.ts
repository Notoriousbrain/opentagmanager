export interface ObfuscatedPayload {
  d: string;
}

export function obfuscatePayload(raw: string): {
  json: string;
  base64: string;
} {
  const utf8 = new TextEncoder().encode(raw);
  const base64 = btoa(String.fromCharCode(...utf8));

  return {
    json: JSON.stringify({ d: base64 }),
    base64,
  };
}
