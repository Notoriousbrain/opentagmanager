"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/react";

const ORG_NEW = "/org/new";
const ORG_PICK = "/org";

export function useActiveOrg() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const selectedOrgId = search.get("org");

  const mine = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const status = useMemo(() => {
    if (mine.isLoading) return "loading" as const;
    const count = mine.data?.length ?? 0;
    if (count === 0) return "zero" as const;
    if (count === 1) return "one" as const;
    return "many" as const;
  }, [mine.isLoading, mine.data]);

  const orgs = mine.data ?? [];

  // Determine active org: explicit query param > first org
  const org =
    orgs.find((o) => o.id === selectedOrgId) ??
    (orgs.length === 1 ? orgs[0] : null);

  useEffect(() => {
    if (mine.isLoading) return;

    if (status === "zero" && pathname !== ORG_NEW && pathname !== ORG_PICK) {
      router.replace(ORG_NEW);
      return;
    }

    if (status === "many" && !selectedOrgId && pathname !== ORG_PICK) {
      router.replace(ORG_PICK);
      return;
    }
  }, [mine.isLoading, status, selectedOrgId, pathname, router]);

  return { org, orgs, status, isLoading: mine.isLoading };
}
