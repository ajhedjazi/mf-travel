type BrandLogoProps = {
  variant?: "icon" | "horizontal" | "stacked";
  tone?: "adaptive" | "light" | "dark";
  className?: string;
};

export default function BrandLogo({
  variant = "horizontal",
  tone = "adaptive",
  className = "",
}: BrandLogoProps) {
  const classes = [
    "brand-logo",
    `brand-logo--${variant}`,
    tone === "adaptive" ? "brand-logo--adaptive" : "",
    className,
  ].filter(Boolean).join(" ");

  if (tone === "adaptive") {
    return (
      <span className={classes} aria-hidden="true">
        <img className="brand-logo__night" src={`/brand/mf-travel-${variant}-light.svg`} alt="" />
        <img className="brand-logo__day" src={`/brand/mf-travel-${variant}-dark.svg`} alt="" />
      </span>
    );
  }

  return (
    <span className={classes} aria-hidden="true">
      <img src={`/brand/mf-travel-${variant}-${tone}.svg`} alt="" />
    </span>
  );
}
