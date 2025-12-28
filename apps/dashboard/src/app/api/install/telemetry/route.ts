import { NextResponse } from "next/server";
import { z } from "zod";
import { insertClickHouse } from "@otm/core";

const bodySchema = z.object({
  projectId: z.string().min(1),
  loaded: z.boolean().optional(),
  errored: z.boolean().optional(),
  osstagReady: z.boolean().optional(),
});

function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const { projectId, loaded, errored, osstagReady } = parsed.data;

  const rows: { project_id: string; status: string; occurred_at: string }[] =
    [];
  const now = formatDateTime(new Date());

  if (loaded) {
    rows.push({ project_id: projectId, status: "script_loaded", occurred_at: now });
  }
  if (osstagReady) {
    rows.push({ project_id: projectId, status: "sdk_next_loaded", occurred_at: now });
  }
  if (errored) {
    rows.push({ project_id: projectId, status: "script_error", occurred_at: now });
  }

  if (rows.length > 0) {
    try {
      await insertClickHouse("install_telemetry", rows);
    } catch (err) {
      console.error("[telemetry] ClickHouse insert failed:", err);
      return NextResponse.json(
        { ok: false, error: "Failed to persist telemetry" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { ok: false, error: "Missing projectId" },
      { status: 400 }
    );
  }

  try {
    const { queryClickHouse } = await import("@otm/core");

    type TelemetryRow = {
      script_loaded: number;
      sdk_loaded: number;
      script_error: number;
      last_at: string | null;
    };

    const rows = await queryClickHouse<TelemetryRow>(
      `SELECT
        countIf(status = 'script_loaded') AS script_loaded,
        countIf(status = 'sdk_next_loaded') AS sdk_loaded,
        countIf(status = 'script_error') AS script_error,
        max(occurred_at) AS last_at
      FROM install_telemetry
      WHERE project_id = {projectId:String}
        AND occurred_at >= now() - INTERVAL 10 MINUTE`,
      { projectId }
    );

    const row = rows[0] ?? { script_loaded: 0, sdk_loaded: 0, script_error: 0, last_at: null };

    return NextResponse.json({
      ok: true,
      telemetry: {
        loaded: row.script_loaded > 0,
        errored: row.script_error > 0,
        osstagReady: row.sdk_loaded > 0,
        at: row.last_at ? new Date(row.last_at).getTime() : null,
      },
    });
  } catch (err) {
    console.error("[telemetry] ClickHouse query failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to query telemetry" },
      { status: 500 }
    );
  }
}
