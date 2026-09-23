import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

import projectImage from "@/assets/images/About_r_img.png";

interface CompanyProjectsProps {
  company: {
    name: string;
  };
}

const CompanyProjects = ({ company }: CompanyProjectsProps) => {
  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-primary" />

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Selected Projects
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            Work that speaks for itself.
          </h2>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[350px] overflow-hidden lg:min-h-[500px]">
              <Image
                src={projectImage}
                alt={`${company.name} project`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Featured Project
                </span>

                <h3 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
                  Project Showcase
                </h3>

                <p className="mt-5 leading-7 text-muted-foreground">
                  Explore selected work, project information and the
                  capabilities delivered by {company.name}.
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={17} className="text-primary" />
                  Malaysia
                </div>
              </div>

              <button className="mt-10 flex w-fit items-center gap-3 text-sm font-bold text-primary">
                View Project Details
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyProjects;
