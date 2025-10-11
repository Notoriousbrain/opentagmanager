"use client";

import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Button, Separator, Skeleton,
} from "@otm/ui";
import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectsPanel() {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setOrgId(localStorage.getItem("otm.orgId"));
    read();
    window.addEventListener("otm:org-changed", read);
    return () => window.removeEventListener("otm:org-changed", read);
  }, []);

  const query = trpc.projects.list.useQuery(
    { orgId: orgId ?? "" },
    { enabled: !!orgId }
  );

  const projects = useMemo(() => query.data ?? [], [query.data]);

  return (
    <Card className="border-black/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">Projects</CardTitle>
          <CardDescription className="">
            {orgId ? `Organization: ${orgId}` : "Select an org to view projects."}
          </CardDescription>
        </div>
        <CreateProjectDialog orgId={orgId} onCreated={() => query.refetch()} />
      </CardHeader>
      <CardContent className="space-y-4">
        {!orgId && (
          <p className="text-sm ">
            Enter an org ID in the header to load projects.
          </p>
        )}

        {orgId && query.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-2/3 rounded-lg" />
          </div>
        )}

        {orgId && query.isSuccess && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/15 p-6 text-sm">
            No projects yet. Create your first project.
          </div>
        )}

        {orgId && projects.length > 0 && (
          <ul className="divide-y divide-black/5 rounded-xl border border-black/10">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs ">{p.slug}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-black/15 px-2 py-0.5 text-xs">
                    {p.status}
                  </span>
                  {/* per-project route soon */}
                  <Button variant="outline" className="rounded-lg">Open</Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Separator className="my-2" />

        <div className="text-xs">
          RBAC enforced server-side; viewer+ can list, admin+ can create.
        </div>
      </CardContent>
    </Card>
  );
}
