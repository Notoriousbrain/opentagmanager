import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "@otm/db";
import { eq, and } from "drizzle-orm";

type Role = "owner" | "admin" | "editor" | "viewer";
export type OrgSummary = { id: string; name: string; role: Role };

export const orgsRouter = createTRPCRouter({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const organization = schema.organization;
    const organizationMember = schema.organizationMember;

    const rows = await db
      .select({
        id: organization.id,
        name: organization.name,
        role: organizationMember.role,
        status: organization.status,
        archivedAt: organization.archivedAt,
      })
      .from(organizationMember)
      .innerJoin(
        organization,
        and(eq(organizationMember.orgId, organization.id))
      )
      .where(eq(organizationMember.userId, userId));

    const result: OrgSummary[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role as Role,
    }));
    return result;
  }),
});
