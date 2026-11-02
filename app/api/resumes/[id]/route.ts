import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { canAccessMenu, getHrUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getHrUser();
  if (!user || !user.isActive || !canAccessMenu(user, "applications")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application?.resumePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const full = path.join(process.cwd(), application.resumePath);
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
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${application.resumeName ?? "resume"}"`,
    },
  });
}
