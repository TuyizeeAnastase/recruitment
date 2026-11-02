import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const COOKIE = "applicant_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return `${process.env.SESSION_SECRET ?? "dev-only-secret"}:applicant`;
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

export async function setApplicantSession(applicantId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(applicantId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearApplicantSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getApplicant() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const id = verify(token);
  if (!id) return null;
  return prisma.applicant.findUnique({ where: { id } });
}

export async function requireApplicant() {
  const user = await getApplicant();
  if (!user) redirect("/portal/login");
  return user;
}
