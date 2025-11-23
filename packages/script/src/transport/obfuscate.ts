export interface ObfuscatedPayload {
  d: string;
}

export function obfuscatePayload(raw: string): string {
  const utf8 = new TextEncoder().encode(raw);
  const base64 = btoa(String.fromCharCode(...utf8));

  return JSON.stringify({ d: base64 });
}
