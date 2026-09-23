import { Award, Rocket, Shield, Target } from "lucide-react";
import SectionHeader from "@/components/theme/SectionHeader";

const values = [
  {
    title: "Integrity",
    desc: "Uncompromising honesty, transparency, and high ethical standards in every transaction.",
    icon: Shield,
  },
  {
    title: "Excellence",
    desc: "Delivering top-tier quality, technical precision, and safety across all company operations.",
    icon: Target,
  },
  {
    title: "Reliability",
    desc: "Punctual project delivery, dependable service, and long-standing corporate trust.",
    icon: Award,
  },
  {
    title: "Sustainable Growth",
    desc: "Continuous innovation aimed at creating economic value and sustainable social impact.",
    icon: Rocket,
  },
];

export default function CorporateValues() {
  return (
    <section className="bg-[var(--am-steel)] py-12 lg:py-14">
      <div className="container-am">
        <SectionHeader kicker="What guides us" title="Our Core Values" />

        <div data-reveal-stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ title, desc, icon: Icon }) => (
            <article
              key={title}
              className="am-lift relative overflow-hidden rounded-lg bg-white p-7 shadow-[0_1px_0_rgb(15_36_71/0.06)]"
            >
              <Icon
                aria-hidden="true"
                className="absolute -right-5 -top-5 size-28 text-[var(--am-steel)]"
                strokeWidth={1.25}
              />
              <span className="relative flex size-12 items-center justify-center rounded-md bg-primary text-white">
                <Icon className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="relative mt-8 text-xl font-bold text-[var(--am-harbour)]">{title}</h3>
              <p className="relative mt-3 text-sm leading-7 text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
