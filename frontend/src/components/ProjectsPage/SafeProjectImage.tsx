"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { projectFallbackImage } from "@/features/projects/project-display";
import { cn } from "@/lib/utils";

type SafeProjectImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export default function SafeProjectImage({
  src,
  alt,
  fallbackSrc = projectFallbackImage,
  className,
  fill,
  ...props
}: SafeProjectImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = failedSrc === src;

  if (hasError && fallbackSrc && fallbackSrc !== src) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill={fill}
        className={className}
        onError={() => setFailedSrc(fallbackSrc)}
        {...props}
      />
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-200 text-slate-400",
          fill ? "absolute inset-0" : "h-full w-full",
          className
        )}
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <ImageOff className="size-10" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}
