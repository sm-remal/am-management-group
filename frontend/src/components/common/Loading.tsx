"use client";

import React, { useState } from "react";
import staticLogo from "../../assets/Am_logo.png";
import Image from "next/image";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

const Loading: React.FC = () => {
  const settings = usePublicSettings();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const logoSrc =
    settings.websiteLogo && failedLogoSrc !== settings.websiteLogo
      ? settings.websiteLogo
      : staticLogo;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center  font-sans">
      <div className="relative w-24 h-24 flex justify-center items-center">
        {/* Outer Smooth Rotating Ring */}
        <div className="w-full h-full rounded-full border-4 border-slate-100 border-t-secondary border-r-primary animate-spin"></div>

        {/* Center Logo with Subtle Pulse */}
        <Image
          src={logoSrc}
          alt={`${settings.siteName || "AM Management"} Logo`}
          className="absolute w-12 h-12 object-contain animate-pulse"
          width={48}
          height={48}
          onError={() => {
            if (settings.websiteLogo) {
              setFailedLogoSrc(settings.websiteLogo);
            }
          }}
        />
      </div>

      <p className="mt-6 text-sm font-semibold text-gray-700 tracking-wider uppercase">
        Loading, please wait...
      </p>
    </div>
  );
};

export default Loading;
