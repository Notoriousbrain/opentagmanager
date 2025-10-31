import { randomBytes } from "node:crypto";
import { db, schema } from "../packages/db/src";

async function main() {
  // 1️⃣ Seed a dummy user (owner of the demo org)
  await db
    .insert(schema.user)
    .values({
      id: "seed_user_1",
      email: "seed@example.com",
      name: "Seed User",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  // 2️⃣ Seed demo org
  await db
    .insert(schema.organization)
    .values({
      id: "demo_org_1",
      name: "Demo Org",
      slug: "demo-org",
      ownerId: "seed_user_1",
    })
    .onConflictDoNothing();

  // 3️⃣ Seed demo project
  await db
    .insert(schema.project)
    .values({
      id: "demo_project_1",
      orgId: "demo_org_1",
      name: "Demo Project",
      slug: "demo-project",
    })
    .onConflictDoNothing();

  // 4️⃣ Seed demo API key
  const id = "OTM_PK_demo1234567890abcd";
  const keyHash = randomBytes(16).toString("hex");

  await db.insert(schema.apiKey).values({
    id,
    projectId: "demo_project_1",
    name: "Demo key",
    type: "public",
    prefix: "OTM_PK",
    keyHash,
  });

  console.log("✅ Seeded demo API key:", id, "→", keyHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
