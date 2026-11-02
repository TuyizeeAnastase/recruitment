import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteApplicantAction, sendApplicantPasswordAction } from "@/app/actions/settings";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";

export default async function ApplicantsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const applicants = await prisma.applicant.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Applicants</h2>
      <p className="mt-2 mb-6 max-w-2xl text-sm text-slate-400">
        Remove a person and all of their applications and CVs. You can also email them a new portal password.
        This cannot be undone.
      </p>

      <form className="mb-4 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        />
        <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900">Search</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Applications</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No applicants match this search.
                </td>
              </tr>
            ) : (
              applicants.map((person) => (
                <tr key={person.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{person.fullName}</p>
                    <p className="text-xs text-slate-400">{person.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{person._count.applications}</td>
                  <td className="px-4 py-3 text-slate-400">{person.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/hr/applications?q=${encodeURIComponent(person.email)}`}
                        className="rounded-full border border-slate-500 px-3 py-1.5 text-xs"
                      >
                        View applications
                      </Link>
                      <form action={sendApplicantPasswordAction.bind(null, person.id)}>
                        <button className="rounded-full border border-slate-500 px-3 py-1.5 text-xs">
                          Email new password
                        </button>
                      </form>
                      <form action={deleteApplicantAction.bind(null, person.id)}>
                        <ConfirmSubmit
                          label="Remove"
                          message={`Permanently delete ${person.fullName} and all of their applications?`}
                          className="rounded-full bg-rose-700 px-3 py-1.5 text-xs text-white"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
