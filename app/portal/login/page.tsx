import { redirect } from "next/navigation";
import { getApplicant } from "@/lib/applicant-auth";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ApplicantLoginForm } from "@/components/ApplicantLoginForm";

export const dynamic = "force-dynamic";

export default async function ApplicantLoginPage() {
  if (await getApplicant()) redirect("/portal");

  return (
    <div className="career-site grid min-h-full place-items-center px-5 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#0a4a7c]/15 bg-white px-8 py-10 shadow-[0_12px_40px_rgba(10,74,124,0.08)]">
        <div className="flex justify-center">
          <CompanyLogo height={46} />
        </div>
        <h1 className="mt-6 text-center text-xl font-semibold text-[#0a4a7c]">Applicant portal</h1>
        <p className="mt-1 mb-7 text-center text-sm text-[#5a7384]">
          Enter the email you applied with to receive a password, then sign in to track your application.
        </p>
        <ApplicantLoginForm />
      </div>
    </div>
  );
}
