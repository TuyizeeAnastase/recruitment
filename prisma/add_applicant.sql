CREATE TABLE IF NOT EXISTS "applicants" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "applicants_email_key" ON "applicants"("email");

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "applicantId" TEXT;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "nextStep" TEXT NOT NULL DEFAULT '';
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "examScore" DOUBLE PRECISION;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "examMax" DOUBLE PRECISION;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "examDate" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "examVenue" TEXT;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "interviewDate" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "interviewVenue" TEXT;

CREATE INDEX IF NOT EXISTS "applications_applicantId_idx" ON "applications"("applicantId");
CREATE UNIQUE INDEX IF NOT EXISTS "applications_jobId_applicantId_key" ON "applications"("jobId", "applicantId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'applications_applicantId_fkey'
  ) THEN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_applicantId_fkey"
      FOREIGN KEY ("applicantId") REFERENCES "applicants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "application_events" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "application_events_applicationId_idx" ON "application_events"("applicationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'application_events_applicationId_fkey'
  ) THEN
    ALTER TABLE "application_events"
      ADD CONSTRAINT "application_events_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "applications"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
