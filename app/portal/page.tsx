import Link from "next/link";
import { requireApplicant } from "@/lib/applicant-auth";
import { prisma } from "@/lib/prisma";
import { publicStatusBadgeClass, statusLabel } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function ApplicantPortalHome() {
  const applicant = await requireApplicant();
  const applications = await prisma.application.findMany({
    where: { applicantId: applicant.id },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Your applications</h1>
      <p className="mt-2 text-sm text-slate-500">
        Follow each role’s stage, written exam marks, and the next step from HR.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          No applications are linked to this account yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/portal/applications/${app.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{app.job.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {app.job.department} · Applied {app.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${publicStatusBadgeClass(app.status)}`}>
                  {statusLabel(app.status)}
                </span>
              </div>
              {app.nextStep ? <p className="mt-4 text-sm text-slate-600">{app.nextStep}</p> : null}
              {app.examScore != null ? (
                <p className="mt-2 text-sm font-medium text-slate-800">
                  Written exam: {app.examScore}
                  {app.examMax ? ` / ${app.examMax}` : ""}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
