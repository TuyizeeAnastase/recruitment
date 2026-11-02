export function examPercent(score: number | null, max: number | null) {
  if (score == null || max == null || max <= 0) return null;
  return Math.round((score / max) * 1000) / 10;
}

export function rankByScore<T extends { examScore: number | null }>(rows: T[]) {
  const scored = [...rows].sort((a, b) => {
    const left = a.examScore;
    const right = b.examScore;
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return right - left;
  });
  let rank = 0;
  let previous: number | null = null;
  return scored.map((row, index) => {
    if (row.examScore == null) return { ...row, rank: null as number | null };
    if (previous === null || row.examScore !== previous) {
      rank = index + 1;
      previous = row.examScore;
    }
    return { ...row, rank };
  });
}
