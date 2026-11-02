"use server";

import { canAccessMenu, homePath, requireMenu } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJobForm, visibilityFromIntent } from "@/lib/jobs";
import { parseCriteriaLabels } from "@/lib/match";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateJobs(jobId?: string, slug?: string) {
  revalidatePath("/hr");
  revalidatePath("/hr/jobs");
  revalidatePath("/");
  if (jobId) {
    revalidatePath(`/hr/jobs/${jobId}`);
    revalidatePath(`/hr/jobs/${jobId}/edit`);
  }
  if (slug) {
    revalidatePath(`/jobs/${slug}`);
    revalidatePath(`/jobs/${slug}/apply`);
  }
}

async function uniqueSlug(title: string, excludeId?: string) {
  let slug = slugify(title);
  const clash = await prisma.job.findUnique({ where: { slug } });
  if (clash && clash.id !== excludeId) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  return slug;
}

export async function createJobAction(_: { error?: string } | null, formData: FormData) {
  const user = await requireMenu("jobs.create");
  const parsed = parseJobForm(formData);
  if ("error" in parsed) return parsed;

  const intent = String(formData.get("intent") ?? "publish");
  const criteria = parseCriteriaLabels(formData);
  if (intent === "publish" && criteria.length === 0) {
    return { error: "Add at least one screening criterion before publishing this role." };
  }
  const visibility = visibilityFromIntent(intent);
  const slug = await uniqueSlug(parsed.title);

  const job = await prisma.job.create({
    data: {
      ...parsed,
      slug,
      ...visibility,
      postedById: user.id,
      criteria: {
        create: criteria.map((label, sortOrder) => ({ label, sortOrder })),
      },
    },
  });

  revalidateJobs(job.id, job.slug);
  redirect(canAccessMenu(user, "jobs") ? `/hr/jobs/${job.id}` : homePath(user));
}

export async function updateJobAction(
  jobId: string,
  _: { error?: string } | null,
  formData: FormData,
) {
  await requireMenu("jobs");
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) return { error: "This role could not be found." };

  const parsed = parseJobForm(formData);
  if ("error" in parsed) return parsed;

  const intent = String(formData.get("intent") ?? "save");
  const criteria = parseCriteriaLabels(formData);
  if ((intent === "publish" || (intent === "save" && existing.status === "PUBLISHED")) && criteria.length === 0) {
    return { error: "Keep at least one screening criterion on a live role." };
  }
  const visibility =
    intent === "save"
      ? {
          status: existing.status,
          isOpen: existing.isOpen,
          publishedAt: existing.publishedAt,
        }
      : visibilityFromIntent(intent, existing);

  await prisma.jobCriterion.deleteMany({ where: { jobId } });
  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...parsed,
      ...visibility,
      criteria: {
        create: criteria.map((label, sortOrder) => ({ label, sortOrder })),
      },
    },
  });

  revalidateJobs(job.id, job.slug);
  redirect(`/hr/jobs/${job.id}`);
}

export async function toggleJobAction(jobId: string) {
  await requireMenu("jobs");
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return;

  const next = job.isOpen
    ? visibilityFromIntent("close", job)
    : visibilityFromIntent("publish", job);

  await prisma.job.update({
    where: { id: jobId },
    data: next,
  });

  revalidateJobs(job.id, job.slug);
}

export async function setJobStatusAction(jobId: string, intent: "publish" | "draft" | "close") {
  await requireMenu("jobs");
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { _count: { select: { criteria: true } } },
  });
  if (!job) return;
  if (intent === "publish" && job._count.criteria === 0) {
    redirect(`/hr/jobs/${jobId}/edit`);
  }

  await prisma.job.update({
    where: { id: jobId },
    data: visibilityFromIntent(intent, job),
  });

  revalidateJobs(job.id, job.slug);
}
