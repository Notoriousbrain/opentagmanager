"use client";

import { useContext } from "react";
import type { Analytics } from "../analytics/create-analytics";
import { NextAnalyticsContext } from "./provider";

export function useAnalytics(): Analytics {
  const ctx = useContext(NextAnalyticsContext);

  if (!ctx || !ctx.analytics) {
    throw new Error(
      "[otm] useAnalytics() must be used inside <NextAnalyticsProvider>"
    );
  }

  return ctx.analytics;
}
