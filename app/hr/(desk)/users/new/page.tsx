import Link from "next/link";
import { UserForm } from "@/components/UserForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl">
      <Link href="/hr/users" className="text-sm text-[#00a651] hover:underline">
        ← All users
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[#0a4a7c]">Create a user</h1>
      <p className="mt-2 mb-8 text-sm text-[#5a7384]">
        Use <span className="text-[#0a2f4a]">HR</span> for Human Resources officers — they are
        notified when a department requests staff. Use Head of department / staff and tick only
        Request staff for department heads. They set their own password on first sign-in.
      </p>
      <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-6">
        <UserForm />
      </div>
    </div>
  );
}
