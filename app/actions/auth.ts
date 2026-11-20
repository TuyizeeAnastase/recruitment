"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { clearSession, homePath, requireHr, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";

export async function loginAction(_: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  await ensureRequisitionTables().catch(() => undefined);

  const user = await prisma.hrUser.findUnique({
    where: { email },
    include: { menus: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Those credentials did not match an HR account." };
  }
  if (!user.isActive) {
    return { error: "This account is disabled. Ask an administrator to restore access." };
  }

  await setSession(user.id);
  if (user.mustChangePassword) redirect("/hr/change-password");
  redirect(homePath(user));
}

export async function changePasswordAction(_: { error?: string } | null, formData: FormData) {
  const user = await requireHr({ allowPasswordChange: true });

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "Current password is not correct." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation do not match." };
  }
  if (await bcrypt.compare(next, user.passwordHash)) {
    return { error: "Choose a password that is different from the temporary one." };
  }

  await prisma.hrUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(next, 10),
      mustChangePassword: false,
    },
  });

  redirect(homePath(user));
}

export async function logoutAction() {
  await clearSession();
  redirect("/hr/login");
}
