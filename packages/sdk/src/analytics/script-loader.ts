import {
  isScriptLoaded,
  hasExistingScriptTag,
  waitForOSSTag,
  createScriptTag,
} from "./script-utils";

export interface ScriptTelemetry {
  loaded: boolean;
  errored: boolean;
  osstagReady: boolean;
}

export interface ScriptLoaderOptions {
  projectId: string;
  scriptUrls?: string[];
  autoInject?: boolean;
  onTelemetry?: (t: ScriptTelemetry) => void;
}

function emitTelemetry(
  fn: ScriptLoaderOptions["onTelemetry"],
  partial: Partial<ScriptTelemetry>,
  projectId?: string
) {
  if (projectId) {
    fetch("/api/install/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, ...partial }),
    }).catch(() => {});
  }

  if (fn)
    fn({
      loaded: partial.loaded ?? false,
      errored: partial.errored ?? false,
      osstagReady: partial.osstagReady ?? false,
    });
}

export async function loadOSSTagScript({
  projectId,
  scriptUrls = ["https://cdn.osstag.com/v1.min.js", "/osstag.js"],
  autoInject = true,
  onTelemetry,
}: ScriptLoaderOptions): Promise<any> {
  if (isScriptLoaded()) {
    emitTelemetry(onTelemetry, {
      loaded: true,
      osstagReady: true,
    });
    return window.OSSTag;
  }

  if (hasExistingScriptTag()) {
    try {
      const api = await waitForOSSTag();
      emitTelemetry(onTelemetry, {
        loaded: true,
        osstagReady: true,
      }, projectId);
      return api;
    } catch {
      emitTelemetry(onTelemetry, { errored: true }, projectId);
      throw new Error("[otm] OSSTag failed to initialize");
    }
  }

  if (!autoInject) {
    throw new Error("[otm] Script missing and autoInject=false");
  }

  for (const url of scriptUrls) {
    try {
      const tag = createScriptTag(projectId);

      // Use a promise to track script load/error before OSSTag initialization
      const scriptLoadPromise = new Promise<void>((resolve, reject) => {
        tag.onload = () => resolve();
        tag.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      });

      // Set src AFTER attaching listeners to avoid race condition with cached scripts
      tag.src = url;
      document.head.appendChild(tag);

      // Wait for script to load
      await scriptLoadPromise;

      // Wait for OSSTag to initialize
      const api = await waitForOSSTag();

      // Emit telemetry only once when fully ready
      emitTelemetry(onTelemetry, {
        loaded: true,
        osstagReady: true,
      }, projectId);

      return api;
    } catch {
      emitTelemetry(onTelemetry, { errored: true }, projectId);
    }
  }

  throw new Error("[otm] Failed to load OSSTag script");
}
