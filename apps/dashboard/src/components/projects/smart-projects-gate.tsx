"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { ListSkeleton } from "@otm/ui";
import { ProjectsPanel } from "./projects-panel";

type Props = { activeOrgId: string };

function getLastVisitedProjectId(orgId: string) {
  try {
    return localStorage.getItem(`otm.lastProject.${orgId}`) || null;
  } catch {
    return null;
  }
}

export function SmartProjectsGate({ activeOrgId }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, isFetched, isRefetching, error } =
    trpc.projects.list.useQuery(
      { orgId: activeOrgId },
      {
        refetchOnWindowFocus: false,
        staleTime: 15_000,
        retry: 1,
      }
    );

  const projects = data ?? [];
  const projectCount = projects.length;

  let targetProjectId: string | null = null;
  if (isFetched && !isRefetching && !isLoading) {
    if (projectCount === 1) {
      targetProjectId = projects[0].id;
    } else if (projectCount > 1) {
      const last = getLastVisitedProjectId(activeOrgId);
      if (last && projects.some((p) => p.id === last)) {
        targetProjectId = last;
      }
    }
  }

  useEffect(() => {
    if (targetProjectId) {
      router.prefetch(`/dashboard/projects/${targetProjectId}`);
    }
  }, [router, targetProjectId]);

  useEffect(() => {
    if (!targetProjectId) return;
    const dest = `/dashboard/projects/${targetProjectId}`;
    if (pathname !== dest) {
      router.replace(dest);
    }
  }, [pathname, router, targetProjectId]);

  if (isLoading || isRefetching || !!targetProjectId) {
    return <ListSkeleton rows={3} />;
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500">
        Failed to load projects. Please refresh.
      </div>
    );
  }

  return <ProjectsPanel />;
}
