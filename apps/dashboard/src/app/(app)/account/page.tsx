"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Separator,
  Skeleton,
} from "@otm/ui";

export default function AccountPage() {
  const router = useRouter();
  const me = trpc.account.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex items-center justify-between gap-4 px-6 pt-6">
        <div>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage your profile information.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Separator className="mb-6 bg-white/10" />

        {me.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : me.data ? (
          <div className="space-y-2 text-sm text-zinc-300">
            <div>
              <span className="text-zinc-500">Email:</span>{" "}
              <span className="font-medium text-zinc-100">
                {me.data.email ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Name:</span>{" "}
              <span className="font-medium text-zinc-100">
                {me.data.name ?? "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 p-4 text-sm text-zinc-300">
            You’re signed out.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
