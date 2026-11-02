"use client";

export function ConfirmSubmit({
  message,
  label,
  className,
}: {
  message: string;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
