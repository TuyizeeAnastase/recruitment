import Link from "next/link";
import { CompanyLogo } from "@/components/CompanyLogo";

export function PublicHeader() {
  return (
    <header className="bg-[#0a4a7c] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center rounded-md bg-white px-2 py-1">
          <CompanyLogo height={36} />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/85">
          <Link href="/" className="hover:text-white">
            Open roles
          </Link>
          <Link href="/portal/login" className="hover:text-white">
            Applicant portal
          </Link>
          <Link
            href="/hr/login"
            className="rounded-full border border-white/40 px-3 py-1.5 text-white hover:bg-white/10"
          >
            HR login
          </Link>
        </nav>
      </div>
    </header>
  );
}
