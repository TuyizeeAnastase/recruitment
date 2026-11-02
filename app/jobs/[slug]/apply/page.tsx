import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { ApplyForm } from "@/components/ApplyForm";
import { sourceLabel } from "@/lib/company";
import { jobIsAccepting } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { slug } = await params;
  const { src } = await searchParams;
  const job = await prisma.job.findUnique({
    where: { slug },
    include: { criteria: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job || job.status === "DRAFT") notFound();

  const source = src ?? "website";

  return (
    <div className="career-site flex min-h-full flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <p className="text-sm font-medium text-[#00a651]">{job.title}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0a4a7c]">Apply</h1>
        <p className="mt-2 text-[#3d5a6e]">
          Fill this form on your phone after scanning a QR code, from LinkedIn, or from our website.
          Source tracked as <span className="font-medium text-[#0a4a7c]">{sourceLabel(source)}</span>.
        </p>
        {!jobIsAccepting(job) ? (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            This role is no longer open.
          </p>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#0a4a7c]/15 bg-white p-6">
            <ApplyForm
              slug={job.slug}
              jobTitle={job.title}
              defaultSource={source}
              criteria={job.criteria}
            />
          </div>
        )}
      </main>
    </div>
  );
}
