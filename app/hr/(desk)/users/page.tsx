import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toggleUserActiveAction } from "@/app/actions/users";
import { menus } from "@/lib/menus";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.hrUser.findMany({
    include: { menus: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create staff accounts and choose which HR menus each person can open.
          </p>
        </div>
        <Link href="/hr/users/new" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">
          New user
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Menus</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((person) => (
              <tr key={person.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <Link href={`/hr/users/${person.id}`} className="font-medium text-white hover:underline">
                    {person.name}
                  </Link>
                  <p className="text-xs text-slate-400">{person.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {person.role === "ADMIN" ? "Administrator" : "Staff"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {person.role === "ADMIN"
                    ? "All menus"
                    : person.menus
                        .map((item) => menus.find((menu) => menu.key === item.menuKey)?.label ?? item.menuKey)
                        .join(", ") || "None"}
                </td>
                <td className="px-4 py-3">{person.isActive ? "Active" : "Disabled"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/hr/users/${person.id}`}
                      className="rounded-full border border-slate-500 px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                    <form action={toggleUserActiveAction.bind(null, person.id)}>
                      <button className="rounded-full bg-slate-700 px-3 py-1.5 text-xs">
                        {person.isActive ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
