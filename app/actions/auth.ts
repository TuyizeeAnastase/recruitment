"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { clearSession, homePath, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(_: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

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
  redirect(homePath(user));
}

export async function logoutAction() {
  await clearSession();
  redirect("/hr/login");
}
