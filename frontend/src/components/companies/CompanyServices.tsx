"use client";

import { ArrowUpRight, BriefcaseBusiness, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedServices } from "@/features/services/service.api";
import type { ServiceRecord } from "@/features/services/service.types";

interface CompanyServicesProps {
  company: {
    name: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
  };
}

const CompanyServices = ({ company }: CompanyServicesProps) => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPublishedServices({
          companySlug: company.slug,
          limit: 50,
        });
        setServices(result.data?.services ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load services",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadServices();
  }, [company.slug]);

  return (
    <section className="bg-muted/30 py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Services
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
              What we do
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Explore the key capabilities and services associated with{" "}
            {company.name}.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-3 size-7 animate-spin text-primary" />
            <p className="text-sm">Loading services...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-10 text-center text-muted-foreground">
            No published services available for {company.name} yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                    {service.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BriefcaseBusiness size={20} />
                    )}
                  </div>

                  <span className="text-xs font-bold text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold text-foreground">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {service.description ||
                    `Professional service offering from ${company.name}.`}
                </p>

                {/* <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary">
                  Learn More
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyServices;
