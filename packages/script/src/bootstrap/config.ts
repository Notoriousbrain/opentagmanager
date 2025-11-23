export interface ScriptConfig {
  ingestUrl: string;
  antiBlock: {
    enabled: boolean;
  };
}

export function buildConfig(): ScriptConfig {
  let ingestUrl = "/api/ingest";

  const script = document.querySelector<HTMLScriptElement>(
    "script[data-osstag]"
  );

  if (script) {
    const override = script.dataset.endpoint;
    if (override) {
      ingestUrl = override;
    } else {
      const src = script.src;
      if (src) {
        try {
          const url = new URL(src);
          ingestUrl = `${url.protocol}//${url.host}/api/ingest`;
        } catch {}
      }
    }
  }

  return { ingestUrl, antiBlock: { enabled: false } };
}
