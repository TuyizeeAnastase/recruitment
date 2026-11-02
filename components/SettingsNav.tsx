"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/hr/settings", label: "Overview", exact: true },
  { href: "/hr/settings/email", label: "Email" },
  { href: "/hr/settings/applicants", label: "Applicants" },
  { href: "/hr/settings/jobs", label: "Roles" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="no-print mb-8 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              active ? "bg-teal-600 text-white" : "border border-slate-600 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
