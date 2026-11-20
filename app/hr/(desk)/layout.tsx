import { HrNav } from "@/components/HrNav";
import { canAccessMenu, requireHr } from "@/lib/auth";
import { companyName } from "@/lib/company";
import { menus } from "@/lib/menus";
import { prisma } from "@/lib/prisma";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";

export const dynamic = "force-dynamic";

export default async function HrDeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireHr();
  let pendingRequests = 0;
  if (canAccessMenu(user, "staff-requests.review")) {
    try {
      await ensureRequisitionTables();
      pendingRequests = await prisma.staffRequisition.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      });
    } catch {
      pendingRequests = 0;
    }
  }

  const isDepartmentHead =
    user.role === "STAFF" &&
    canAccessMenu(user, "staff-requests") &&
    !canAccessMenu(user, "applications") &&
    !canAccessMenu(user, "jobs");

  const links = menus
    .filter((menu) => canAccessMenu(user, menu.key))
    .map((menu) => ({
      href: menu.href,
      label: menu.label,
      exact: "exact" in menu ? menu.exact : false,
      badge: menu.key === "staff-requests.review" && pendingRequests > 0 ? pendingRequests : undefined,
    }));

  return (
    <div className="flex min-h-full bg-slate-900 text-slate-100">
      <div className="no-print">
        <HrNav
          name={user.name}
          company={companyName}
          role={
            user.role === "ADMIN"
              ? "ADMIN"
              : user.role === "HR"
                ? "HR"
                : isDepartmentHead
                  ? "Head of department"
                  : "Staff"
          }
          links={links}
          showPublicSite={!isDepartmentHead}
        />
      </div>
      <div className="min-h-full flex-1 overflow-auto p-8 print:overflow-visible print:bg-white print:p-0 print:text-slate-900">
        {children}
      </div>
    </div>
  );
}
