import { EventRow } from "@otm/types";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { queryClickHouse } from "@otm/core";
import z from "zod";

const METRICS_URL =
  process.env.RELAY_METRICS_URL ?? "http://localhost:4000/metrics";
const METRICS_TIMEOUT_MS = Number(process.env.RELAY_METRICS_TIMEOUT_MS ?? 1500);
const METRICS_CACHE_MS = Number(process.env.RELAY_METRICS_CACHE_MS ?? 3000);

type RelayMetrics = {
  uptimeSeconds: number;
  requests: number;
  acceptedBatches: number;
  acceptedEvents: number;
  lastRequestAt: string | null;
  lastAcceptedAt: string | null;
  dlqWrites: number;
  replays: number;
  cleaned: number;
};

const DEFAULT_METRICS: RelayMetrics = {
  uptimeSeconds: 0,
  requests: 0,
  acceptedBatches: 0,
  acceptedEvents: 0,
  lastRequestAt: null,
  lastAcceptedAt: null,
  dlqWrites: 0,
  replays: 0,
  cleaned: 0,
};

let cachedMetrics: { value: RelayMetrics; expiresAt: number } | null = null;

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

async function getRelayMetrics(): Promise<RelayMetrics> {
  // serve from cache if fresh
  const now = Date.now();
  if (cachedMetrics && cachedMetrics.expiresAt > now) {
    return cachedMetrics.value;
  }

  // fetch with timeout, fallback to last cache or defaults
  try {
    const data = await fetchJsonWithTimeout<RelayMetrics>(
      METRICS_URL,
      METRICS_TIMEOUT_MS
    );
    cachedMetrics = { value: data, expiresAt: now + METRICS_CACHE_MS };
    return data;
  } catch {
    if (cachedMetrics) return cachedMetrics.value; // stale-while-revalidate feel
    return DEFAULT_METRICS;
  }
}

export const relayRouter = createTRPCRouter({
  getMetrics: publicProcedure.query(async () => {
    return await getRelayMetrics();
  }),

  countByProject: publicProcedure.query(async () => {
    try {
      const rows = await queryClickHouse<{
        project_id: string;
        total: number;
      }>(`
        SELECT project_id, count() AS total
        FROM osstag.events_raw
        GROUP BY project_id
      `);
      return rows;
    } catch {
      return [] as { project_id: string; total: number }[];
    }
  }),

  countByDay: publicProcedure.query(async () => {
    try {
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
    } catch {
      return [] as { project_id: string; day: string; total: number }[];
    }
  }),

  countByType: publicProcedure.query(async () => {
    try {
      const rows = await queryClickHouse<{ type: string; total: number }>(`
      SELECT
        type,
        count() AS total
      FROM osstag.events_raw
      WHERE occurred_at >= now() - INTERVAL 14 DAY
      GROUP BY type
      ORDER BY total DESC
    `);
      return rows;
    } catch {
      return [];
    }
  }),

  countByRegion: publicProcedure.query(async () => {
    try {
      const rows = await queryClickHouse<{ region: string; total: number }>(`
      SELECT
        data.props.region AS region,
        count() AS total
      FROM osstag.events_raw
      WHERE occurred_at >= now() - INTERVAL 14 DAY
      GROUP BY data.props.region
      ORDER BY total DESC
    `);
      return rows;
    } catch {
      return [];
    }
  }),

  getEventsByProject: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        type: z.string().optional(),
        region: z.string().optional(),
        since: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { projectId, type, region, since } = input;

      const whereParts: string[] = [`project_id = '${projectId}'`];
      if (type) whereParts.push(`type = '${type}'`);
      if (region) whereParts.push(`data.props.region = '${region}'`);
      if (since) whereParts.push(`occurred_at >= toDateTime('${since}')`);
      const whereClause = whereParts.join(" AND ");

      type RawRow = {
        project_id: string;
        type: string;
        region: string | null;
        props: unknown;
        occurred_at: string;
      };

      const rows = await queryClickHouse<RawRow>(`
        SELECT
          project_id,
          type,
          JSONExtract(toJSONString(data), 'props', 'JSON') AS props,
          data.props.region AS region,
          occurred_at
        FROM osstag.events_raw
        WHERE ${whereClause}
        ORDER BY occurred_at DESC
        LIMIT 100
      `);

      const normalized: EventRow[] = rows.map((r) => ({
        project_id: r.project_id,
        type: r.type,
        region: r.region ?? "—",
        occurred_at: r.occurred_at,
        props:
          r.props && typeof r.props === "string"
            ? JSON.parse(r.props)
            : (r.props ?? {}),
      }));

      return normalized;
    }),
});
