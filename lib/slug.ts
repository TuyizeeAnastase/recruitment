export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "role";
}

export function applyUrl(slug: string, source: string, origin?: string) {
  const base = origin ?? process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/jobs/${slug}/apply?src=${encodeURIComponent(source)}`;
}
