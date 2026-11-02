import Link from "next/link";
import { UserForm } from "@/components/UserForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl">
      <Link href="/hr/users" className="text-sm text-teal-400 hover:underline">
        ← All users
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">Create a user</h1>
      <p className="mt-2 mb-8 text-sm text-slate-400">
        Staff only see the menus you tick. Administrators can open every screen, including this one.
      </p>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <UserForm />
      </div>
    </div>
  );
}
