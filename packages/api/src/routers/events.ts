import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { queryClickHouse } from "@otm/core";

export const eventsRouter = createTRPCRouter({
  stats: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        range: z.string(),
        type: z.string().nullable().optional(),
        region: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const { projectId, range, type, region, search } = input;

      // Build WHERE filters dynamically
      const filters: string[] = [
        `project_id = '${projectId}'`,
        `timestamp >= now() - INTERVAL ${range}`,
      ];

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
          uniq(data.userId) AS uniqueUsers,
          topK(1)(data.name)[1] AS topEventType,
          topK(1)(data.props.region)[1] AS topRegion
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
