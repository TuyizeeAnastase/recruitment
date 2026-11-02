DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HrRole') THEN
    CREATE TYPE "HrRole" AS ENUM ('ADMIN', 'STAFF');
  END IF;
END $$;

ALTER TABLE "hr_users" ADD COLUMN IF NOT EXISTS "role" "HrRole" NOT NULL DEFAULT 'STAFF';
ALTER TABLE "hr_users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "menu_permissions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "menuKey" TEXT NOT NULL,
  CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "menu_permissions_userId_menuKey_key"
  ON "menu_permissions"("userId", "menuKey");
CREATE INDEX IF NOT EXISTS "menu_permissions_userId_idx" ON "menu_permissions"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_permissions_userId_fkey'
  ) THEN
    ALTER TABLE "menu_permissions"
      ADD CONSTRAINT "menu_permissions_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "hr_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
