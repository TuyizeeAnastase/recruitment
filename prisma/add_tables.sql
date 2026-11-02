DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobStatus') THEN
    CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "hr_users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hr_users_email_key" ON "hr_users"("email");

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "employment" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "requirements" TEXT NOT NULL DEFAULT '',
  "salaryRange" TEXT,
  "closesAt" TIMESTAMP(3),
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "postedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "jobs_slug_key" ON "jobs"("slug");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "jobs_isOpen_idx" ON "jobs"("isOpen");
CREATE INDEX IF NOT EXISTS "jobs_postedById_idx" ON "jobs"("postedById");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_postedById_fkey'
  ) THEN
    ALTER TABLE "jobs"
      ADD CONSTRAINT "jobs_postedById_fkey"
      FOREIGN KEY ("postedById") REFERENCES "hr_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "applications" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "linkedinUrl" TEXT,
  "currentTitle" TEXT,
  "yearsExperience" TEXT,
  "coverLetter" TEXT NOT NULL,
  "resumePath" TEXT,
  "resumeName" TEXT,
  "source" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "applications_jobId_email_key" ON "applications"("jobId", "email");
CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications"("status");
CREATE INDEX IF NOT EXISTS "applications_createdAt_idx" ON "applications"("createdAt");
CREATE INDEX IF NOT EXISTS "applications_email_idx" ON "applications"("email");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'applications_jobId_fkey'
  ) THEN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_jobId_fkey"
      FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
