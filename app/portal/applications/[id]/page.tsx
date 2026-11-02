import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApplicant } from "@/lib/applicant-auth";
import { prisma } from "@/lib/prisma";
import { publicStatusBadgeClass, statusLabel, statuses } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function ApplicantApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const applicant = await requireApplicant();
  const { id } = await params;
  const app = await prisma.application.findFirst({
    where: { id, applicantId: applicant.id },
    include: { job: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!app) notFound();

  const currentIndex = Math.max(
    0,
    statuses.findIndex((item) => item.id === app.status),
  );

  return (
    <div className="space-y-6">
      <Link href="/portal" className="text-sm text-teal-800 hover:underline">
        ← All applications
      </Link>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${publicStatusBadgeClass(app.status)}`}>
          {statusLabel(app.status)}
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">{app.job.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {app.job.department} · {app.job.location}
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Pipeline</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-4">
          {statuses
            .filter((item) => item.id !== "rejected")
            .map((item) => {
              const idx = statuses.findIndex((s) => s.id === item.id);
              const reached = currentIndex >= idx && app.status !== "rejected";
              return (
                <li
                  key={item.id}
                  className={`rounded-xl px-3 py-2 text-sm ${reached ? "bg-[#0a4a6e] text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {item.label}
                </li>
              );
            })}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">What is next</h2>
        <p className="mt-2 text-slate-600">
          {app.nextStep || "No further instruction has been published yet. Check back after HR reviews your file."}
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Written exam</h2>
          {app.examScore != null ? (
            <p className="mt-3 text-3xl font-semibold text-[#0a4a6e]">
              {app.examScore}
              {app.examMax ? <span className="text-lg text-slate-400"> / {app.examMax}</span> : null}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No mark published yet.</p>
          )}
          {app.examDate ? <p className="mt-2 text-sm text-slate-600">Date: {app.examDate.toLocaleString()}</p> : null}
          {app.examVenue ? <p className="text-sm text-slate-600">Venue: {app.examVenue}</p> : null}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Interview</h2>
          {app.interviewDate ? (
            <p className="mt-2 text-sm text-slate-600">Date: {app.interviewDate.toLocaleString()}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No interview scheduled yet.</p>
          )}
          {app.interviewVenue ? <p className="text-sm text-slate-600">Venue: {app.interviewVenue}</p> : null}
        </section>
      </div>

      {app.events.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Updates</h2>
          <ul className="space-y-4">
            {app.events.map((event) => (
              <li key={event.id} className="border-l-2 border-teal-700 pl-4">
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-600">{event.detail}</p>
                <p className="mt-1 text-xs text-slate-400">{event.createdAt.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
