import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  projectId: z.string().min(1),
  loaded: z.boolean().optional(),
  errored: z.boolean().optional(),
  osstagReady: z.boolean().optional(),
});

const installTelemetry = new Map<
  string,
  { loaded: boolean; errored: boolean; osstagReady: boolean; at: number }
>();

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

  installTelemetry.set(projectId, {
    loaded: loaded ?? false,
    errored: errored ?? false,
    osstagReady: osstagReady ?? false,
    at: Date.now(),
  });

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

  const entry = installTelemetry.get(projectId);

  return NextResponse.json({
    ok: true,
    telemetry: entry ?? null,
  });
}
