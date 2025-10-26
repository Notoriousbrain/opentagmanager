import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@otm/db";
import { and, eq, isNull } from "drizzle-orm";
import { env } from "@otm/env";
import { verifyScrypt, baseRateLimit } from "@otm/core";

const Body = z.object({
  key: z.string().min(1),
  events: z
    .array(
      z.object({
        type: z.string().min(1),
        ts: z.number().int().optional(),
        props: z.record(z.string(), z.unknown()).optional(),
        eventId: z.string().optional(),
      })
    )
    .min(1),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ipHeader = req.headers.get("x-forwarded-for");
    const ipFromReq = (req as unknown as { ip?: string })?.ip;
    const ip =
      (ipHeader ? ipHeader.split(",")[0]?.trim() : "") ||
      (typeof ipFromReq === "string" ? ipFromReq : "") ||
      req.headers.get("user-agent")?.slice(0, 64) ||
      "anonymous";

    const { success } = await baseRateLimit.limit(`ingest:${ip}`);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    const json = (await req.json()) as unknown;
    const parsed = Body.parse(json);
    const { key } = parsed;

    const dot = key.indexOf(".");
    const prefix = dot > 0 ? key.slice(0, dot) : key;

    const rows = await db
      .select({
        keyHash: schema.apiKey.keyHash,
        revokedAt: schema.apiKey.revokedAt,
        type: schema.apiKey.type,
      })
      .from(schema.apiKey)
      .where(
        and(eq(schema.apiKey.prefix, prefix), isNull(schema.apiKey.revokedAt))
      )
      .limit(1);

    const rec = rows[0];
    if (!rec) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ok = verifyScrypt(key, rec.keyHash, env.OTM_API_KEY_PEPPER);
    if (!ok) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return new NextResponse("Bad Request", { status: 400 });
  }
}
