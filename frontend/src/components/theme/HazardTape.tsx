import { cn } from "@/lib/utils";

/** Thin animated safety-tape rule. Purely decorative. */
export default function HazardTape({
  className,
  height = 6,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("tape-hazard w-full", className)}
      style={{ height }}
    />
  );
}
