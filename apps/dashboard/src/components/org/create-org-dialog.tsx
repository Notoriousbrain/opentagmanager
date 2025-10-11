"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore, type Org } from "@/store/org";
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

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export function CreateOrgCard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const slug = useMemo(() => slugify(name), [name]);

  const setOrgs = useOrgStore((s) => s.setOrgs);
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);

  const create = trpc.orgs.create.useMutation({
    onSuccess: (org: Org) => {
      setOrgs((prev) => [...prev, org]);
      setActiveOrg(org.id);
      router.replace("/dashboard");
    },
  });

  const disabled = !name.trim() || !slug || create.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    create.mutate({ name: name.trim(), slug });
  };

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6 space-y-2">
        <CardTitle className="text-2xl tracking-tight">
          Create organization
        </CardTitle>
        <CardDescription className="text-zinc-400">
          You’ll become the owner. Slug is auto-generated.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="org-name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc"
              autoFocus
              className="rounded-lg border-white/40 text-white/80"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="org-slug" className="text-zinc-300">
              Slug
            </Label>
            <Input
              id="org-slug"
              value={slug}
              readOnly
              disabled
              className="rounded-lg border-white/40 text-white/80"
            />
          </div>

          {create.isError && (
            <p className="text-xs text-red-400">
              {String(
                create.error?.message ?? "Failed to create organization."
              )}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5 cursor-pointer"
              onClick={() => router.back()}
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
