"use client";

import { useActionState } from "react";
import { saveApplicationProgress } from "@/app/actions/applications";
import { statuses } from "@/lib/company";

function toLocal(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  id: string;
  status: string;
  nextStep: string;
  interviewDate: Date | null;
  interviewVenue: string | null;
};

export function ProgressForm(props: Props) {
  const [state, action, pending] = useActionState(saveApplicationProgress.bind(null, props.id), null);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
      <h2 className="font-medium text-white">Interview and other stages</h2>
      <p className="text-sm text-slate-400">
        After the written exam, move the candidate to interview or another stage. Tick notify to email them.
      </p>

      {state?.error ? (
        <p className="rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          {state.error}
        </p>
      ) : state && "saved" in state && state.saved ? (
        <p className="rounded-lg border border-teal-400/40 bg-teal-950/40 px-3 py-2 text-sm text-teal-100">
          {state.emailed ? "Progress saved and the candidate was emailed." : "Progress saved."}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-300">Stage</span>
        <select
          name="status"
          defaultValue={props.status}
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
        >
          {statuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-300">What is next (shown to the applicant)</span>
        <textarea
          name="nextStep"
          rows={3}
          defaultValue={props.nextStep}
          placeholder="e.g. Attend the written exam on 12 Nov at Head Office, 09:00."
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-white"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-300">Interview date & time</span>
          <input
            name="interviewDate"
            type="datetime-local"
            defaultValue={toLocal(props.interviewDate)}
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-300">Interview venue</span>
          <input
            name="interviewVenue"
            defaultValue={props.interviewVenue ?? ""}
            placeholder="HR boardroom / Teams link"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-white"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-teal-600" />
        Email the applicant about this update
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save and notify"}
      </button>
    </form>
  );
}
