// src/analytics/script-loader.ts
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
  scriptUrls = [
    "https://cdn.osstag.com/v1.min.js", // primary
    "/osstag.js",                       // fallback to origin
  ],
  autoInject = true,
}: ScriptLoaderOptions): Promise<any> {
  if (isScriptLoaded()) {
    return window.OSSTag;
  }

  // If script tag already exists, just wait for it
  if (hasExistingScriptTag()) {
    return waitForOSSTag();
  }

  if (!autoInject) {
    throw new Error(
      "[otm] Script not present and autoInject=false. Add <script data-osstag> manually."
    );
  }

  // Try loading urls in order
  for (const url of scriptUrls) {
    try {
      const tag = createScriptTag(url, projectId);
      document.head.appendChild(tag);

      // If it loads, OSSTag becomes available
      const api = await waitForOSSTag();
      return api;
    } catch {
      // try next url
    }
  }

  throw new Error("[otm] Failed to load OSSTag script from all provided URLs");
}
