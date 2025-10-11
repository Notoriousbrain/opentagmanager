"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Label,
  Input,
} from "@otm/ui";
import { trpc } from "@/lib/trpc/react";

export function CreateProjectDialog({
  orgId,
  onCreated,
}: {
  orgId: string | null;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const create = trpc.projects.create.useMutation({
    onSuccess: () => {
      setOpen(false);
      setName("");
      setSlug("");
      onCreated?.();
    },
  });

  const disabled = !orgId || !name.trim() || !slug.trim() || create.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    create.mutate({ orgId, name: name.trim(), slug: slug.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg" disabled={!orgId}>
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-app"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setOpen(false)}
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
