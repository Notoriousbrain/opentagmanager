CREATE TYPE "public"."api_key_type"      AS ENUM ('public', 'secret');
CREATE TYPE "public"."org_role"          AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE "public"."org_status"        AS ENUM ('active', 'disabled', 'archived');
CREATE TYPE "public"."project_status"    AS ENUM ('active', 'disabled', 'archived');

CREATE TABLE "api_key" (
  "id"           text PRIMARY KEY NOT NULL,
  "project_id"   text NOT NULL,
  "name"         text NOT NULL,
  "type"         "api_key_type" NOT NULL,
  "prefix"       text NOT NULL,
  "key_hash"     text NOT NULL,
  "last_used_at" timestamptz,
  "revoked_at"   timestamptz,
  "created_at"   timestamptz DEFAULT now() NOT NULL,
  "updated_at"   timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "api_key_prefix_unique" UNIQUE ("prefix"),
  CONSTRAINT "api_key_prefix_not_empty_chk" CHECK (length(prefix) > 0),
  CONSTRAINT "api_key_hash_not_empty_chk"   CHECK (length(key_hash) > 0),
  CONSTRAINT "api_key_revoked_after_create_chk" CHECK (revoked_at IS NULL OR revoked_at >= created_at)
);

CREATE TABLE "audit_event" (
  "id"               text PRIMARY KEY NOT NULL,
  "actor_user_id"    text,
  "actor_api_key_id" text,
  "org_id"           text,
  "project_id"       text,
  "action"           text NOT NULL,
  "data"             jsonb DEFAULT '{}'::jsonb NOT NULL,
  "ip"               text,
  "ua"               text,
  "created_at"       timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "organization" (
  "id"          text PRIMARY KEY NOT NULL,
  "name"        text NOT NULL,
  "slug"        text NOT NULL,
  "owner_id"    text NOT NULL,
  "status"      "org_status" DEFAULT 'active' NOT NULL,
  "archived_at" timestamptz,
  "version"     integer DEFAULT 1 NOT NULL,
  "created_at"  timestamptz DEFAULT now() NOT NULL,
  "updated_at"  timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "organization_slug_unique" UNIQUE ("slug"),
  CONSTRAINT "organization_slug_format_chk"
    CHECK ("organization"."slug" ~ '^[a-z0-9][a-z0-9-]*$')
);

CREATE TABLE "organization_member" (
  "id"         text PRIMARY KEY NOT NULL,
  "org_id"     text NOT NULL,
  "user_id"    text NOT NULL,
  "role"       "org_role" NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "organization_member_org_user_unique" UNIQUE ("org_id", "user_id")
);

CREATE TABLE "project" (
  "id"          text PRIMARY KEY NOT NULL,
  "org_id"      text NOT NULL,
  "name"        text NOT NULL,
  "slug"        text NOT NULL,
  "status"      "project_status" DEFAULT 'active' NOT NULL,
  "archived_at" timestamptz,
  "version"     integer DEFAULT 1 NOT NULL,
  "created_at"  timestamptz DEFAULT now() NOT NULL,
  "updated_at"  timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "project_org_slug_unique" UNIQUE ("org_id","slug"),
  CONSTRAINT "project_slug_format_chk"
    CHECK ("project"."slug" ~ '^[a-z0-9][a-z0-9-]*$')
);

ALTER TABLE "api_key"
  ADD CONSTRAINT "api_key_project_id_project_id_fk"
  FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "audit_event"
  ADD CONSTRAINT "audit_event_actor_user_id_user_id_fk"
  FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "audit_event"
  ADD CONSTRAINT "audit_event_actor_api_key_id_api_key_id_fk"
  FOREIGN KEY ("actor_api_key_id") REFERENCES "public"."api_key"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "audit_event"
  ADD CONSTRAINT "audit_event_org_id_organization_id_fk"
  FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "audit_event"
  ADD CONSTRAINT "audit_event_project_id_project_id_fk"
  FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "organization"
  ADD CONSTRAINT "organization_owner_id_user_id_fk"
  FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "organization_member"
  ADD CONSTRAINT "organization_member_org_id_organization_id_fk"
  FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "organization_member"
  ADD CONSTRAINT "organization_member_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "project"
  ADD CONSTRAINT "project_org_id_organization_id_fk"
  FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX "api_key_project_id_type_idx"      ON "api_key" USING btree ("project_id","type");
CREATE INDEX "organization_owner_id_idx"        ON "organization" USING btree ("owner_id");
CREATE INDEX "organization_member_user_id_idx"  ON "organization_member" USING btree ("user_id");
CREATE INDEX "organization_member_org_id_idx"   ON "organization_member" USING btree ("org_id");
CREATE INDEX "project_org_id_idx"               ON "project" USING btree ("org_id");

ALTER TABLE "organization" DROP CONSTRAINT IF EXISTS "organization_slug_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_unique_active"
  ON "organization" ("slug")
  WHERE "archived_at" IS NULL;

ALTER TABLE "project" DROP CONSTRAINT IF EXISTS "project_org_slug_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "project_org_slug_unique_active"
  ON "project" ("org_id","slug")
  WHERE "archived_at" IS NULL;

CREATE INDEX IF NOT EXISTS "api_key_project_type_active_idx"
  ON "api_key" ("project_id","type")
  WHERE "revoked_at" IS NULL;

CREATE INDEX IF NOT EXISTS "api_key_last_used_at_idx"
  ON "api_key" ("last_used_at");

DROP INDEX IF EXISTS "audit_event_created_at_idx";
DROP INDEX IF EXISTS "audit_event_org_id_idx";
DROP INDEX IF EXISTS "audit_event_project_id_idx";

CREATE INDEX IF NOT EXISTS "audit_event_created_at_brin"
  ON "audit_event" USING BRIN ("created_at");

CREATE INDEX IF NOT EXISTS "audit_event_org_created_idx"
  ON "audit_event" ("org_id","created_at" DESC);

CREATE INDEX IF NOT EXISTS "audit_event_project_created_idx"
  ON "audit_event" ("project_id","created_at" DESC);

CREATE INDEX IF NOT EXISTS "audit_event_data_gin"
  ON "audit_event" USING GIN ("data" jsonb_path_ops);

ALTER TABLE "audit_event"
  ALTER COLUMN "ip" TYPE inet USING NULLIF(ip,'')::inet;

CREATE OR REPLACE FUNCTION otm_touch_updated_version()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  NEW.version := COALESCE(OLD.version, 1) + 1;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS organization_touch ON "organization";
CREATE TRIGGER organization_touch
BEFORE UPDATE ON "organization"
FOR EACH ROW EXECUTE FUNCTION otm_touch_updated_version();

DROP TRIGGER IF EXISTS project_touch ON "project";
CREATE TRIGGER project_touch
BEFORE UPDATE ON "project"
FOR EACH ROW EXECUTE FUNCTION otm_touch_updated_version();

CREATE OR REPLACE FUNCTION otm_prevent_slug_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'slug is immutable once created';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS organization_slug_immutable ON "organization";
CREATE TRIGGER organization_slug_immutable
BEFORE UPDATE ON "organization"
FOR EACH ROW EXECUTE FUNCTION otm_prevent_slug_update();

DROP TRIGGER IF EXISTS project_slug_immutable ON "project";
CREATE TRIGGER project_slug_immutable
BEFORE UPDATE ON "project"
FOR EACH ROW EXECUTE FUNCTION otm_prevent_slug_update();
