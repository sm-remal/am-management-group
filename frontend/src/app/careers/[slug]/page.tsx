import CareersJobDetails from "@/components/CareersPage/CareersJobDetails";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CareersJobPage({ params }: Props) {
  const { slug } = await params;

  return <CareersJobDetails slug={slug} />;
}


