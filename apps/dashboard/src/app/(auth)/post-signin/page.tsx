"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore } from "@/store/org";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
} from "@otm/ui";

function sameOrgList(
  a: { id: string }[] | undefined,
  b: { id: string }[]
): boolean {
  if (!a) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

export default function PostSignInPage() {
  const router = useRouter();
  const { setActiveOrg, setOrgs } = useOrgStore();
  const routedRef = useRef(false);

  const mine = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    retry(failureCount, err) {
      const is401 =
        typeof err?.message === "string" &&
        /unauthorized|401/i.test(err.message);
      return is401 ? failureCount < 2 : failureCount < 3;
    },
  });

  useEffect(() => {
    if (mine.status !== "success" || routedRef.current) return;

    const orgs = mine.data ?? [];
    setOrgs((prev) => (sameOrgList(prev, orgs) ? prev : orgs));

    if (orgs.length === 0) {
      routedRef.current = true;
      router.replace("/org/new");
      return;
    }
    if (orgs.length === 1) {
      routedRef.current = true;
      setActiveOrg(orgs[0].id);
      router.replace("/dashboard");
      return;
    }
    routedRef.current = true;
    router.replace("/org");
  }, [mine.status, mine.data, router, setActiveOrg, setOrgs]);

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg">Signing you in…</CardTitle>
        <CardDescription className="text-zinc-400">
          Preparing your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
