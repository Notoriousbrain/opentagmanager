"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
import {
  Button,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ListSkeleton,
  formatDateWithRelative,
} from "@otm/ui";
import { ApiKeysPanel } from "@/components/api-keys/api-keys-panel";
import { Role } from "@/types/org";

function canCreateProjects(role: Role | undefined): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string | Date | null;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { org, orgs } = useActiveOrg();

  const role: Role | undefined = useMemo(
    () => orgs.find((o) => o.id === org?.id)?.role,
    [orgs, org?.id]
  );

  const canCreate = canCreateProjects(role);

  const projects = trpc.projects.list.useQuery(
    { orgId: org?.id ?? "" },
    { enabled: !!org?.id, refetchOnWindowFocus: false }
  );

  const project: Project | undefined = useMemo(
    () => projects.data?.find((p) => p.id === projectId),
    [projects.data, projectId]
  );

  useEffect(() => {
    if (org?.id && projectId) {
      try {
        localStorage.setItem(`otm.lastProject.${org?.id}`, projectId);
      } catch {}
    }
  }, [org?.id, projectId]);

  if (!org?.id) {
    return (
      <Card className="border-white/10 text-zinc-100">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-lg">Select an organization</CardTitle>
          <CardDescription className="text-zinc-400">
            Choose an organization first to view project details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Button variant="outline" onClick={() => router.push("/org")}>
            Go to Organizations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (projects.isLoading) {
    return <ListSkeleton rows={3} />;
  }

  if (projects.isSuccess && !project) {
    return (
      <Card className="border-white/10 text-zinc-100">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-lg">Project not found</CardTitle>
          <CardDescription className="text-zinc-400">
            We couldn’t find that project in your current organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to projects
            </Button>
            <Button
              variant="inverse"
              onClick={() => router.push("/dashboard/new-project")}
              disabled={!canCreate}
              aria-disabled={!canCreate}
              title={
                !canCreate
                  ? "Requires Editor or higher"
                  : "Create a new project"
              }
            >
              Create project
            </Button>
          </div>

          <Separator className="my-6 bg-white/10" />
          <p className="text-xs text-zinc-500">
            Tip: Switch organizations from the header if you&apos;re looking for
            a project elsewhere.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-lg">
            {project?.name}{" "}
            <span className="text-xs text-zinc-500">({project?.slug})</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Created {formatDateWithRelative(project?.createdAt)}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to projects
          </Button>
          <Button
            variant="inverse"
            onClick={() => router.push("/dashboard/new-project")}
            disabled={!canCreate}
            aria-disabled={!canCreate}
          >
            New project
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Separator className="mb-6 bg-white/10" />
        {project && <ApiKeysPanel projectId={project.id} />}
      </CardContent>
    </Card>
  );
}
