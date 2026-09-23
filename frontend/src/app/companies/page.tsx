import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import CompaniesSection from "@/components/companies/CompaniesSection";

export const metadata = { title: "Our Companies" };

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AboutBanner
        title="Companies built for long-term value."
        description="Explore the businesses and capabilities represented within the group."
      />

      <CompaniesSection />
    </div>
  );
}
