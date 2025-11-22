export interface ScriptConfig {
  ingestUrl: string;
}

export function buildConfig(): ScriptConfig {
  const script = document.querySelector<HTMLScriptElement>(
    "script[data-osstag]"
  );
  if (!script) {
    return { ingestUrl: "/api/ingest" };
  }

  const override = script.dataset.endpoint;
  if (override) {
    return { ingestUrl: override };
  }

  const src = script.src;
  if (src) {
    try {
      const url = new URL(src);
      return {
        ingestUrl: `${url.protocol}//${url.host}/api/ingest`,
      };
    } catch {}
  }

  return { ingestUrl: "/api/ingest" };
}
