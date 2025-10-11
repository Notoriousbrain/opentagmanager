"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrgStore } from "@/store/org";

export function useActiveOrg(redirectTo: string = "/org") {
  const router = useRouter();
  const pathname = usePathname();

  const hydrated = useOrgStore((s) => s.hydrated);
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const orgs = useOrgStore((s) => s.orgs);

  const activeOrg = useMemo(
    () => orgs.find((o) => o.id === activeOrgId) ?? null,
    [orgs, activeOrgId]
  );
  const role = activeOrg?.role;
  const canCreateProject = role === "owner" || role === "admin";

  useEffect(() => {
    if (!hydrated) return;
    if (!activeOrgId && pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [hydrated, activeOrgId, pathname, redirectTo, router]);

  return { hydrated, activeOrgId, activeOrg, canCreateProject };
}
