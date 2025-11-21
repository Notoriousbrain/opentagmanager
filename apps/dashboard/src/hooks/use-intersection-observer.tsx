"use client"
import { useEffect } from "react";

export function useIntersectionObserver({
  target,
  onIntersect,
  enabled = true,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: {
  target: React.RefObject<Element | null>;
  onIntersect: () => void;
  enabled?: boolean;
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number;
}) {
  useEffect(() => {
    if (!enabled) return;

    const element = target.current;
    if (!element) return;

    let block = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) {
          block = false;
          return;
        }
        if (block) return;
        block = true;
        onIntersect();
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, enabled, root, rootMargin, threshold, onIntersect]);
}
