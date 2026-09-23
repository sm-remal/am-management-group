import { cn } from "@/lib/utils";

type Tone = "signal" | "harbour" | "light";

type TickerTapeProps = {
  items: string[];
  tone?: Tone;
  direction?: "left" | "right";
  /** degrees; small values read as a ribbon stretched across the page */
  tilt?: number;
  speedSeconds?: number;
  className?: string;
  label?: string;
};

const toneClass: Record<Tone, string> = {
  signal:
    "text-white bg-[linear-gradient(90deg,#e45a0b_0%,#fb731f_25%,#ff8e44_50%,#fb731f_75%,#e45a0b_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),inset_0_-1px_0_rgb(120_40_0/0.35),0_14px_30px_-14px_rgb(200_80_10/0.8)]",
  harbour:
    "text-white bg-[linear-gradient(90deg,#0b1c3a_0%,#16305c_50%,#0b1c3a_100%)] shadow-[inset_0_1px_0_rgb(251_115_31/0.9),inset_0_-1px_0_rgb(251_115_31/0.9),0_14px_30px_-14px_rgb(15_36_71/0.8)]",
  light:
    "text-[var(--am-harbour)] bg-white shadow-[inset_0_1px_0_var(--am-line),inset_0_-1px_0_var(--am-line),0_14px_30px_-16px_rgb(15_36_71/0.45)]",
};

const ruleClass: Record<Tone, string> = {
  signal: "border-white/35",
  harbour: "border-white/12",
  light: "border-[var(--am-line)]",
};

const markColor: Record<Tone, string> = {
  signal: "#0f2447",
  harbour: "#fb731f",
  light: "#fb731f",
};

/** Four-point star separator. */
function Mark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5 shrink-0" aria-hidden="true">
      <path d="M6 0 7.3 4.7 12 6 7.3 7.3 6 12 4.7 7.3 0 6 4.7 4.7Z" fill={color} />
    </svg>
  );
}

/**
 * Premium ribbon ticker: gradient body, fine inner rules, a slow light sheen,
 * and small-caps tracking. Content is duplicated so the -50% loop is seamless.
 */
export default function TickerTape({
  items,
  tone = "signal",
  direction = "left",
  tilt = 0,
  speedSeconds = 40,
  className,
  label,
}: TickerTapeProps) {
  const run = [...items, ...items];

  return (
    <div
      role="marquee"
      aria-label={label ?? items.join(", ")}
      className={cn("am-marquee-host relative -ml-[2%] w-[104%] overflow-hidden", toneClass[tone], className)}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      {/* fine double rules */}
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 top-[3px] border-t", ruleClass[tone])} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 bottom-[3px] border-b", ruleClass[tone])} />
      {/* light sheen */}
      <span
        aria-hidden="true"
        className="am-tape-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.28),transparent)]"
      />

      <div
        aria-hidden="true"
        className={cn("relative flex w-max items-center py-2.5", direction === "left" ? "am-marquee" : "am-marquee-reverse")}
        style={{ "--am-marquee-speed": `${speedSeconds}s` } as React.CSSProperties}
      >
        {run.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center whitespace-nowrap">
            <span className="px-7 text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-xs">{item}</span>
            <Mark color={markColor[tone]} />
          </span>
        ))}
      </div>
    </div>
  );
}
