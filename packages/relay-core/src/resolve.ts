import { UnauthorizedError, ForbiddenError } from "./errors";
import { type PublicKeyParts } from "./auth";

export interface TenantCfg {
  allowedHosts?: string[];
  aliases?: string[];
  corsOrigins?: string[];
}

export interface ProjectInfo {
  projectId: string;
  tenantId?: string | null;
  status: "active" | "disabled" | "revoked";
  rateLimitRpsOverride?: number;
  tenantCfg?: TenantCfg;
}

export type ProjectResolution =
  | { ok: true; project: ProjectInfo }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_KEY" | "REVOKED" | "DISABLED" };

export type ResolveProject = (
  key: PublicKeyParts
) => Promise<ProjectResolution>;

export function assertActiveProject(
  r: ProjectResolution
): asserts r is { ok: true; project: ProjectInfo } {
  if (r.ok) return;
  const reason = (r as Exclude<ProjectResolution, { ok: true }>).reason;
  switch (reason) {
    case "INVALID_KEY":
    case "NOT_FOUND":
      throw new UnauthorizedError("Invalid API key");
    case "REVOKED":
      throw new ForbiddenError("API key revoked");
    case "DISABLED":
      throw new ForbiddenError("Project disabled");
    default:
      throw new UnauthorizedError("Unauthorized");
  }
}

export function createInMemoryResolver(
  entries: Array<
    { id: string; info: ProjectInfo } & (
      | { status?: never }
      | { status: ProjectInfo["status"] }
    )
  >
): ResolveProject {
  const map = new Map<string, ProjectInfo>();
  for (const e of entries) {
    map.set(e.id, {
      ...e.info,
      status: (e as any).status ?? e.info.status ?? "active",
    });
  }
  return async (key) => {
    const hit = map.get(key.id);
    if (!hit) return { ok: false, reason: "NOT_FOUND" as const };
    if (hit.status === "revoked")
      return { ok: false, reason: "REVOKED" as const };
    if (hit.status === "disabled")
      return { ok: false, reason: "DISABLED" as const };
    return { ok: true, project: hit };
  };
}
