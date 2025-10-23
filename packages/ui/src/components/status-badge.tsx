"use client";

import { Badge } from "./badge";

export type Status = "active" | "revoked" | "pending";

function labelFor(status: Status): string {
  switch (status) {
    case "active":
      return "active";
    case "revoked":
      return "revoked";
    case "pending":
      return "pending";
  }
}

function variantFor(status: Status): "success" | "muted" | "secondary" {
  switch (status) {
    case "active":
      return "success";
    case "revoked":
      return "muted";
    case "pending":
      return "secondary";
  }
}

export function StatusBadge(props: { status: Status }) {
  const { status } = props;
  return <Badge variant={variantFor(status)}>{labelFor(status)}</Badge>;
}
