import Link from "next/link";
import { requireMenu } from "@/lib/auth";
import { RequisitionForm } from "@/components/RequisitionForm";

export const dynamic = "force-dynamic";

export default async function NewStaffRequestPage() {
  const user = await requireMenu("staff-requests");

  return (
    <div className="max-w-3xl">
      <Link href="/hr/staff-requests" className="text-sm text-[#00a651] hover:underline">
        ← Request report
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[#0a4a7c]">Request a staff member</h1>
      <p className="mt-2 mb-8 text-sm text-[#5a7384]">
        Describe the post your department needs. The HR team receives a notification and will review
        the request.
      </p>
      <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-6">
        <RequisitionForm department={user.department} />
      </div>
    </div>
  );
}
