import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "@otm/db";
import { eq, and } from "drizzle-orm";
import z from "zod";
import { nanoid } from "nanoid";
import { Role } from "@otm/types"

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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = `org_${nanoid(10)}`;

      await db.insert(schema.organization).values({
        id,
        name: input.name,
        slug: input.slug,
        ownerId: userId,
      });

      await db.insert(schema.organizationMember).values({
        id: `mem_${nanoid(12)}`,
        orgId: id,
        userId,
        role: "owner",
      });

      return { id, name: input.name, role: "owner" as const };
    }),
});
