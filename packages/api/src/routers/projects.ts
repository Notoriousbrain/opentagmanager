import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  listProjects,
  createProject,
  listActiveApiKeys,
  createApiKey as repoCreateApiKey,
  revokeApiKey as repoRevokeApiKey,
} from "@otm/db/repos";
import { CreateProjectInput, CreateApiKeyInput } from "@otm/core";
import { makeApiKey } from "@otm/core";

const PEPPER = process.env.OTM_API_KEY_PEPPER ?? "";

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .query(async ({ input }) => listProjects(input.orgId)),

  create: protectedProcedure
    .input(CreateProjectInput)
    .mutation(async ({ ctx, input }) => {
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
    .query(async ({ input }) => listActiveApiKeys(input.projectId)),

  apiKeysCreate: protectedProcedure
    .input(CreateApiKeyInput)
    .mutation(async ({ ctx, input }) => {
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
      await repoRevokeApiKey(input.keyId, ctx.session.user.id);
      return { ok: true };
    }),
});
