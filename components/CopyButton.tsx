"use client";

import { useState } from "react";

function markCopied(setCopied: (value: boolean) => void) {
  setCopied(true);
  window.setTimeout(() => setCopied(false), 1600);
}

function copyWithTextarea(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.left = "0";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.focus();
  field.select();
  field.setSelectionRange(0, value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    document.body.removeChild(field);
  }
  return ok;
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (copyWithTextarea(value)) {
          markCopied(setCopied);
          return;
        }

        if (window.isSecureContext && navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText(value).then(
            () => markCopied(setCopied),
            () => window.prompt("Copy this link:", value),
          );
          return;
        }

        window.prompt("Copy this link:", value);
      }}
      className="rounded-full border border-slate-500 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
