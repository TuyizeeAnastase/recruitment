"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white"
    >
      {label}
    </button>
  );
}
