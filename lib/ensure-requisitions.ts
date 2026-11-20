import { prisma } from "@/lib/prisma";

let ready = false;

export async function ensureRequisitionTables() {
  if (ready) return;

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "hr_users" ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT ''`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "hr_users" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false`,
  );
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      ALTER TYPE "HrRole" ADD VALUE IF NOT EXISTS 'HR';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `);
  await prisma.$executeRawUnsafe(`
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
    END $$
  `);
  await prisma.$executeRawUnsafe(`
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
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "staff_requisitions_status_idx" ON "staff_requisitions"("status")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "staff_requisitions_requestedById_idx" ON "staff_requisitions"("requestedById")`,
  );
  await prisma.$executeRawUnsafe(`
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
    END $$
  `);

  ready = true;
}
