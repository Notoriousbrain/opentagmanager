"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore } from "@/store/org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Skeleton,
  Separator,
  Input,
} from "@otm/ui";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

type ApiKey = {
  id: string;
  name: string;
  type: "public" | "secret";
  prefix: string;
  lastUsedAt?: string | Date | null;
  revokedAt?: string | Date | null;
  createdAt?: string | Date | null;
};

export function ApiKeysPanel({ projectId }: { projectId: string }) {
  const { activeOrgId, orgs } = useOrgStore();
  const role = useMemo(
    () => orgs.find((o) => o.id === activeOrgId)?.role,
    [orgs, activeOrgId]
  );
  const canCreate = role === "owner" || role === "admin" || role === "editor";
  const canRevoke = canCreate; 

  const list = trpc.projects.apiKeysList.useQuery(
    { projectId },
    { enabled: !!projectId, refetchOnWindowFocus: false }
  );

  const utils = trpc.useUtils();

  const revoke = trpc.projects.apiKeysRevoke.useMutation({
    onSuccess: () => utils.projects.apiKeysList.invalidate({ projectId }),
  });

  const [issuedToken, setIssuedToken] = useState<string | null>(null);

  const keys: ApiKey[] = list.data ?? [];

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-lg">API keys</CardTitle>
          <CardDescription className="text-zinc-400">
            Keys are scoped to this project. Secret keys are shown once only.
          </CardDescription>
        </div>

        {canCreate && (
          <CreateApiKeyDialog
            projectId={projectId}
            onIssued={(token) => setIssuedToken(token)}
          />
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6 mt-6 space-y-4">
        {issuedToken && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="mb-2 text-sm text-emerald-300">
              Save this token now — you won&apos;t be able to see it again.
            </div>
            <Input
              readOnly
              value={issuedToken}
              className="h-10 rounded-lg border-white/20 bg-zinc-900/50 px-3 text-xs text-zinc-100"
            />
            <div className="mt-3 flex justify-end">
              <Button
                className="rounded-lg"
                onClick={() => setIssuedToken(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {list.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-5/6 rounded-lg" />
          </div>
        )}

        {list.isSuccess && keys.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-zinc-400">
            No active keys.{" "}
            {canCreate
              ? "Create a key to get started."
              : "Ask an editor/admin to create one."}
          </div>
        )}

        {list.isSuccess && keys.length > 0 && (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {keys.map((k) => {
              const revoked = !!k.revokedAt;
              return (
                <li
                  key={k.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {k.name}{" "}
                      <span className="text-xs text-zinc-500">({k.type})</span>
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {k.prefix} • created{" "}
                      {k.createdAt
                        ? new Date(k.createdAt).toLocaleString()
                        : "—"}
                      {k.lastUsedAt
                        ? ` • last used ${new Date(k.lastUsedAt).toLocaleString()}`
                        : ""}
                      {revoked ? " • revoked" : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-zinc-400">
                      {revoked ? "revoked" : "active"}
                    </span>
                    {canRevoke && !revoked && (
                      <Button
                        variant="outline"
                        className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
                        onClick={() => revoke.mutate({ keyId: k.id })}
                        disabled={revoke.isPending}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {list.isError && (
          <p className="text-sm text-red-400">Failed to load API keys.</p>
        )}

        <Separator className="bg-white/10" />
        <p className="text-xs text-zinc-500">
          For security, only token **prefix** is stored. Full token is shown
          once at creation.
        </p>
      </CardContent>
    </Card>
  );
}
