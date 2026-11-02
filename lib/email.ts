import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { companyName, statusEmails, statusLabel } from "./company";
import { portalLoginUrl } from "./origin";

type MailPayload = {
  to: string;
  subject: string;
  title: string;
  body: string;
  extra?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
};

export function isGmailHost(host: string, username: string) {
  return host.includes("gmail.com") || /@gmail\.com$/i.test(username);
}

export function normalizeSmtpPassword(raw: string, gmail: boolean) {
  const trimmed = raw.trim();
  return gmail ? trimmed.replace(/\s+/g, "") : trimmed;
}

export function isGmailAppPassword(raw: string) {
  return /^[a-zA-Z0-9]{16}$/.test(normalizeSmtpPassword(raw, true));
}

async function loadConfig(): Promise<MailConfig | null> {
  const saved = await prisma.mailSetting.findUnique({ where: { id: "default" } }).catch(() => null);
  const username = saved?.username?.trim() || process.env.SMTP_USER?.trim() || "";
  const host =
    saved?.host?.trim() ||
    process.env.SMTP_HOST?.trim() ||
    (username.endsWith("@gmail.com") ? "smtp.gmail.com" : "");
  const gmail = isGmailHost(host, username);
  const password = normalizeSmtpPassword(saved?.password || process.env.SMTP_PASS || "", gmail);
  if (!username || !password || !host) return null;

  return {
    host,
    port: saved?.port || Number(process.env.SMTP_PORT ?? 587),
    secure: saved?.secure ?? process.env.SMTP_SECURE === "true",
    username,
    password,
    fromName: saved?.fromName?.trim() || companyName,
  };
}

function wrap(payload: MailPayload) {
  const cta = payload.ctaHref
    ? `<p style="margin:24px 0"><a href="${payload.ctaHref}" style="background:#0a4a6e;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">${payload.ctaLabel ?? "Open portal"}</a></p>
        <p style="font-size:12px;color:#64748b;word-break:break-all">Or paste this link: <a href="${payload.ctaHref}">${payload.ctaHref}</a></p>`
    : "";
  return `
    <div style="font-family:Arial,sans-serif;background:#f3f5f8;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;color:#1e293b">
        <p style="color:#0a4a6e;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;margin:0">${companyName}</p>
        <h1 style="font-size:22px;margin:12px 0 16px">${payload.title}</h1>
        <p style="line-height:1.6">${payload.body}</p>
        ${payload.extra ? `<div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:16px;line-height:1.6">${payload.extra}</div>` : ""}
        ${cta}
        <p style="color:#64748b;font-size:12px;margin-top:28px">This message was sent by the ${companyName} recruitment desk.</p>
      </div>
    </div>
  `;
}

export async function sendMail(payload: MailPayload) {
  const config = await loadConfig();
  if (!config) {
    console.info("[email:not-configured]", payload.subject, payload.to);
    return {
      sent: false as const,
      reason: "Sending mail is not set up. An administrator must save SMTP details under HR → Email.",
    };
  }

  const gmail = isGmailHost(config.host, config.username);
  if (gmail && !isGmailAppPassword(config.password)) {
    return {
      sent: false as const,
      reason:
        "The saved secret is not a Gmail App Password (16 letters/numbers). Create one at myaccount.google.com/apppasswords, paste it under HR → Email, then send the test again.",
    };
  }

  const timeouts = {
    connectionTimeout: 6_000,
    greetingTimeout: 6_000,
    socketTimeout: 10_000,
  };
  const auth = { user: config.username, pass: config.password };
  const transports = gmail
    ? [
        { host: "smtp.gmail.com", port: 465, secure: true, auth, ...timeouts },
        { host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true, auth, ...timeouts },
      ]
    : [{ host: config.host, port: config.port, secure: config.secure, auth, ...timeouts }];

  const ctaHref = payload.ctaHref ?? (await portalLoginUrl());
  const html = wrap({ ...payload, ctaHref });
  const mail = {
    from: `${config.fromName} <${config.username}>`,
    to: payload.to,
    subject: payload.subject,
    html,
    text: `${payload.title}\n\n${payload.body.replace(/<[^>]+>/g, "")}\n\nPortal: ${ctaHref}`,
  };

  let lastError: unknown;
  for (const options of transports) {
    const mailer = nodemailer.createTransport(options);
    try {
      await mailer.sendMail(mail);
      mailer.close();
      return { sent: true as const };
    } catch (error) {
      lastError = error;
      mailer.close();
      console.error("[email:failed]", options.port, error);
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Send failed";
  const authFailed = /invalid login|username and password not accepted|535|eauth/i.test(message);
  const timedOut = /greeting never received|etimedout|timeout/i.test(message);
  return {
    sent: false as const,
    reason: authFailed
      ? "Gmail rejected this mailbox. The sending address must match the Google account, 2-Step Verification must be on, and the field must be a new 16-character App Password (spaces are OK). Open myaccount.google.com/apppasswords, generate Mail, paste it, Save, then send the test."
      : timedOut
        ? "Gmail SMTP timed out from this network. The application was still saved. Try the test email again, or request a portal password from /portal/login."
        : message,
  };
}

export async function sendApplicationReceivedEmail(input: {
  to: string;
  name: string;
  jobTitle: string;
  password: string;
}) {
  const portal = await portalLoginUrl();
  return sendMail({
    to: input.to,
    subject: `${statusEmails.new.subject} — ${input.jobTitle}`,
    title: "Application received",
    body: `Dear ${input.name}, ${statusEmails.new.intro} Role: <strong>${input.jobTitle}</strong>. Sign in to the applicant portal with this email, the password below, and the link in this message.`,
    extra: `<strong>Portal link:</strong> <a href="${portal}">${portal}</a><br/><strong>Portal email:</strong> ${input.to}<br/><strong>Portal password:</strong> ${input.password}<br/><span style="color:#64748b">Keep this password. You can also request a new one from the portal login page.</span>`,
    ctaLabel: "Open applicant portal",
    ctaHref: portal,
  });
}

export async function sendPortalPasswordEmail(input: {
  to: string;
  name: string;
  password: string;
}) {
  const portal = await portalLoginUrl();
  return sendMail({
    to: input.to,
    subject: `Your ${companyName} applicant portal password`,
    title: "Portal access",
    body: `Dear ${input.name}, a new password was generated for your applicant portal. Sign in with this email, the password below, and the portal link.`,
    extra: `<strong>Portal link:</strong> <a href="${portal}">${portal}</a><br/><strong>Portal email:</strong> ${input.to}<br/><strong>Portal password:</strong> ${input.password}`,
    ctaLabel: "Open applicant portal",
    ctaHref: portal,
  });
}

export async function sendStatusEmail(input: {
  to: string;
  name: string;
  jobTitle: string;
  status: string;
  nextStep?: string;
  examScore?: number | null;
  examMax?: number | null;
  examDate?: Date | null;
  examVenue?: string | null;
  interviewDate?: Date | null;
  interviewVenue?: string | null;
}) {
  const copy = statusEmails[input.status] ?? {
    subject: "Update on your application",
    intro: `Your application is now at: ${statusLabel(input.status)}.`,
  };
  const bits: string[] = [];
  if (input.nextStep) bits.push(`<strong>What is next:</strong> ${input.nextStep}`);
  if (input.examDate) bits.push(`<strong>Exam date:</strong> ${input.examDate.toLocaleString()}`);
  if (input.examVenue) bits.push(`<strong>Exam venue:</strong> ${input.examVenue}`);
  if (input.examScore != null) {
    bits.push(
      `<strong>Written exam mark:</strong> ${input.examScore}${input.examMax ? ` / ${input.examMax}` : ""}`,
    );
  }
  if (input.interviewDate) bits.push(`<strong>Interview date:</strong> ${input.interviewDate.toLocaleString()}`);
  if (input.interviewVenue) bits.push(`<strong>Interview venue:</strong> ${input.interviewVenue}`);

  return sendMail({
    to: input.to,
    subject: `${copy.subject} — ${input.jobTitle}`,
    title: copy.subject,
    body: `Dear ${input.name}, ${copy.intro} Role: <strong>${input.jobTitle}</strong>.`,
    extra: bits.join("<br/>"),
    ctaLabel: "Open applicant portal",
    ctaHref: await portalLoginUrl(),
  });
}
