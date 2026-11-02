"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="rounded-full border border-slate-500 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
