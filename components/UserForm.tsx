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
  menus: { menuKey: string }[];
};

const fieldClass =
  "w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-500";

export function UserForm({ user }: { user?: UserValue }) {
  const action = user ? updateUserAction.bind(null, user.id) : createUserAction;
  const [state, formAction, pending] = useActionState(action, null);
  const [role, setRole] = useState<HrRole>(user?.role ?? "STAFF");
  const selected = new Set(user?.menus.map((item) => item.menuKey) ?? ["dashboard", "applications", "jobs"]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Full name</span>
          <input name="name" required defaultValue={user?.name} className={fieldClass} placeholder="Jean Uwimana" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Work email</span>
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
          <span className="mb-1.5 block font-medium text-slate-200">
            {user ? "New password (optional)" : "Temporary password"}
          </span>
          <input
            name="password"
            type="password"
            required={!user}
            minLength={user ? undefined : 8}
            className={fieldClass}
            placeholder={user ? "Leave blank to keep current" : "At least 8 characters"}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Role</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as HrRole)}
            className={fieldClass}
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </label>
      </div>

      {user ? (
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="h-4 w-4 accent-teal-600" />
          Account is active
        </label>
      ) : null}

      {role === "ADMIN" ? (
        <p className="rounded-xl border border-teal-900 bg-teal-950/40 px-4 py-3 text-sm text-teal-100">
          Administrators can open every menu, including user management.
        </p>
      ) : (
        <fieldset className="rounded-xl border border-slate-700 p-4">
          <legend className="px-1 text-sm font-medium text-slate-200">Menus this person can view</legend>
          <p className="mb-3 text-xs text-slate-400">Only checked items appear in their sidebar.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {staffMenus.map((menu) => (
              <label key={menu.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-900">
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
