"use client";

import { Badge } from "./badge";
import { Role } from "@otm/types"


function variantFor(
  role: Role
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

export function RoleBadge(props: { role: Role }) {
  return <Badge variant={variantFor(props.role)}>{props.role}</Badge>;
}
