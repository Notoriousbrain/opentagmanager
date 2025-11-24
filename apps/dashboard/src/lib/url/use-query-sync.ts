"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useQuerySync(
  filters: Record<string, string | null | undefined>
) {
  const router = useRouter();
  const search = useSearchParams();

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams(search.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router, search]);

  return { search, syncToUrl };
}
