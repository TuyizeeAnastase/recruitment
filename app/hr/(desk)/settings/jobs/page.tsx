import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { jobStatusLabel } from "@/lib/jobs";
import { closeAllLiveJobsAction } from "@/app/actions/settings";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function JobsSettingsPage() {
  const jobs = await prisma.job.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const live = jobs.filter((job) => job.status === "PUBLISHED" && job.isOpen).length;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Roles</h2>
      <p className="mt-2 mb-6 max-w-2xl text-sm text-slate-400">
        {live} role{live === 1 ? "" : "s"} currently accept applications on the public careers site.
      </p>

      {live > 0 ? (
        <form action={closeAllLiveJobsAction} className="mb-6">
          <ConfirmSubmit
            label="Close all live roles"
            message="Close every published role so nobody can apply until you publish again?"
            className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white"
          />
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Applications</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <Link href={`/hr/jobs/${job.id}`} className="font-medium text-white hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-400">{job.department}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{jobStatusLabel(job.status)}</td>
                <td className="px-4 py-3 text-slate-300">{job._count.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
