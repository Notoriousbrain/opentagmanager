"use client";

import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { OTMContext } from "./context";
import { createAnalytics } from "../analytics/create-analytics";
import type { AnalyticsConfig, Analytics } from "../analytics/create-analytics";
import { useAutoPageview } from "./auto-pageview";

export interface OTMProviderProps extends AnalyticsConfig {
  children: ReactNode;
}

export function OTMProvider({ children, ...config }: OTMProviderProps) {
  const analytics: Analytics = useMemo(() => {
    return createAnalytics(config);
  }, [config]);

  useAutoPageview({
    track: analytics.track,
  });

  return (
    <OTMContext.Provider value={{ analytics }}>
      {children}
    </OTMContext.Provider>
  );
}
