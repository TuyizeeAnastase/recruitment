"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteResumeFile } from "@/lib/resume";
import { generateApplicantPassword } from "@/lib/passwords";
import { sendPortalPasswordEmail } from "@/lib/email";

async function deleteApplicationRecord(id: string) {
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) return null;
  await deleteResumeFile(application.resumePath);
  await prisma.application.delete({ where: { id } });
  return application;
}

export async function deleteApplicationAction(id: string) {
  await requireAdmin();
  const application = await deleteApplicationRecord(id);
  if (!application) return { error: "Application not found." };

  if (application.applicantId) {
    const remaining = await prisma.application.count({ where: { applicantId: application.applicantId } });
    if (remaining === 0) {
      await prisma.applicant.delete({ where: { id: application.applicantId } }).catch(() => undefined);
    }
  }

  revalidatePath("/hr");
  revalidatePath("/hr/applications");
  revalidatePath("/hr/settings/applicants");
  revalidatePath("/hr/reports/exams");
  redirect("/hr/applications");
}

export async function deleteApplicantAction(id: string) {
  await requireAdmin();
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { applications: { select: { id: true, resumePath: true } } },
  });
  if (!applicant) return { error: "Applicant not found." };

  for (const application of applicant.applications) {
    await deleteResumeFile(application.resumePath);
  }
  await prisma.application.deleteMany({ where: { applicantId: id } });
  await prisma.application.deleteMany({
    where: { email: { equals: applicant.email, mode: "insensitive" } },
  });
  await prisma.applicant.delete({ where: { id } });

  revalidatePath("/hr");
  revalidatePath("/hr/applications");
  revalidatePath("/hr/settings/applicants");
  revalidatePath("/hr/reports/exams");
  return { saved: true };
}

export async function sendApplicantPasswordAction(id: string) {
  await requireAdmin();
  const applicant = await prisma.applicant.findUnique({ where: { id } });
  if (!applicant) return { error: "Applicant not found." };

  const password = generateApplicantPassword();
  await prisma.applicant.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  const result = await sendPortalPasswordEmail({
    to: applicant.email,
    name: applicant.fullName,
    password,
  });
  if (!result.sent) {
    return { error: result.reason ?? "The password email was not sent." };
  }
  revalidatePath("/hr/settings/applicants");
  return { saved: true };
}

export async function closeAllLiveJobsAction() {
  await requireAdmin();
  await prisma.job.updateMany({
    where: { status: "PUBLISHED", isOpen: true },
    data: { status: "CLOSED", isOpen: false },
  });
  revalidatePath("/hr");
  revalidatePath("/hr/jobs");
  revalidatePath("/");
  revalidatePath("/hr/settings");
  return { saved: true };
}
