CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"ip" text,
	"container_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
