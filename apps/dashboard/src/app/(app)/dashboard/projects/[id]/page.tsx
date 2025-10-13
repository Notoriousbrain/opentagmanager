"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
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
import { ApiKeysPanel } from "@/components/api-keys/api-keys-panel";

type Project = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "disabled" | "archived";
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  // guard: ensure org is selected (waits for hydration internally)
  const { hydrated, activeOrgId, activeOrg } = useActiveOrg("/org");

  // we don’t have a "projects.get" proc, so reuse list + find
  const q = trpc.projects.list.useQuery(
    { orgId: activeOrgId ?? "" },
    { enabled: !!activeOrgId, refetchOnWindowFocus: false }
  );

  const project: Project | null = useMemo(() => {
    if (!q.data || !projectId) return null;
    return (q.data as Project[]).find((p) => p.id === projectId) ?? null;
  }, [q.data, projectId]);

  const canSeeProject = !!project;

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
        <Card className="border-white/10 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {project ? project.name : "Project"}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {activeOrg
                  ? `Organization: ${activeOrg.name}`
                  : "Select an organization to continue."}
                {project && (
                  <>
                    {" · "}
                    <span className="text-zinc-500">slug:</span> {project.slug}
                    {" · "}
                    <span className="text-zinc-500">status:</span> {project.status}
                  </>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
                onClick={() => router.push("/dashboard")}
              >
                Back to projects
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {!hydrated && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            )}

            {hydrated && activeOrgId && q.isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/2 rounded" />
                <Skeleton className="h-10 w-2/3 rounded" />
              </div>
            )}

            {hydrated && activeOrgId && q.isSuccess && !canSeeProject && (
              <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-zinc-400">
                Project not found in this organization. It may be deleted or you don’t have access.
              </div>
            )}

            {hydrated && activeOrgId && canSeeProject && (
              <>
                {/* Future: Overview panel(s) can go here */}
                <Separator className="bg-white/10 my-4" />
                <ApiKeysPanel projectId={project!.id} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
