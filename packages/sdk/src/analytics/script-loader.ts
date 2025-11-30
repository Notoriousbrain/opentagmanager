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
      });
      return api;
    } catch {
      emitTelemetry(onTelemetry, { errored: true });
      throw new Error("[otm] OSSTag failed to initialize");
    }
  }

  if (!autoInject) {
    throw new Error("[otm] Script missing and autoInject=false");
  }

  for (const url of scriptUrls) {
    try {
      const tag = createScriptTag(url, projectId);

      tag.onload = () => {
        emitTelemetry(onTelemetry, { loaded: true }, projectId);
      };
      tag.onerror = () => {
        emitTelemetry(onTelemetry, { errored: true }, projectId);
      };

      document.head.appendChild(tag);

      const api = await waitForOSSTag();

      emitTelemetry(onTelemetry, {
        loaded: true,
        osstagReady: true,
      });

      return api;
    } catch {
      emitTelemetry(onTelemetry, { errored: true }, projectId);
    }
  }

  throw new Error("[otm] Failed to load OSSTag script");
}
