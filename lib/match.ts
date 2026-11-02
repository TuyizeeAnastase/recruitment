export const matchBands = [
  { id: "100", label: "100% match", min: 100, max: 100 },
  { id: "90", label: "90–99% match", min: 90, max: 99 },
  { id: "70", label: "70–89% match", min: 70, max: 89 },
  { id: "50", label: "50–69% match", min: 50, max: 69 },
  { id: "below", label: "Below 50%", min: 0, max: 49 },
] as const;

export type MatchBandId = (typeof matchBands)[number]["id"];

export function parseCriteriaLabels(formData: FormData) {
  return formData
    .getAll("criteria")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function matchPercent(met: number, total: number) {
  if (total <= 0) return null;
  return Math.round((met / total) * 100);
}

export function bandForPercent(percent: number | null | undefined) {
  if (percent == null) return null;
  return matchBands.find((band) => percent >= band.min && percent <= band.max) ?? matchBands[4];
}

export function matchWhere(bandId: string) {
  const band = matchBands.find((item) => item.id === bandId);
  if (!band) return {};
  if (band.min === band.max) {
    return { matchPercent: band.min };
  }
  return { matchPercent: { gte: band.min, lte: band.max } };
}

export function matchBadgeClass(percent: number | null | undefined) {
  if (percent == null) return "bg-slate-700 text-slate-300";
  if (percent >= 100) return "bg-teal-500/20 text-teal-200";
  if (percent >= 90) return "bg-emerald-500/20 text-emerald-200";
  if (percent >= 70) return "bg-sky-500/20 text-sky-200";
  if (percent >= 50) return "bg-amber-500/20 text-amber-200";
  return "bg-rose-500/20 text-rose-200";
}

export function matchLabel(percent: number | null | undefined) {
  if (percent == null) return "No criteria";
  return `${percent}% match`;
}
