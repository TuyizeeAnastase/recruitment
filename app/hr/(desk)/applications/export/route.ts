import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMenu } from "@/lib/auth";
import { sourceLabel, statusLabel } from "@/lib/company";
import { matchLabel, matchWhere } from "@/lib/match";
import { csvFile } from "@/lib/csv";

export async function GET(request: NextRequest) {
  await requireMenu("applications");
  const { searchParams } = request.nextUrl;
  const job = searchParams.get("job") ?? "";
  const status = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const match = searchParams.get("match") ?? "";

  const applications = await prisma.application.findMany({
    where: {
      ...(job ? { jobId: job } : {}),
      ...(status ? { status } : {}),
      ...(match ? matchWhere(match) : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { job: true },
    orderBy: [{ matchPercent: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  const excel = searchParams.get("format") === "excel";
  return csvFile(
    "applications.csv",
    ["Name", "Email", "Phone", "Role", "Match", "Source", "Stage", "Exam score", "Exam max", "Applied"],
    applications.map((row) => [
      row.fullName,
      row.email,
      row.phone,
      row.job.title,
      matchLabel(row.matchPercent),
      sourceLabel(row.source),
      statusLabel(row.status),
      row.examScore ?? "",
      row.examMax ?? "",
      row.createdAt.toISOString().slice(0, 10),
    ]),
    excel,
  );
}
