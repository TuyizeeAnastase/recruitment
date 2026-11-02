"use client";

import { useActionState } from "react";
import { inviteWrittenExamAction } from "@/app/actions/applications";

function toLocal(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ExamInviteForm({
  id,
  examDate,
  examVenue,
}: {
  id: string;
  examDate: Date | null;
  examVenue: string | null;
}) {
  const [state, action, pending] = useActionState(inviteWrittenExamAction.bind(null, id), null);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-800/50 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-300">Step 1</p>
        <h2 className="mt-1 font-medium text-white">Invite to written exam</h2>
        <p className="mt-1 text-sm text-slate-400">
          Set the date and venue, then email the applicant. This also appears in their portal.
        </p>
      </div>

      {state?.error ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          {state.error}
        </p>
      ) : state?.saved ? (
        <p className="rounded-lg border border-teal-400/40 bg-teal-950/40 px-3 py-2 text-sm text-teal-100">
          {state.emailed ? "Exam invitation emailed to the applicant." : "Exam invitation saved."}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-300">Exam date & time</span>
          <input
            name="examDate"
            type="datetime-local"
            required
            defaultValue={toLocal(examDate)}
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-300">Venue</span>
          <input
            name="examVenue"
            required
            defaultValue={examVenue ?? ""}
            placeholder="BOA Head Office, Kigali"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-300">Message (optional)</span>
        <textarea
          name="nextStep"
          rows={2}
          placeholder="Leave blank to send a standard exam invitation."
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email exam date"}
      </button>
    </form>
  );
}
