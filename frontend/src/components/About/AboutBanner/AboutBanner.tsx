"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface AboutData {
  title: string;
  description: string;
  /** Optional small line above the title. */
  kicker?: string;
}

const labelFor = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Inner page banner (About, Companies, Services, Projects, News, Careers,
 * Gallery, Contact, legal pages). Calm, readable band: breadcrumb, title and
 * one line of description on navy, closed by a solid orange rule. No moving
 * parts, so the text is the only thing competing for attention.
 */
const AboutBanner: React.FC<AboutData> = ({ title, description, kicker }) => {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[var(--am-harbour)] text-white">
      {/* quiet texture + brand mark */}
      <div aria-hidden="true" className="bg-blueprint absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-1/2 hidden size-[26rem] -translate-y-1/2 rounded-full border-[36px] border-white/[0.04] lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute right-[12%] top-1/2 hidden size-40 -translate-y-1/2 rounded-full bg-secondary/20 blur-3xl lg:block"
      />

      <div className="container-am relative py-9 sm:py-10 lg:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/65">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const isLast = index === segments.length - 1;
              return (
                <li key={href} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3.5 text-secondary" />
                  {isLast ? (
                    <span aria-current="page" className="max-w-[16rem] truncate font-medium text-white">
                      {labelFor(segment)}
                    </span>
                  ) : (
                    <Link href={href} className="transition-colors hover:text-white">
                      {labelFor(segment)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {kicker && <p className="mt-5 text-sm font-semibold text-secondary">{kicker}</p>}

        <h1 className="font-display mt-4 max-w-3xl text-[1.6rem] sm:text-[2rem] lg:text-[2.35rem]">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/75 sm:text-[1.05rem]">
            {description}
          </p>
        )}
      </div>
      <div aria-hidden="true" className="h-1 bg-secondary" />
    </section>
  );
};

export default AboutBanner;
