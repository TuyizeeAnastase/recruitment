import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sourceLabel, statusBadgeClass, statusLabel, statuses, companyName } from "@/lib/company";
import { matchBands, matchBadgeClass } from "@/lib/match";
import { canAccessMenu, requireMenu } from "@/lib/auth";
import { jobStatusLabel } from "@/lib/jobs";
import { CompanyLogo } from "@/components/CompanyLogo";

export const dynamic = "force-dynamic";

export default async function HrHome() {
  const user = await requireMenu("dashboard");
  const [jobs, applications, total, fresh, interviews, liveRoles, drafts, offers, hired, byStatus, scored] =
    await Promise.all([
      prisma.job.findMany({
        include: { _count: { select: { applications: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.application.findMany({
        include: { job: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "new" } }),
      prisma.application.count({ where: { status: "interview" } }),
      prisma.job.count({ where: { status: "PUBLISHED", isOpen: true } }),
      prisma.job.count({ where: { status: "DRAFT" } }),
      prisma.application.count({ where: { status: "offer" } }),
      prisma.application.count({ where: { status: "hired" } }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.findMany({
        where: { matchPercent: { not: null } },
        select: { matchPercent: true },
      }),
    ]);

  const matchCounts = Object.fromEntries(
    matchBands.map((band) => [
      band.id,
      scored.filter((row) => {
        const percent = row.matchPercent ?? -1;
        return percent >= band.min && percent <= band.max;
      }).length,
    ]),
  );

  const statusCount = Object.fromEntries(byStatus.map((row) => [row.status, row._count._all]));
  const pipelineMax = Math.max(1, ...statuses.map((item) => statusCount[item.id] ?? 0));
  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#041e33] via-[#0a4a6e] to-[#0f766e] p-7 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-teal-300/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-200/90">{today}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-sky-100/80">
              Recruitment overview for {companyName}. Track openings, move candidates, and keep the
              pipeline current.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {canAccessMenu(user, "jobs.create") ? (
                <Link
                  href="/hr/jobs/new"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a4a6e] hover:bg-sky-50"
                >
                  Post a role
                </Link>
              ) : null}
              {canAccessMenu(user, "applications") ? (
                <Link
                  href="/hr/applications"
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                >
                  Review applications
                </Link>
              ) : null}
              {canAccessMenu(user, "reports") ? (
                <Link
                  href="/hr/reports/exams"
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                >
                  Exam report
                </Link>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <CompanyLogo variant="light" height={36} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canAccessMenu(user, "jobs") ? (
          <Stat
            label="Live roles"
            value={liveRoles}
            hint={drafts ? `${drafts} still in draft` : "Published on careers"}
            href="/hr/jobs"
            accent="teal"
          />
        ) : null}
        {canAccessMenu(user, "applications") ? (
          <Stat
            label="New applications"
            value={fresh}
            hint="Waiting for first review"
            href="/hr/applications?status=new"
            accent="sky"
          />
        ) : null}
        {canAccessMenu(user, "applications") ? (
          <Stat
            label="In interview"
            value={interviews}
            hint={`${offers} at offer stage`}
            href="/hr/applications?status=interview"
            accent="violet"
          />
        ) : null}
        {canAccessMenu(user, "applications") ? (
          <Stat
            label="Hired"
            value={hired}
            hint={`${total} applicants in total`}
            href="/hr/applications?status=hired"
            accent="emerald"
          />
        ) : null}
      </div>

      {canAccessMenu(user, "applications") ? (
        <section className="rounded-3xl border border-slate-700/70 bg-slate-800/40 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Criteria match</h2>
              <p className="mt-1 text-sm text-slate-400">
                Applicants grouped by how many screening boxes they ticked for the role they applied to.
              </p>
            </div>
            <Link href="/hr/applications" className="text-sm text-teal-300 hover:underline">
              All applications
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {matchBands.map((band) => (
              <Link
                key={band.id}
                href={`/hr/applications?match=${band.id}`}
                className="rounded-2xl border border-slate-700/80 bg-slate-950/40 p-4 hover:border-slate-500"
              >
                <p className={`text-sm font-medium ${matchBadgeClass(band.min)} inline-flex rounded-full px-2 py-0.5`}>
                  {band.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{matchCounts[band.id] ?? 0}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {canAccessMenu(user, "applications") ? (
        <section className="rounded-3xl border border-slate-700/70 bg-slate-800/40 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Hiring pipeline</h2>
            <Link href="/hr/applications" className="text-sm text-teal-300 hover:underline">
              Open inbox
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {statuses.map((item) => {
              const count = statusCount[item.id] ?? 0;
              const width = Math.round((count / pipelineMax) * 100);
              return (
                <Link
                  key={item.id}
                  href={`/hr/applications?status=${item.id}`}
                  className="rounded-2xl border border-slate-700/80 bg-slate-950/40 p-4 hover:border-slate-500"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {canAccessMenu(user, "applications") ? (
          <section className="rounded-3xl border border-slate-700/70 bg-slate-800/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Latest candidates</h2>
              <Link href="/hr/applications" className="text-sm text-teal-300 hover:underline">
                View all
              </Link>
            </div>
            {applications.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-600 px-4 py-10 text-center text-sm text-slate-400">
                No applications yet. Publish a role and share the apply link or QR code.
              </p>
            ) : (
              <ul className="divide-y divide-slate-700/80">
                {applications.map((app) => (
                  <li key={app.id}>
                    <Link
                      href={`/hr/applications/${app.id}`}
                      className="flex items-center justify-between gap-4 py-3.5 hover:opacity-90"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{app.fullName}</p>
                        <p className="truncate text-sm text-slate-400">
                          {app.job.title} · {sourceLabel(app.source)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(app.status)}`}
                      >
                        {statusLabel(app.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {canAccessMenu(user, "jobs") ? (
          <section className="rounded-3xl border border-slate-700/70 bg-slate-800/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Open roles</h2>
              <Link href="/hr/jobs" className="text-sm text-teal-300 hover:underline">
                Manage
              </Link>
            </div>
            {jobs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-600 px-4 py-10 text-center text-sm text-slate-400">
                No roles yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/hr/jobs/${job.id}`}
                      className="block rounded-2xl border border-slate-700/80 bg-slate-950/40 px-4 py-3 hover:border-slate-500"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-white">{job.title}</p>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                          {jobStatusLabel(job.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {job.department} · {job._count.applications} applications
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  accent: "teal" | "sky" | "violet" | "emerald";
}) {
  const accents = {
    teal: "from-teal-500/20 to-transparent text-teal-300",
    sky: "from-sky-500/20 to-transparent text-sky-300",
    violet: "from-violet-500/20 to-transparent text-violet-300",
    emerald: "from-emerald-500/20 to-transparent text-emerald-300",
  };

  return (
    <Link
      href={href}
      className={`relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-800/50 p-5 hover:border-slate-500`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accents[accent]}`} />
      <div className="relative">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      </div>
    </Link>
  );
}
