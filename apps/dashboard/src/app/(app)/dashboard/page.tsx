"use client";

import { ProjectsPanel } from "@/components/projects/projects-panel";
import { useActiveOrg } from "@/hooks/use-active-org";
import { ListSkeleton } from "@otm/ui";

export default function DashboardPage() {
  const { status } = useActiveOrg();
  if (status === "loading") return <ListSkeleton rows={3} />;
  return <ProjectsPanel />;
}
