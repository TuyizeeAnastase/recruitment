import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/JobForm";
import { requireMenu } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMenu("jobs");
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { criteria: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job) notFound();

  return (
    <div className="max-w-3xl">
      <Link href={`/hr/jobs/${job.id}`} className="text-sm text-teal-400 hover:underline">
        ← Back to role
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">Edit {job.title}</h1>
      <p className="mt-2 mb-8 text-sm text-slate-400">
        Changes to a live role appear on the public careers site as soon as you save or publish.
      </p>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <JobForm job={job} criteria={job.criteria.map((item) => item.label)} />
      </div>
    </div>
  );
}
