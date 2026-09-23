"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";

const Logo: React.FC = () => {
  return (
    <div>
      {/* LEFT: Logo */}
      <Link href="/" className="shrink-0">
        <BrandLogo
          width={180}
          height={260}
          priority
          className="w-auto h-15 object-contain"
        />
      </Link>
    </div>
  );
};

export default Logo;
