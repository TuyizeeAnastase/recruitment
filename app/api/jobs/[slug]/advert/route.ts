import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";
import { ensureAdvertColumns } from "@/lib/advert";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureAdvertColumns();
  const { slug } = await params;
  const job = await prisma.job.findUnique({ where: { slug } });
  if (!job || job.status === "DRAFT" || !job.advertisementPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const full = path.join(process.cwd(), job.advertisementPath);
  const root = path.join(process.cwd(), "uploads");
  if (!full.startsWith(root)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await stat(full);
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const stream = createReadStream(full);
  const webStream = Readable.toWeb(stream) as ReadableStream;
  const safeName = (job.advertisementName ?? "role-advertisement").replace(/"/g, "");
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
