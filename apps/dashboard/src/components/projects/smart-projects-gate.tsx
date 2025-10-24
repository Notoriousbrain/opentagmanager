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

function getVisitedFlag(orgId: string) {
  try {
    return sessionStorage.getItem(`otm.smartDash.visited.${orgId}`) === "1";
  } catch {
    return false;
  }
}

function setVisitedFlag(orgId: string) {
  try {
    sessionStorage.setItem(`otm.smartDash.visited.${orgId}`, "1");
  } catch {}
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

  const alreadyVisited = getVisitedFlag(activeOrgId);

  let targetProjectId: string | null = null;
  if (!alreadyVisited && isFetched && !isRefetching && !isLoading) {
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
    if (!targetProjectId) return;
    const dest = `/dashboard/projects/${targetProjectId}`;
    if (pathname !== dest) {
      router.prefetch(dest);
      setVisitedFlag(activeOrgId);
      router.replace(dest);
    }
  }, [pathname, router, activeOrgId, targetProjectId]);

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
