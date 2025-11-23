"use client";

import { createClient } from "../client/create-client";
import type { WebClient, WebClientConfig } from "../client/create-client";

export function createNextClient(config: WebClientConfig): WebClient {
  if (typeof window === "undefined") {
    throw new Error(
      "[otm] createNextClient() can only be used inside Next.js Client Components"
    );
  }

  return createClient(config);
}
