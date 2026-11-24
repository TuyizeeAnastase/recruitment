"use client";

import { useActionState, useState } from "react";
import type { HrRole } from "@prisma/client";
import { createUserAction, updateUserAction } from "@/app/actions/users";
import { staffMenus } from "@/lib/menus";

type UserValue = {
  id: string;
  name: string;
  email: string;
  role: HrRole;
  isActive: boolean;
  department?: string;
  menus: { menuKey: string }[];
};

const fieldClass =
  "w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a] outline-none placeholder:text-[#8aa0b0] focus:border-teal-500";

export function UserForm({ user }: { user?: UserValue }) {
  const action = user ? updateUserAction.bind(null, user.id) : createUserAction;
  const [state, formAction, pending] = useActionState(action, null);
  const [role, setRole] = useState<HrRole>(user?.role ?? "STAFF");
  const selected = new Set(user?.menus.map((item) => item.menuKey) ?? ["dashboard", "applications", "jobs"]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Full name</span>
          <input name="name" required defaultValue={user?.name} className={fieldClass} placeholder="Jean Uwimana" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Work email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={user?.email}
            className={fieldClass}
            placeholder="name@boarwanda.com"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">
            {user ? "New password (optional)" : "Temporary password"}
          </span>
          <input
            name="password"
            type="password"
            required={!user}
            minLength={user ? undefined : 8}
            className={fieldClass}
            placeholder={user ? "Leave blank to keep current" : "They will change this on first login"}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Department</span>
          <input
            name="department"
            defaultValue={user?.department ?? ""}
            className={fieldClass}
            placeholder="e.g. Retail Banking"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Role</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as HrRole)}
            className={fieldClass}
          >
            <option value="STAFF">Head of department / staff</option>
            <option value="HR">HR</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </label>
      </div>

      {user ? (
        <label className="flex items-center gap-2 text-sm text-[#0a2f4a]">
          <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="h-4 w-4 accent-teal-600" />
          Account is active
        </label>
      ) : null}

      {role === "ADMIN" ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Administrators can open every menu, including user management.
        </p>
      ) : role === "HR" ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          HR officers see recruitment work and receive a notification when a head of department
          requests staff.
        </p>
      ) : (
        <fieldset className="rounded-xl border border-[#0a4a7c]/15 p-4">
          <legend className="px-1 text-sm font-medium text-[#0a2f4a]">Menus this person can view</legend>
          <p className="mb-3 text-xs text-[#5a7384]">
            Only checked items appear in their sidebar. For a head of department, tick only{" "}
            <span className="text-[#0a2f4a]">Request staff</span>.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {staffMenus.map((menu) => (
              <label key={menu.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white">
                <input
                  type="checkbox"
                  name="menus"
                  value={menu.key}
                  defaultChecked={selected.has(menu.key)}
                  className="h-4 w-4 accent-teal-600"
                />
                {menu.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : user ? "Save user" : "Create user"}
      </button>
    </form>
  );
}
