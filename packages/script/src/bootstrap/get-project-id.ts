export function getProjectId(): string | null {
  if (typeof document === "undefined") return null;

  const script = document.querySelector<HTMLScriptElement>(
    'script[data-osstag]'
  );

  return script?.dataset.osstag ?? null;
}
