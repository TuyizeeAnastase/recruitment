"use server";

import { requireMenu } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel, statuses } from "@/lib/company";
import { sendStatusEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const statusIds = new Set(statuses.map((s) => s.id));

function parseDate(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function updateApplicationStatus(id: string, status: string) {
  await requireMenu("applications");
  if (!statusIds.has(status as never)) return;
  await prisma.application.update({ where: { id }, data: { status } });
  revalidatePath("/hr");
  revalidatePath(`/hr/applications/${id}`);
}

export async function saveApplicationNotes(id: string, formData: FormData) {
  await requireMenu("applications");
  const notes = String(formData.get("notes") ?? "");
  await prisma.application.update({ where: { id }, data: { notes } });
  revalidatePath(`/hr/applications/${id}`);
}

export async function saveApplicationProgress(
  id: string,
  _: { error?: string } | null,
  formData: FormData,
) {
  await requireMenu("applications");
  const existing = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!existing) return { error: "Application not found." };

  const status = String(formData.get("status") ?? existing.status);
  if (!statusIds.has(status as never)) {
    return { error: "Choose a valid stage." };
  }

  const nextStep = String(formData.get("nextStep") ?? "").trim();
  const interviewVenue = String(formData.get("interviewVenue") ?? "").trim() || null;
  const interviewDate = parseDate(String(formData.get("interviewDate") ?? ""));
  const notify = String(formData.get("notify") ?? "") === "on";

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status,
      nextStep,
      interviewDate,
      interviewVenue,
      events: {
        create: {
          title: status === existing.status ? "Progress updated" : `Moved to ${statusLabel(status)}`,
          detail: nextStep || "HR updated this application.",
        },
      },
    },
    include: { job: true },
  });

  let emailed = false;
  if (notify) {
    const result = await sendStatusEmail({
      to: updated.email,
      name: updated.fullName,
      jobTitle: updated.job.title,
      status: updated.status,
      nextStep: updated.nextStep,
      examScore: updated.examScore,
      examMax: updated.examMax,
      examDate: updated.examDate,
      examVenue: updated.examVenue,
      interviewDate: updated.interviewDate,
      interviewVenue: updated.interviewVenue,
    });
    emailed = result.sent;
    if (!result.sent) {
      revalidatePath("/hr");
      revalidatePath(`/hr/applications/${id}`);
      return {
        error: `Saved, but the email was not sent. ${result.reason ?? "Configure SMTP in .env."}`,
      };
    }
  }

  revalidatePath("/hr");
  revalidatePath(`/hr/applications/${id}`);
  revalidatePath("/hr/reports/exams");
  return { saved: true, emailed };
}

function examInviteMessage(date: Date, venue: string | null) {
  const when = date.toLocaleString();
  if (venue) {
    return `Please sit the written exam on ${when} at ${venue}. Bring identification and arrive 15 minutes early.`;
  }
  return `Please sit the written exam on ${when}. Bring identification and arrive 15 minutes early.`;
}

export async function inviteWrittenExamAction(
  id: string,
  _: { error?: string; saved?: boolean; emailed?: boolean } | null,
  formData: FormData,
) {
  await requireMenu("applications");
  const existing = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!existing) return { error: "Application not found." };

  const examDate = parseDate(String(formData.get("examDate") ?? ""));
  const examVenue = String(formData.get("examVenue") ?? "").trim() || null;
  const nextStep = String(formData.get("nextStep") ?? "").trim();
  if (!examDate) {
    return { error: "Choose the written exam date and time before notifying the applicant." };
  }

  const message = nextStep || examInviteMessage(examDate, examVenue);
  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: "written_exam",
      examDate,
      examVenue,
      nextStep: message,
      events: {
        create: {
          title: "Invited to written exam",
          detail: message,
        },
      },
    },
    include: { job: true },
  });

  const result = await sendStatusEmail({
    to: updated.email,
    name: updated.fullName,
    jobTitle: updated.job.title,
    status: "written_exam",
    nextStep: updated.nextStep,
    examDate: updated.examDate,
    examVenue: updated.examVenue,
  });

  revalidatePath("/hr");
  revalidatePath("/hr/applications");
  revalidatePath(`/hr/applications/${id}`);
  revalidatePath("/hr/reports/exams");

  if (!result.sent) {
    return {
      error: `Exam date saved, but the email was not sent. ${result.reason ?? "Check Email settings."}`,
    };
  }

  return { saved: true, emailed: true };
}

export async function saveExamScoreAction(
  id: string,
  _: { error?: string; saved?: boolean; emailed?: boolean } | null,
  formData: FormData,
) {
  await requireMenu("applications");
  const existing = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!existing) return { error: "Application not found." };

  const examScore = parseNumber(String(formData.get("examScore") ?? ""));
  const examMax = parseNumber(String(formData.get("examMax") ?? "")) ?? 100;
  const notify = String(formData.get("notify") ?? "") === "on";
  if (examScore == null) {
    return { error: "Enter the written exam mark." };
  }

  const detail = `Written exam mark recorded: ${examScore}${examMax ? ` / ${examMax}` : ""}.`;
  const updated = await prisma.application.update({
    where: { id },
    data: {
      examScore,
      examMax,
      nextStep: existing.nextStep || "Your written exam mark is now available in the applicant portal.",
      events: {
        create: {
          title: "Written exam mark recorded",
          detail,
        },
      },
    },
    include: { job: true },
  });

  let emailed = false;
  if (notify) {
    const result = await sendStatusEmail({
      to: updated.email,
      name: updated.fullName,
      jobTitle: updated.job.title,
      status: updated.status,
      nextStep: updated.nextStep,
      examScore: updated.examScore,
      examMax: updated.examMax,
      examDate: updated.examDate,
      examVenue: updated.examVenue,
    });
    emailed = result.sent;
    if (!result.sent) {
      revalidatePath("/hr");
      revalidatePath(`/hr/applications/${id}`);
      revalidatePath("/hr/reports/exams");
      return {
        error: `Mark saved, but the email was not sent. ${result.reason ?? "Check Email settings."}`,
      };
    }
  }

  revalidatePath("/hr");
  revalidatePath("/hr/applications");
  revalidatePath(`/hr/applications/${id}`);
  revalidatePath("/hr/reports/exams");
  return { saved: true, emailed };
}
