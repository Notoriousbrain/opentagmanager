export function obfuscatePayload(canonicalJson: string) {
  const base64 = btoa(unescape(encodeURIComponent(canonicalJson)));
  return { d: base64 };
}

export interface ObfuscatedPayload {
  d: string;
}
