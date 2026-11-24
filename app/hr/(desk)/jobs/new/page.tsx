import { JobForm } from "@/components/JobForm";
import { requireMenu } from "@/lib/auth";

export default async function NewJobPage() {
  await requireMenu("jobs.create");
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#00a651]">Hiring</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#0a4a7c]">Create a role</h1>
      <p className="mt-2 mb-8 max-w-2xl text-sm text-[#5a7384]">
        Add screening criteria (degree, years of experience, language, and so on). Applicants tick what they
        meet, and the dashboard groups them by match percent.
      </p>
      <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-6">
        <JobForm />
      </div>
    </div>
  );
}
