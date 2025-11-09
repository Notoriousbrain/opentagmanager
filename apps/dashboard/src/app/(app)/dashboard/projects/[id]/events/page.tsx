"use client";

import { notFound } from "next/navigation";
import { useActiveOrg } from "@/hooks/use-active-org";
import Link from "next/link";
import { EventsTable } from "@/components/events/events-table";
import { use } from "react";

export default function ProjectEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { org, isLoading } = useActiveOrg();
  if (isLoading) return <div>Loading...</div>;
  if (!org) return notFound();

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Recent Events</h1>
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Project
        </Link>
      </header>

      <section className="rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recent Events (mock)</h2>
        <EventsTable />
      </section>
    </main>
  );
}
