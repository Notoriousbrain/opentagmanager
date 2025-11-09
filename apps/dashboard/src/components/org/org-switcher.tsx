"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  RoleBadge,
  ListSkeleton,
} from "@otm/ui";

type OrgRole = "owner" | "admin" | "editor" | "viewer";

type OrgItem = {
  id: string;
  name: string;
  role: OrgRole;
};

export function OrgSwitcher() {
  const router = useRouter();
  const { org } = useActiveOrg();

  const orgs = trpc.orgs.mine.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const active = useMemo(
    () => orgs.data?.find((o) => o.id === org?.id) ?? null,
    [orgs.data, org?.id]
  );

  const label = active?.name ?? "Select organization";

  if (orgs.isLoading) {
    return <ListSkeleton rows={1} />;
  }

  if (!orgs.data || orgs.data.length === 0) {
    return (
      <Button variant="inverse" onClick={() => router.push("/org/new")}>
        New org
      </Button>
    );
  }

  if (orgs.data.length === 1) {
    return (
      <Button variant="outline" onClick={() => router.push("/org")}>
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Switch organization"
          className="max-w-[220px] truncate"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[240px] truncate">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.data.map((o: OrgItem) => {
          return (
            <DropdownMenuItem
              key={o.id}
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              <span className="mr-2 inline-flex min-w-0 flex-1 items-center truncate">
                <span className="truncate">{o.name}</span>
              </span>
              <RoleBadge role={o.role} />
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/org/new")}>
          + Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
