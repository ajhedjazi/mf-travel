import Image from "next/image";
import { logoPath } from "./site-config";

export default function BrandLogo({
  className = "",
}: { className?: string }) {
  return (
    <span className={`brand-logo brand-logo--card ${className}`}>
      <Image src={logoPath} alt="MF Travel" width={572} height={174} loading="eager" unoptimized />
    </span>
  );
}
