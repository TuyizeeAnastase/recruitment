import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMenu } from "@/lib/auth";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";
import { requisitionStatusClass, requisitionStatusLabel } from "@/lib/requisitions";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const user = await requireMenu("staff-requests");
  await ensureRequisitionTables();

  const rows = await prisma.staffRequisition.findMany({
    where: { requestedById: user.id },
    orderBy: { createdAt: "desc" },
  });

  const open = rows.filter((row) => row.status === "SUBMITTED" || row.status === "UNDER_REVIEW").length;
  const approved = rows.filter((row) => row.status === "APPROVED").length;
  const filled = rows.filter((row) => row.status === "FULFILLED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-teal-400">Department hiring</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Staff requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Request a new post for your department. Human Resources is notified immediately and will
            update the status of each request.
          </p>
        </div>
        <Link
          href="/hr/staff-requests/new"
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Request staff
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="With HR" value={open} />
        <SummaryCard label="Approved to recruit" value={approved} />
        <SummaryCard label="Positions filled" value={filled} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  You have not submitted a staff request yet.
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
                  <td className="px-4 py-3 text-slate-300">{row.headcount}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {row.createdAt.toLocaleDateString("en-GB")}
                  </td>
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
