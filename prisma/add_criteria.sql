CREATE TABLE IF NOT EXISTS "job_criteria" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "job_criteria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_criteria_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "job_criteria_jobId_idx" ON "job_criteria"("jobId");

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "matchPercent" INTEGER;

CREATE INDEX IF NOT EXISTS "applications_matchPercent_idx" ON "applications"("matchPercent");

CREATE TABLE IF NOT EXISTS "application_criteria" (
  "applicationId" TEXT NOT NULL,
  "criterionId" TEXT NOT NULL,
  "met" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "application_criteria_pkey" PRIMARY KEY ("applicationId", "criterionId"),
  CONSTRAINT "application_criteria_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "application_criteria_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "job_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "application_criteria_criterionId_idx" ON "application_criteria"("criterionId");
