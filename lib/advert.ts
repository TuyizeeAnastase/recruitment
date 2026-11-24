import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { deleteResumeFile } from "@/lib/resume";

const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

let ready = false;

export async function ensureAdvertColumns() {
  if (ready) return;
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "advertisementPath" TEXT`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "advertisementName" TEXT`,
  );
  ready = true;
}

export async function saveAdvertisement(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return { path: null as string | null, name: null as string | null };
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("The role advertisement must be under 8 MB.");
  }
  if (file.type && !ALLOWED.has(file.type)) {
    throw new Error("The role advertisement must be a PDF or Word document.");
  }

  const ext = path.extname(file.name || "").toLowerCase() || ".pdf";
  const safeExt = [".pdf", ".doc", ".docx"].includes(ext) ? ext : ".pdf";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const dir = path.join(process.cwd(), "uploads", "adverts");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return { path: `uploads/adverts/${fileName}`, name: file.name };
}

export async function replaceAdvertisement(
  previousPath: string | null | undefined,
  file: FormDataEntryValue | null,
) {
  const saved = await saveAdvertisement(file);
  if (!saved.path) return null;
  if (previousPath) await deleteResumeFile(previousPath);
  return saved;
}
