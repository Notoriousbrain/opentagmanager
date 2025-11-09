"use client";

import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/react";
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
import { useRouter } from "next/navigation";

type CreateOrgInput = {
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

export function CreateOrgCard() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<CreateOrgInput>({ name: "", slug: "" });
  const [touched, setTouched] = useState<{ name: boolean; slug: boolean }>({
    name: false,
    slug: false,
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const userTypedSlugRef = useRef(false);
  const derivedSlug = useMemo(() => slugify(form.name), [form.name]);
  const effectiveSlug = userTypedSlugRef.current ? form.slug : derivedSlug;

  const create = trpc.orgs.create.useMutation({
    onSuccess: async (org) => {
      await utils.orgs.mine.invalidate();
      if (org && typeof org.id === "string") {
        router.push(`/dashboard?org=${org.id}`);
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      const msg = err.message || "Failed to create organization.";
      setServerError(
        /unique|exists|duplicate|taken/i.test(msg)
          ? "This slug is already taken."
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

  // Prefer backend for uniqueness; we only show serverError if base checks pass
  const slugError = slugErrorBase ?? serverError;

  const canSubmit =
    !nameError &&
    !slugErrorBase && // don't block on potential serverError before submit
    form.name.trim().length >= 2 &&
    effectiveSlug.length >= 2 &&
    !create.isPending;

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg">Create organization</CardTitle>
        <CardDescription className="text-zinc-400">
          Choose a name; we’ll generate a slug. You can tweak it.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="org-name" className="text-sm text-zinc-200">
            Name
          </label>
          <Input
            id="org-name"
            value={form.name}
            placeholder="Acme Inc."
            onChange={(e) => {
              const name = e.target.value;
              setServerError(null);
              setForm((f) => ({
                ...f,
                name,
                // do not overwrite slug if user has typed it
                slug: userTypedSlugRef.current ? f.slug : slugify(name),
              }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={!!nameError || undefined}
            aria-describedby={nameError ? "org-name-error" : undefined}
          />
          {nameError && (
            <p id="org-name-error" className="text-xs text-red-300">
              {nameError}
            </p>
          )}
        </div>

        {/* Slug (subdued preview & editable) */}
        <div className="space-y-2">
          <label htmlFor="org-slug" className="text-sm text-zinc-200">
            Slug
          </label>
          <Input
            id="org-slug"
            value={userTypedSlugRef.current ? form.slug : derivedSlug}
            onChange={(e) => {
              const raw = e.target.value;
              userTypedSlugRef.current = true;
              setServerError(null);
              setForm((f) => ({ ...f, slug: slugify(raw) }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, slug: true }))}
            aria-invalid={!!slugError || undefined}
            aria-describedby={slugError ? "org-slug-error" : "org-slug-hint"}
          />
          <div id="org-slug-hint" className="text-xs text-zinc-500/80">
            Will be accessible at{" "}
            <span className="text-zinc-300">/{effectiveSlug}</span>
          </div>

          {slugError && (
            <p id="org-slug-error" className="text-xs text-red-300">
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
                name: form.name.trim(),
                slug: effectiveSlug,
              });
            }}
            disabled={!canSubmit}
          >
            {create.isPending ? "Creating…" : "Create organization"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              // reset; keep no accidental user-typed slug
              userTypedSlugRef.current = false;
              setServerError(null);
              setForm({ name: "", slug: "" });
              setTouched({ name: false, slug: false });
            }}
          >
            Reset
          </Button>
        </div>

        <p className="text-xs text-zinc-500">
          Slugs are URL-safe and unique per organization.
        </p>
      </CardContent>
    </Card>
  );
}
