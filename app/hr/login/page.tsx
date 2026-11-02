import { redirect } from "next/navigation";
import { getHrUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { CompanyLogo } from "@/components/CompanyLogo";

export const dynamic = "force-dynamic";

export default async function HrLoginPage() {
  if (await getHrUser()) redirect("/hr");

  return (
    <div className="grid min-h-full place-items-center bg-[#f3f5f8] px-5 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="flex justify-center">
          <CompanyLogo height={46} />
        </div>
        <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">HR Portal</h1>
        <p className="mt-1 mb-7 text-center text-sm text-slate-500">Sign in to continue</p>
        <LoginForm />
      </div>
    </div>
  );
}
