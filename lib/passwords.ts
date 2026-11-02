import { randomBytes } from "crypto";

export function generateApplicantPassword() {
  return `Boa-${randomBytes(4).toString("hex")}`;
}
