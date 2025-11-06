import { eq } from "drizzle-orm";
import { db, schema } from "../packages/db/src";
import { createHash } from "node:crypto";

async function ensureUser() {
  const userId = "seed_user_1";
  const existing = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
  });

  if (existing) return existing;

  await db
    .insert(schema.user)
    .values({
      id: userId,
      email: "demo@osstag.dev",
      name: "Demo User",
      role: "admin",
    })
    .onConflictDoNothing();

  console.log("👤 Created demo user:", userId);
  return { id: userId };
}

async function ensureOrganization(ownerId: string) {
  const orgId = "demo_org_1";
  const existing = await db.query.organization.findFirst({
    where: eq(schema.organization.id, orgId),
  });

  if (existing) return existing;

  await db
    .insert(schema.organization)
    .values({
      id: orgId,
      name: "Demo Org",
      slug: "demo-org",
      ownerId,
    })
    .onConflictDoNothing();

  console.log("🏢 Created demo organization:", orgId);
  return { id: orgId };
}

async function ensureProject(orgId: string) {
  const projectId = "demo_project_1";
  const existing = await db.query.project.findFirst({
    where: eq(schema.project.id, projectId),
  });

  if (existing) return existing;

  await db
    .insert(schema.project)
    .values({
      id: projectId,
      orgId,
      name: "Demo Project",
      slug: "demo-project",
    })
    .onConflictDoNothing();

  console.log("📦 Created demo project:", projectId);
  return { id: projectId };
}

async function ensureApiKey(projectId: string) {
  const id = "OTM_PK_demo1234567890abcd";
  const rawSecret = "test_secret_public";
  const keyHash = createHash("sha256").update(rawSecret).digest("hex");
  const existing = await db.query.apiKey.findFirst({
    where: eq(schema.apiKey.id, id),
  });

  if (existing) {
    console.log("🔑 API key already exists:", id);
    return existing;
  }

  await db.insert(schema.apiKey).values({
    id,
    projectId,
    name: "Demo Public Key",
    type: "public",
    prefix: "OTM_PK",
    keyHash,
  });

  console.log("🔐 Inserted demo API key:", id);
  return { id, keyHash };
}

async function main() {
  console.log("🌱 Seeding demo environment...");
  const user = await ensureUser();
  const org = await ensureOrganization(user.id);
  const project = await ensureProject(org.id);
  const key = await ensureApiKey(project.id);

  console.log("\n✅ Demo environment ready:");
  console.log("  Organization:", org.id);
  console.log("  Project:", project.id);
  console.log("  Public Key:", key.id);
  console.log("  Secret (keyHash):", key.keyHash);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
