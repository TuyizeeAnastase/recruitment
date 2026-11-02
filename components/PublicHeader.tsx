import Link from "next/link";
import { CompanyLogo } from "@/components/CompanyLogo";

export function PublicHeader() {
  return (
    <header className="border-b border-[#e7e0d4] bg-[#fffdf8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center">
          <CompanyLogo height={36} />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">
            Open roles
          </Link>
          <Link href="/portal/login" className="hover:text-stone-900">
            Applicant portal
          </Link>
          <Link href="/hr/login" className="rounded-full border border-stone-300 px-3 py-1.5 hover:bg-white">
            HR login
          </Link>
        </nav>
      </div>
    </header>
  );
}
