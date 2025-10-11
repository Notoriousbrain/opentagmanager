"use client";

import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Skeleton,
  Separator,
} from "@otm/ui";
import { useActiveOrg } from "@/hooks/use-active-org";

type Project = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "disabled" | "archived";
};

export function ProjectsPanel() {
  const { activeOrgId, activeOrg, canCreateProject } = useActiveOrg("/org");

  const q = trpc.projects.list.useQuery(
    { orgId: activeOrgId ?? "" },
    { enabled: !!activeOrgId, refetchOnWindowFocus: false }
  );

  const projects: Project[] = q.data ?? [];

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-xl">Projects</CardTitle>
          <CardDescription className="text-zinc-400">
            {activeOrg
              ? `Organization: ${activeOrg.name} (${activeOrg.role})`
              : "Select an organization to continue."}
          </CardDescription>
        </div>

        {canCreateProject && (
          <Button
            onClick={() => (window.location.href = "/dashboard/projects/new")}
            className="rounded-lg"
          >
            New project
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        {!activeOrgId && (
          <p className="text-sm text-zinc-400">
            No active organization selected. Choose one first.
          </p>
        )}

        {activeOrgId && q.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-2/3 rounded-lg" />
          </div>
        )}

        {activeOrgId && q.isError && (
          <p className="text-sm text-red-400">
            Failed to load projects. Please try again.
          </p>
        )}

        {activeOrgId && q.isSuccess && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-zinc-400">
            No projects yet.{" "}
            {canCreateProject
              ? "Create your first project."
              : "Ask an admin to create one."}
          </div>
        )}

        {activeOrgId && projects.length > 0 && (
          <>
            <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-zinc-400">
                      {p.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-zinc-400">
                      {p.status}
                    </span>
                    <Button
                      variant="outline"
                      className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
                      onClick={() =>
                        (window.location.href = `/dashboard/projects/${p.id}`)
                      }
                    >
                      Open
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <Separator className="bg-white/10" />

            <p className="text-xs text-zinc-500">
              RBAC enforced on the server; UI only shows allowed actions.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
