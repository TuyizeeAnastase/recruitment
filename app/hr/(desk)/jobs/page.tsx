import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleJobAction } from "@/app/actions/jobs";
import { jobStatusLabel } from "@/lib/jobs";
import { canAccessMenu, requireMenu } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function JobsAdminPage() {
  const user = await requireMenu("jobs");
  const jobs = await prisma.job.findMany({
    include: {
      _count: { select: { applications: true } },
      postedBy: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#0a4a7c]">Roles</h1>
          <p className="mt-1 text-sm text-[#5a7384]">
            Draft, publish, and close openings. Published roles appear on the careers site.
          </p>
        </div>
        {canAccessMenu(user, "jobs.create") ? (
          <Link href="/hr/jobs/new" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">
            Create a role
          </Link>
        ) : null}
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#0a4a7c]/20 bg-white shadow-sm p-10 text-center">
          <p className="text-lg font-medium text-[#0a4a7c]">No roles yet</p>
          <p className="mt-2 text-sm text-[#5a7384]">Create a job post, then publish it when the brief is ready.</p>
          <Link
            href="/hr/jobs/new"
            className="mt-6 inline-flex rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          >
            Post the first role
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/hr/jobs/${job.id}`} className="text-lg font-medium text-[#0a4a7c] hover:underline">
                    {job.title}
                  </Link>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#3d5a6e]">
                    {jobStatusLabel(job.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#5a7384]">
                  {job.department} · {job.location} · {job.employment} · {job._count.applications} applications
                  {job.postedBy ? ` · Posted by ${job.postedBy.name}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/hr/jobs/${job.id}/edit`}
                  className="rounded-full border border-[#0a4a7c]/25 px-3 py-1.5 text-sm"
                >
                  Edit
                </Link>
                <Link href={`/hr/jobs/${job.id}`} className="rounded-full border border-[#0a4a7c]/25 px-3 py-1.5 text-sm">
                  Share & QR
                </Link>
                <form action={toggleJobAction.bind(null, job.id)}>
                  <button className="rounded-full bg-[#0a4a7c] px-3 py-1.5 text-sm text-white">
                    {job.isOpen ? "Close" : "Publish"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
