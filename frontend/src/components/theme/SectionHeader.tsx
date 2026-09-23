import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  action?: React.ReactNode;
};

/** Consistent section heading: short tape swatch + kicker, display title, intro copy. */
export default function SectionHeader({
  kicker,
  title,
  intro,
  align = "left",
  tone = "light",
  className,
  action,
}: SectionHeaderProps) {
  const dark = tone === "dark";

  return (
    <div
      data-reveal
      className={cn(
        "mb-8 flex flex-col gap-6 md:mb-10",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {kicker && (
          <div
            className={cn(
              "mb-4 flex items-center gap-3 text-sm font-semibold",
              align === "center" && "justify-center",
              dark ? "text-white/75" : "text-primary",
            )}
          >
            <span aria-hidden="true" className="tape-hazard h-2 w-8 rounded-[1px]" />
            {kicker}
          </div>
        )}
        <h2
          className={cn(
            "text-2xl sm:text-[1.75rem] lg:text-[2.1rem] font-semibold leading-[1.15]",
            dark ? "text-white" : "text-[var(--am-harbour)]",
          )}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8",
              align === "center" && "mx-auto",
              dark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
