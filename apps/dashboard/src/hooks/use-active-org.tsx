"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore } from "@/store/org";

const ORG_NEW = "/org/new";
const ORG_PICK = "/org";
const DASHBOARD = "/dashboard";

export function useActiveOrg() {
  const router = useRouter();
  const pathname = usePathname();

  const { activeOrgId, setActiveOrg, setOrgs } = useOrgStore();
  const mine = trpc.orgs.mine.useQuery(undefined, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (mine.data) setOrgs(mine.data);
  }, [mine.data, setOrgs]);

  const status = useMemo(() => {
    if (mine.isLoading) return "loading" as const;
    const count = mine.data?.length ?? 0;
    if (count === 0) return "zero" as const;
    if (count === 1) return "one" as const;
    return "many" as const;
  }, [mine.isLoading, mine.data]);

  useEffect(() => {
    if (mine.isLoading) return;

    if (status === "zero") {
      if (pathname !== ORG_NEW) router.replace(ORG_NEW);
      return;
    }

    if (status === "one") {
      const only = mine.data![0];
      if (activeOrgId !== only.id) setActiveOrg(only.id);
      if (pathname === ORG_PICK || pathname === ORG_NEW) router.replace(DASHBOARD);
      return;
    }

    if (status === "many") {
      if (!activeOrgId) {
        if (pathname !== ORG_PICK) router.replace(ORG_PICK);
      }
    }
  }, [status, mine.isLoading, mine.data, activeOrgId, pathname, router, setActiveOrg]);

  return { status, activeOrgId, orgs: mine.data ?? [], isLoading: mine.isLoading };
}
