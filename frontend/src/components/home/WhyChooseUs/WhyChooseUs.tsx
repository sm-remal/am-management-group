import { Check } from "lucide-react";
import SectionHeader from "@/components/theme/SectionHeader";

const points = [
  {
    title: "Proven Track Record",
    desc: "10+ years of corporate stability executing multi-million RM contracts in Malaysia.",
  },
  {
    title: "Diversified Expertise",
    desc: "A single conglomerate providing end-to-end solutions across 6 key industries.",
  },
  {
    title: "Quality & Compliance",
    desc: "Fully CIDB registered with trusted partnerships alongside top Tier-1 developers.",
  },
  {
    title: "Structured Leadership",
    desc: "Guided by seasoned Directors and a strategic corporate executive board.",
  },
  {
    title: "Long-Term Vision",
    desc: "Deeply committed to client satisfaction, worker safety, and sustainable practices.",
  },
  {
    title: "Financial Stability",
    desc: "Strong financial foundation with consistent operational growth and capital strength.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-blueprint py-12 text-white lg:py-16">
      <div className="container-am">
        <SectionHeader
          tone="dark"
          kicker="Why partners work with us"
          title="Why Choose AM Management Group?"
        />

        <div data-reveal-stagger className="grid border-l border-t border-white/12 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="group relative border-b border-r border-white/12 p-7 transition-colors duration-300 hover:bg-white/[0.04] sm:p-9"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
              />
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <h3 className="mt-6 text-xl font-bold">{point.title}</h3>
              <p className="mt-3 leading-7 text-white/65">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
