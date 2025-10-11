"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Org, useOrgStore } from "@/store/org";
import { trpc } from "@/lib/trpc/react";
import { Card, CardContent, Skeleton } from "@otm/ui";

export default function PostSignin() {
  const router = useRouter();
  const setOrgs = useOrgStore((s) => s.setOrgs);
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);

  const q = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!q.isSuccess) return;

    const orgs: Org[] = q.data ?? [];

    setOrgs(orgs);

    if (orgs.length === 1) {
      setActiveOrg(orgs[0].id);
      router.replace("/dashboard");
    } else if (orgs.length === 0) {
      setActiveOrg(null);
      router.replace("/org");
    } else {
      setActiveOrg(null);
      router.replace("/org");
    }
  }, [q.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <Card className="w-full max-w-sm border-white/10">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-2/3 rounded" />
        </CardContent>
      </Card>
    </main>
  );
}
