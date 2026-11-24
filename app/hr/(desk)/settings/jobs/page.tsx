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
      <h2 className="text-lg font-semibold text-[#0a4a7c]">Roles</h2>
      <p className="mt-2 mb-6 max-w-2xl text-sm text-[#5a7384]">
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

      <div className="overflow-hidden rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a4a7c] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Applications</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-[#0a4a7c]/10">
                <td className="px-4 py-3">
                  <Link href={`/hr/jobs/${job.id}`} className="font-medium text-[#0a4a7c] hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-xs text-[#5a7384]">{job.department}</p>
                </td>
                <td className="px-4 py-3 text-[#3d5a6e]">{jobStatusLabel(job.status)}</td>
                <td className="px-4 py-3 text-[#3d5a6e]">{job._count.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
