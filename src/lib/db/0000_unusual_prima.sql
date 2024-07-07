-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "chats" (
	"pdf_name" text NOT NULL,
	"pdf_url" text NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"file_key" text NOT NULL,
	"xata_version" integer DEFAULT 0 NOT NULL,
	"xata_createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"xata_updatedat" timestamp with time zone DEFAULT now() NOT NULL,
	"xata_id" text DEFAULT ('rec_'::text || (xata_private.xid())::text) NOT NULL,
	CONSTRAINT "chats__pgroll_new_xata_id_key" UNIQUE("xata_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"content" text NOT NULL,
	"role" text NOT NULL,
	"xata_createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"xata_updatedat" timestamp with time zone DEFAULT now() NOT NULL,
	"xata_id" text DEFAULT ('rec_'::text || (xata_private.xid())::text) NOT NULL,
	"xata_version" integer DEFAULT 0 NOT NULL,
	"chat_id" text,
	CONSTRAINT "messages__pgroll_new_xata_id_key" UNIQUE("xata_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chats__pgroll_new_xata_id_key" ON "chats" ("xata_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "messages__pgroll_new_xata_id_key" ON "messages" ("xata_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "chat_id_link" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("xata_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/