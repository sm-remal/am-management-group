"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedGalleryImages } from "@/features/gallery/gallery.api";
import type { GalleryImageRecord } from "@/features/gallery/gallery.types";

interface CompanyGalleryProps {
  company: {
    name: string;
    slug: string;
  };
}

const CompanyGallery = ({ company }: CompanyGalleryProps) => {
  const [images, setImages] = useState<GalleryImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPublishedGalleryImages({
          companySlug: company.slug,
          limit: 12,
        });
        setImages(result.data?.galleryImages ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load gallery");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGallery();
  }, [company.slug]);

  return (
    <section className="bg-muted/30 py-10 sm:py-12 ">
      <div className="container-am">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Gallery
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
              Inside our work.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            A visual look at the work and activities of {company.name}.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-3 size-7 animate-spin text-primary" />
            <p className="text-sm">Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-10 text-center text-muted-foreground">
            No gallery images available for {company.name} yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <div className="relative h-[300px] sm:h-[350px]">
                  <Image
                    src={image.imageUrl}
                    alt={image.title || `${company.name} gallery`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="absolute bottom-5 left-5">
                    <span className="rounded-full bg-background/90 px-4 py-2 text-xs font-semibold text-foreground">
                      {image.title || image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyGallery;
