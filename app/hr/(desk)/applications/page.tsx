import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { companyName, sourceLabel, statusLabel, statuses } from "@/lib/company";
import { matchBadgeClass, matchLabel, matchBands, matchWhere } from "@/lib/match";
import { canAccessMenu, requireMenu } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; status?: string; q?: string; match?: string }>;
}) {
  const user = await requireMenu("applications");
  const { job, status, q, match } = await searchParams;

  const applications = await prisma.application.findMany({
    where: {
      ...(job ? { jobId: job } : {}),
      ...(status ? { status } : {}),
      ...(match ? matchWhere(match) : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { job: true },
    orderBy: [{ matchPercent: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  const jobs = await prisma.job.findMany({ orderBy: { title: "asc" } });
  const total = await prisma.application.count();
  const fresh = await prisma.application.count({ where: { status: "new" } });
  const exportQuery = new URLSearchParams(
    Object.entries({ job, status, q, match }).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();
  const csvHref = `/hr/applications/export${exportQuery ? `?${exportQuery}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Applications</h1>
          <p className="mt-1 text-sm text-slate-400">
            {fresh} new · {total} total from website, LinkedIn, and QR codes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportMenu csvHref={csvHref} />
          <Link
            href="/hr/reports/exams"
            className="no-print rounded-full border border-slate-500 px-4 py-2 text-sm font-medium text-white"
          >
            Exam report
          </Link>
          {canAccessMenu(user, "jobs.create") ? (
            <Link
              href="/hr/jobs/new"
              className="no-print rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white"
            >
              Post a role
            </Link>
          ) : null}
        </div>
      </div>

      <form className="no-print mt-6 grid gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        />
        <select name="job" defaultValue={job ?? ""} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm">
          <option value="">All roles</option>
          {jobs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm">
          <option value="">All stages</option>
          {statuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select name="match" defaultValue={match ?? ""} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm">
          <option value="">All match levels</option>
          {matchBands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-900">Filter</button>
      </form>

      <div className="print-sheet mt-6 overflow-hidden rounded-2xl border border-slate-700 print:mt-0 print:rounded-none print:border-0">
        <header className="hidden border-b border-slate-300 pb-3 print:block">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#0a4a6e]">{companyName}</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Applications list</h1>
        </header>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a4a6e] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Match</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Exam mark</th>
              <th className="px-4 py-3 font-medium">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No applications match these filters.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-t border-slate-800 hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <Link href={`/hr/applications/${app.id}`} className="font-medium text-white hover:underline">
                      {app.fullName}
                    </Link>
                    <p className="text-xs text-slate-400">{app.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${matchBadgeClass(app.matchPercent)}`}>
                      {matchLabel(app.matchPercent)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{app.job.title}</td>
                  <td className="px-4 py-3 text-slate-300">{sourceLabel(app.source)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs">{statusLabel(app.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {app.examScore == null ? "—" : `${app.examScore}${app.examMax ? ` / ${app.examMax}` : ""}`}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{app.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
