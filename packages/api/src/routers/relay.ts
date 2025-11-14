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

const MetricsInput = z.object({
  projectId: z.string().optional(),
  range: z.enum(["7d", "14d", "30d"]).default("14d"),
});

function safeString(v: string) {
  return v.replace(/[^a-zA-Z0-9_\-]/g, "");
}

function buildRangeSql(range: "7d" | "14d" | "30d") {
  switch (range) {
    case "7d":
      return "now() - INTERVAL 7 DAY";
    case "30d":
      return "now() - INTERVAL 30 DAY";
    default:
      return "now() - INTERVAL 14 DAY";
  }
}

function buildProjectFilter(projectId?: string) {
  if (!projectId || projectId === "all") return "";
  return `e.project_id = '${safeString(projectId)}' AND`;
}

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
  const now = Date.now();
  if (cachedMetrics && cachedMetrics.expiresAt > now) {
    return cachedMetrics.value;
  }

  try {
    const data = await fetchJsonWithTimeout<RelayMetrics>(
      METRICS_URL,
      METRICS_TIMEOUT_MS
    );
    cachedMetrics = { value: data, expiresAt: now + METRICS_CACHE_MS };
    return data;
  } catch {
    if (cachedMetrics) return cachedMetrics.value;
    return DEFAULT_METRICS;
  }
}

export const relayRouter = createTRPCRouter({
  getMetrics: publicProcedure.query(async () => {
    return await getRelayMetrics();
  }),

  countByProject: publicProcedure
    .input(MetricsInput)
    .query(async ({ input }) => {
      try {
        const { projectId, range } = input;

        const rangeSql = buildRangeSql(range);
        const projectFilter = buildProjectFilter(projectId);

        const rows = await queryClickHouse<{
          project_id: string;
          project_name: string | null;
          total: number;
        }>(`
          SELECT
            toString(e.project_id) AS project_id,
            p.project_name,
            count() AS total
          FROM osstag.events_raw e
          LEFT JOIN osstag.project_lookup p ON e.project_id = p.project_id
          WHERE ${projectFilter} e.occurred_at >= ${rangeSql}
          GROUP BY project_id, p.project_name
        `);

        return rows;
      } catch {
        return [];
      }
    }),

  countByDay: publicProcedure.input(MetricsInput).query(async ({ input }) => {
    try {
      const { projectId, range } = input;

      const rangeSql = buildRangeSql(range);
      const projectFilter = buildProjectFilter(projectId);

      const rows = await queryClickHouse<{
        project_id: string;
        project_name: string | null;
        day: string;
        total: number;
      }>(`
        SELECT
          toString(e.project_id) AS project_id,
          p.project_name,
          toDate(e.occurred_at) AS day,
          count() AS total
        FROM osstag.events_raw e
        LEFT JOIN osstag.project_lookup p ON e.project_id = p.project_id
        WHERE ${projectFilter} e.occurred_at >= ${rangeSql}
        GROUP BY project_id, p.project_name, day
        ORDER BY day ASC
      `);

      return rows;
    } catch {
      return [];
    }
  }),

  countByType: publicProcedure.input(MetricsInput).query(async ({ input }) => {
    try {
      const { projectId, range } = input;

      const rangeSql = buildRangeSql(range);
      const projectFilter = buildProjectFilter(projectId);

      const rows = await queryClickHouse<{
        type: string;
        total: number;
      }>(`
        SELECT
          e.type,
          count() AS total
        FROM osstag.events_raw e
        WHERE ${projectFilter} e.occurred_at >= ${rangeSql}
        GROUP BY e.type
        ORDER BY total DESC
      `);

      return rows;
    } catch {
      return [];
    }
  }),

  countByRegion: publicProcedure
    .input(MetricsInput)
    .query(async ({ input }) => {
      try {
        const { projectId, range } = input;

        const rangeSql = buildRangeSql(range);
        const projectFilter = buildProjectFilter(projectId);

        const rows = await queryClickHouse<{
          region: string | null;
          total: number;
        }>(`
          SELECT
            e.data.props.region AS region,
            count() AS total
          FROM osstag.events_raw e
          WHERE ${projectFilter} e.occurred_at >= ${rangeSql}
          GROUP BY e.data.props.region
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
        cursor: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const { projectId, type, region, since, cursor, limit } = input;

      const whereParts: string[] = [
        `e.project_id = '${safeString(projectId)}'`,
      ];
      if (type) whereParts.push(`e.type = '${type}'`);
      if (region) whereParts.push(`e.data.props.region = '${region}'`);
      if (since)
        whereParts.push(`e.occurred_at >= parseDateTimeBestEffort('${since}')`);
      if (cursor)
        whereParts.push(`e.occurred_at < parseDateTimeBestEffort('${cursor}')`);

      const whereClause = whereParts.join(" AND ");

      type RawRow = {
        project_id: string;
        project_name: string | null;
        type: string;
        region: string | null;
        props: string | null;
        occurred_at: string;
      };

      const rows = await queryClickHouse<RawRow>(`
        SELECT
          toString(e.project_id) AS project_id,
          p.project_name,
          e.type,
          e.data.props.region AS region,
          JSONExtract(toJSONString(e.data), 'props', 'JSON') AS props,
          e.occurred_at
        FROM osstag.events_raw e
        LEFT JOIN osstag.project_lookup p ON e.project_id = p.project_id
        WHERE ${whereClause}
        ORDER BY e.occurred_at DESC
        LIMIT ${limit + 1}
      `);

      const normalized: EventRow[] = rows.map((r) => ({
        project_id: r.project_id,
        project_name: r.project_name ?? "Unknown",
        type: r.type,
        region: r.region ?? "—",
        occurred_at: r.occurred_at,
        props:
          r.props && typeof r.props === "string" ? JSON.parse(r.props) : {},
      }));

      const hasMore = normalized.length > limit;
      const items = hasMore ? normalized.slice(0, limit) : normalized;
      const nextCursor = hasMore ? items[items.length - 1]?.occurred_at : null;

      return { items, nextCursor };
    }),
});
