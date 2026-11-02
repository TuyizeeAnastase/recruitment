"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isGmailAppPassword, isGmailHost, normalizeSmtpPassword, sendMail } from "@/lib/email";
import { portalLoginUrl } from "@/lib/origin";

export async function saveMailSettingsAction(_: { error?: string; saved?: boolean } | null, formData: FormData) {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const host = String(formData.get("host") ?? "").trim();
  const fromName = String(formData.get("fromName") ?? "").trim();
  const gmail = isGmailHost(host, username);
  const password = normalizeSmtpPassword(String(formData.get("password") ?? ""), gmail);

  if (!username.includes("@")) {
    return { error: "Enter the mailbox that will send recruitment emails." };
  }
  if (!host) {
    return { error: "Enter the SMTP host, for example smtp.office365.com or mail.yourbank.rw." };
  }

  const existing = await prisma.mailSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  if (!password && !existing.password) {
    return { error: "Enter the SMTP password for that mailbox." };
  }
  if (password && gmail && !isGmailAppPassword(password)) {
    return {
      error:
        "Gmail needs a 16-character App Password. For the bank mail server, use that server’s host and password instead.",
    };
  }

  await prisma.mailSetting.update({
    where: { id: "default" },
    data: {
      host,
      port: Number(formData.get("port") ?? 587) || 587,
      secure: String(formData.get("secure") ?? "") === "on",
      username,
      password: password || existing.password,
      fromName: fromName || "BANK OF AFRICA RWANDA Careers",
    },
  });

  revalidatePath("/hr/settings");
  return { saved: true };
}

export async function sendTestMailAction(_: { error?: string; saved?: boolean } | null, formData: FormData) {
  await requireAdmin();
  const to = String(formData.get("testTo") ?? "").trim().toLowerCase();
  if (!to.includes("@")) {
    return { error: "Enter an email address to send a test message." };
  }
  const result = await sendMail({
    to,
    subject: "Test message from BOA recruitment",
    title: "Email is working",
    body: "If you can read this, the live mail server is configured. Applicants can receive portal passwords.",
    ctaLabel: "Open applicant portal",
    ctaHref: await portalLoginUrl(),
  });
  if (!result.sent) {
    return { error: result.reason ?? "Test email was not sent." };
  }
  return { saved: true };
}
