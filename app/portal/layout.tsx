import Link from "next/link";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getApplicant } from "@/lib/applicant-auth";
import { applicantLogoutAction } from "@/app/actions/applicant-auth";

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const applicant = await getApplicant();

  return (
    <div className="flex min-h-full flex-col bg-[#f3f5f8]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href={applicant ? "/portal" : "/portal/login"} className="flex items-center">
            <CompanyLogo height={36} />
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Careers
            </Link>
            {applicant ? (
              <>
                <span className="hidden sm:inline text-slate-400">{applicant.fullName}</span>
                <form action={applicantLogoutAction}>
                  <button className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-50" type="submit">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/portal/login" className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</div>
    </div>
  );
}
