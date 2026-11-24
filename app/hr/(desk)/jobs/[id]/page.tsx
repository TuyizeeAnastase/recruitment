import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { applyUrl } from "@/lib/slug";
import { qrDataUrl } from "@/lib/qr";
import { appUrl, sourceLabel, statusLabel } from "@/lib/company";
import { jobStatusLabel } from "@/lib/jobs";
import { matchBadgeClass, matchLabel } from "@/lib/match";
import { setJobStatusAction } from "@/app/actions/jobs";
import { CopyButton } from "@/components/CopyButton";
import { headers } from "next/headers";
import { requireMenu } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function JobSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMenu("jobs");
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: { orderBy: [{ matchPercent: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }] },
      criteria: { orderBy: { sortOrder: "asc" } },
      postedBy: { select: { name: true } },
    },
  });
  if (!job) notFound();

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : appUrl;

  const publicPage = `${origin}/jobs/${job.slug}`;
  const website = applyUrl(job.slug, "website", origin);
  const linkedin = applyUrl(job.slug, "linkedin", origin);
  const qrLink = applyUrl(job.slug, "qr", origin);
  const qr = await qrDataUrl(qrLink);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#5a7384]">{job.department}</p>
          <h1 className="text-2xl font-semibold text-[#0a4a7c]">{job.title}</h1>
          <p className="mt-1 text-sm text-[#5a7384]">
            {job.location} · {job.employment}
            {job.salaryRange ? ` · ${job.salaryRange}` : ""}
            {job.postedBy ? ` · Posted by ${job.postedBy.name}` : ""}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-[#00a651]">{jobStatusLabel(job.status)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/hr/jobs/${job.id}/edit`}
            className="rounded-full border border-[#0a4a7c]/25 px-4 py-2 text-sm"
          >
            Edit
          </Link>
          {job.status !== "PUBLISHED" ? (
            <form action={setJobStatusAction.bind(null, job.id, "publish")}>
              <button className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">
                Publish
              </button>
            </form>
          ) : (
            <form action={setJobStatusAction.bind(null, job.id, "close")}>
              <button className="rounded-full bg-[#0a4a7c] px-4 py-2 text-sm text-white">Close role</button>
            </form>
          )}
        </div>
      </div>

      {job.status !== "PUBLISHED" ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This role is not live. Publish it to list it on the careers site and accept applications.
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white p-5 text-center text-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Application QR code" className="mx-auto h-52 w-52" />
          <p className="mt-3 text-sm font-medium">Scan to apply</p>
          <p className="text-xs text-slate-500">{job.title}</p>
        </div>
        <div className="space-y-4 rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="font-semibold">Share outside the HR system</h2>
          <ShareRow label="Public job page" value={publicPage} />
          <ShareRow label="Website apply link" value={website} />
          <ShareRow label="LinkedIn post / message" value={linkedin} />
          <ShareRow label="QR / print / events" value={qrLink} />
          <p className="text-sm text-[#5a7384]">
            Each apply link tags the source so you can see whether the candidate came from LinkedIn, the
            website, or a QR scan.
          </p>
        </div>
      </section>

      {job.criteria.length > 0 ? (
        <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="font-semibold">Screening criteria</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[#3d5a6e]">
            {job.criteria.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This role has no screening criteria yet.{" "}
          <Link href={`/hr/jobs/${job.id}/edit`} className="underline">
            Add them
          </Link>{" "}
          so applicants can tick what they meet.
        </p>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Applications for this role</h2>
        <div className="overflow-hidden rounded-2xl border border-[#0a4a7c]/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#eef4f8] text-[#5a7384]">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {job.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#5a7384]">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                job.applications.map((app) => (
                  <tr key={app.id} className="border-t border-[#0a4a7c]/10">
                    <td className="px-4 py-3">
                      <Link href={`/hr/applications/${app.id}`} className="text-[#0a4a7c] hover:underline">
                        {app.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${matchBadgeClass(app.matchPercent)}`}>
                        {matchLabel(app.matchPercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sourceLabel(app.source)}</td>
                    <td className="px-4 py-3">{statusLabel(app.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ShareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-[#5a7384]">{label}</p>
        <CopyButton value={value} />
      </div>
      <p className="mt-1 break-all rounded-lg bg-[#eef4f8] px-3 py-2 font-mono text-xs text-[#00a651]">{value}</p>
    </div>
  );
}
