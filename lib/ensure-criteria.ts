import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

let ready = false;

export async function ensureCriteriaTables() {
  if (ready) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "job_criteria" (
      "id" TEXT NOT NULL,
      "jobId" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "job_criteria_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "job_criteria_jobId_idx" ON "job_criteria"("jobId")`,
  );
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'job_criteria_jobId_fkey'
      ) THEN
        ALTER TABLE "job_criteria"
          ADD CONSTRAINT "job_criteria_jobId_fkey"
          FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$
  `);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "matchPercent" INTEGER`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "applications_matchPercent_idx" ON "applications"("matchPercent")`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "application_criteria" (
      "applicationId" TEXT NOT NULL,
      "criterionId" TEXT NOT NULL,
      "met" BOOLEAN NOT NULL DEFAULT false,
      CONSTRAINT "application_criteria_pkey" PRIMARY KEY ("applicationId", "criterionId")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "application_criteria_criterionId_idx" ON "application_criteria"("criterionId")`,
  );
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'application_criteria_applicationId_fkey'
      ) THEN
        ALTER TABLE "application_criteria"
          ADD CONSTRAINT "application_criteria_applicationId_fkey"
          FOREIGN KEY ("applicationId") REFERENCES "applications"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'application_criteria_criterionId_fkey'
      ) THEN
        ALTER TABLE "application_criteria"
          ADD CONSTRAINT "application_criteria_criterionId_fkey"
          FOREIGN KEY ("criterionId") REFERENCES "job_criteria"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$
  `);

  ready = true;
}

export async function saveJobCriteria(jobId: string, labels: string[]) {
  await ensureCriteriaTables();
  await prisma.$executeRaw`
    DELETE FROM "application_criteria"
    WHERE "criterionId" IN (SELECT "id" FROM "job_criteria" WHERE "jobId" = ${jobId})
  `;
  await prisma.$executeRaw`DELETE FROM "job_criteria" WHERE "jobId" = ${jobId}`;
  for (let sortOrder = 0; sortOrder < labels.length; sortOrder++) {
    const id = randomUUID();
    const label = labels[sortOrder];
    await prisma.$executeRaw`
      INSERT INTO "job_criteria" ("id", "jobId", "label", "sortOrder")
      VALUES (${id}, ${jobId}, ${label}, ${sortOrder})
    `;
  }
}

export async function loadJobCriteriaLabels(jobId: string) {
  try {
    await ensureCriteriaTables();
    const rows = await prisma.$queryRaw<{ label: string }[]>`
      SELECT "label" FROM "job_criteria" WHERE "jobId" = ${jobId} ORDER BY "sortOrder" ASC
    `;
    return rows.map((row) => row.label);
  } catch {
    return [];
  }
}
