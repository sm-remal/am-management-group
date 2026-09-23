import { Mail, Phone } from "lucide-react";
import InquiryFormCard from "@/components/contact/InquiryFormCard";

interface CompanyCTAProps {
  company: {
    name: string;
  };
}

const CompanyCTA = ({ company }: CompanyCTAProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.07] via-background to-secondary/[0.10] py-12 text-foreground sm:py-14 lg:py-16">
      <div className="container-am">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Get In Touch
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Let&apos;s discuss your next opportunity.
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
              Interested in working with {company.name}? Send us your
              requirements and our team will get back to you.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Phone size={19} className="text-primary" />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Call Us
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    +60 XXX XXX XXXX
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Mail size={19} className="text-primary" />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    info@example.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          <InquiryFormCard
            defaultCompanyName={company.name}
            successCompanyName={company.name}
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyCTA;
