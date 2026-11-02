import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function saveResume(file: File) {
  if (!file || file.size === 0) return { path: null, name: null as string | null };
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Resume must be under 8 MB.");
  }
  if (file.type && !ALLOWED.has(file.type)) {
    throw new Error("Resume must be a PDF or Word document.");
  }

  const ext = path.extname(file.name || "").toLowerCase() || ".pdf";
  const safeExt = [".pdf", ".doc", ".docx"].includes(ext) ? ext : ".pdf";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const dir = path.join(process.cwd(), "uploads", "resumes");
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(full, bytes);
  return { path: `uploads/resumes/${fileName}`, name: file.name };
}

export async function deleteResumeFile(relative: string | null | undefined) {
  if (!relative) return;
  const full = path.join(process.cwd(), relative);
  const root = path.join(process.cwd(), "uploads");
  if (!full.startsWith(root)) return;
  await unlink(full).catch(() => undefined);
}
