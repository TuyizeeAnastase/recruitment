"use client";

import { useActionState } from "react";
import { createRequisitionAction } from "@/app/actions/requisitions";

const fieldClass =
  "w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a] outline-none placeholder:text-[#8aa0b0] focus:border-teal-500";

export function RequisitionForm({ department }: { department?: string }) {
  const [state, formAction, pending] = useActionState(createRequisitionAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Department</span>
          <input
            name="department"
            required
            defaultValue={department}
            placeholder="e.g. Information Technology"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Position title</span>
          <input
            name="positionTitle"
            required
            placeholder="e.g. Credit Analyst"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Number of posts</span>
          <input name="headcount" type="number" min={1} max={50} defaultValue={1} className={fieldClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Employment type</span>
          <select name="employment" className={fieldClass} defaultValue="Full-time">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Duty station</span>
          <input name="location" placeholder="e.g. Kigali Head Office" className={fieldClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Needed by (optional)</span>
          <input name="requiredBy" type="date" className={fieldClass} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[#0a2f4a]">Business justification</span>
        <textarea
          name="justification"
          required
          rows={6}
          placeholder="Why this post is required, workload or vacancy it covers, and any skills that matter."
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit to HR"}
      </button>
    </form>
  );
}
