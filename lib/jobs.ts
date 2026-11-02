import type { Job, JobStatus, Prisma } from "@prisma/client";

export type JobFormValues = {
  title: string;
  department: string;
  location: string;
  employment: string;
  description: string;
  requirements: string;
  salaryRange: string | null;
  closesAt: Date | null;
};

export function parseJobForm(formData: FormData): JobFormValues | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const employment = String(formData.get("employment") ?? "Full-time").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requirements = String(formData.get("requirements") ?? "").trim();
  const salaryRange = String(formData.get("salaryRange") ?? "").trim() || null;
  const closesRaw = String(formData.get("closesAt") ?? "").trim();

  if (!title || !department || !location || !description) {
    return { error: "Title, department, location, and description are required." };
  }

  let closesAt: Date | null = null;
  if (closesRaw) {
    const parsed = new Date(`${closesRaw}T23:59:59`);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Closing date is not valid." };
    }
    closesAt = parsed;
  }

  return {
    title,
    department,
    location,
    employment,
    description,
    requirements,
    salaryRange,
    closesAt,
  };
}

export function visibilityFromIntent(
  intent: string,
  previous?: { publishedAt: Date | null },
): {
  status: JobStatus;
  isOpen: boolean;
  publishedAt: Date | null;
} {
  if (intent === "draft") {
    return {
      status: "DRAFT",
      isOpen: false,
      publishedAt: previous?.publishedAt ?? null,
    };
  }

  if (intent === "close") {
    return {
      status: "CLOSED",
      isOpen: false,
      publishedAt: previous?.publishedAt ?? null,
    };
  }

  return {
    status: "PUBLISHED",
    isOpen: true,
    publishedAt: previous?.publishedAt ?? new Date(),
  };
}

export function publishedJobsWhere(): Prisma.JobWhereInput {
  return {
    status: "PUBLISHED",
    isOpen: true,
    OR: [{ closesAt: null }, { closesAt: { gte: new Date() } }],
  };
}

export function jobStatusLabel(status: JobStatus) {
  if (status === "PUBLISHED") return "Live";
  if (status === "CLOSED") return "Closed";
  return "Draft";
}

export function jobIsAccepting(job: Pick<Job, "status" | "isOpen" | "closesAt">) {
  if (job.status !== "PUBLISHED" || !job.isOpen) return false;
  if (job.closesAt && job.closesAt < new Date()) return false;
  return true;
}

export function toDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}
