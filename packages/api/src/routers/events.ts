import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { queryClickHouse, cachedQuery } from "@otm/core";

function isoToCHDate(iso: string): string {
  return iso.replace("T", " ").replace("Z", "").slice(0, 19);
}

function resolveSince(code?: string | null): string | null {
  if (!code) return null;

  const now = new Date();

  switch (code) {
    case "24h":
      return new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    case "14d":
      return new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString();
    default:
      return code;
  }
}

export const eventsRouter = createTRPCRouter({
  stats: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        since: z.string().nullable().optional(),
        type: z.string().nullable().optional(),
        region: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const { projectId, since, type, region, search } = input;

      const sinceDate = resolveSince(since);
      const chSince = sinceDate ? isoToCHDate(sinceDate) : null;

      const cacheKey = `stats:v2:${projectId}:${since ?? "all"}:${type ?? "all"}:${
        region ?? "all"
      }:${search ?? "all"}`;

      return cachedQuery(cacheKey, 15, async () => {
        const rowsAgg = await queryClickHouse<{
          totalEvents: number;
          uniqueUsers: number;
          lastEventAt: string | null;
        }>(`
        SELECT
          sumMerge(total_events) AS totalEvents,
          uniqMerge(unique_users) AS uniqueUsers,
          formatDateTime(maxMerge(last_event_at), '%Y-%m-%d %H:%M:%S') AS lastEventAt
        FROM osstag.events_minute FINAL
        WHERE project_id = '${projectId}'
        ${chSince ? `AND minute >= toDateTime('${chSince}')` : ""}
      `);

        const agg = rowsAgg[0] ?? {
          totalEvents: 0,
          uniqueUsers: 0,
          lastEventAt: null,
        };

        const rowsTop = await queryClickHouse<{
          topEventType: string | null;
          topRegion: string | null;
        }>(`
        SELECT
          topK(1)(JSONExtractString(data, 'name'))[1] AS topEventType,
          topK(1)(
            JSONExtractString(JSONExtractRaw(data, 'props'), 'region')
          )[1] AS topRegion
        FROM osstag.events_raw
        WHERE project_id = '${projectId}'
        ${chSince ? `AND occurred_at >= toDateTime('${chSince}')` : ""}
      `);

        const top = rowsTop[0] ?? {
          topEventType: null,
          topRegion: null,
        };

        return {
          totalEvents: agg.totalEvents,
          uniqueUsers: agg.uniqueUsers,
          lastEventAt: agg.lastEventAt,
          topEventType: top.topEventType,
          topRegion: top.topRegion,
        };
      });
    }),

  live: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        windowMinutes: z.number().int().min(1).max(60).default(5),
      })
    )
    .query(async ({ input }) => {
      const { projectId, windowMinutes } = input;

      const cacheKey = `live:${projectId}:${windowMinutes}`;

      return cachedQuery(cacheKey, 5, async () => {
        const rows = await queryClickHouse<{
          totalEvents: number;
          lastEventAt: string | null;
        }>(`
          SELECT
            sumMerge(total_events) AS totalEvents,
            formatDateTime(maxMerge(last_event_at), '%Y-%m-%d %H:%M:%S') AS lastEventAt
          FROM osstag.events_minute FINAL
          WHERE project_id = '${projectId}'
            AND minute >= now() - INTERVAL ${windowMinutes} MINUTE
        `);

        const row = rows[0];

        if (!row || row.totalEvents === 0) {
          return {
            lastEventAt: null,
            eventsPerMinute: 0,
            totalInWindow: 0,
            windowMinutes,
          };
        }

        return {
          lastEventAt: row.lastEventAt,
          eventsPerMinute: row.totalEvents / windowMinutes,
          totalInWindow: row.totalEvents,
          windowMinutes,
        };
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().int().min(1).max(200).default(50),
        cursor: z.number().int().min(0).nullable().optional(),

        type: z.string().nullable().optional(),
        region: z.string().nullable().optional(),
        since: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = input.cursor ?? 0;

      const filters = [`project_id = '${input.projectId}'`];

      const sinceDate = resolveSince(input.since);
      if (sinceDate) {
        const chSince = isoToCHDate(sinceDate);
        filters.push(`occurred_at >= toDateTime('${chSince}')`);
      }

      if (input.type) {
        filters.push(`type = '${input.type}'`);
      }

      if (input.region) {
        filters.push(`
         JSONExtractString(
           JSONExtractRaw(data, 'props'),
           'region'
         ) = '${input.region}'
        `);
      }

      if (input.search) {
        const q = input.search.replace(/'/g, "");

        filters.push(`
         (
           JSONExtractString(data, 'name') ILIKE '%${q}%'
           OR JSONExtractString(data, 'userId') ILIKE '%${q}%'
           OR JSONExtractRaw(data, 'props') ILIKE '%${q}%'
         )
       `);
      }

      const where = filters.join(" AND ");

      const rows = await queryClickHouse<{
        project_id: string;
        type: string;
        region: string | null;
        props: string | null;
        occurred_at: string;
      }>(`
          SELECT
            project_id,
            type,
            JSONExtractString(JSONExtractRaw(data, 'props'), 'region') AS region,
            JSONExtractRaw(data, 'props') AS props,
            occurred_at
          FROM osstag.events_raw
          WHERE ${where}
          ORDER BY occurred_at DESC
          LIMIT ${input.limit}
          OFFSET ${offset}
        `);

      const parsed = rows.map((r) => ({
        ...r,
        props: r.props ? JSON.parse(r.props) : null,
      }));

      return {
        items: parsed,
        nextCursor: rows.length < input.limit ? null : offset + rows.length,
      };
    }),
});
