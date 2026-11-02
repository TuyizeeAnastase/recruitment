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
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-800">Careers</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-stone-900">
          Careers at {companyName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          Apply from our website, a LinkedIn post, or by scanning a QR code on a flyer.
          Your application lands directly with the HR team.
        </p>

        <div className="mt-10 grid gap-4">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-stone-600">
              No open roles right now. Check back soon.
            </p>
          ) : (
            jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-stone-200 bg-[#fffdf8] p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">{job.title}</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {job.department} · {job.location} · {job.employment}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    View & apply
                  </Link>
                </div>
                <p className="mt-4 line-clamp-2 text-stone-600">{job.description}</p>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
