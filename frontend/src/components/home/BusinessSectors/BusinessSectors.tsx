import Link from "next/link";
import {
  ArrowUpRight,
  HardHat,
  PlaneTakeoff,
  Sparkles,
  Store,
  Trees,
  Wrench,
} from "lucide-react";

const sectors = [
  {
    title: "Construction & Real Estate",
    desc: "Residential & Commercial Developments, Brickworks, Plastering, Skim Coat.",
    icon: HardHat,
  },
  {
    title: "Facility Support & Cleaning",
    desc: "Professional commercial cleaning, site maintenance, and facility management.",
    icon: Sparkles,
  },
  {
    title: "Machinery & Engineering",
    desc: "Industrial equipment solutions, machinery rental, and technical operations.",
    icon: Wrench,
  },
  {
    title: "Plantation & Agriculture",
    desc: "Sustainable plantation management, field workforce, and agricultural services.",
    icon: Trees,
  },
  {
    title: "Mini Market & Retail",
    desc: "Mini market retail and daily essential goods for local communities.",
    icon: Store,
  },
  {
    title: "Travel & Ticketing",
    desc: "Airline ticketing, corporate travel booking, and custom tourism packages.",
    icon: PlaneTakeoff,
  },
];

export default function BusinessSectors() {
  return (
    <section className="bg-[var(--am-steel)] py-12 lg:py-16" aria-labelledby="sectors-title">
      <div className="container-am grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="tape-hazard h-2 w-8 rounded-[1px]" />
            What we do
          </div>
          <h2 id="sectors-title" className="text-2xl sm:text-[1.75rem] lg:text-[2.1rem] font-semibold leading-[1.15] text-[var(--am-harbour)]">
            Business Sectors
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">
            Discover the key industries and core business sectors where AM
            Management Group operates to drive innovation and growth.
          </p>
          <Link
            href="/services"
            className="group mt-8 inline-flex items-center gap-2 border-b-2 border-secondary pb-1 text-sm font-bold text-[var(--am-harbour)]"
          >
            View all services
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul data-reveal-stagger className="border-t border-[var(--am-line)]">
          {sectors.map(({ title, desc, icon: Icon }) => (
            <li
              key={title}
              className="group grid grid-cols-[auto_1fr] items-start gap-5 border-b border-border py-7 sm:gap-8"
            >
              <span className="flex size-14 items-center justify-center rounded-md bg-white text-primary shadow-sm transition-colors duration-300 group-hover:bg-secondary group-hover:text-white">
                <Icon className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-xl font-bold text-[var(--am-harbour)]">{title}</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
