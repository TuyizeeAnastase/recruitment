export const requisitionStatuses = [
  { id: "SUBMITTED", label: "Submitted", hint: "Waiting for HR" },
  { id: "UNDER_REVIEW", label: "Under review", hint: "HR is assessing the request" },
  { id: "APPROVED", label: "Approved to recruit", hint: "HR may open the role" },
  { id: "DECLINED", label: "Declined", hint: "Not taken forward" },
  { id: "FULFILLED", label: "Position filled", hint: "Recruitment completed" },
] as const;

export type RequisitionStatusId = (typeof requisitionStatuses)[number]["id"];

export function requisitionStatusLabel(status: string) {
  return requisitionStatuses.find((item) => item.id === status)?.label ?? status;
}

export function requisitionStatusClass(status: string) {
  if (status === "APPROVED") return "bg-teal-100 text-teal-800";
  if (status === "UNDER_REVIEW") return "bg-sky-100 text-sky-800";
  if (status === "FULFILLED") return "bg-emerald-100 text-emerald-800";
  if (status === "DECLINED") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export function isRequisitionStatus(value: string): value is RequisitionStatusId {
  return requisitionStatuses.some((item) => item.id === value);
}
