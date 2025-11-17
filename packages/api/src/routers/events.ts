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

      if (type) filters.push(`data.name = '${type}'`);
      if (region) filters.push(`data.props.region = '${region}'`);
      if (search)
        filters.push(`JSONExtractString(raw, 'name') ILIKE '%${search}%'`);

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
          topK(1)(JSONExtractString(data, 'props.region'))[1] AS topRegion
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
});
