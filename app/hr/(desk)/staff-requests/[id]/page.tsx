import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessMenu, requireHr } from "@/lib/auth";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";
import { RequisitionReviewForm } from "@/components/RequisitionReviewForm";
import { requisitionStatusClass, requisitionStatusLabel } from "@/lib/requisitions";

export const dynamic = "force-dynamic";

export default async function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireHr();
  await ensureRequisitionTables();
  const { id } = await params;
  const canReview = canAccessMenu(user, "staff-requests.review");
  const canOwn = canAccessMenu(user, "staff-requests");

  const row = await prisma.staffRequisition.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { name: true, email: true, department: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!row) notFound();
  if (!canReview && !(canOwn && row.requestedById === user.id)) notFound();

  const backHref = canReview && row.requestedById !== user.id ? "/hr/requisitions" : "/hr/staff-requests";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={backHref} className="text-sm text-[#00a651] hover:underline">
        ← Back
      </Link>
      <div>
        <p className="text-sm text-[#5a7384]">{row.department}</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#0a4a7c]">{row.positionTitle}</h1>
        <p className="mt-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${requisitionStatusClass(row.status)}`}>
            {requisitionStatusLabel(row.status)}
          </span>
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5 sm:grid-cols-2">
        <Info label="Requested by" value={`${row.requestedBy.name} · ${row.requestedBy.email}`} />
        <Info label="Posts" value={String(row.headcount)} />
        <Info label="Employment" value={row.employment} />
        <Info label="Duty station" value={row.location || "—"} />
        <Info label="Needed by" value={row.requiredBy ? row.requiredBy.toLocaleDateString("en-GB") : "Not specified"} />
        <Info label="Submitted" value={row.createdAt.toLocaleString("en-GB")} />
      </section>

      <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
        <h2 className="font-semibold text-[#0a4a7c]">Business justification</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#3d5a6e]">{row.justification}</p>
      </section>

      {row.hrNotes ? (
        <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-[#0a4a7c]">HR note</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#3d5a6e]">{row.hrNotes}</p>
          {row.reviewedBy ? (
            <p className="mt-2 text-xs text-slate-500">
              Updated by {row.reviewedBy.name}
              {row.reviewedAt ? ` on ${row.reviewedAt.toLocaleString("en-GB")}` : ""}
            </p>
          ) : null}
        </section>
      ) : null}

      {canReview ? (
        <section className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-5">
          <h2 className="mb-4 font-semibold text-[#0a4a7c]">HR action</h2>
          <RequisitionReviewForm id={row.id} status={row.status} hrNotes={row.hrNotes} />
        </section>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-[#0a2f4a]">{value}</p>
    </div>
  );
}
