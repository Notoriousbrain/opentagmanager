export function getIngestEndpoint(script: HTMLScriptElement): string {
  if (script.dataset.endpoint) {
    return script.dataset.endpoint;
  }

  return "/api/ingest";
}
