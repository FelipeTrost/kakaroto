CREATE TABLE IF NOT EXISTS "kakaroto_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar,
	"access_token" varchar,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" varchar,
	"session_state" varchar(255),
	CONSTRAINT "kakaroto_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kakaroto_question_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1000),
	"language" varchar(1000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kakaroto_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(256) NOT NULL,
	"question_end" varchar(256),
	"type" varchar NOT NULL,
	"collectionId" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kakaroto_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kakaroto_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kakaroto_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "kakaroto_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "kakaroto_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_collection_user_id_idx" ON "kakaroto_question_collection" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_collection_title_idx" ON "kakaroto_question_collection" ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_collection_id_idx" ON "kakaroto_question" ("collectionId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "kakaroto_session" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kakaroto_account" ADD CONSTRAINT "kakaroto_account_userId_kakaroto_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kakaroto_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kakaroto_question_collection" ADD CONSTRAINT "kakaroto_question_collection_userId_kakaroto_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kakaroto_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kakaroto_question" ADD CONSTRAINT "kakaroto_question_collectionId_kakaroto_question_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "kakaroto_question_collection"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kakaroto_session" ADD CONSTRAINT "kakaroto_session_userId_kakaroto_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kakaroto_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
