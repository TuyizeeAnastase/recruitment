export const companyName = process.env.COMPANY_NAME ?? "BANK OF AFRICA RWANDA";
export const companyShort = process.env.COMPANY_SHORT ?? "BOA";

export const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const sources = [
  { id: "website", label: "Company website" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "qr", label: "QR code" },
  { id: "referral", label: "Employee referral" },
  { id: "other", label: "Other" },
] as const;

export const statuses = [
  { id: "new", label: "Applied", tone: "sky" },
  { id: "reviewing", label: "Under review", tone: "amber" },
  { id: "shortlisted", label: "Shortlisted", tone: "cyan" },
  { id: "written_exam", label: "Written exam", tone: "indigo" },
  { id: "interview", label: "Interview", tone: "violet" },
  { id: "offer", label: "Offer", tone: "emerald" },
  { id: "hired", label: "Hired", tone: "teal" },
  { id: "rejected", label: "Not selected", tone: "rose" },
] as const;

export type ApplicationStatus = (typeof statuses)[number]["id"];
export type ApplicationSource = (typeof sources)[number]["id"];

export function statusLabel(id: string) {
  return statuses.find((s) => s.id === id)?.label ?? id;
}

export function sourceLabel(id: string) {
  return sources.find((s) => s.id === id)?.label ?? id;
}

export function statusBadgeClass(id: string) {
  switch (id) {
    case "new":
      return "bg-sky-500/15 text-sky-300";
    case "reviewing":
      return "bg-amber-500/15 text-amber-300";
    case "shortlisted":
      return "bg-cyan-500/15 text-cyan-300";
    case "written_exam":
      return "bg-indigo-500/15 text-indigo-300";
    case "interview":
      return "bg-violet-500/15 text-violet-300";
    case "offer":
      return "bg-emerald-500/15 text-emerald-300";
    case "hired":
      return "bg-teal-500/15 text-teal-300";
    case "rejected":
      return "bg-rose-500/15 text-rose-300";
    default:
      return "bg-slate-700 text-slate-300";
  }
}

export function publicStatusBadgeClass(id: string) {
  switch (id) {
    case "new":
    case "reviewing":
      return "bg-amber-100 text-amber-800";
    case "shortlisted":
      return "bg-cyan-100 text-cyan-800";
    case "written_exam":
      return "bg-indigo-100 text-indigo-800";
    case "interview":
      return "bg-violet-100 text-violet-800";
    case "offer":
    case "hired":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export const statusEmails: Record<string, { subject: string; intro: string }> = {
  new: {
    subject: "We received your application",
    intro: "Thank you for applying. Our recruitment team will review your file.",
  },
  reviewing: {
    subject: "Your application is under review",
    intro: "Your application is being reviewed by the hiring team.",
  },
  shortlisted: {
    subject: "You have been shortlisted",
    intro: "Congratulations — you have been shortlisted for the next stage.",
  },
  written_exam: {
    subject: "You are invited to a written exam",
    intro: "You have been selected to sit a written examination.",
  },
  interview: {
    subject: "You are invited to interview",
    intro: "You have been selected for an interview.",
  },
  offer: {
    subject: "You have received an offer",
    intro: "We are pleased to move forward with an offer.",
  },
  hired: {
    subject: "Welcome to the team",
    intro: "Your hiring process is complete. Welcome to Bank of Africa Rwanda.",
  },
  rejected: {
    subject: "Update on your application",
    intro: "Thank you for your interest. We will not be moving forward with your application at this time.",
  },
};
