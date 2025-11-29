"use client";

import React, { useMemo } from "react";
import type { JSX, ReactNode } from "react";

import { createNextClient } from "./client";
import { useAutoPageview } from "../react/auto-pageview";
import type { Analytics, AnalyticsConfig } from "../analytics/create-analytics";

export const NextAnalyticsContext = React.createContext<{
  analytics: Analytics | null;
}>({
  analytics: null,
});

export function NextAnalyticsProvider({
  children,
  ...config
}: AnalyticsConfig & { children: ReactNode }): JSX.Element {
  const analytics = useMemo(() => createNextClient(config), [config]);

  useAutoPageview({ track: analytics.track });

  return (
    <NextAnalyticsContext.Provider value={{ analytics }}>
      {children}
    </NextAnalyticsContext.Provider>
  );
}
