"use client";

import { updateApplicationStatus } from "@/app/actions/applications";
import { statuses } from "@/lib/company";

export function StatusForm({ id, value }: { id: string; value: string }) {
  return (
    <form
      action={async (formData) => {
        await updateApplicationStatus(id, String(formData.get("status")));
      }}
    >
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-300">Pipeline stage</span>
        <select
          name="status"
          defaultValue={value}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
