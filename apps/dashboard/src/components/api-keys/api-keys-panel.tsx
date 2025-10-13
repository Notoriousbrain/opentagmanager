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
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { CreateApiKeyCard } from "./create-api-key-dialog";

type ApiKey = {
  id: string;
  name: string;
  type: "public" | "secret";
  prefix: string;
  lastUsedAt?: string | Date | null;
  revokedAt?: string | Date | null;
  createdAt?: string | Date | null;
};

function maskToken(token: string, keepStart = 6, keepEnd = 4) {
  if (token.length <= keepStart + keepEnd) return token;
  const start = token.slice(0, keepStart);
  const end = token.slice(-keepEnd);
  const middleLen = token.length - keepStart - keepEnd;
  return `${start}${"•".repeat(middleLen)}${end}`;
}

export function ApiKeysPanel({ projectId }: { projectId: string }) {
  const { activeOrgId, orgs } = useOrgStore();
  const role = useMemo(
    () => orgs.find((o) => o.id === activeOrgId)?.role,
    [orgs, activeOrgId]
  );
  const canCreate = role === "owner" || role === "admin" || role === "editor";
  const canRevoke = canCreate; // editor+

  const list = trpc.projects.apiKeysList.useQuery(
    { projectId },
    { enabled: !!projectId, refetchOnWindowFocus: false }
  );

  const utils = trpc.useUtils();
  const revoke = trpc.projects.apiKeysRevoke.useMutation({
    onSuccess: () => utils.projects.apiKeysList.invalidate({ projectId }),
  });

  // inline create & one-time token reveal
  const [creating, setCreating] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const keys: ApiKey[] = list.data ?? [];

  const copyToken = async () => {
    if (!issuedToken) return;
    try {
      await navigator.clipboard.writeText(issuedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op; you could surface a toast here if you have one
    }
  };

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
          <Button
            onClick={() => {
              setIssuedToken(null);
              setRevealed(false);
              setCreating((v) => !v);
            }}
            className="rounded-lg bg-white text-black hover:bg-white/90"
          >
            {creating ? "Close" : "New key"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6 mt-6 space-y-6">
        {/* One-time token reveal (masked by default) */}
        {issuedToken && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="mb-2 text-sm text-emerald-300">
              Save this token now — you won’t be able to see it again.
            </div>

            <div className="relative">
              <Input
                readOnly
                value={revealed ? issuedToken : maskToken(issuedToken)}
                className="
                  h-10 w-full rounded-lg border-white/20 bg-zinc-900/50
                  pr-20 pl-3 text-xs text-zinc-100 font-mono tracking-wider
                "
              />
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? "Hide token" : "Reveal token"}
                className="
                  absolute right-12 cursor-pointer top-1/2 -translate-y-1/2
                  inline-flex h-8 w-8 items-center justify-center
                  rounded-md border border-white/15 bg-transparent
                  text-zinc-200 hover:bg-white/5
                "
              >
                {revealed ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={copyToken}
                aria-label="Copy token"
                className="
                  absolute right-2 top-1/2 cursor-pointer -translate-y-1/2
                  inline-flex h-8 w-8 items-center justify-center
                  rounded-md border border-white/15 bg-transparent
                  text-zinc-200 hover:bg-white/5
                "
              >
                {copied ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                className="rounded-lg bg-black"
                onClick={() => {
                  setIssuedToken(null);
                  setRevealed(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Inline create card */}
        {creating && canCreate && (
          <CreateApiKeyCard
            projectId={projectId}
            onIssued={(token: string) => {
              setIssuedToken(token);
              setCreating(false);
              setRevealed(false);
              setCopied(false);
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        {list.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-5/6 rounded-lg" />
          </div>
        )}

        {list.isSuccess && keys.length === 0 && !creating && !issuedToken && (
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
          For security, only token <strong>prefix</strong> is stored. Full token
          is shown once at creation.
        </p>
      </CardContent>
    </Card>
  );
}
