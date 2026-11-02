"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearApplicantSession, setApplicantSession } from "@/lib/applicant-auth";
import { generateApplicantPassword } from "@/lib/passwords";
import { sendPortalPasswordEmail } from "@/lib/email";

const THROTTLE_MS = 45_000;
const recentlyIssued = new Map<string, number>();

export async function requestPortalPasswordAction(
  _: { error?: string; sent?: boolean } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email.includes("@")) {
    return { error: "Enter the email you used to apply." };
  }

  const last = recentlyIssued.get(email) ?? 0;
  if (Date.now() - last < THROTTLE_MS) {
    return { error: "Wait about a minute, then request a new password again." };
  }

  const application = await prisma.application.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
  });
  if (!application) {
    return {
      error:
        "No application was found for this email. Use the same address you applied with — not the HR sending Gmail.",
    };
  }

  const password = generateApplicantPassword();
  const passwordHash = await bcrypt.hash(password, 10);
  const normalized = application.email.trim().toLowerCase();

  const existing = await prisma.applicant.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });

  const applicant = existing
    ? await prisma.applicant.update({
        where: { id: existing.id },
        data: { passwordHash, fullName: application.fullName },
      })
    : await prisma.applicant.create({
        data: {
          email: normalized,
          fullName: application.fullName,
          passwordHash,
        },
      });

  await prisma.application.updateMany({
    where: { email: { equals: email, mode: "insensitive" }, applicantId: null },
    data: { applicantId: applicant.id },
  });

  recentlyIssued.set(email, Date.now());

  const result = await sendPortalPasswordEmail({
    to: applicant.email,
    name: applicant.fullName,
    password,
  });
  if (!result.sent) {
    return { error: `We could not send the email. ${result.reason ?? "Ask HR to check Email settings."}` };
  }

  return { sent: true };
}

export async function applicantLoginAction(_: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.applicant.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Those details did not match. Request a new password if you need one." };
  }

  await setApplicantSession(user.id);
  redirect("/portal");
}

export async function applicantLogoutAction() {
  await clearApplicantSession();
  redirect("/portal/login");
}
