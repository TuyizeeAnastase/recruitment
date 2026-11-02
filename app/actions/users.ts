"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HrRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isMenuKey, staffMenus } from "@/lib/menus";

function parseMenus(formData: FormData) {
  return formData
    .getAll("menus")
    .map((value) => String(value))
    .filter((key) => isMenuKey(key) && staffMenus.some((menu) => menu.key === key));
}

function parseRole(value: string): HrRole {
  return value === "ADMIN" ? "ADMIN" : "STAFF";
}

export async function createUserAction(_: { error?: string } | null, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? "STAFF"));
  const menus = parseMenus(formData);

  if (!name || !email.includes("@")) {
    return { error: "Enter a name and a valid work email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (role === "STAFF" && menus.length === 0) {
    return { error: "Choose at least one menu this user can open." };
  }

  const exists = await prisma.hrUser.findUnique({ where: { email } });
  if (exists) {
    return { error: "That email already has an account." };
  }

  const user = await prisma.hrUser.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      isActive: true,
      menus:
        role === "STAFF"
          ? { create: menus.map((menuKey) => ({ menuKey })) }
          : undefined,
    },
  });

  revalidatePath("/hr/users");
  redirect(`/hr/users/${user.id}`);
}

export async function updateUserAction(
  userId: string,
  _: { error?: string } | null,
  formData: FormData,
) {
  const actor = await requireAdmin();

  const existing = await prisma.hrUser.findUnique({ where: { id: userId } });
  if (!existing) return { error: "User not found." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? "STAFF"));
  const isActive = String(formData.get("isActive") ?? "") === "on";
  const menus = parseMenus(formData);

  if (!name || !email.includes("@")) {
    return { error: "Enter a name and a valid work email." };
  }
  if (password && password.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (role === "STAFF" && menus.length === 0) {
    return { error: "Choose at least one menu this user can open." };
  }

  const adminCount = await prisma.hrUser.count({
    where: { role: "ADMIN", isActive: true },
  });
  const strippingLastAdmin =
    existing.role === "ADMIN" &&
    existing.isActive &&
    adminCount <= 1 &&
    (role !== "ADMIN" || !isActive);
  if (strippingLastAdmin) {
    return { error: "Keep at least one active administrator." };
  }
  if (actor.id === userId && !isActive) {
    return { error: "You cannot deactivate your own account." };
  }

  const clash = await prisma.hrUser.findUnique({ where: { email } });
  if (clash && clash.id !== userId) {
    return { error: "That email already has an account." };
  }

  await prisma.$transaction([
    prisma.menuPermission.deleteMany({ where: { userId } }),
    prisma.hrUser.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        isActive,
        passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
        menus:
          role === "STAFF"
            ? { create: menus.map((menuKey) => ({ menuKey })) }
            : undefined,
      },
    }),
  ]);

  revalidatePath("/hr/users");
  revalidatePath(`/hr/users/${userId}`);
  redirect(`/hr/users/${userId}`);
}

export async function toggleUserActiveAction(userId: string) {
  const actor = await requireAdmin();
  const existing = await prisma.hrUser.findUnique({ where: { id: userId } });
  if (!existing) return;
  if (actor.id === userId) return;

  if (existing.isActive && existing.role === "ADMIN") {
    const adminCount = await prisma.hrUser.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (adminCount <= 1) return;
  }

  await prisma.hrUser.update({
    where: { id: userId },
    data: { isActive: !existing.isActive },
  });
  revalidatePath("/hr/users");
}
