ALTER TABLE "hr_users" ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RequisitionStatus') THEN
    CREATE TYPE "RequisitionStatus" AS ENUM (
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'DECLINED',
      'FULFILLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "staff_requisitions" (
  "id" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "positionTitle" TEXT NOT NULL,
  "headcount" INTEGER NOT NULL DEFAULT 1,
  "employment" TEXT NOT NULL,
  "location" TEXT NOT NULL DEFAULT '',
  "justification" TEXT NOT NULL,
  "requiredBy" TIMESTAMP(3),
  "status" "RequisitionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "hrNotes" TEXT NOT NULL DEFAULT '',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_requisitions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "staff_requisitions_status_idx" ON "staff_requisitions"("status");
CREATE INDEX IF NOT EXISTS "staff_requisitions_requestedById_idx" ON "staff_requisitions"("requestedById");
CREATE INDEX IF NOT EXISTS "staff_requisitions_createdAt_idx" ON "staff_requisitions"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_requisitions_requestedById_fkey'
  ) THEN
    ALTER TABLE "staff_requisitions"
      ADD CONSTRAINT "staff_requisitions_requestedById_fkey"
      FOREIGN KEY ("requestedById") REFERENCES "hr_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_requisitions_reviewedById_fkey'
  ) THEN
    ALTER TABLE "staff_requisitions"
      ADD CONSTRAINT "staff_requisitions_reviewedById_fkey"
      FOREIGN KEY ("reviewedById") REFERENCES "hr_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
