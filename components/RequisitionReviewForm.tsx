"use client";

import { useActionState } from "react";
import { updateRequisitionStatusAction } from "@/app/actions/requisitions";
import { requisitionStatuses } from "@/lib/requisitions";

const fieldClass =
  "w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500";

export function RequisitionReviewForm({
  id,
  status,
  hrNotes,
}: {
  id: string;
  status: string;
  hrNotes: string;
}) {
  const [state, formAction, pending] = useActionState(updateRequisitionStatusAction.bind(null, id), null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-200">HR decision</span>
        <select name="status" defaultValue={status} className={fieldClass}>
          {requisitionStatuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-200">Note to the department (optional)</span>
        <textarea name="hrNotes" rows={4} defaultValue={hrNotes} className={fieldClass} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update request"}
      </button>
    </form>
  );
}
