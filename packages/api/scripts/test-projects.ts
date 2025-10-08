// packages/api/scripts/test-projects.ts
import "dotenv/config";
import { appRouter } from "@otm/api";
import { db, schema } from "@otm/db";
import { sql } from "drizzle-orm";

async function pickAnyUserId(): Promise<string> {
  const rows = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .limit(1);
  if (!rows.length) {
    throw new Error(
      "No user found. Log in once via the dashboard to create a user row, then rerun."
    );
  }
  return rows[0]!.id;
}

function randomSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureOrg(ownerId: string) {
  const slug = randomSlug("test-org");
  const orgId = `org_${crypto.randomUUID()}`;

  await db.insert(schema.organization).values({
    id: orgId,
    name: "Test Org",
    slug,
    ownerId,
  });

  await db.insert(schema.organizationMember).values({
    id: `mbr_${crypto.randomUUID()}`,
    orgId,
    userId: ownerId,
    role: "owner",
  });

  return { orgId, slug };
}

async function main() {
  const userId = await pickAnyUserId();
  const { orgId, slug: orgSlug } = await ensureOrg(userId);

  // ✅ Provide a session directly to createCaller (satisfies protectedProcedure)
  const caller = appRouter.createCaller({
    session: {
        user: {
            id: userId,
            role: "owner" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            email: "",
            emailVerified: false,
            name: "",
        },
        session: {
            id: "test-session-id",
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
            token: "test-session-token",
            ipAddress: "127.0.0.1",
            userAgent: "test-script"
        }
    },
  });

  // 1) Create project
  const projectSlug = randomSlug("proj");
  const { id: projectId } = await caller.projects.create({
    orgId,
    name: "Test Project",
    slug: projectSlug,
  });
  console.log("✅ project.created:", {
    projectId,
    projectSlug,
    orgId,
    orgSlug,
  });

  // 2) Create API key
  const { keyId, token, prefix } = await caller.projects.apiKeysCreate({
    projectId,
    name: "Dev Secret Key",
    type: "secret",
  });
  console.log("✅ api_key.created:", { keyId, prefix, token });

  // 3) List active keys
  const keys1 = await caller.projects.apiKeysList({ projectId });
  console.log(
    "🔎 active keys:",
    keys1.map((k) => ({
      id: k.id,
      name: k.name,
      type: k.type,
      prefix: k.prefix,
    }))
  );

  // 4) Revoke key
  await caller.projects.apiKeysRevoke({ keyId });
  console.log("✅ api_key.revoked:", { keyId });

  // 5) Verify list again
  const keys2 = await caller.projects.apiKeysList({ projectId });
  console.log(
    "🔎 active keys after revoke:",
    keys2.map((k) => k.id)
  );

  // Recent audit events
  const events = await db.execute(
    sql`select action, created_at from audit_event where project_id = ${projectId} order by created_at desc limit 5`
  );
  console.log("🧾 recent audit:", events);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
