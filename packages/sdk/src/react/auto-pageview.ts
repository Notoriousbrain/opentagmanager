"use client";

import { useEffect, useRef } from "react";
import type { WebClient } from "../client/create-client";

export function useAutoPageview(client: WebClient) {
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!client) return;

    const trackPageview = () => {
      const url = window.location.href;
      if (lastUrlRef.current === url) return;
      lastUrlRef.current = url;

      client.track("$pageview", {
        url,
        referrer: document.referrer || null,
      });
    };

    trackPageview();

    try {
      import("next/navigation")
        .then((nav) => {
          try {
            const { usePathname, useSearchParams } = nav;
            const pathname = usePathname?.();
            const search = useSearchParams?.()?.toString();

            useEffect(() => {
              trackPageview();
            }, [pathname, search]);
          } catch {}
        })
        .catch(() => {});
    } catch {}

    const pushState = history.pushState;
    history.pushState = function (...args) {
      pushState.apply(history, args as any);
      trackPageview();
    };

    const replaceState = history.replaceState;
    history.replaceState = function (...args) {
      replaceState.apply(history, args as any);
      trackPageview();
    };

    window.addEventListener("popstate", trackPageview);

    return () => {
      window.removeEventListener("popstate", trackPageview);
      history.pushState = pushState;
      history.replaceState = replaceState;
    };
  }, [client]);
}
