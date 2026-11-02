import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { jobIsAccepting } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await prisma.job.findUnique({
    where: { slug },
    include: { criteria: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job || job.status === "DRAFT") notFound();

  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <Link href="/" className="text-sm text-teal-800 hover:underline">
          ← All roles
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{job.title}</h1>
        <p className="mt-2 text-stone-500">
          {job.department} · {job.location} · {job.employment}
          {job.salaryRange ? ` · ${job.salaryRange}` : ""}
        </p>
        <div className="mt-8 whitespace-pre-wrap text-stone-700">{job.description}</div>
        {job.criteria.length > 0 ? (
          <>
            <h2 className="mt-8 text-lg font-semibold">Screening criteria</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-stone-700">
              {job.criteria.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </>
        ) : null}
        {job.requirements ? (
          <>
            <h2 className="mt-8 text-lg font-semibold">What we look for</h2>
            <div className="mt-3 whitespace-pre-wrap text-stone-700">{job.requirements}</div>
          </>
        ) : null}
        {jobIsAccepting(job) ? (
          <Link
            href={`/jobs/${job.slug}/apply?src=website`}
            className="mt-10 inline-flex rounded-full bg-teal-800 px-6 py-3 text-sm font-semibold text-white"
          >
            Apply for this role
          </Link>
        ) : (
          <p className="mt-10 text-stone-500">This role is closed.</p>
        )}
      </main>
    </div>
  );
}
