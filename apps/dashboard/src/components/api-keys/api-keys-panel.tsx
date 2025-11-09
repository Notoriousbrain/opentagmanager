"use client";

import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import { useActiveOrg } from "@/hooks/use-active-org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Separator,
  StatusBadge,
  LiveRegion,
  ListSkeleton,
} from "@otm/ui";
import { CreateApiKeyCard } from "./create-api-key-dialog";
import { useToasts } from "../toast/use-toasts";
import { TokenReveal } from "./token-reveal";
import { KeyMeta } from "./key-meta";

type OrgRole = "owner" | "admin" | "editor" | "viewer";

function canCreateKeys(role: OrgRole | undefined): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}
const canRevokeKeys = canCreateKeys;

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
  const newKeyBtnRef = useRef<HTMLButtonElement | null>(null);

  const { org, orgs } = useActiveOrg();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const role: OrgRole | undefined = useMemo(
    () => orgs.find((o) => o.id === org?.id)?.role as OrgRole | undefined,
    [orgs, org?.id]
  );

  const { push } = useToasts();

  const list = trpc.projects.apiKeysList.useQuery(
    { projectId },
    { enabled: !!projectId, refetchOnWindowFocus: false }
  );

  const utils = trpc.useUtils();

  const revoke = trpc.projects.apiKeysRevoke.useMutation({
    onMutate: ({ keyId }) => {
      setRevokingId(keyId);
    },
    onSuccess: async () => {
      await utils.projects.apiKeysList.invalidate({ projectId });
      push("success", "API key revoked.");
      setLiveMsg("API key revoked.");
    },
    onError: (err) => {
      push("error", err.message || "Failed to revoke API key.");
      setLiveMsg("Failed to revoke API key.");
    },
    onSettled: () => {
      setRevokingId(null);
    },
  });

  const [creating, setCreating] = useState(false);
  const [liveMsg, setLiveMsg] = useState<string | null>(null);

  const [issuedToken, setIssuedToken] = useState<string | null>(null);

  const keys: ApiKey[] = list.data ?? [];

  const canCreate = canCreateKeys(role);
  const canRevoke = canRevokeKeys(role);

  const handleNewKeyToggle = () => {
    setIssuedToken(null);
    setCreating((v) => !v);
  };

  return (
    <>
      <Card className="border-white/10 text-zinc-100">
        <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">API keys</CardTitle>
            <CardDescription className="text-zinc-400">
              Keys are scoped to this project. Secret keys are shown once only.
            </CardDescription>
          </div>

          <div className="flex flex-col items-end">
            <Button
              ref={newKeyBtnRef}
              onClick={handleNewKeyToggle}
              variant="inverse"
              disabled={!canCreate}
              aria-disabled={!canCreate}
              title={
                !canCreate ? "Requires Editor or higher" : "Create a new key"
              }
            >
              {creating ? "Close" : "New key"}
            </Button>
            {!canCreate && (
              <span className="mt-1 text-[11px] text-zinc-500">
                Requires <strong>Editor</strong> or higher
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-6 space-y-6 px-6 pb-6">
          {issuedToken && (
            <TokenReveal
              token={issuedToken}
              onDone={() => {
                setIssuedToken(null);
                newKeyBtnRef.current?.focus();
                setLiveMsg("Token panel closed. Focus returned to New key.");
              }}
              onCopySuccess={() => {
                push("success", "Token copied to clipboard.");
                setLiveMsg("Token copied to clipboard.");
              }}
              onCopyError={(m) => {
                push("error", m);
                setLiveMsg("Copy failed. Please copy manually.");
              }}
            />
          )}

          {creating && canCreate && (
            <CreateApiKeyCard
              projectId={projectId}
              onIssued={(token: string) => {
                setIssuedToken(token);
                setCreating(false);
                push("success", "API key created. Token shown once.");
                setLiveMsg("API key created. Token is shown once.");
              }}
              onCancel={() => {
                setCreating(false);
                newKeyBtnRef.current?.focus();
                setLiveMsg("Creation canceled. Focus returned to New key.");
              }}
            />
          )}

          {list.isLoading && <ListSkeleton rows={3} />}

          {list.isSuccess && keys.length === 0 && !creating && !issuedToken && (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-zinc-400 min-h-[64px] flex items-center">
              No active keys.{" "}
              {canCreate
                ? "Create a key to get started."
                : "Ask an editor/admin to create one."}
            </div>
          )}

          {list.isSuccess && keys.length > 0 && (
            <ul className="rounded-xl border border-white/10 divide-y divide-white/10">
              {keys.map((k) => {
                const revoked = !!k.revokedAt;
                const isThisRevoking = revokingId === k.id && revoke.isPending;
                return (
                  <li
                    key={k.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <KeyMeta
                      name={k.name}
                      type={k.type}
                      prefix={k.prefix}
                      createdAt={k.createdAt}
                      lastUsedAt={k.lastUsedAt}
                      revokedAt={k.revokedAt}
                    />

                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={revoked ? "revoked" : "active"} />
                      {canRevoke && !revoked && (
                        <Button
                          variant="outline"
                          className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
                          onClick={() => revoke.mutate({ keyId: k.id })}
                          disabled={isThisRevoking}
                          aria-disabled={isThisRevoking}
                        >
                          {isThisRevoking ? "Revoking…" : "Revoke"}
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
            For security, only token <strong>prefix</strong> is stored. Full
            token is shown once at creation.
          </p>
        </CardContent>
      </Card>

      <LiveRegion message={liveMsg} />
    </>
  );
}
