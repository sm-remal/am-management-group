import NewsDetailPage from "@/components/NewsPage/NewsDetailPage/NewsDetailPage";
import React from "react";

interface NewsDetailsProps {
  params: Promise<{ slug: string }>;
}

const NewsDetails = async ({ params }: NewsDetailsProps) => {
  const { slug } = await params;

  return (
    <div>
      <NewsDetailPage slug={slug} />
    </div>
  );
};

export default NewsDetails;
