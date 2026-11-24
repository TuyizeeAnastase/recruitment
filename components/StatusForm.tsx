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
        <span className="mb-1.5 block font-medium text-[#3d5a6e]">Pipeline stage</span>
        <select
          name="status"
          defaultValue={value}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a]"
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
