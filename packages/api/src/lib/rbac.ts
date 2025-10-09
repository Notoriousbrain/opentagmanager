import { TRPCError } from "@trpc/server";
import { db, schema } from "@otm/db";
import { eq, sql } from "drizzle-orm";

const roleRank = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3,
} as const;

type OrgRole = keyof typeof roleRank;

function isAllowed(
  userRole: OrgRole | null | undefined,
  allowed: OrgRole[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export async function assertOrgRole(
  ctx: { session?: { user?: { id?: string } } },
  orgId: string,
  allowed: OrgRole[]
) {
  const userId = ctx.session?.user?.id;
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  const row = await db
    .select({ role: schema.organizationMember.role })
    .from(schema.organizationMember)
    .where(
      sql`${schema.organizationMember.orgId} = ${orgId} AND ${schema.organizationMember.userId} = ${userId}`
    )
    .limit(1);

  const role = row[0]?.role as OrgRole | undefined;
  if (!isAllowed(role, allowed)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export async function assertProjectRole(
  ctx: { session?: { user?: { id?: string } } },
  projectId: string,
  allowed: OrgRole[]
) {
  const userId = ctx.session?.user?.id;
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  const proj = await db
    .select({ orgId: schema.project.orgId })
    .from(schema.project)
    .where(eq(schema.project.id, projectId))
    .limit(1);

  const orgId = proj[0]?.orgId;
  if (!orgId) throw new TRPCError({ code: "NOT_FOUND" });

  const row = await db
    .select({ role: schema.organizationMember.role })
    .from(schema.organizationMember)
    .where(
      sql`${schema.organizationMember.orgId} = ${orgId} AND ${schema.organizationMember.userId} = ${userId}`
    )
    .limit(1);

  const role = row[0]?.role as OrgRole | undefined;
  if (!isAllowed(role, allowed)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}
