"use client";

import React from "react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { OTMContext } from "./context";
import type { WebClientConfig, WebClient } from "../client/create-client";
import { createClient } from "../client/create-client";
import { useAutoPageview } from "./auto-pageview";

export interface OTMProviderProps {
  config: WebClientConfig;
  children: ReactNode;
}

export function OTMProvider({ config, children }: OTMProviderProps) {
  const client: WebClient = useMemo(() => {
    return createClient(config);
  }, [config]);

  useAutoPageview(client);

  return (
    <OTMContext.Provider value={{ client }}>{children}</OTMContext.Provider>
  );
}
