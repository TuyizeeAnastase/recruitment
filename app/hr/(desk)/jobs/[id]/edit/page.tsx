import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/JobForm";
import { loadJobCriteriaLabels } from "@/lib/ensure-criteria";
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
  });
  if (!job) notFound();
  const criteria = await loadJobCriteriaLabels(job.id);

  return (
    <div className="max-w-3xl">
      <Link href={`/hr/jobs/${job.id}`} className="text-sm text-[#00a651] hover:underline">
        ← Back to role
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[#0a4a7c]">Edit {job.title}</h1>
      <p className="mt-2 mb-8 text-sm text-[#5a7384]">
        Changes to a live role appear on the public careers site as soon as you save or publish.
      </p>
      <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-6">
        <JobForm job={job} criteria={criteria} />
      </div>
    </div>
  );
}
