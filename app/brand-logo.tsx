import Image from "next/image";
import { logoPath } from "./site-config";

export default function BrandLogo({
  className = "",
  adaptive = false,
}: { className?: string; adaptive?: boolean }) {
  return (
    <span className={`brand-logo brand-logo--card${adaptive ? " brand-logo--adaptive" : ""} ${className}`}>
      <Image className={adaptive ? "brand-logo__night" : undefined} src={logoPath} alt="MF Travel" width={572} height={174} loading="eager" unoptimized />
      {adaptive && <Image className="brand-logo__day" src="/brand/mf-travel-business-card-logo-day.webp" alt="MF Travel" width={572} height={174} loading="eager" unoptimized />}
    </span>
  );
}
