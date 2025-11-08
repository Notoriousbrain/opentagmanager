import { createTRPCRouter, publicProcedure } from "../trpc";
import { queryClickHouse } from "@otm/core";

export const relayRouter = createTRPCRouter({
  getMetrics: publicProcedure.query(async () => {
    const res = await fetch(
      process.env.RELAY_METRICS_URL ?? "http://localhost:4000/metrics"
    );
    if (!res.ok) throw new Error("Failed to fetch relay metrics");
    const metrics = await res.json();
    return metrics;
  }),

  countByProject: publicProcedure.query(async () => {
    const rows = await queryClickHouse<{ project_id: string; total: number }>(`
      SELECT project_id, count() AS total
      FROM osstag.events_raw
      GROUP BY project_id
      ORDER BY total DESC
    `);
    return rows;
  }),

  countByDay: publicProcedure.query(async () => {
    const rows = await queryClickHouse<{
      project_id: string;
      day: string;
      total: number;
    }>(`
      SELECT
        project_id,
        toDate(occurred_at) AS day,
        count() AS total
      FROM osstag.events_raw
      WHERE day >= today() - 14
      GROUP BY project_id, day
      ORDER BY project_id, day ASC
    `);

    return rows;
  }),
});
