import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { companyName, companyShort } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function SettingsHomePage() {
  const [applicants, applications, liveJobs, mail] = await Promise.all([
    prisma.applicant.count(),
    prisma.application.count(),
    prisma.job.count({ where: { status: "PUBLISHED", isOpen: true } }),
    prisma.mailSetting.findUnique({ where: { id: "default" } }),
  ]);
  const mailReady = Boolean(mail?.username && mail?.password && mail?.host);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card
        href="/hr/settings/email"
        title="Email / SMTP"
        body={
          mailReady
            ? `Sending from ${mail?.username} via ${mail?.host}.`
            : "No mail server saved yet. Applicants cannot receive portal passwords until this is set."
        }
        action="Open email"
      />
      <Card
        href="/hr/settings/applicants"
        title="Applicants"
        body={`${applicants} portal accounts · ${applications} applications. Remove records or email a new portal password.`}
        action="Manage applicants"
      />
      <Card
        href="/hr/settings/jobs"
        title="Live roles"
        body={`${liveJobs} roles are currently published on the careers site. You can close all of them at once.`}
        action="Manage roles"
      />
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
        <h2 className="font-semibold text-white">Company</h2>
        <p className="mt-2 text-sm text-slate-400">
          Public name is <span className="text-white">{companyName}</span> ({companyShort}). Change{" "}
          <code className="text-teal-300">COMPANY_NAME</code> and <code className="text-teal-300">APP_URL</code>{" "}
          in the server <code className="text-teal-300">.env</code> for go-live.
        </p>
      </div>
    </div>
  );
}

function Card({
  href,
  title,
  body,
  action,
}: {
  href: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border border-slate-700 bg-slate-800/50 p-5 hover:border-slate-500">
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
      <p className="mt-4 text-sm font-medium text-teal-300">{action} →</p>
    </Link>
  );
}
