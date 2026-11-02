import { JobForm } from "@/components/JobForm";
import { requireMenu } from "@/lib/auth";

export default async function NewJobPage() {
  await requireMenu("jobs.create");
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.18em] text-teal-400">Hiring</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Create a role</h1>
      <p className="mt-2 mb-8 max-w-2xl text-sm text-slate-400">
        Add screening criteria (degree, years of experience, language, and so on). Applicants tick what they
        meet, and the dashboard groups them by match percent.
      </p>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <JobForm />
      </div>
    </div>
  );
}
