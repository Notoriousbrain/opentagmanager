"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data, error, isLoading } = trpc.account.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && error) router.replace("/signin");
  }, [error, isLoading, router]);

  if (isLoading) return <p className="p-8">Loading…</p>;
  if (!data) return null;

  const onSignOut = async () => {
    await authClient.signOut();
    router.replace("/signin");
  };

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={onSignOut}
          className="rounded-xl border px-3 py-1 text-sm"
        >
          Sign out
        </button>
      </header>

      <p>
        Welcome, <strong>{data.name ?? data.email}</strong>!
      </p>

      <section className="rounded-xl border p-4">
        <h2 className="mb-2 font-medium">Session user</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>
    </main>
  );
}
