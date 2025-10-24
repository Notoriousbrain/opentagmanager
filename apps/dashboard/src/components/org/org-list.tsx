"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore } from "@/store/org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Separator,
  ListSkeleton,
  RoleBadge,
  hasKey,
} from "@otm/ui";

export function OrgList() {
  const router = useRouter();
  const { activeOrgId, setActiveOrg } = useOrgStore();

  const orgs = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isEmpty = orgs.isSuccess && (orgs.data?.length ?? 0) === 0;

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-lg">Organizations</CardTitle>
          <CardDescription className="text-zinc-400">
            Switch between organizations you belong to.
          </CardDescription>
        </div>
        <Button variant="inverse" onClick={() => router.push("/org/new")}>
          New org
        </Button>
      </CardHeader>

      <CardContent className="mt-6 space-y-6 px-6 pb-6">
        {orgs.isLoading && <ListSkeleton rows={3} />}

        {orgs.isError && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            Failed to load organizations.
          </div>
        )}

        {isEmpty && (
          <div className="flex min-h-[72px] items-center justify-between rounded-xl border border-dashed border-white/15 p-6">
            <p className="text-sm text-zinc-400">
              You don’t belong to any organizations yet.
            </p>
            <Button variant="inverse" onClick={() => router.push("/org/new")}>
              Create organization
            </Button>
          </div>
        )}

        {orgs.isSuccess && (orgs.data?.length ?? 0) > 0 && (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {orgs.data!.map((o) => {
              const isActive = o.id === activeOrgId;
              return (
                <li
                  key={o.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium leading-6">
                      {o.name}{" "}
                      {hasKey(o, "slug") && typeof o.slug === "string" && (
                        <span className="text-xs text-zinc-500">
                          ({o.slug})
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs leading-5 text-zinc-500">
                      {isActive ? "current organization" : "\u00A0"}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <RoleBadge role={o.role} />
                    <Button
                      variant={isActive ? "outline" : "default"}
                      onClick={() => {
                        setActiveOrg(o.id);
                        router.push("/dashboard");
                      }}
                    >
                      {isActive ? "Open" : "Switch"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Separator className="bg-white/10" />
        <p className="text-xs text-zinc-500">
          Your role controls what you can do inside each org.
        </p>
      </CardContent>
    </Card>
  );
}
