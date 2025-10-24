"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { useOrgStore, type Role } from "@/store/org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Separator,
} from "@otm/ui";

type CreateProjectInput = {
  name: string;
  slug: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function canCreateProjects(role: Role | undefined): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function CreateProjectCard() {
  const router = useRouter();
  const { activeOrgId, orgs } = useOrgStore();

  const role: Role | undefined = useMemo(
    () => orgs.find((o) => o.id === activeOrgId)?.role,
    [orgs, activeOrgId]
  );
  const allowed = canCreateProjects(role);

  const [form, setForm] = useState<CreateProjectInput>({ name: "", slug: "" });
  const [touched, setTouched] = useState<{ name: boolean; slug: boolean }>({
    name: false,
    slug: false,
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const userTypedSlugRef = useRef(false);
  const derivedSlug = useMemo(() => slugify(form.name), [form.name]);
  const effectiveSlug = userTypedSlugRef.current ? form.slug : derivedSlug;

  const utils = trpc.useUtils();

  const create = trpc.projects.create.useMutation({
    onSuccess: async (proj) => {
      await utils.projects.list.invalidate({ orgId: activeOrgId ?? "" });
      router.replace(`/dashboard/projects/${proj.id}`);
    },
    onError: (err) => {
      const msg = err.message || "Failed to create project.";
      setServerError(
        /unique|exists|duplicate|taken|slug/i.test(msg)
          ? "This project slug already exists in your org."
          : msg
      );
    },
  });

  const nameError =
    touched.name && form.name.trim().length < 2
      ? "Name must be at least 2 characters."
      : null;

  const slugErrorBase =
    touched.slug || touched.name
      ? effectiveSlug.length === 0
        ? "Slug is required."
        : effectiveSlug.length < 2
          ? "Slug must be at least 2 characters."
          : null
      : null;

  const slugError = slugErrorBase ?? serverError;

  const canSubmit =
    !!activeOrgId &&
    allowed &&
    !nameError &&
    !slugErrorBase &&
    form.name.trim().length >= 2 &&
    effectiveSlug.length >= 2 &&
    !create.isPending;

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg">Create project</CardTitle>
        <CardDescription className="text-zinc-400">
          Projects group API keys and settings within your organization.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {!activeOrgId && (
          <div className="rounded-md border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs text-yellow-200">
            Select an organization first.
          </div>
        )}
        {!allowed && (
          <div className="rounded-md border border-white/15 p-3 text-xs text-zinc-300">
            You need <strong>Editor</strong> or higher to create a project.
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="proj-name" className="text-sm text-zinc-200">
            Name
          </label>
          <Input
            id="proj-name"
            value={form.name}
            placeholder="My App"
            onChange={(e) => {
              const name = e.target.value;
              setServerError(null);
              setForm((f) => ({
                ...f,
                name,
                slug: userTypedSlugRef.current ? f.slug : slugify(name),
              }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={!!nameError || undefined}
            aria-describedby={nameError ? "proj-name-error" : undefined}
          />
          {nameError && (
            <p id="proj-name-error" className="text-xs text-red-300">
              {nameError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="proj-slug" className="text-sm text-zinc-200">
            Slug
          </label>
          <Input
            id="proj-slug"
            value={userTypedSlugRef.current ? form.slug : derivedSlug}
            onChange={(e) => {
              const raw = e.target.value;
              userTypedSlugRef.current = true;
              setServerError(null);
              setForm((f) => ({ ...f, slug: slugify(raw) }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, slug: true }))}
            aria-invalid={!!slugError || undefined}
            aria-describedby={slugError ? "proj-slug-error" : "proj-slug-hint"}
          />
          <div id="proj-slug-hint" className="text-xs text-zinc-500/80">
            Will be accessible as{" "}
            <span className="text-zinc-300">{`/${effectiveSlug}`}</span>
          </div>
          {slugError && (
            <p id="proj-slug-error" className="text-xs text-red-300">
              {slugError}
            </p>
          )}
        </div>

        <Separator className="bg-white/10" />

        <div className="flex items-center gap-3">
          <Button
            variant="inverse"
            onClick={() => {
              setServerError(null);
              create.mutate({
                orgId: activeOrgId ?? "",
                name: form.name.trim(),
                slug: effectiveSlug,
              });
            }}
            disabled={!canSubmit}
          >
            {create.isPending ? "Creating…" : "Create project"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              userTypedSlugRef.current = false;
              setServerError(null);
              setForm({ name: "", slug: "" });
              setTouched({ name: false, slug: false });
            }}
          >
            Reset
          </Button>
          <Button variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
        </div>

        <p className="text-xs text-zinc-500">
          Slugs are unique per organization. You can change them later if
          needed.
        </p>
      </CardContent>
    </Card>
  );
}
