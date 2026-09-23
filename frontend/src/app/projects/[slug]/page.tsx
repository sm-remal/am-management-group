import ProjectDetailPage from "@/components/ProjectsPage/ProjectDetailPage/ProjectDetailPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div>
      <ProjectDetailPage params={resolvedParams} />
    </div>
  );
}
