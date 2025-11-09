"use client";

import { useEffect, useRef } from "react";

export function usePolling(callback: () => void, intervalMs = 3000) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) saved.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
