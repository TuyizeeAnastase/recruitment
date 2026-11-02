import { prisma } from "@/lib/prisma";
import { requireMenu } from "@/lib/auth";
import { companyName, statusLabel } from "@/lib/company";
import { examPercent, rankByScore } from "@/lib/exam-report";
import { ExportMenu } from "@/components/ExportMenu";

export const dynamic = "force-dynamic";

export default async function ExamReportPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  await requireMenu("reports");
  const { job } = await searchParams;
  const jobs = await prisma.job.findMany({ orderBy: { title: "asc" } });
  const applications = await prisma.application.findMany({
    where: job ? { jobId: job } : {},
    include: { job: true },
    orderBy: { fullName: "asc" },
  });
  const ranked = rankByScore(applications);
  const scored = ranked.filter((row) => row.examScore != null);
  const invited = ranked.filter((row) => row.examDate || row.status === "written_exam");
  const average =
    scored.length > 0
      ? Math.round((scored.reduce((sum, row) => sum + (row.examScore ?? 0), 0) / scored.length) * 10) / 10
      : null;
  const selectedJob = jobs.find((item) => item.id === job);
  const printed = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-400">Recruitment</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Written exam report</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ranked marks{selectedJob ? ` for ${selectedJob.title}` : " across all roles"}.
          </p>
        </div>
        <ExportMenu csvHref={`/hr/reports/exams/export${job ? `?job=${job}` : ""}`} />
      </div>

      <form className="no-print flex flex-wrap gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
        <select
          name="job"
          defaultValue={job ?? ""}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {jobs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900">Filter</button>
      </form>

      <div className="print-sheet space-y-5">
        <header className="hidden border-b border-slate-300 pb-3 print:block">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#0a4a6e]">{companyName}</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Written examination report</h1>
          <p className="mt-1 text-xs text-slate-600">
            {selectedJob ? selectedJob.title : "All open and closed roles"} · Printed {printed}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <Summary label="Invited / scheduled" value={String(invited.length)} />
          <Summary label="Marks recorded" value={String(scored.length)} />
          <Summary label="Average mark" value={average == null ? "—" : String(average)} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700 print:rounded-none print:border-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a4a6e] text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Exam date</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">%</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/70 print:bg-white">
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                ranked.map((row, index) => {
                  const percent = examPercent(row.examScore, row.examMax);
                  return (
                    <tr
                      key={row.id}
                      className={`border-t border-slate-800 text-slate-100 print:border-slate-200 print:text-slate-900 ${
                        index % 2 === 1 ? "bg-slate-800/50 print:bg-slate-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-teal-300 print:text-slate-900">
                        {row.rank ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/hr/applications/${row.id}`} className="font-medium text-white print:text-slate-900">
                          {row.fullName}
                        </a>
                        <p className="text-xs text-slate-400 print:text-slate-600">{row.email}</p>
                      </td>
                      <td className="px-4 py-3">{row.job.title}</td>
                      <td className="px-4 py-3">{statusLabel(row.status)}</td>
                      <td className="px-4 py-3">{row.examDate ? row.examDate.toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">{row.examVenue ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">
                        {row.examScore == null ? "—" : `${row.examScore}${row.examMax ? ` / ${row.examMax}` : ""}`}
                      </td>
                      <td className="px-4 py-3">{percent == null ? "—" : `${percent}%`}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4 print:rounded-md print:border-slate-300 print:bg-slate-50">
      <p className="text-sm text-slate-400 print:text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white print:text-slate-900">{value}</p>
    </div>
  );
}
