import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="career-site flex min-h-full flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#00a651]">Received</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#0a4a7c]">Thank you for applying</h1>
        <p className="mt-3 text-[#3d5a6e]">
          Your application has been received. Open the applicant portal, enter the same email you used to
          apply, and we will send you a password so you can track your status.
        </p>
        {id ? <p className="mt-2 font-mono text-xs text-stone-400">Ref {id}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/portal/login"
            className="rounded-full bg-[#00a651] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#008a44]"
          >
            Applicant portal
          </Link>
          <Link href="/" className="inline-flex items-center font-medium text-[#0a4a7c] hover:underline">
            Back to open roles
          </Link>
        </div>
      </main>
    </div>
  );
}
