import {
  isScriptLoaded,
  hasExistingScriptTag,
  waitForOSSTag,
  createScriptTag,
} from "./script-utils";

export interface ScriptLoaderOptions {
  projectId: string;
  scriptUrls?: string[];
  autoInject?: boolean;
}

export async function loadOSSTagScript({
  projectId,
  scriptUrls = ["https://cdn.osstag.com/v1.min.js", "/osstag.js"],
  autoInject = true,
}: ScriptLoaderOptions): Promise<any> {
  if (isScriptLoaded()) {
    return window.OSSTag;
  }

  if (hasExistingScriptTag()) {
    return waitForOSSTag();
  }

  if (!autoInject) {
    throw new Error(
      "[otm] Script not present and autoInject=false. Add <script data-osstag> manually."
    );
  }

  for (const url of scriptUrls) {
    try {
      const tag = createScriptTag(url, projectId);
      document.head.appendChild(tag);

      const api = await waitForOSSTag();
      return api;
    } catch {}
  }

  throw new Error("[otm] Failed to load OSSTag script from all provided URLs");
}
