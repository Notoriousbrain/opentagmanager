export function waitForOSSTag(timeoutMs = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function check() {
      if (window.OSSTag && window.OSSTag.init) {
        return resolve(window.OSSTag);
      }
      if (Date.now() - start >= timeoutMs) {
        return reject(new Error("[otm] OSSTag script did not load in time"));
      }
      requestAnimationFrame(check);
    }

    check();
  });
}

export function isScriptLoaded(): boolean {
  return Boolean(window.OSSTag && window.OSSTag.init);
}

export function hasExistingScriptTag(): boolean {
  return !!document.querySelector("script[data-osstag]");
}

export function createScriptTag(
  projectId: string
): HTMLScriptElement {
  const script = document.createElement("script");
  script.async = true;
  script.dataset.osstag = projectId;
  // NOTE: src is NOT set here to avoid race conditions.
  // Set script.src AFTER attaching onload/onerror handlers.
  return script;
}
