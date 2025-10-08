"use client";
import { trpc } from "@/lib/trpc/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const r = useRouter();
  const { data, error, isLoading } = trpc.admin.stats.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) return <p className="p-8">Loading…</p>;
  if (error)
    return (
      <main className="p-8 space-y-3">
        <p>Forbidden — admin only.</p>
        <button
          className="rounded-xl border px-3 py-1"
          onClick={() => r.replace("/dashboard")}
        >
          Go back
        </button>
      </main>
    );

  return <pre className="p-8">{JSON.stringify(data, null, 2)}</pre>;
}
