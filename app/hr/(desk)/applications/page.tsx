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
          <h1 className="text-2xl font-semibold text-[#0a4a7c]">Applications</h1>
          <p className="mt-1 text-sm text-[#5a7384]">
            {fresh} new · {total} total from website, LinkedIn, and QR codes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportMenu csvHref={csvHref} />
          <Link
            href="/hr/reports/exams"
            className="no-print rounded-full border border-[#0a4a7c]/25 px-4 py-2 text-sm font-medium text-[#0a4a7c]"
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

      <form className="no-print mt-6 grid gap-3 rounded-2xl border border-[#0a4a7c]/15 bg-[#eef4f8]/60 p-4 sm:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2 text-sm"
        />
        <select name="job" defaultValue={job ?? ""} className="rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2 text-sm">
          <option value="">All roles</option>
          {jobs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2 text-sm">
          <option value="">All stages</option>
          {statuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select name="match" defaultValue={match ?? ""} className="rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2 text-sm">
          <option value="">All match levels</option>
          {matchBands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-900">Filter</button>
      </form>

      <div className="print-sheet mt-6 overflow-hidden rounded-2xl border border-[#0a4a7c]/15 print:mt-0 print:rounded-none print:border-0">
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
                <td colSpan={7} className="px-4 py-10 text-center text-[#5a7384]">
                  No applications match these filters.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-t border-[#0a4a7c]/10 bg-white hover:bg-[#eef4f8]">
                  <td className="px-4 py-3">
                    <Link href={`/hr/applications/${app.id}`} className="font-medium text-[#0a4a7c] hover:underline">
                      {app.fullName}
                    </Link>
                    <p className="text-xs text-[#5a7384]">{app.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${matchBadgeClass(app.matchPercent)}`}>
                      {matchLabel(app.matchPercent)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#3d5a6e]">{app.job.title}</td>
                  <td className="px-4 py-3 text-[#3d5a6e]">{sourceLabel(app.source)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#eef4f8] px-2 py-1 text-xs">{statusLabel(app.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-[#3d5a6e]">
                    {app.examScore == null ? "—" : `${app.examScore}${app.examMax ? ` / ${app.examMax}` : ""}`}
                  </td>
                  <td className="px-4 py-3 text-[#5a7384]">{app.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
