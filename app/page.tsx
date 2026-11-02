import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { companyName } from "@/lib/company";
import { PublicHeader } from "@/components/PublicHeader";
import { publishedJobsWhere } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await prisma.job.findMany({
    where: publishedJobsWhere(),
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="career-site flex min-h-full flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#00a651]">Careers</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-[#0a4a7c]">
          Careers at {companyName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d5a6e]">
          Apply from our website, a LinkedIn post, or by scanning a QR code on a flyer.
          Your application lands directly with the HR team.
        </p>

        <div className="mt-10 grid gap-4">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#0a4a7c]/25 bg-white p-8 text-[#3d5a6e]">
              No open roles right now. Check back soon.
            </p>
          ) : (
            jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-[#0a4a7c]/15 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0a4a7c]">{job.title}</h2>
                    <p className="mt-1 text-sm text-[#5a7384]">
                      {job.department} · {job.location} · {job.employment}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="rounded-full bg-[#00a651] px-4 py-2 text-sm font-medium text-white hover:bg-[#008a44]"
                  >
                    View & apply
                  </Link>
                </div>
                <p className="mt-4 line-clamp-2 text-[#3d5a6e]">{job.description}</p>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
