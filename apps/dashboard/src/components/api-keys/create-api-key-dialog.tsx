"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@otm/ui";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@otm/api";

// Strongly-typed output from your router
type CreateKeyOutput =
  inferRouterOutputs<AppRouter>["projects"]["apiKeysCreate"];

function extractToken(result: CreateKeyOutput): string | null {
  if (typeof result === "string") return result;
  if (result && typeof (result as { token?: string }).token === "string") {
    return (result as { token: string }).token;
  }
  return null;
}

export function CreateApiKeyDialog({
  projectId,
  onIssued,
}: {
  projectId: string;
  onIssued: (token: string) => void;
}) {
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"public" | "secret">("secret");
  const [formError, setFormError] = useState<string | null>(null);

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
      // refresh list for this project
      utils.projects.apiKeysList.invalidate({ projectId }).catch(() => {});
      onIssued(token);
    },
    onError: (err) => setFormError(err.message || "Failed to create key."),
  });

  const disabled = !keyName.trim() || create.isPending;

  return (
    <Dialog
      // reset when the dialog closes
      onOpenChange={(open) => {
        if (!open) {
          setKeyName("");
          setKeyType("secret");
          setFormError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          className="rounded-lg bg-white text-black hover:bg-white/90"
        >
          New key
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-white/10 text-zinc-100 z-50">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
        </DialogHeader>

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
            <Select
              value={keyType}
              onValueChange={(v) => setKeyType(v as "public" | "secret")}
            >
              <SelectTrigger className="h-10 rounded-lg border-white/10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="secret">secret</SelectItem>
                <SelectItem value="public">public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formError && <p className="text-xs text-red-400">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
              onClick={() => {
                new MouseEvent("click", { bubbles: true });
                (document.activeElement as HTMLElement | null)?.blur();
              }}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg" disabled={disabled}>
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
