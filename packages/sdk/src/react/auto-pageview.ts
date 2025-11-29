"use client";

import { useEffect, useRef } from "react";

export interface PageviewAPI {
  track: (name: string, props?: any) => Promise<void> | void;
}

export function useAutoPageview(api: PageviewAPI) {
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!api) return;

    const trackPageview = () => {
      const url = window.location.href;
      if (lastUrlRef.current === url) return;
      lastUrlRef.current = url;

      api.track("$pageview", {
        url,
        referrer: document.referrer || null,
      });
    };

    trackPageview();

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

    return () => {
      window.removeEventListener("popstate", trackPageview);
      history.pushState = pushState;
      history.replaceState = replaceState;
    };
  }, [api]);
}
