"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import staticLogo from "../../assets/Am_logo.png";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

type BrandLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
};

const BrandLogo = ({
  className,
  width = 180,
  height = 80,
  priority = false,
  alt,
}: BrandLogoProps) => {
  const settings = usePublicSettings();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const isLogoFailed =
    Boolean(settings.websiteLogo) && failedLogoSrc === settings.websiteLogo;
  const logoSrc: StaticImageData | string =
    settings.websiteLogo && !isLogoFailed ? settings.websiteLogo : staticLogo;

  return (
    <Image
      src={logoSrc}
      alt={alt || `${settings.siteName || "AM Management"} Logo`}
      width={width}
      height={height}
      priority={priority}
      className={className}
      onError={() => {
        if (settings.websiteLogo) {
          setFailedLogoSrc(settings.websiteLogo);
        }
      }}
    />
  );
};

export default BrandLogo;
