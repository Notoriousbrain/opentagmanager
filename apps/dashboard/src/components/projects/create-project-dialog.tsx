"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore } from "@/store/org";
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

export function CreateProjectCard({
  onCreated,
}: {
  onCreated?: (project: { id: string; name: string; slug: string }) => void;
}) {
  const router = useRouter();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);

  const [name, setName] = useState("");
  const slug = useMemo(() => slugify(name), [name]);

  const create = trpc.projects.create.useMutation({
    onSuccess: (p) => {
      onCreated?.({
        id: p.id,
        name: "",
        slug: "",
      });
      router.replace(`/dashboard/projects/${p.id}`);
    },
  });

  const disabled = !activeOrgId || !name.trim() || !slug || create.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !activeOrgId) return;
    create.mutate({ orgId: activeOrgId, name: name.trim(), slug });
  };

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6 space-y-2">
        <CardTitle className="text-xl">Create project</CardTitle>
        <CardDescription className="text-zinc-400">
          Names are editable. Slug is used in URLs and must be unique within the
          org.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="proj-name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Backend"
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
            <Label htmlFor="proj-slug" className="text-zinc-300">
              Slug
            </Label>
            <Input
              id="proj-slug"
              value={slug}
              readOnly
              disabled
              className="
                h-10 w-full rounded-lg border border-white/10
                bg-zinc-900/50 px-3 text-sm text-zinc-500
                cursor-not-allowed opacity-70
              "
            />
          </div>

          {create.isError && (
            <p className="text-xs text-red-400">
              {String(create.error?.message ?? "Failed to create project.")}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-white/20 text-zinc-100 hover:bg-white/5"
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
