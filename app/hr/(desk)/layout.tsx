import { HrNav } from "@/components/HrNav";
import { canAccessMenu, requireHr } from "@/lib/auth";
import { companyName } from "@/lib/company";
import { menus } from "@/lib/menus";

export const dynamic = "force-dynamic";

export default async function HrDeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireHr();
  const links = menus
    .filter((menu) => canAccessMenu(user, menu.key))
    .map((menu) => ({
      href: menu.href,
      label: menu.label,
      exact: "exact" in menu ? menu.exact : false,
    }));

  return (
    <div className="flex min-h-full bg-slate-900 text-slate-100">
      <div className="no-print">
        <HrNav name={user.name} company={companyName} role={user.role} links={links} />
      </div>
      <div className="min-h-full flex-1 overflow-auto p-8 print:overflow-visible print:bg-white print:p-0 print:text-slate-900">
        {children}
      </div>
    </div>
  );
}
