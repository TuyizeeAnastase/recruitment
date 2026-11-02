import Link from "next/link";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getApplicant } from "@/lib/applicant-auth";
import { applicantLogoutAction } from "@/app/actions/applicant-auth";

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const applicant = await getApplicant();

  return (
    <div className="career-site flex min-h-full flex-col">
      <header className="bg-[#0a4a7c] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href={applicant ? "/portal" : "/portal/login"}
            className="flex items-center rounded-md bg-white px-2 py-1"
          >
            <CompanyLogo height={36} />
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/85">
            <Link href="/" className="hover:text-white">
              Careers
            </Link>
            {applicant ? (
              <>
                <span className="hidden text-white/70 sm:inline">{applicant.fullName}</span>
                <form action={applicantLogoutAction}>
                  <button
                    className="rounded-full border border-white/40 px-3 py-1.5 text-white hover:bg-white/10"
                    type="submit"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/portal/login"
                className="rounded-full border border-white/40 px-3 py-1.5 text-white hover:bg-white/10"
              >
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
