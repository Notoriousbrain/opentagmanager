CREATE TABLE "interest" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text,
	CONSTRAINT "interest_email_unique" UNIQUE("email")
);
