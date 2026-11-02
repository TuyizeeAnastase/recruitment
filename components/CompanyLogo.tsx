export function CompanyLogo({
  variant = "color",
  height = 40,
}: {
  variant?: "color" | "light";
  height?: number;
}) {
  const src = variant === "light" ? "/boa-logo-light.png" : "/boa-logo.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="BANK OF AFRICA RWANDA"
      height={height}
      className="h-auto w-auto max-w-full object-contain"
      style={{ height }}
    />
  );
}
