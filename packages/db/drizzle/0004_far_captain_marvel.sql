DROP INDEX IF EXISTS "organization_slug_unique";
DROP INDEX IF EXISTS "project_org_slug_unique";
DROP INDEX IF EXISTS "audit_event_created_at_idx";

CREATE INDEX "audit_event_created_at_brin_idx"
  ON "audit_event" USING brin ("created_at");

CREATE INDEX "audit_event_data_gin_idx"
  ON "audit_event" USING gin ("data");

CREATE UNIQUE INDEX "organization_slug_active_unique"
  ON "organization" ("slug")
  WHERE "organization"."archived_at" IS NULL;

CREATE UNIQUE INDEX "project_org_slug_active_unique"
  ON "project" ("org_id","slug")
  WHERE "project"."archived_at" IS NULL;