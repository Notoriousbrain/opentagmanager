"use client";

import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
import { skipToken } from "@tanstack/react-query";

export function useProjectName(projectId: string) {
  const { org } = useActiveOrg();

  const query = trpc.projects.list.useQuery(
    org ? { orgId: org.id } : skipToken,
    {
      refetchOnWindowFocus: false,
    }
  );

  if (query.isLoading || !org) {
    return { name: "", isLoading: true, notFound: false };
  }

  const project = query.data?.find((p) => p.id === projectId);
  return {
    name: project?.name ?? "",
    isLoading: false,
    notFound: !project,
  };
}
