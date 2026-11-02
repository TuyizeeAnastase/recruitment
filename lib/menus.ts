export const menus = [
  { key: "dashboard", label: "Dashboard", href: "/hr", exact: true },
  { key: "applications", label: "Applications", href: "/hr/applications" },
  { key: "reports", label: "Exam report", href: "/hr/reports/exams" },
  { key: "jobs", label: "Roles", href: "/hr/jobs" },
  { key: "jobs.create", label: "Post a role", href: "/hr/jobs/new" },
  { key: "users", label: "Users", href: "/hr/users", adminOnly: true },
  { key: "settings", label: "Settings", href: "/hr/settings", adminOnly: true },
] as const;

export type MenuKey = (typeof menus)[number]["key"];

export const staffMenus = menus.filter((menu) => !("adminOnly" in menu && menu.adminOnly));

export const menuKeys = menus.map((menu) => menu.key);

export function isMenuKey(value: string): value is MenuKey {
  return menuKeys.includes(value as MenuKey);
}

export function firstAllowedPath(allowed: Iterable<string>) {
  const set = new Set(allowed);
  const match = menus.find((menu) => set.has(menu.key));
  return match?.href ?? "/hr/no-access";
}
