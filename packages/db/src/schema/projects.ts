// packages/db/src/schema/projects.ts
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  unique,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

import { user } from "./auth";

export const orgRole = pgEnum("org_role", [
  "owner",
  "admin",
  "editor",
  "viewer",
]);
export const apiKeyType = pgEnum("api_key_type", ["public", "secret"]);

export const orgStatus = pgEnum("org_status", [
  "active",
  "disabled",
  "archived",
]);
export const projectStatus = pgEnum("project_status", [
  "active",
  "disabled",
  "archived",
]);

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    status: orgStatus("status").notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),

    version: integer("version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugUnique: unique("organization_slug_unique").on(t.slug),
    ownerIdx: index("organization_owner_id_idx").on(t.ownerId),
    slugFormatCheck: check(
      "organization_slug_format_chk",
      sql`${t.slug} ~ '^[a-z0-9][a-z0-9-]*$'`
    ),
  })
);

export const organizationMember = pgTable(
  "organization_member",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: orgRole("role").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgUserUnique: unique("organization_member_org_user_unique").on(
      t.orgId,
      t.userId
    ),
    userIdx: index("organization_member_user_id_idx").on(t.userId),
    orgIdx: index("organization_member_org_id_idx").on(t.orgId),
  })
);

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    status: projectStatus("status").notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),

    version: integer("version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgSlugUnique: unique("project_org_slug_unique").on(t.orgId, t.slug),
    orgIdx: index("project_org_id_idx").on(t.orgId),
    slugFormatCheck: check(
      "project_slug_format_chk",
      sql`${t.slug} ~ '^[a-z0-9][a-z0-9-]*$'`
    ),
  })
);

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: apiKeyType("type").notNull(), 
    prefix: text("prefix").notNull(), 
    keyHash: text("key_hash").notNull(),

    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }), 

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    prefixUnique: unique("api_key_prefix_unique").on(t.prefix),
    projectTypeIdx: index("api_key_project_id_type_idx").on(
      t.projectId,
      t.type
    ),
  })
);

export const auditEvent = pgTable(
  "audit_event",
  {
    id: text("id").primaryKey(),

    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    actorApiKeyId: text("actor_api_key_id").references(() => apiKey.id, {
      onDelete: "set null",
    }),

    orgId: text("org_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),

    action: text("action").notNull(),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ip: text("ip"),
    ua: text("ua"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdIdx: index("audit_event_created_at_idx").on(t.createdAt),
    orgIdx: index("audit_event_org_id_idx").on(t.orgId),
    projectIdx: index("audit_event_project_id_idx").on(t.projectId),
    actorIdx: index("audit_event_actor_user_id_idx").on(t.actorUserId),
    actorKeyIdx: index("audit_event_actor_api_key_id_idx").on(t.actorApiKeyId),
  })
);

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    owner: one(user, { fields: [organization.ownerId], references: [user.id] }),
    members: many(organizationMember),
    projects: many(project),
  })
);

export const organizationMemberRelations = relations(
  organizationMember,
  ({ one }) => ({
    org: one(organization, {
      fields: [organizationMember.orgId],
      references: [organization.id],
    }),
    member: one(user, {
      fields: [organizationMember.userId],
      references: [user.id],
    }),
  })
);

export const projectRelations = relations(project, ({ one, many }) => ({
  organization: one(organization, {
    fields: [project.orgId],
    references: [organization.id],
  }),
  apiKeys: many(apiKey),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  project: one(project, {
    fields: [apiKey.projectId],
    references: [project.id],
  }),
}));

export const auditEventRelations = relations(auditEvent, ({ one }) => ({
  actor: one(user, { fields: [auditEvent.actorUserId], references: [user.id] }),
  actorApiKey: one(apiKey, {
    fields: [auditEvent.actorApiKeyId],
    references: [apiKey.id],
  }),
  org: one(organization, {
    fields: [auditEvent.orgId],
    references: [organization.id],
  }),
  project: one(project, {
    fields: [auditEvent.projectId],
    references: [project.id],
  }),
}));
