"use client";

import { useEffect, useState } from "react";
import { useInView, usePrefersReducedMotion } from "./useInView";

type CountUpProps = {
  /** Numeric target, e.g. 4.8 */
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

/** Counts up once when scrolled into view. Server-renders the final value. */
export default function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1600,
  className,
}: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState<number | null>(null);

  // Server renders the final value (SEO / no-JS). On the client, reset to 0
  // before the element is seen, so the count never jumps backwards on screen.
  useEffect(() => {
    if (!reduced) setValue((current) => (current === null ? 0 : current));
  }, [reduced]);

  useEffect(() => {
    if (!inView || reduced) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, durationMs]);

  const shown = value === null ? to : value;

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to.toFixed(decimals)}${suffix}`}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
