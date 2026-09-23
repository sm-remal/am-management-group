"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Eye,
  Factory,
  HardHat,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

// import imgOurStory from "../../assets/images/About_r_img.png";
import imgCompanyLook from "../../assets/images/Main_Company.jpg";
import pantanl from "../../assets/images/Pantal.png";

/* =========================================================
   CORPORATE INTRODUCTION
========================================================= */

export function CompanyIntroduction() {
  const stats = [
    {
      value: "2012",
      label: "Year Incorporated",
    },
    {
      value: "10+",
      label: "Years of Industry Experience",
    },
    {
      value: "G5",
      label: "CIDB Contractor Grade",
    },
    {
      value: "RM 1.02M",
      label: "Completed Project Value",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        {/* Heading */}
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                About The Group
              </span>
            </div>

            <h2 className="max-w-4xl text-2xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Building a stronger foundation for{" "}
              <span className="text-primary">long-term growth.</span>
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              AM Management Group Sdn. Bhd. is a Malaysian-based company
              headquartered in Melaka, with experience spanning more than a
              decade. The company profile highlights capabilities across
              residential, commercial, industrial and infrastructure-related
              projects.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative px-7 py-8 lg:px-8 ${
                index !== stats.length - 1
                  ? "border-b border-border sm:border-r lg:border-b-0"
                  : ""
              }`}
            >
              <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   WHO WE ARE
========================================================= */

export function OurStory() {
  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 border-l border-t border-primary/40" />

            <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
              <Image
                src={imgCompanyLook}
                width={900}
                height={650}
                alt="AM Management Group"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
            </div>

            <div className="absolute -bottom-6 -right-4 hidden rounded-xl border border-border bg-background p-5 shadow-xl sm:block">
              <div className="text-3xl font-bold text-primary">2012</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Incorporated
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Who We Are
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
              Experience, discipline and a clear vision for the future.
            </h2>

            <div className="mt-7 space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                AM Management Group Sdn. Bhd. was incorporated on{" "}
                <strong className="text-foreground">27 November 2012</strong>.
                The company has developed its capabilities through experience in
                land, property and construction-related activities.
              </p>

              <p>
                Today, the company focuses on delivering reliable project
                execution while maintaining strong attention to quality, safety,
                cost efficiency and timely delivery.
              </p>

              <p>
                Based in{" "}
                <strong className="text-foreground">Melaka, Malaysia</strong>,
                AM Management Group continues to build long-term relationships
                with clients, partners and stakeholders.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Quality Focused",
                "Reliable Execution",
                "Safety Conscious",
                "Long-Term Growth",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
                >
                  <CheckCircle2 size={16} className="text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BUSINESS CAPABILITIES
========================================================= */

export function BusinessAreas() {
  const areas = [
    {
      number: "01",
      icon: Building2,
      title: "Residential Construction",
      description:
        "Construction and development activities covering residential properties and housing projects.",
    },
    {
      number: "02",
      icon: Landmark,
      title: "Commercial Development",
      description:
        "Experience in commercial developments including shop and office-related construction.",
    },
    {
      number: "03",
      icon: Factory,
      title: "Industrial Projects",
      description:
        "Capabilities supporting industrial and larger-scale built environment projects.",
    },
    {
      number: "04",
      icon: HardHat,
      title: "Civil & Infrastructure",
      description:
        "Construction-related works including civil engineering and infrastructure projects.",
    },
  ];

  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          {/* Section Intro */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Our Capabilities
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
              Built around capability.
              <br />
              Driven by results.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-muted-foreground">
              Our experience covers multiple areas of the built environment,
              allowing us to approach projects with practical knowledge and
              disciplined execution.
            </p>
          </div>

          {/* Areas */}
          <div className="divide-y divide-border border-y border-border">
            {areas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.number}
                  className="group grid gap-6 py-8 transition-all duration-300 md:grid-cols-[70px_1fr_60px] md:items-center"
                >
                  <span className="text-sm font-bold text-muted-foreground">
                    {area.number}
                  </span>

                  <div className="flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {area.title}
                      </h3>

                      <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
                        {area.description}
                      </p>
                    </div>
                  </div>

                  <div className="hidden justify-end md:flex">
                    <ArrowRight
                      size={20}
                      className="text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SELECTED PROJECT
========================================================= */

export function SelectedProject() {
  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Selected Project
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground sm:text-2xl lg:text-3xl">
              Delivering projects with purpose.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-muted-foreground">
            A completed residential development project recorded in the company
            profile.
          </p>
        </div>

        {/* Project */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* Visual placeholder */}
            <div className="relative min-h-[350px] overflow-hidden bg-muted lg:min-h-[500px]">
              <Image
                src={pantanl}
                width={1000}
                height={700}
                alt="Residential construction project"
                className="h-full w-full object-cover"
              />

              <div className="absolute left-6 top-6 rounded-full bg-background/95 px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground">
                Completed
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Residential Development
                </div>

                <h3 className="mt-5 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                  Pembangunan Perumahan Bina Rumah Atas Tanah
                </h3>

                <p className="mt-5 leading-7 text-muted-foreground">
                  A residential development project for Visi Lagenda Sdn Bhd,
                  completed according to the project information recorded in the
                  company profile.
                </p>
              </div>

              <div className="mt-10">
                <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-border py-7">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Project Value
                    </div>

                    <div className="mt-2 text-xl font-bold text-foreground">
                      RM 1,019,200
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location
                    </div>

                    <div className="mt-2 text-xl font-bold text-foreground">
                      Port Dickson
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Start
                    </div>

                    <div className="mt-2 text-base font-semibold text-foreground">
                      25 June 2023
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Completion
                    </div>

                    <div className="mt-2 text-base font-semibold text-foreground">
                      25 June 2025
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary">
                  <CheckCircle2 size={18} />
                  Project Status: Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CORPORATE JOURNEY
========================================================= */

export function CorporateTimeline() {
  const timeline = [
    {
      year: "2012",
      title: "Company Established",
      description:
        "AM Management Group's corporate history begins with incorporation on 27 November 2012.",
    },
    {
      year: "2012 — 2021",
      title: "Capability Development",
      description:
        "The company developed its experience through land, property, construction and related project activities.",
    },
    {
      year: "2021",
      title: "Corporate Rebranding",
      description:
        "The business was rebranded as AM Management Group Sdn. Bhd. in December 2021.",
    },
    {
      year: "Today",
      title: "Building for the Future",
      description:
        "The company continues to focus on reliable execution, quality delivery and sustainable long-term growth.",
    },
  ];

  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          {/* Intro */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Our Journey
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
              A journey shaped by experience.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-muted-foreground">
              From its establishment in 2012 to its current corporate identity,
              the organisation has continued to develop its capabilities and
              pursue sustainable growth.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[21px] top-3 bottom-3 w-px bg-border" />

            <div className="space-y-2">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className="relative grid gap-6 py-7 pl-12 md:grid-cols-[150px_1fr] md:pl-0"
                >
                  <div className="absolute left-3 top-9 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border-4 border-background bg-primary md:left-0" />

                  <div className="text-sm font-bold text-primary md:pl-10">
                    {item.year}
                  </div>

                  <div className="border-b border-border pb-7">
                    <h3 className="text-xl font-bold text-foreground">
                      {item.title}
                    </h3>

                    <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LEADERSHIP
========================================================= */

export function Leadership() {
  const leaders = [
    {
      name: "Rohaidah Binti Buang",
      title: "Director",
      featured: true,
    },
    {
      name: "Dato' Kulwant Singh A/L Sewa Singh",
      title: "Executive Director",
    },
    {
      name: "Nor Haryati Binti Zahain",
      title: "Chief Financial Officer",
    },
    {
      name: "Mohammad Jewel Islam Zoo",
      title: "Site Manager",
    },
    {
      name: "Nor Zakiah Binti Abu Bakar",
      title: "Administrative Executive",
    },
  ];

  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="mb-8 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Leadership
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            Experienced leadership behind every decision.
          </h2>

          <p className="mt-5 leading-7 text-muted-foreground">
            The company&apos;s management structure brings together leadership,
            financial management, site operations and administration.
          </p>
        </div>

        {/* Director */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-background">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[120px_1fr_auto]">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Users size={38} strokeWidth={1.5} />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Director
              </div>

              <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Rohaidah Binti Buang
              </h3>

              <p className="mt-2 text-muted-foreground">
                Corporate leadership and strategic direction
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="text-right text-sm text-muted-foreground">
                Executive
                <br />
                Leadership
              </div>
            </div>
          </div>
        </div>

        {/* Other Leaders */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {leaders.slice(1).map((leader) => (
            <div
              key={leader.name}
              className="group rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
                <Users size={19} />
              </div>

              <h3 className="mt-6 font-bold leading-snug text-foreground">
                {leader.name}
              </h3>

              <p className="mt-2 text-sm font-medium text-primary">
                {leader.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CORPORATE CREDENTIALS
========================================================= */

export function CorporateCredentials() {
  const credentials = [
    {
      icon: ShieldCheck,
      label: "CIDB Grade",
      value: "G5",
    },
    {
      icon: Award,
      label: "CIDB Registration",
      value: "0120220325-ML097519",
    },
    {
      icon: Building2,
      label: "Company Registration",
      value: "201201041345",
    },
    {
      icon: CalendarDays,
      label: "Certificate Valid Until",
      value: "21 June 2027",
    },
  ];

  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            {/* Left */}
            <div className="bg-primary p-8 text-primary-foreground sm:p-10 lg:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10">
                <ShieldCheck size={28} />
              </div>

              <div className="mt-8 text-xs font-bold uppercase tracking-[0.25em] opacity-80">
                Trust & Credentials
              </div>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-2xl">
                Registered.
                <br />
                Qualified.
                <br />
                Accountable.
              </h2>

              <p className="mt-6 max-w-md leading-7 opacity-80">
                AM Management Group&apos;s corporate profile records its CIDB
                registration, contractor grade and registration details.
              </p>
            </div>

            {/* Right */}
            <div className="grid sm:grid-cols-2">
              {credentials.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`p-7 sm:p-8 ${
                      index < 2 ? "border-b border-border" : ""
                    } ${index % 2 === 0 ? "sm:border-r sm:border-border" : ""}`}
                  >
                    <Icon size={22} className="text-primary" />

                    <div className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </div>

                    <div className="mt-2 break-words text-lg font-bold text-foreground">
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Specialisations */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-7 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                CIDB Specialisations
              </div>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                Registered categories
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {["B04", "CE21", "M15"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-background px-5 py-2 text-sm font-bold text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MISSION & VISION
========================================================= */

export function MissionVision() {
  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Mission */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-8 sm:p-10 lg:p-12">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Target size={26} />
              </div>

              <div className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Our Mission
              </div>

              <h3 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Deliver quality.
                <br />
                Create lasting value.
              </h3>

              <p className="mt-6 max-w-xl leading-8 text-muted-foreground">
                To deliver high-quality, reliable and cost-effective solutions
                while building lasting partnerships, adopting best practices and
                executing projects with excellence, safety and sustainability.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-8 sm:p-10 lg:p-12">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                <Eye size={26} />
              </div>

              <div className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Our Vision
              </div>

              <h3 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Grow responsibly.
                <br />
                Build for tomorrow.
              </h3>

              <p className="mt-6 max-w-xl leading-8 text-muted-foreground">
                To become a leading and trusted force in construction and
                related business activities by maintaining operational
                excellence, reliability, innovation and sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CORE VALUES
========================================================= */

export function CoreValues() {
  const values = [
    {
      number: "01",
      title: "Integrity",
      description:
        "Conducting business with honesty, transparency and accountability.",
    },
    {
      number: "02",
      title: "Excellence",
      description:
        "Maintaining high standards across projects, services and operations.",
    },
    {
      number: "03",
      title: "Reliability",
      description:
        "Building trust through consistent performance and responsible execution.",
    },
    {
      number: "04",
      title: "Innovation",
      description:
        "Adopting better practices and continuously improving how we work.",
    },
    {
      number: "05",
      title: "Sustainable Growth",
      description:
        "Creating long-term value while growing responsibly and sustainably.",
    },
  ];

  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          {/* Intro */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Our Values
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
              Principles that guide our work.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-muted-foreground">
              Strong businesses are built not only through projects, but through
              the principles that guide every decision.
            </p>
          </div>

          {/* Values */}
          <div className="border-t border-border">
            {values.map((value) => (
              <div
                key={value.number}
                className="group grid gap-5 border-b border-border py-7 md:grid-cols-[80px_200px_1fr] md:items-center"
              >
                <span className="text-sm font-bold text-primary">
                  {value.number}
                </span>

                <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {value.title}
                </h3>

                <p className="leading-7 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   WHY AM MANAGEMENT
========================================================= */

export function WhyUs() {
  const reasons = [
    {
      number: "01",
      title: "More Than a Decade of Experience",
      description:
        "Established in 2012, the company has developed its experience across construction and property-related activities.",
    },
    {
      number: "02",
      title: "Project-Based Expertise",
      description:
        "Experience covering residential, commercial, industrial and infrastructure-related projects.",
    },
    {
      number: "03",
      title: "G5 CIDB Registration",
      description:
        "The company profile records AM Management Group as a CIDB G5 contractor with registered specialisations.",
    },
    {
      number: "04",
      title: "Quality & Safety Focus",
      description:
        "The company's stated objectives emphasize quality, safety, sustainability and timely project delivery.",
    },
  ];

  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            Why AM Management
          </h2>

          <p className="mt-5 leading-7 text-muted-foreground">
            A practical approach to projects, partnerships and long-term
            corporate growth.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.number} className="bg-background p-8 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <span className="text-sm font-bold text-primary">
                  {reason.number}
                </span>

                <ArrowRight size={20} className="text-muted-foreground" />
              </div>

              <h3 className="mt-8 text-xl font-bold text-foreground sm:text-2xl">
                {reason.title}
              </h3>

              <p className="mt-3 max-w-lg leading-7 text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CTA
========================================================= */

export function CTA() {
  return (
    <section className="bg-secondary/5 py-12 text-black sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Let&apos;s Work Together
              </span>
            </div>

            <h2 className="max-w-3xl text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Let&apos;s build something that lasts.
            </h2>

            <p className="mt-6 max-w-2xl leading-7 ">
              Whether you are looking for a reliable construction partner,
              discussing a development opportunity or exploring a corporate
              collaboration, our team is ready to connect.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="tel:062836301"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:opacity-90"
            >
              <Phone size={18} />
              Contact Our Team
            </a>

            <a
              href="mailto:ammanagement2012@gmail.com"
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-background/20 px-6 py-3.5 text-sm font-bold  transition-all duration-300 hover:bg-background/10"
            >
              <Mail size={18} />
              Send an Email
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-10 grid gap-6 border-t border-background/15 pt-8 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin size={19} className="mt-0.5 shrink-0 text-primary" />

            <div>
              <div className="font-semibold ">Corporate Office</div>

              <p className="mt-1 leading-6 ">
                No 387-O/1 (1st Floor), Jalan Melor Utama,
                <br />
                Taman Peringgit Jaya, 75400 Melaka, Malaysia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone size={19} className="mt-0.5 shrink-0 text-primary" />

            <div>
              <div className="font-semibold ">Phone</div>

              <p className="mt-1 leading-6 ">
                016-8600084
                <br />
                016-6440084 / 06-2836301
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-0.5 shrink-0 text-primary" />

            <div>
              <div className="font-semibold ">Email</div>

              <p className="mt-1 leading-6 ">ammanagement2012@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FULL ABOUT CONTENT
========================================================= */

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-background">
      <CompanyIntroduction />

      <OurStory />

      <BusinessAreas />

      <SelectedProject />

      <CorporateTimeline />

      <Leadership />

      <CorporateCredentials />

      <MissionVision />

      <CoreValues />

      <WhyUs />

      <CTA />
    </div>
  );
}
