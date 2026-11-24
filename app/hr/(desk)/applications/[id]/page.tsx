import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sourceLabel, statusLabel } from "@/lib/company";
import { matchBadgeClass, matchLabel } from "@/lib/match";
import { saveApplicationNotes } from "@/app/actions/applications";
import { deleteApplicationAction } from "@/app/actions/settings";
import { requireMenu } from "@/lib/auth";
import { ProgressForm } from "@/components/ProgressForm";
import { ExamInviteForm } from "@/components/ExamInviteForm";
import { ExamScoreForm } from "@/components/ExamScoreForm";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireMenu("applications");
  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
      events: { orderBy: { createdAt: "desc" }, take: 12 },
      criteria: { include: { criterion: true }, orderBy: { criterion: { sortOrder: "asc" } } },
    },
  });
  if (!app) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/hr/applications" className="text-[#00a651] hover:underline">
          ← All applications
        </Link>
        <Link
          href={`/hr/reports/exams?job=${app.jobId}`}
          className="text-[#5a7384] hover:text-[#0a4a7c] hover:underline"
        >
          Exam report for this role
        </Link>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-[#00a651]">{statusLabel(app.status)}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${matchBadgeClass(app.matchPercent)}`}>
            {matchLabel(app.matchPercent)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-[#0a4a7c]">{app.fullName}</h1>
        <p className="mt-1 text-[#5a7384]">
          {app.job.title} · {sourceLabel(app.source)} · {app.createdAt.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5 text-sm">
        <Info label="Email" value={app.email} />
        <Info label="Phone" value={app.phone} />
        <Info label="Location" value={app.city} />
        <Info label="Current title" value={app.currentTitle ?? "—"} />
        <Info label="Experience" value={app.yearsExperience ?? "—"} />
        <Info
          label="LinkedIn"
          value={app.linkedinUrl ?? "—"}
          href={app.linkedinUrl ?? undefined}
        />
      </div>

      {app.criteria.length > 0 ? (
        <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="font-medium">Criteria the applicant ticked</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {app.criteria.map((item) => (
              <li key={item.criterionId} className="flex gap-2">
                <span className={item.met ? "text-[#00a651]" : "text-slate-500"}>{item.met ? "Yes" : "No"}</span>
                <span className="text-[#0a2f4a]">{item.criterion.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
        <h2 className="font-medium">Cover note</h2>
        <p className="mt-2 whitespace-pre-wrap text-[#3d5a6e]">{app.coverLetter}</p>
      </section>

      {app.resumePath ? (
        <a
          href={`/api/resumes/${app.id}`}
          className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900"
        >
          Download resume{app.resumeName ? ` (${app.resumeName})` : ""}
        </a>
      ) : (
        <p className="text-sm text-[#5a7384]">No resume attached.</p>
      )}

      <ExamInviteForm id={app.id} examDate={app.examDate} examVenue={app.examVenue} />
      <ExamScoreForm id={app.id} examScore={app.examScore} examMax={app.examMax} />
      <ProgressForm
        key={`${app.id}-${app.status}-${app.nextStep}`}
        id={app.id}
        status={app.status}
        nextStep={app.nextStep}
        interviewDate={app.interviewDate}
        interviewVenue={app.interviewVenue}
      />

      <form action={saveApplicationNotes.bind(null, app.id)} className="space-y-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#3d5a6e]">Internal HR notes (not shown to the applicant)</span>
          <textarea
            name="notes"
            defaultValue={app.notes}
            rows={4}
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2"
          />
        </label>
        <button className="rounded-full bg-[#0a4a7c] px-4 py-2 text-sm font-medium text-white">Save notes</button>
      </form>

      {user.role === "ADMIN" ? (
        <form
          action={deleteApplicationAction.bind(null, app.id)}
          className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5"
        >
          <h2 className="font-medium text-rose-100">Remove this application</h2>
          <p className="mt-1 mb-3 text-sm text-rose-800/80">
            Deletes this file, its CV, and exam/interview notes. The applicant portal account is removed if they
            have no other applications.
          </p>
          <ConfirmSubmit
            label="Delete application"
            message={`Permanently delete the application from ${app.fullName}?`}
            className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white"
          />
        </form>
      ) : null}

      {app.events.length > 0 ? (
        <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="mb-3 font-medium">Activity</h2>
          <ul className="space-y-3 text-sm">
            {app.events.map((event) => (
              <li key={event.id} className="border-l border-[#0a4a7c]/20 pl-3">
                <p className="text-[#0a4a7c]">{event.title}</p>
                <p className="text-[#5a7384]">{event.detail}</p>
                <p className="text-xs text-slate-500">{event.createdAt.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#5a7384]">{label}</p>
      {href ? (
        <a href={href} className="mt-1 block break-all text-[#00a651] hover:underline" target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-[#0a2f4a]">{value}</p>
      )}
    </div>
  );
}
