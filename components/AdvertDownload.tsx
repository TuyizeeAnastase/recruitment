export function AdvertDownload({
  slug,
  fileName,
}: {
  slug: string;
  fileName: string;
}) {
  return (
    <a
      href={`/api/jobs/${slug}/advert`}
      className="inline-flex items-center rounded-full border border-[#0a4a7c]/20 bg-white px-4 py-2 text-sm font-medium text-[#0a4a7c] hover:bg-[#eef4f8]"
    >
      Download role advertisement{fileName ? ` (${fileName})` : ""}
    </a>
  );
}
