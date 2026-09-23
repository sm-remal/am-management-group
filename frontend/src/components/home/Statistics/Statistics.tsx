"use client";

import CountUp from "@/components/theme/CountUp";
import { useInView } from "@/components/theme/useInView";
import { cn } from "@/lib/utils";

const FOUNDED = 2012;

/**
 * Corporate figures as an infographic. The two RM figures share one
 * pictogram unit (one block = RM 100K) so they can be compared at a glance.
 */
export default function Statistics() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - FOUNDED + 1 }, (_, i) => FOUNDED + i);

  return (
    <section className="bg-[var(--am-steel)] py-12 lg:py-14" aria-labelledby="stats-title">
      <div className="container-am" ref={ref}>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id="stats-title" className="max-w-xl text-2xl font-semibold leading-[1.15] text-[var(--am-harbour)] sm:text-[1.75rem]">
            A decade of growth, in figures
          </h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block size-3 rounded-[2px] bg-secondary" />
            1 block = RM 100K
          </p>
        </div>

        <div data-reveal-stagger className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {/* Years */}
          <article className="bg-white p-7 sm:p-9">
            <Figure value={<CountUp to={10} suffix="+" />} label="Years of Corporate Excellence" desc="Est. 2012" />
            <div className="mt-8" aria-hidden="true">
              <div className="flex h-10 items-end gap-[3px]">
                {years.map((year, index) => (
                  <span
                    key={year}
                    className={cn(
                      "flex-1 origin-bottom rounded-t-[2px]",
                      index === years.length - 1 ? "bg-secondary" : "bg-primary",
                    )}
                    style={{
                      height: "100%",
                      transform: inView ? "scaleY(1)" : "scaleY(0)",
                      transition: `transform 0.6s cubic-bezier(.2,.8,.2,1) ${index * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{FOUNDED}</span>
                <span>{currentYear}</span>
              </div>
            </div>
          </article>

          {/* Sister concerns */}
          <article className="bg-white p-7 sm:p-9">
            <Figure value={<CountUp to={6} suffix="+" />} label="Sister Concerns & Divisions" desc="Diverse Business Portfolio" />
            <div className="mt-8 grid grid-cols-6 gap-2" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <span
                  key={index}
                  className="aspect-square rounded-md border-2 border-primary"
                  style={{
                    backgroundColor: inView ? "var(--am-navy)" : "transparent",
                    transition: `background-color 0.4s ease ${0.2 + index * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Holding company</span>
              <span>6 operating sectors</span>
            </div>
          </article>

          {/* Active project value */}
          <article className="bg-white p-7 sm:p-9">
            <Figure
              value={<CountUp to={2.66} decimals={2} prefix="RM " suffix="M" />}
              label="Documented Contract Value"
              desc="2 housing programmes, 2023–2026"
            />
            {/* RM 1,019,200 + RM 1,641,000 = RM 2,660,200 (company profile 2026) */}
            <ValueBars
              inView={inView}
              rows={[
                { label: "BRAT housing programme", note: "Completed 2025", value: 1019200, tone: "var(--am-navy)" },
                { label: "Housing & shop-office programme", note: "Ongoing", value: 1641000, tone: "var(--am-signal)" },
              ]}
            />
          </article>

          {/* Share capital */}
          <article className="bg-white p-7 sm:p-9">
            <Figure
              value={<CountUp to={500} prefix="RM " suffix="K" />}
              label="Issued Share Capital"
              desc="Solid Financial Foundation"
            />
            <Blocks count={5} inView={inView} />
          </article>
        </div>
      </div>
    </section>
  );
}

function Figure({
  value,
  label,
  desc,
}: {
  value: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h3 className="text-base font-bold text-[var(--am-harbour)]">{label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="font-display shrink-0 text-3xl text-primary sm:text-4xl">{value}</div>
    </div>
  );
}

function Blocks({
  count,
  inView,
  partial,
}: {
  count: number;
  inView: boolean;
  /** Fraction (0–1) of the last block that is filled, for non-round values. */
  partial?: number;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-[5px]" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="size-[18px] rounded-[2px] bg-secondary sm:size-5"
          style={{
            ...(partial && index === count - 1
              ? { background: `linear-gradient(90deg, var(--am-signal) ${partial * 100}%, rgb(251 115 31 / 0.2) 0)` }
              : null),
            opacity: inView ? 1 : 0.12,
            transform: inView ? "scale(1)" : "scale(0.7)",
            transition: `opacity 0.3s ease ${index * 0.025}s, transform 0.3s ease ${index * 0.025}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Animated horizontal bar chart (values in RM). Bars grow when scrolled into view. */
function ValueBars({
  rows,
  inView,
}: {
  rows: { label: string; note: string; value: number; tone: string }[];
  inView: boolean;
}) {
  const max = Math.max(...rows.map((row) => row.value));
  const rm = (value: number) => `RM ${(value / 1_000_000).toFixed(2)}M`;

  return (
    <figure className="mt-7 space-y-4" aria-label={rows.map((row) => `${row.label}: ${rm(row.value)}`).join("; ")}>
      {rows.map((row, index) => (
        <div key={row.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-[var(--am-harbour)]">
              {row.label} <span className="font-normal text-muted-foreground">· {row.note}</span>
            </span>
            <span className="font-display shrink-0 font-semibold text-[var(--am-harbour)]">{rm(row.value)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--am-steel)]">
            <div
              className="h-full origin-left rounded-full"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: row.tone,
                transform: inView ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 1.1s cubic-bezier(.2,.8,.2,1) ${0.2 + index * 0.25}s`,
              }}
            />
          </div>
        </div>
      ))}
    </figure>
  );
}
