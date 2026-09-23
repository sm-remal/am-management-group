import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import HazardTape from "@/components/theme/HazardTape";

export default function CareerCTA() {
  return (
    <section className="bg-white py-12 lg:py-14">
      <div className="container-am">
        <div data-reveal className="relative overflow-hidden rounded-lg bg-primary text-white">
          <HazardTape height={8} />
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-10 size-96 rounded-full border-[40px] border-white/[0.05]"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 p-8 sm:p-12 md:flex-row md:items-center lg:p-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                <Briefcase className="size-4 text-secondary" />
                Career Opportunities
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-[1.75rem]">
                Grow Your Career With Us
              </h2>
              <p className="mt-4 max-w-lg leading-7 text-white/75">
                We are constantly looking for talented professionals, skilled
                workers, and passionate leaders to join our growing business
                group.
              </p>
            </div>

            <Link
              href="/careers"
              className="group inline-flex h-13 shrink-0 items-center gap-2 rounded-md bg-secondary px-7 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[var(--am-signal-deep)]"
            >
              Explore Careers
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
