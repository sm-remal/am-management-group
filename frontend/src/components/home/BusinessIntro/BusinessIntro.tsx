import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Trophy } from "lucide-react";
import Construction from "../../../assets/images/cons_01.jpg";
import house from "../../../assets/images/house-1.png";
import HazardTape from "@/components/theme/HazardTape";

export default function BusinessIntro() {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="container-am grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        {/* Visual */}
        <div data-reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-lg sm:aspect-[5/6]">
            <Image
              src={Construction}
              alt="AM Management construction site"
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-[-6%] right-0 aspect-[4/3] w-[52%] overflow-hidden rounded-lg border-[6px] border-white shadow-[0_30px_60px_-25px_rgb(15_36_71/0.55)]">
            <Image
              src={house}
              alt="Completed residential development"
              fill
              sizes="(min-width: 1024px) 22vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute left-[-4%] top-10 overflow-hidden rounded-md bg-[var(--am-harbour)] text-white shadow-xl">
            <div className="px-5 py-4">
              <div className="font-display text-4xl">2012</div>
              <div className="mt-1 text-xs text-white/70">Incorporated in Melaka</div>
            </div>
            <HazardTape height={5} />
          </div>
        </div>

        {/* Copy */}
        <div data-reveal className="order-1 lg:order-2">
          <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="tape-hazard h-2 w-8 rounded-[1px]" />
            Who we are
          </div>
          <h2 className="text-2xl sm:text-[1.75rem] lg:text-[2.1rem] font-semibold leading-[1.15] text-[var(--am-harbour)]">
            Welcome to AM Management Group Sdn. Bhd.
          </h2>

          <p className="mt-7 text-lg leading-8 text-foreground/85">
            Established in 2012, AM Management Group is a dynamic and trusted
            Malaysian business conglomerate. With over a decade of operational
            excellence, we have built a solid foundation across Construction,
            Property Development, Facility Support, Agriculture, Retail, and
            Tourism services.
          </p>
          <p className="mt-5 leading-8 text-muted-foreground">
            Our commitment to quality, strategic execution, and long-term value
            creation drives every project we undertake, ensuring sustainable
            growth for our partners and communities.
          </p>

          <dl data-reveal-stagger className="mt-9 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {[
              { icon: Trophy, title: "10+ Years Experience", desc: "Delivering excellence since 2012." },
              { icon: ShieldCheck, title: "CIDB Registered", desc: "Compliant with highest industry standards." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-secondary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <dt className="font-bold text-[var(--am-harbour)]">{title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>

          <Link
            href="/about"
            className="group mt-9 inline-flex h-12 items-center gap-3 rounded-md bg-[var(--am-harbour)] pl-6 pr-5 text-sm font-bold text-white transition-colors hover:bg-primary"
          >
            Learn More About Us
            <ArrowRight className="size-4 text-secondary transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
