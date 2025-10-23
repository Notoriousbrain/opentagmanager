"use client";

import { Badge } from "./badge";

export type OrgRole = "owner" | "admin" | "editor" | "viewer";

function variantFor(
  role: OrgRole
): "success" | "secondary" | "outline" | "muted" {
  switch (role) {
    case "owner":
      return "success";
    case "admin":
      return "secondary";
    case "editor":
      return "outline";
    case "viewer":
      return "muted";
  }
}

export function RoleBadge(props: { role: OrgRole }) {
  return <Badge variant={variantFor(props.role)}>{props.role}</Badge>;
}
