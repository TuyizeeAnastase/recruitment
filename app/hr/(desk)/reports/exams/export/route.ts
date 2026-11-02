import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMenu } from "@/lib/auth";
import { statusLabel } from "@/lib/company";
import { examPercent, rankByScore } from "@/lib/exam-report";
import { csvFile } from "@/lib/csv";

export async function GET(request: NextRequest) {
  await requireMenu("reports");
  const job = request.nextUrl.searchParams.get("job") ?? "";
  const applications = await prisma.application.findMany({
    where: job ? { jobId: job } : {},
    include: { job: true },
  });
  const ranked = rankByScore(applications);

  const excel = request.nextUrl.searchParams.get("format") === "excel";
  return csvFile(
    "written-exam-report.csv",
    ["Rank", "Applicant", "Email", "Role", "Stage", "Exam date", "Venue", "Score", "Max", "Percent"],
    ranked.map((row) => [
      row.rank ?? "",
      row.fullName,
      row.email,
      row.job.title,
      statusLabel(row.status),
      row.examDate ? row.examDate.toISOString() : "",
      row.examVenue ?? "",
      row.examScore ?? "",
      row.examMax ?? "",
      examPercent(row.examScore, row.examMax) ?? "",
    ]),
    excel,
  );
}
