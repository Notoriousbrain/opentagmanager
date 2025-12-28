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
import { env } from "@otm/env";

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

  testEvent: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertProjectRole(ctx, input.projectId, [
        "owner",
        "admin",
        "editor",
      ]);

      const now = new Date().toISOString();

      const clientId = "dashboard-test";
      const sessionId = "dashboard-session";

      const batch = {
        projectId: input.projectId,
        clientId,
        sessionId,
        sentAt: now,
        events: [
          {
            id: crypto.randomUUID(),
            name: "$test_event",
            props: { source: "dashboard_setup" },
            timestamp: now,
            clientId,
            sessionId,
            url: "dashboard",
            referrer: null,
            viewport: { width: 0, height: 0 },
            region: null,
            context: { framework: "dashboard" },
          },
        ],
      };

      const ingestUrl = env.OTM_INGEST_URL;
      if (!ingestUrl) {
        throw new Error("OTM_INGEST_URL missing from environment");
      }

      await fetch(ingestUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(batch),
      });

      return { ok: true };
    }),

  installStatus: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertProjectRole(ctx, input.projectId, [
        "owner",
        "admin",
        "editor",
        "viewer",
      ]);

      const sql = `
      SELECT 
        count() AS cnt,
        max(occurred_at) AS last_event
      FROM events_raw
      WHERE project_id = {projectId:String}
        AND occurred_at >= now() - INTERVAL 5 MINUTE
    `;

      const rows = await ctx.queryClickHouse(sql, {
        projectId: input.projectId,
      });

      const row = (rows[0] ?? {
        cnt: 0,
        last_event: null,
      }) as { cnt: number; last_event: string | null };

      return {
        hasEvents: row.cnt > 0,
        recentCount: row.cnt,
        lastEventAt: row.last_event,
      };
    }),

  installTelemetryStatus: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertProjectRole(ctx, input.projectId, [
        "owner",
        "admin",
        "editor",
        "viewer",
      ]);

      const sql = `
      SELECT
        countIf(status = 'script_loaded') AS script_loaded,
        countIf(status = 'sdk_next_loaded') AS sdk_loaded
      FROM install_telemetry
      WHERE project_id = {projectId:String}
        AND occurred_at >= now() - INTERVAL 10 MINUTE
    `;

      // Explicitly tell TypeScript what to expect
      type TelemetryRow = {
        script_loaded: number;
        sdk_loaded: number;
      };

      const rows = await ctx.queryClickHouse(sql, {
        projectId: input.projectId,
      });
      const row = (rows[0] ?? {
        script_loaded: 0,
        sdk_loaded: 0,
      }) as TelemetryRow;

      return {
        scriptLoaded: row.script_loaded > 0,
        sdkLoaded: row.sdk_loaded > 0,
        blocked: row.script_loaded === 0 && row.sdk_loaded === 0,
      };
    }),
});
