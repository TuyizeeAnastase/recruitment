"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessMenu, requireMenu } from "@/lib/auth";
import { ensureRequisitionTables } from "@/lib/ensure-requisitions";
import { isRequisitionStatus } from "@/lib/requisitions";
import { notifyHiringTeamOfRequisition } from "@/lib/email";

function parseHeadcount(value: string) {
  const count = Number.parseInt(value, 10);
  if (!Number.isFinite(count) || count < 1) return 1;
  return Math.min(50, count);
}

export async function createRequisitionAction(_: { error?: string } | null, formData: FormData) {
  const user = await requireMenu("staff-requests");
  await ensureRequisitionTables();

  const positionTitle = String(formData.get("positionTitle") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim() || user.department || "";
  const employment = String(formData.get("employment") ?? "Full-time").trim();
  const location = String(formData.get("location") ?? "").trim();
  const justification = String(formData.get("justification") ?? "").trim();
  const headcount = parseHeadcount(String(formData.get("headcount") ?? "1"));
  const requiredRaw = String(formData.get("requiredBy") ?? "").trim();
  const requiredBy = requiredRaw ? new Date(`${requiredRaw}T00:00:00`) : null;

  if (!positionTitle || !department || !justification) {
    return { error: "Enter the department, position title, and a short business justification." };
  }

  const requisition = await prisma.staffRequisition.create({
    data: {
      requestedById: user.id,
      department,
      positionTitle,
      employment,
      location,
      justification,
      headcount,
      requiredBy: requiredBy && !Number.isNaN(requiredBy.getTime()) ? requiredBy : null,
    },
  });

  void notifyHiringTeamOfRequisition({
    requesterName: user.name,
    department,
    positionTitle,
    headcount,
    requisitionId: requisition.id,
  });

  revalidatePath("/hr/staff-requests");
  revalidatePath("/hr/requisitions");
  revalidatePath("/hr");
  redirect(`/hr/staff-requests/${requisition.id}`);
}

export async function updateRequisitionStatusAction(
  id: string,
  _: { error?: string } | null,
  formData: FormData,
) {
  const user = await requireMenu("staff-requests.review");
  await ensureRequisitionTables();

  const existing = await prisma.staffRequisition.findUnique({ where: { id } });
  if (!existing) return { error: "This request could not be found." };

  const status = String(formData.get("status") ?? "");
  const hrNotes = String(formData.get("hrNotes") ?? "").trim();
  if (!isRequisitionStatus(status)) {
    return { error: "Choose a valid status." };
  }

  await prisma.staffRequisition.update({
    where: { id },
    data: {
      status,
      hrNotes,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/hr/requisitions");
  revalidatePath(`/hr/staff-requests/${id}`);
  revalidatePath("/hr");
  redirect(`/hr/requisitions`);
}
