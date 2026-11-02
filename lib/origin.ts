import { headers } from "next/headers";
import { appUrl } from "./company";

export async function publicOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return appUrl;
}

export async function portalLoginUrl() {
  return `${await publicOrigin()}/portal/login`;
}
