import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import CompanyServices from "@/components/companies/CompanyServices";
import CompanyProjects from "@/components/companies/CompanyProjects";
import CompanyGallery from "@/components/companies/CompanyGallery";
import CompanyCTA from "@/components/companies/CompanyCTA";
import CompanyBanner from "@/components/companies/CompanyBanner/CompanyBanner";
import CompanyCareersSection from "@/components/companies/CompanyCareersSection";
import { getPublishedCompanyBySlug } from "@/features/companies/company.api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  let company;

  try {
    const result = await getPublishedCompanyBySlug(slug);
    company = result.data?.company;
  } catch {
    notFound();
  }

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* =====================================================
          COMPANY HERO
      ===================================================== */}
      <CompanyBanner company={company}></CompanyBanner>

      {/* =====================================================
          COMPANY OVERVIEW
      ===================================================== */}
      <section className="border-b border-border bg-background py-12 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-primary" />

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  Company Overview
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
                Focused on delivering value through expertise.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-muted-foreground">
                {company.shortDescription}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Professional approach",
                  "Quality-focused execution",
                  "Reliable service",
                  "Long-term relationships",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <CheckCircle2 size={19} className="shrink-0 text-primary" />

                    <span className="text-sm font-semibold text-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}
      <div id="services">
        <CompanyServices company={company} />
      </div>

      {/* =====================================================
          PROJECTS
      ===================================================== */}
      <CompanyProjects company={company} />

      {/* =====================================================
          GALLERY
      ===================================================== */}
      <CompanyGallery company={company} />

      {/* =====================================================
          CAREERS
      ===================================================== */}
      <CompanyCareersSection company={company} />

      {/* =====================================================
          CTA
      ===================================================== */}
      <div id="contact">
        <CompanyCTA company={company} />
      </div>
    </div>
  );
}
