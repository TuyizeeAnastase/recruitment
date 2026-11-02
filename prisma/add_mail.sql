CREATE TABLE IF NOT EXISTS "mail_settings" (
  "id" TEXT NOT NULL,
  "host" TEXT NOT NULL DEFAULT 'smtp.gmail.com',
  "port" INTEGER NOT NULL DEFAULT 587,
  "secure" BOOLEAN NOT NULL DEFAULT false,
  "username" TEXT NOT NULL DEFAULT '',
  "password" TEXT NOT NULL DEFAULT '',
  "fromName" TEXT NOT NULL DEFAULT 'BANK OF AFRICA RWANDA Careers',
  CONSTRAINT "mail_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "mail_settings" ("id")
VALUES ('default')
ON CONFLICT ("id") DO NOTHING;
