"use client";

import { useActionState } from "react";
import type { Job } from "@prisma/client";
import { createJobAction, updateJobAction } from "@/app/actions/jobs";
import { toDateInput } from "@/lib/jobs";

const fieldClass =
  "w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-500";

export function JobForm({ job, criteria = [] }: { job?: Job; criteria?: string[] }) {
  const action = job ? updateJobAction.bind(null, job.id) : createJobAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="title"
          label="Role title"
          required
          placeholder="Frontend engineer"
          defaultValue={job?.title}
        />
        <Input
          name="department"
          label="Department"
          required
          placeholder="Engineering"
          defaultValue={job?.department}
        />
        <Input
          name="location"
          label="Location"
          required
          placeholder="Kigali / Remote"
          defaultValue={job?.location}
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Employment type</span>
          <select name="employment" className={fieldClass} defaultValue={job?.employment ?? "Full-time"}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </label>
        <Input
          name="salaryRange"
          label="Salary range (optional)"
          placeholder="e.g. RWF 1.2M – 1.8M / month"
          defaultValue={job?.salaryRange ?? ""}
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Application deadline</span>
          <input
            type="date"
            name="closesAt"
            defaultValue={toDateInput(job?.closesAt)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-200">Role description</span>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={job?.description}
          placeholder="What the person will own, who they work with, and what success looks like."
          className={fieldClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-200">What you look for (narrative)</span>
        <textarea
          name="requirements"
          rows={5}
          defaultValue={job?.requirements}
          placeholder="One requirement per line."
          className={fieldClass}
        />
      </label>

      <CriteriaFields initial={criteria} />

      <div className="flex flex-wrap gap-3 pt-2">
        {job ? (
          <>
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending}
              className="rounded-full border border-slate-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
            {job.status !== "PUBLISHED" ? (
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={pending}
                className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Publishing…" : "Publish role"}
              </button>
            ) : (
              <button
                type="submit"
                name="intent"
                value="close"
                disabled={pending}
                className="rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                Close role
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={pending}
              className="rounded-full border border-slate-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending}
              className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Publishing…" : "Publish role"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function CriteriaFields({ initial }: { initial: string[] }) {
  const extras = Math.max(0, 6 - initial.length);
  const rows = [...initial, ...Array.from({ length: extras }, () => "")];

  return (
    <fieldset className="space-y-3 rounded-2xl border border-teal-500/20 bg-slate-950/40 p-4">
      <legend className="px-1 text-sm font-medium text-white">Screening criteria</legend>
      <p className="text-sm text-slate-400">
        Type one requirement per box, then click <span className="text-white">Save changes</span>. Empty
        boxes are ignored. Applicants will tick what they meet.
      </p>
      {rows.map((row, index) => (
        <input
          key={`${index}-${row}`}
          name="criteria"
          defaultValue={row}
          placeholder={
            index === 0
              ? "e.g. Bachelor’s degree in Computer Science"
              : index === 1
                ? "e.g. 3+ years of software development"
                : "Another must-have for this role"
          }
          className={fieldClass}
        />
      ))}
    </fieldset>
  );
}

function Input({
  name,
  label,
  required,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-200">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={fieldClass}
      />
    </label>
  );
}
