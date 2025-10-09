import { db, schema } from "@otm/db";
import { and, desc, eq, isNull } from "drizzle-orm";

export async function listProjects(orgId: string) {
  return db
    .select()
    .from(schema.project)
    .where(eq(schema.project.orgId, orgId))
    .orderBy(desc(schema.project.createdAt));
}

export async function createProject(input: {
  orgId: string;
  name: string;
  slug: string;
  actorUserId: string;
}) {
  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.project).values({
      id,
      orgId: input.orgId,
      name: input.name,
      slug: input.slug,
    });

    await tx.insert(schema.auditEvent).values({
      id: crypto.randomUUID(),
      actorUserId: input.actorUserId,
      orgId: input.orgId,
      projectId: id,
      action: "project.created",
      data: { name: input.name, slug: input.slug },
      ip: null,
      ua: null,
    });
  });

  return id;
}

export async function archiveProject(projectId: string, actorUserId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.project)
      .set({ status: "archived", archivedAt: new Date() })
      .where(eq(schema.project.id, projectId));

    await tx.insert(schema.auditEvent).values({
      id: crypto.randomUUID(),
      actorUserId,
      projectId,
      action: "project.archived",
      data: {},
      ip: null,
      ua: null,
    });
  });
}

export async function disableProject(projectId: string, actorUserId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.project)
      .set({ status: "disabled" })
      .where(eq(schema.project.id, projectId));

    await tx.insert(schema.auditEvent).values({
      id: crypto.randomUUID(),
      actorUserId,
      projectId,
      action: "project.disabled",
      data: {},
      ip: null,
      ua: null,
    });
  });
}

export async function createApiKey(input: {
  projectId: string;
  name: string;
  type: "public" | "secret";
  prefix: string;
  keyHash: string;
  actorUserId: string;
}) {
  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.apiKey).values({
      id,
      projectId: input.projectId,
      name: input.name,
      type: input.type,
      prefix: input.prefix,
      keyHash: input.keyHash,
    });

    await tx.insert(schema.auditEvent).values({
      id: crypto.randomUUID(),
      actorUserId: input.actorUserId,
      projectId: input.projectId,
      action: "api_key.created",
      data: { keyId: id, name: input.name, type: input.type },
      ip: null,
      ua: null,
    });
  });

  return id;
}

export async function revokeApiKey(keyId: string, actorUserId: string) {
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(schema.apiKey)
      .set({ revokedAt: new Date() })
      .where(eq(schema.apiKey.id, keyId))
      .returning({ projectId: schema.apiKey.projectId });

    if (!updated) throw new Error("API key not found");

    const [proj] = await tx
      .select({ orgId: schema.project.orgId })
      .from(schema.project)
      .where(eq(schema.project.id, updated.projectId));

    await tx.insert(schema.auditEvent).values({
      id: crypto.randomUUID(),
      actorUserId,
      orgId: proj?.orgId ?? null,
      projectId: updated.projectId,
      action: "api_key.revoked",
      data: { keyId },
      ip: null,
      ua: null,
    });
  });
}

export async function listActiveApiKeys(projectId: string) {
  return db
    .select()
    .from(schema.apiKey)
    .where(
      and(
        eq(schema.apiKey.projectId, projectId),
        isNull(schema.apiKey.revokedAt)
      )
    )
    .orderBy(desc(schema.apiKey.createdAt));
}
