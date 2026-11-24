import Link from "next/link";
import { notFound } from "next/navigation";
import { UserForm } from "@/components/UserForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.hrUser.findUnique({
    where: { id },
    include: { menus: true },
  });
  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/hr/users" className="text-sm text-[#00a651] hover:underline">
        ← All users
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[#0a4a7c]">Edit {user.name}</h1>
      <p className="mt-2 mb-8 text-sm text-[#5a7384]">
        Change their role, reset a password, or update which menus appear in their sidebar.
      </p>
      <div className="rounded-2xl border border-[#0a4a7c]/15 bg-white shadow-sm p-6">
        <UserForm user={user} />
      </div>
    </div>
  );
}
