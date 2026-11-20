import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMenu } from "@/lib/auth";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";
import { requisitionStatusClass, requisitionStatusLabel } from "@/lib/requisitions";

export const dynamic = "force-dynamic";

export default async function HiringRequestsInboxPage() {
  await requireMenu("staff-requests.review");
  await ensureRequisitionTables();

  const rows = await prisma.staffRequisition.findMany({
    include: { requestedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const pending = rows.filter((row) => row.status === "SUBMITTED" || row.status === "UNDER_REVIEW").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-teal-400">Human resources</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Hiring requests</h1>
        <p className="mt-1 text-sm text-slate-400">
          Requests submitted by heads of department. {pending} {pending === 1 ? "item" : "items"} need
          attention.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Requested by</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No staff requests have been submitted yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <Link href={`/hr/staff-requests/${row.id}`} className="font-medium text-white hover:underline">
                      {row.positionTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.department}</td>
                  <td className="px-4 py-3 text-slate-300">{row.requestedBy.name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.headcount}</td>
                  <td className="px-4 py-3 text-slate-400">{row.createdAt.toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${requisitionStatusClass(row.status)}`}>
                      {requisitionStatusLabel(row.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
