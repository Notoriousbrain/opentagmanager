import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  listProjects,
  createProject,
  listActiveApiKeys,
  createApiKey as repoCreateApiKey,
  revokeApiKey as repoRevokeApiKey,
  getProjectIdByKeyId,
} from "@otm/db/repos";
import { CreateProjectInput, CreateApiKeyInput } from "@otm/core";
import { makeApiKey } from "@otm/core";
import { assertOrgRole, assertProjectRole } from "../lib/rbac";

const PEPPER = process.env.OTM_API_KEY_PEPPER ?? "";

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertOrgRole(ctx, input.orgId, [
        "admin",
        "editor",
        "owner",
        "viewer",
      ]);
      return listProjects(input.orgId);
    }),

  create: protectedProcedure
    .input(CreateProjectInput)
    .mutation(async ({ ctx, input }) => {
      await assertOrgRole(ctx, input.orgId, ["admin", "owner"]);
      const id = await createProject({
        orgId: input.orgId,
        name: input.name,
        slug: input.slug,
        actorUserId: ctx.session.user.id,
      });
      return { id };
    }),

  apiKeysList: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertProjectRole(ctx, input.projectId, [
        "admin",
        "editor",
        "owner",
        "viewer",
      ]);
      return listActiveApiKeys(input.projectId);
    }),

  apiKeysCreate: protectedProcedure
    .input(CreateApiKeyInput)
    .mutation(async ({ ctx, input }) => {
      await assertProjectRole(ctx, input.projectId, [
        "owner",
        "admin",
        "editor",
      ]);
      const { token, prefix, keyHash } = makeApiKey(input.type, {
        pepper: PEPPER,
      });
      const keyId = await repoCreateApiKey({
        projectId: input.projectId,
        name: input.name,
        type: input.type,
        prefix,
        keyHash,
        actorUserId: ctx.session.user.id,
      });
      return { keyId, token, prefix };
    }),

  apiKeysRevoke: protectedProcedure
    .input(z.object({ keyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const projectId = await getProjectIdByKeyId(input.keyId);
      await assertProjectRole(ctx, projectId, ["owner", "admin", "editor"]);
      await repoRevokeApiKey(input.keyId, ctx.session.user.id);
      return { ok: true };
    }),
});
