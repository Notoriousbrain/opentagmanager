export function getScriptOrigin(): string | null {
  const script = document.querySelector<HTMLScriptElement>(
    "script[data-osstag]"
  );
  if (!script) return null;

  try {
    const url = new URL(script.src);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}
