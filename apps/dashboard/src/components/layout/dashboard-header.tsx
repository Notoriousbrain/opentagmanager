"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
import { Button, Skeleton } from "@otm/ui";
import { UserMenu } from "./user-menu";
import { OrgSwitcher } from "../org/org-switcher";
import Image from "next/image";
import Link from "next/link";

export function DashboardHeader() {
  const router = useRouter();
  const { org, orgs: orgStoreOrgs } = useActiveOrg();

  const me = trpc.account.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const orgs = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const activeOrg = useMemo(() => {
    const inStore = orgStoreOrgs.find((o) => o.id === org?.id);
    const inQuery = orgs.data?.find((o) => o.id === org?.id);
    return inStore ?? inQuery ?? null;
  }, [orgStoreOrgs, org?.id, orgs.data]);

  const manyOrgs = (orgs.data?.length ?? 0) > 1;

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
      <div className="min-w-0 flex items-center gap-4 ">
        <Image
          src="/logo.svg"
          priority
          width={100}
          height={100}
          alt="Oss Tag"
        />
        {orgs.isLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : activeOrg ? (
          <div className="truncate text-sm text-zinc-300">
            Org:{" "}
            <span className="font-medium text-zinc-100">{activeOrg.name}</span>
          </div>
        ) : (
          <div className="text-sm text-zinc-500">No active organization</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {manyOrgs ? (
          <OrgSwitcher />
        ) : (
          <Button variant="outline" onClick={() => router.push("/org")}>
            {activeOrg ? "Organization" : "Select org"}
          </Button>
        )}

        <Link href="/dashboard/metrics" prefetch={false}>
          <Button variant="outline">Metrics</Button>
        </Link>

        {me.isLoading ? (
          <Skeleton className="h-8 w-28 rounded-md" />
        ) : me.data ? (
          <UserMenu account={{ email: me.data.email, name: me.data.name }} />
        ) : (
          <Button variant="inverse" onClick={() => router.push("/signin")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
