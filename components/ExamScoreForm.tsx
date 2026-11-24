"use client";

import { useActionState } from "react";
import { saveExamScoreAction } from "@/app/actions/applications";

export function ExamScoreForm({
  id,
  examScore,
  examMax,
}: {
  id: string;
  examScore: number | null;
  examMax: number | null;
}) {
  const [state, action, pending] = useActionState(saveExamScoreAction.bind(null, id), null);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-teal-500/30 bg-white shadow-sm p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#00a651]">Step 2</p>
        <h2 className="mt-1 font-medium text-[#0a4a7c]">Record written exam mark</h2>
        <p className="mt-1 text-sm text-[#5a7384]">
          After the exam, enter the score. It is listed on the exam report and in the applicant portal.
        </p>
      </div>

      {state?.error ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {state.error}
        </p>
      ) : state?.saved ? (
        <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {state.emailed ? "Mark saved and emailed." : "Mark saved on the exam report."}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#3d5a6e]">Score</span>
          <input
            name="examScore"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={examScore ?? ""}
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#3d5a6e]">Out of</span>
          <input
            name="examMax"
            type="number"
            step="0.01"
            min="1"
            defaultValue={examMax ?? 100}
            className="w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a]"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-[#0a2f4a]">
        <input type="checkbox" name="notify" className="h-4 w-4 accent-teal-600" />
        Email this mark to the applicant
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save mark"}
      </button>
    </form>
  );
}
