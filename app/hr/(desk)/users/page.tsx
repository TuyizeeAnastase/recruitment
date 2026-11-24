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
          <h1 className="text-2xl font-semibold text-[#0a4a7c]">Users</h1>
          <p className="mt-1 text-sm text-[#5a7384]">
            Create HR staff or heads of department and choose which menus each person can open.
          </p>
        </div>
        <Link href="/hr/users/new" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">
          New user
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a4a7c] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Menus</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((person) => (
              <tr key={person.id} className="border-t border-[#0a4a7c]/10">
                <td className="px-4 py-3">
                  <Link href={`/hr/users/${person.id}`} className="font-medium text-[#0a4a7c] hover:underline">
                    {person.name}
                  </Link>
                  <p className="text-xs text-[#5a7384]">{person.email}</p>
                </td>
                <td className="px-4 py-3 text-[#3d5a6e]">{person.department || "—"}</td>
                <td className="px-4 py-3 text-[#3d5a6e]">
                  {person.role === "ADMIN" ? "Administrator" : person.role === "HR" ? "HR" : "Staff"}
                </td>
                <td className="px-4 py-3 text-[#3d5a6e]">
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
                      className="rounded-full border border-[#0a4a7c]/25 px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                    <form action={toggleUserActiveAction.bind(null, person.id)}>
                      <button className="rounded-full bg-[#0a4a7c] px-3 py-1.5 text-xs text-white">
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
