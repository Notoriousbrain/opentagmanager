// src/analytics/create-analytics.ts

import { loadOSSTagScript } from "./script-loader";
import type { WebClient, WebClientConfig } from "../client/create-client";
import { createClient } from "../client/create-client";

export interface AnalyticsConfig {
  projectId: string;

  autoInjectScript?: boolean;

  scriptUrls?: string[];

  client?: Partial<WebClientConfig>;
}

export interface Analytics {
  track: WebClient["track"];
  identify: WebClient["identify"];
  flush: WebClient["flush"];
  debug: WebClient["debug"];
  ready: () => Promise<void>;
}

export function createAnalytics(config: AnalyticsConfig): Analytics {
  let readyPromise: Promise<void> | null = null;

  async function ensureReady() {
    if (!readyPromise) {
      readyPromise = (async () => {
        const { projectId, autoInjectScript, scriptUrls } = config;

        const osstag = await loadOSSTagScript({
          projectId,
          scriptUrls,
          autoInject: autoInjectScript !== false,
        });

        osstag.init();

        client = createClient({
          projectId,
          send: () => {},
          ...config.client,
        });
      })();
    }

    return readyPromise;
  }

  let client: WebClient | null = null;

  return {
    async track(name, props) {
      await ensureReady();
      return client!.track(name, props);
    },

    async identify(id) {
      await ensureReady();
      return client!.identify(id);
    },

    async flush() {
      await ensureReady();
      return client!.flush();
    },

    async debug() {
      await ensureReady();
      return client!.debug();
    },

    ready: ensureReady,
  };
}
