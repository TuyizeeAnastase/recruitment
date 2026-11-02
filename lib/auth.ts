import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { HrUser, MenuPermission } from "@prisma/client";
import { prisma } from "./prisma";
import { firstAllowedPath, type MenuKey } from "./menus";

const COOKIE = "hr_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = HrUser & { menus: MenuPermission[] };

function secret() {
  return process.env.SESSION_SECRET ?? "dev-only-secret";
}

function sign(value: string) {
  const hmac = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(token: string) {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const value = token.slice(0, idx);
  const given = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("hex");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getHrUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const userId = verify(token);
  if (!userId) return null;
  return prisma.hrUser.findUnique({
    where: { id: userId },
    include: { menus: true },
  });
}

export function allowedMenuKeys(user: SessionUser) {
  if (user.role === "ADMIN") {
    return ["dashboard", "applications", "reports", "jobs", "jobs.create", "users", "settings"];
  }
  return user.menus.map((item) => item.menuKey);
}

export function canAccessMenu(user: SessionUser, key: MenuKey) {
  if (!user.isActive) return false;
  if (user.role === "ADMIN") return true;
  if (key === "reports") {
    return user.menus.some((item) => item.menuKey === "reports" || item.menuKey === "applications");
  }
  return user.menus.some((item) => item.menuKey === key);
}

export function homePath(user: SessionUser) {
  return firstAllowedPath(allowedMenuKeys(user));
}

export async function requireHr() {
  const user = await getHrUser();
  if (!user) redirect("/hr/login");
  if (!user.isActive) {
    await clearSession();
    redirect("/hr/login");
  }
  return user;
}

export async function requireMenu(key: MenuKey) {
  const user = await requireHr();
  if (!canAccessMenu(user, key)) redirect(homePath(user));
  return user;
}

export async function requireAdmin() {
  const user = await requireHr();
  if (user.role !== "ADMIN") redirect(homePath(user));
  return user;
}
