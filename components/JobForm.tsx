"use client";

import { useActionState } from "react";
import type { Job } from "@prisma/client";
import { createJobAction, updateJobAction } from "@/app/actions/jobs";
import { toDateInput } from "@/lib/jobs";

const fieldClass =
  "w-full rounded-xl border border-[#0a4a7c]/20 bg-white px-3 py-2.5 text-[#0a2f4a] outline-none placeholder:text-[#8aa0b0] focus:border-teal-500";

export function JobForm({ job, criteria = [] }: { job?: Job; criteria?: string[] }) {
  const action = job ? updateJobAction.bind(null, job.id) : createJobAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
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
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Employment type</span>
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
          <span className="mb-1.5 block font-medium text-[#0a2f4a]">Application deadline</span>
          <input
            type="date"
            name="closesAt"
            defaultValue={toDateInput(job?.closesAt)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[#0a2f4a]">Role description</span>
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
        <span className="mb-1.5 block font-medium text-[#0a2f4a]">What you look for (narrative)</span>
        <textarea
          name="requirements"
          rows={5}
          defaultValue={job?.requirements}
          placeholder="One requirement per line."
          className={fieldClass}
        />
      </label>

      <CriteriaFields initial={criteria} />

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-[#0a2f4a]">Role advertisement (PDF or Word)</span>
        <p className="mb-2 text-xs text-[#5a7384]">
          Candidates will see this on the apply page and can download it. Leave empty to keep the
          current file.
        </p>
        {job?.advertisementName ? (
          <p className="mb-2 text-sm text-teal-200">Current file: {job.advertisementName}</p>
        ) : null}
        <input
          type="file"
          name="advertisement"
          accept=".pdf,.doc,.docx,application/pdf"
          className="w-full rounded-xl border border-dashed border-[#0a4a7c]/20 bg-white px-3 py-3 text-sm text-[#3d5a6e] file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-3 file:py-1.5 file:text-white"
        />
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        {job ? (
          <>
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending}
              className="rounded-full border border-[#0a4a7c]/25 px-5 py-2.5 text-sm font-semibold text-[#0a4a7c] disabled:opacity-60"
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
                className="rounded-full bg-[#0a4a7c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
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
              className="rounded-full border border-[#0a4a7c]/25 px-5 py-2.5 text-sm font-semibold text-[#0a4a7c] disabled:opacity-60"
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
    <fieldset className="space-y-3 rounded-2xl border border-teal-500/20 bg-white p-4">
      <legend className="px-1 text-sm font-medium text-[#0a4a7c]">Screening criteria</legend>
      <p className="text-sm text-[#5a7384]">
        Type one requirement per box, then click <span className="font-medium text-[#0a4a7c]">Save changes</span>. Empty
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
      <span className="mb-1.5 block font-medium text-[#0a2f4a]">{label}</span>
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
