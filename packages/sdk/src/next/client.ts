"use client";

import { createAnalytics } from "../analytics/create-analytics";
import type { Analytics, AnalyticsConfig } from "../analytics/create-analytics";

export function createNextClient(config: AnalyticsConfig): Analytics {
  if (typeof window === "undefined") {
    throw new Error(
      "[otm] createNextClient() must run inside a Next.js Client Component"
    );
  }

  return createAnalytics(config);
}
