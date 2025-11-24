import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { queryClickHouse } from "@otm/core";

function isoToCHDate(iso: string): string {
  return iso.replace("T", " ").replace("Z", "").slice(0, 19);
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

      const filters: string[] = [`project_id = '${projectId}'`];

      if (since) {
        const chSince = isoToCHDate(since);
        filters.push(`occurred_at >= toDateTime('${chSince}')`);
      }

      if (type) {
        filters.push(`JSONExtractString(data, 'name') = '${type}'`);
      }

      if (region) {
        filters.push(`
          JSONExtractString(
            JSONExtractRaw(data, 'props'),
            'region'
          ) = '${region}'
      `);
      }

      if (search) {
        filters.push(`JSONExtractString(data, 'name') ILIKE '%${search}%'`);
      }

      const whereClause = filters.join(" AND ");

      const rows = await queryClickHouse<{
        totalEvents: number;
        uniqueUsers: number;
        topEventType: string | null;
        topRegion: string | null;
      }>(`
        SELECT
          count() AS totalEvents,
          uniq(JSONExtractString(data, 'userId')) AS uniqueUsers,
          topK(1)(JSONExtractString(data, 'name'))[1] AS topEventType,
          topK(1)(
            JSONExtractString(
              JSONExtractRaw(data, 'props'),
              'region'
            )
          )[1] AS topRegion
        FROM osstag.events_raw
        WHERE ${whereClause}
      `);

      return (
        rows[0] ?? {
          totalEvents: 0,
          uniqueUsers: 0,
          topEventType: null,
          topRegion: null,
        }
      );
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
      })
    )
    .query(async ({ input }) => {
      const offset = input.cursor ?? 0;

      const filters = [`project_id = '${input.projectId}'`];

      if (input.since) {
        const sinceCH = input.since
          .replace("T", " ")
          .replace("Z", "")
          .slice(0, 19);
        filters.push(`occurred_at >= toDateTime('${sinceCH}')`);
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
