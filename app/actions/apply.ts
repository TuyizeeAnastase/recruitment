"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sources } from "@/lib/company";
import { jobIsAccepting } from "@/lib/jobs";
import { saveResume } from "@/lib/resume";
import { generateApplicantPassword } from "@/lib/passwords";
import { matchPercent } from "@/lib/match";

const sourceIds = new Set(sources.map((s) => s.id));

export async function applyAction(_: { error?: string } | null, formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
  const currentTitle = String(formData.get("currentTitle") ?? "").trim();
  const yearsExperience = String(formData.get("yearsExperience") ?? "").trim();
  const coverLetter = String(formData.get("coverLetter") ?? "").trim();
  const sourceRaw = String(formData.get("source") ?? "website");
  const source = sourceIds.has(sourceRaw as never) ? sourceRaw : "other";
  const resume = formData.get("resume");

  if (!fullName || !email || !phone || !city || !coverLetter) {
    return { error: "Please complete the required fields." };
  }
  if (!email.includes("@") || email.includes(" ")) {
    return { error: "Enter a valid email address." };
  }

  const job = await prisma.job.findUnique({
    where: { slug },
    include: { criteria: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job || !jobIsAccepting(job)) {
    return { error: "This role is no longer accepting applications." };
  }

  const alreadyApplied = await prisma.application.findFirst({
    where: {
      jobId: job.id,
      email: { equals: email, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (alreadyApplied) {
    return {
      error:
        "You have already applied for this position with this email. Open the applicant portal to follow your status.",
    };
  }

  let resumePath: string | null = null;
  let resumeName: string | null = null;
  try {
    if (resume instanceof File) {
      const saved = await saveResume(resume);
      resumePath = saved.path;
      resumeName = saved.name;
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save resume." };
  }

  const password = generateApplicantPassword();
  const passwordHash = await bcrypt.hash(password, 10);

  let applicationId: string;
  try {
    const application = await prisma.$transaction(async (tx) => {
      const again = await tx.application.findFirst({
        where: { jobId: job.id, email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });
      if (again) throw new Error("DUPLICATE_APPLICATION");

      const applicant = await tx.applicant.upsert({
        where: { email },
        update: { fullName, passwordHash },
        create: { email, fullName, passwordHash },
      });

      const linked = await tx.application.findFirst({
        where: { jobId: job.id, applicantId: applicant.id },
        select: { id: true },
      });
      if (linked) throw new Error("DUPLICATE_APPLICATION");

      const selected = new Set(formData.getAll("criterion").map((value) => String(value)));
      const metCount = job.criteria.filter((item) => selected.has(item.id)).length;
      const percent = matchPercent(metCount, job.criteria.length);

      return tx.application.create({
        data: {
          jobId: job.id,
          applicantId: applicant.id,
          fullName,
          email,
          phone,
          city,
          linkedinUrl: linkedinUrl || null,
          currentTitle: currentTitle || null,
          yearsExperience: yearsExperience || null,
          coverLetter,
          resumePath,
          resumeName,
          source,
          matchPercent: percent,
          nextStep: "Your application has been received. The recruitment team will review it shortly.",
          events: {
            create: {
              title: "Application submitted",
              detail:
                percent == null
                  ? `Applied for ${job.title}.`
                  : `Applied for ${job.title}. Screening match ${percent}% (${metCount} of ${job.criteria.length} criteria).`,
            },
          },
          criteria: job.criteria.length
            ? {
                create: job.criteria.map((item) => ({
                  criterionId: item.id,
                  met: selected.has(item.id),
                })),
              }
            : undefined,
        },
      });
    });
    applicationId = application.id;
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_APPLICATION") {
      return {
        error:
          "You have already applied for this position with this email. Open the applicant portal to follow your status.",
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        error:
          "You have already applied for this position with this email. Open the applicant portal to follow your status.",
      };
    }
    throw error;
  }

  redirect(`/jobs/${slug}/apply/thanks?id=${applicationId}`);
}
