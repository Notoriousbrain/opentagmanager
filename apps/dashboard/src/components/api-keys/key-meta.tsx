"use client";

import { memo } from "react";
import { formatDateWithRelative } from "@otm/ui";

export type KeyMetaProps = {
  prefix: string;
  createdAt?: string | Date | null;
  lastUsedAt?: string | Date | null;
  revokedAt?: string | Date | null;
  type: "public" | "secret";
  name: string;
};

export const KeyMeta = memo(function KeyMeta(props: KeyMetaProps) {
  const { name, type, prefix, createdAt, lastUsedAt, revokedAt } = props;
  const revoked = !!revokedAt;

  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-medium leading-6">
        {name} <span className="text-xs text-zinc-500">({type})</span>
      </div>

      <div className="truncate text-xs text-zinc-500 leading-5">
        {prefix} • created {formatDateWithRelative(createdAt)}
        {lastUsedAt ? ` • last used ${formatDateWithRelative(lastUsedAt)}` : ""}
        {revoked ? " • revoked" : ""}
      </div>
    </div>
  );
});
