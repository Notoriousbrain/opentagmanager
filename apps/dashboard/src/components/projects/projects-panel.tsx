"use client";

import { useMemo } from "react";
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
  formatDateWithRelative,
} from "@otm/ui";

type OrgRole = "owner" | "admin" | "editor" | "viewer";

function canCreateProjects(role: OrgRole | undefined): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string | Date | null;
};

export function ProjectsPanel() {
  const router = useRouter();
  const { activeOrgId, orgs } = useOrgStore();

  const role: OrgRole | undefined = useMemo(
    () => orgs.find((o) => o.id === activeOrgId)?.role as OrgRole | undefined,
    [orgs, activeOrgId]
  );

  const canCreate = canCreateProjects(role);

  const projects = trpc.projects.list.useQuery(
    { orgId: activeOrgId ?? "" },
    {
      enabled: !!activeOrgId,
      refetchOnWindowFocus: false,
    }
  );

  const goProject = (id: string) => {
    router.push(`/dashboard/projects/${id}`);
  };

  const goNewProject = () => {
    router.push("/dashboard/new-project"); // adjust to your actual route/dialog
  };

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-lg">Projects</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage and switch projects within your current organization.
          </CardDescription>
        </div>

        <div className="flex flex-col items-end">
          <Button
            variant="inverse"
            onClick={goNewProject}
            disabled={!canCreate}
            aria-disabled={!canCreate}
            title={
              !canCreate ? "Requires Editor or higher" : "Create a new project"
            }
          >
            New project
          </Button>
          {!canCreate && (
            <span className="mt-1 text-[11px] text-zinc-500">
              Requires <strong>Editor</strong> or higher
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-6 space-y-6 px-6 pb-6">
        {/* Loading skeleton */}
        {projects.isLoading && <ListSkeleton rows={4} />}

        {/* Error state */}
        {projects.isError && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            Failed to load projects.
          </div>
        )}

        {/* Empty state */}
        {projects.isSuccess && (projects.data?.length ?? 0) === 0 && (
          <div className="flex min-h-[72px] items-center justify-between rounded-xl border border-dashed border-white/15 p-6">
            <p className="text-sm text-zinc-400">
              No projects yet.
              {canCreate
                ? " Create your first project to get started."
                : " Ask an editor or admin to create one for you."}
            </p>
            <Button
              variant="inverse"
              onClick={goNewProject}
              disabled={!canCreate}
              aria-disabled={!canCreate}
            >
              New project
            </Button>
          </div>
        )}

        {/* List */}
        {projects.isSuccess && (projects.data?.length ?? 0) > 0 && (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {projects.data!.map((p: Project) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium leading-6">
                    {p.name}{" "}
                    <span className="text-xs text-zinc-500">({p.slug})</span>
                  </div>
                  <div className="truncate text-xs leading-5 text-zinc-500">
                    created {formatDateWithRelative(p.createdAt)}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => goProject(p.id)}
                    aria-label={`Open project ${p.name}`}
                  >
                    Open
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Separator className="bg-white/10" />
        <p className="text-xs text-zinc-500">
          Projects group API keys and settings. You can switch organizations
          from the header.
        </p>
      </CardContent>
    </Card>
  );
}
