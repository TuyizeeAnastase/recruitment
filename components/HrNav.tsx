"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { CompanyLogo } from "@/components/CompanyLogo";

export type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

export function HrNav({
  name,
  company,
  role,
  links,
}: {
  name: string;
  company: string;
  role: string;
  links: NavLink[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-[#041e33] p-5 text-slate-200">
      <div className="rounded-xl bg-white/10 px-3 py-2.5">
        <CompanyLogo variant="light" height={28} />
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-sky-300/80">HR desk</p>
      <p className="sr-only">{company}</p>
      <nav className="mt-8 flex flex-1 flex-col gap-1 text-sm">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : link.href === "/hr/jobs"
              ? pathname.startsWith("/hr/jobs") && pathname !== "/hr/jobs/new"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 ${active ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link className="rounded-lg px-3 py-2 hover:bg-slate-800" href="/" target="_blank">
          Public careers site
        </Link>
      </nav>
      <div className="border-t border-slate-800 pt-4 text-sm">
        <p className="text-white">{name}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{role === "ADMIN" ? "Administrator" : "Staff"}</p>
        <form action={logoutAction}>
          <button className="mt-2 text-teal-400 hover:underline" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
