"use client";

import { ListSkeleton } from "@otm/ui";
import { useActiveOrg } from "@/hooks/use-active-org";
import { SmartProjectsGate } from "@/components/projects/smart-projects-gate";

export default function DashboardPage() {
  const { status, activeOrgId, isLoading } = useActiveOrg();

  const pending = isLoading || status !== "one" || !activeOrgId;
  if (pending) return <ListSkeleton rows={3} />;

  return <SmartProjectsGate activeOrgId={activeOrgId} />;
}
