import CompaniesSection from "@/components/companies/CompaniesSection";
import Banner from "@/components/home/Banner/Banner";
import BusinessIntro from "@/components/home/BusinessIntro/BusinessIntro";
import BusinessSectors from "@/components/home/BusinessSectors/BusinessSectors";
import CareerCTA from "@/components/home/CareerCTA/CareerCTA";
import CorporateValues from "@/components/home/CorporateValues/CorporateValues";
import FeaturedProjects from "@/components/home/FeaturedProjects/FeaturedProjects";
import Statistics from "@/components/home/Statistics/Statistics";
import WhyChooseUs from "@/components/home/WhyChooseUs/WhyChooseUs";
import { getPublishedProjects } from "@/features/projects/project.api";

/** Featured projects are fetched on the server so the grid renders without a loading state. */
const loadFeaturedProjects = async () => {
  try {
    const result = await getPublishedProjects({ limit: 12, featured: "true" });
    return result.data?.projects;
  } catch {
    return undefined; // component falls back to a client-side fetch
  }
};

export default async function Home() {
  const projects = await loadFeaturedProjects();

  return (
    <div>
      <Banner />
      <BusinessIntro />
      <Statistics />
      <CompaniesSection />
      <BusinessSectors />
      <WhyChooseUs />
      <FeaturedProjects initialProjects={projects} />
      <CorporateValues />
      <CareerCTA />
    </div>
  );
}
