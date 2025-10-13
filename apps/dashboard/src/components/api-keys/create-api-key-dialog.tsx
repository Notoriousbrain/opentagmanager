"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Label,
  Input,
} from "@otm/ui";
import { Check, Copy } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@otm/api";

type CreateKeyOutput =
  inferRouterOutputs<AppRouter>["projects"]["apiKeysCreate"];

function extractToken(result: CreateKeyOutput): string | null {
  if (typeof result === "string") return result;
  if (result && typeof (result as { token?: string }).token === "string") {
    return (result as { token: string }).token;
  }
  return null;
}

export function CreateApiKeyCard({
  projectId,
  onIssued,
  onCancel,
}: {
  projectId: string;
  onIssued: (token: string) => void;
  onCancel?: () => void;
}) {
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"public" | "secret">("secret");
  const [formError, setFormError] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();

  const create = trpc.projects.apiKeysCreate.useMutation({
    onMutate: () => setFormError(null),
    onSuccess: (res: CreateKeyOutput) => {
      const token = extractToken(res);
      if (!token) {
        setFormError(
          "The server did not return a token. Check the API response shape."
        );
        return;
      }
      utils.projects.apiKeysList.invalidate({ projectId }).catch(() => {});
      setIssuedToken(token);
      onIssued(token);
    },
    onError: (err) => setFormError(err.message || "Failed to create key."),
  });

  const disabled = !keyName.trim() || create.isPending;

  const copyToClipboard = async () => {
    if (!issuedToken) return;
    try {
      await navigator.clipboard.writeText(issuedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFormError("Failed to copy to clipboard.");
    }
  };

  if (issuedToken) {
    return (
      <Card className="border-white/10 text-zinc-100">
        <CardHeader className="px-6 pt-6 space-y-2">
          <CardTitle className="text-lg">API key created</CardTitle>
          <CardDescription className="text-zinc-400">
            Copy and store this token securely. It will be shown only once.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={issuedToken}
              className="
                h-10 w-full rounded-lg border border-white/10
                bg-zinc-900/50 px-3 text-sm text-zinc-100
              "
            />
            <Button
              type="button"
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
            >
              {copied ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setIssuedToken(null);
                setKeyName("");
                setKeyType("secret");
              }}
              className="rounded-lg"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6 space-y-2">
        <CardTitle className="text-lg">Create API key</CardTitle>
        <CardDescription className="text-zinc-400">
          Secret keys are shown once. You can rename keys later.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (disabled) return;
            create.mutate({ projectId, name: keyName.trim(), type: keyType });
          }}
          className="space-y-4"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="key-name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="key-name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Server key"
              className="
                h-10 w-full rounded-lg border border-white/10
                bg-transparent px-3 text-sm text-zinc-100
                placeholder:text-zinc-500
                focus:border-white/20 focus:ring-0
              "
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-zinc-300">Type</Label>
            <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
              <button
                type="button"
                aria-pressed={keyType === "secret"}
                className={[
                  "px-3 py-2 text-sm transition-colors",
                  keyType === "secret"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/5",
                ].join(" ")}
                onClick={() => setKeyType("secret")}
              >
                secret
              </button>
              <div className="w-px bg-white/10" />
              <button
                type="button"
                aria-pressed={keyType === "public"}
                className={[
                  "px-3 py-2 text-sm transition-colors",
                  keyType === "public"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/5",
                ].join(" ")}
                onClick={() => setKeyType("public")}
              >
                public
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Secret keys are for server-to-server. Public keys are safe for
              client usage.
            </p>
          </div>

          {formError && <p className="text-xs text-red-400">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
              onClick={onCancel}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg bg-white text-black hover:bg-white/95 cursor-pointer" disabled={disabled}>
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
