"use client";
import { trpc } from "@/lib/trpc/react";

export default function AccountPage() {
  const { data, error, isLoading } = trpc.account.me.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Not signed in</p>;
  return (
    <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
  );
}
