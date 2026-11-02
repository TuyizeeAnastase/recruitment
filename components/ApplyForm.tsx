"use client";

import { useActionState } from "react";
import { applyAction } from "@/app/actions/apply";
import { sources } from "@/lib/company";

type Props = {
  slug: string;
  jobTitle: string;
  defaultSource: string;
  criteria: { id: string; label: string }[];
};

export function ApplyForm({ slug, jobTitle, defaultSource, criteria }: Props) {
  const [state, action, pending] = useActionState(applyAction, null);
  const source = sources.some((s) => s.id === defaultSource) ? defaultSource : "website";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required placeholder="Ada Okonkwo" />
        <Field label="Email" name="email" type="email" required placeholder="you@email.com" />
        <Field label="Phone" name="phone" required placeholder="+250 7..." />
        <Field label="City / country" name="city" required placeholder="Kigali, Rwanda" />
        <Field label="LinkedIn URL" name="linkedinUrl" placeholder="https://linkedin.com/in/..." />
        <Field label="Current title" name="currentTitle" placeholder="Software engineer" />
        <Field label="Years of experience" name="yearsExperience" placeholder="4" />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-stone-800">How did you find this role?</span>
          <select
            name="source"
            defaultValue={source}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700"
          >
            {sources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {criteria.length > 0 ? (
        <fieldset className="space-y-3 rounded-2xl border border-teal-800/20 bg-white p-4">
          <legend className="text-sm font-semibold text-stone-900">Do you meet these criteria?</legend>
          <p className="text-sm text-stone-600">
            Tick every item that applies to you. HR uses this to see how closely you match the role.
          </p>
          {criteria.map((item) => (
            <label key={item.id} className="flex items-start gap-3 text-sm text-stone-800">
              <input
                type="checkbox"
                name="criterion"
                value={item.id}
                className="mt-0.5 h-4 w-4 accent-teal-800"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-stone-800">Why this role?</span>
        <textarea
          name="coverLetter"
          required
          rows={5}
          placeholder={`A short note on why you want ${jobTitle}.`}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700"
        />
      </label>

      <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
        You can apply to this role only once. After you submit, open the applicant portal, enter this email,
        and receive a password to track your status.
      </p>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-stone-800">Resume (PDF or Word)</span>
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,application/pdf"
          className="w-full rounded-xl border border-dashed border-stone-300 bg-white px-3 py-3 text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Sending application…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-stone-800">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700"
      />
    </label>
  );
}
