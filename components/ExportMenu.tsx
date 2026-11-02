"use client";

import { PrintButton } from "@/components/PrintButton";

export function ExportMenu({ csvHref }: { csvHref: string }) {
  const joiner = csvHref.includes("?") ? "&" : "?";
  return (
    <div className="no-print flex flex-wrap gap-2">
      <a
        href={csvHref}
        className="rounded-full border border-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Export CSV
      </a>
      <a
        href={`${csvHref}${joiner}format=excel`}
        className="rounded-full border border-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Export Excel
      </a>
      <PrintButton label="Print list" />
    </div>
  );
}
