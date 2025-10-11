"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgStore, type Org } from "@/store/org";
import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Separator,
  Skeleton,
} from "@otm/ui";
import { CreateOrgCard } from "./create-org-dialog";

export function OrgList() {
  const router = useRouter();
  const { orgs, setOrgs, setActiveOrg } = useOrgStore();

  // fetch orgs
  const q = trpc.orgs.mine.useQuery(undefined, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (q.isSuccess && q.data) setOrgs(q.data as Org[]);
  }, [q.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (org: Org) => {
    setActiveOrg(org.id);
    router.push("/dashboard");
  };

  // toggle for inline creation UI (reuses CreateOrgCard)
  const [creating, setCreating] = useState(false);

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl tracking-tight">
              Select organization
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Choose an org to continue. You’ll only see actions permitted for
              your role.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
            onClick={() => setCreating((v) => !v)}
          >
            {creating ? "Close" : "New org"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 mt-6 pb-6 space-y-6">
        {creating && <CreateOrgCard />}

        {q.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-5/6 rounded-xl" />
            <Skeleton className="h-12 w-2/3 rounded-xl" />
          </div>
        )}

        {!q.isLoading && orgs.length === 0 && !creating && (
          <div className="rounded-xl border border-dashed border-white/15 p-6">
            <div className="space-y-2">
              <div className="text-sm text-zinc-300">No organizations yet.</div>
              <div className="text-xs text-zinc-500">
                Create one to get started.
              </div>
            </div>
            <Separator className="my-4 bg-white/10" />
            <Button
              className="rounded-lg bg-white text-black hover:bg-white/90"
              onClick={() => setCreating(true)}
            >
              Create organization
            </Button>
          </div>
        )}

        {!q.isLoading && orgs.length > 0 && (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {orgs.map((org) => (
              <li
                key={org.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{org.name}</div>
                  <div className="truncate text-xs text-zinc-400">{org.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-zinc-400">
                    {org.role}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => select(org)}
                    className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
                  >
                    Use
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
