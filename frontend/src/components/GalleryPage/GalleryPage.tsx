"use client";

import Image from "next/image";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AboutBanner from "../About/AboutBanner/AboutBanner";
import Pagination from "@/components/common/Pagination";
import { getPublishedGalleryImages } from "@/features/gallery/gallery.api";
import type { GalleryImageRecord } from "@/features/gallery/gallery.types";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImageRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [result, categoryResult] = await Promise.all([
          getPublishedGalleryImages({
            page,
            limit: 15,
            category: selectedCategory === "ALL" ? undefined : selectedCategory,
          }),
          page === 1
            ? getPublishedGalleryImages({ limit: 100 })
            : Promise.resolve(null),
        ]);
        setImages(result.data?.galleryImages ?? []);
        setMeta(result.data?.meta ?? { page, total: 0, totalPage: 1 });
        if (categoryResult?.data?.galleryImages) {
          setCategories(
            Array.from(
              new Set(
                categoryResult.data.galleryImages
                  .map((item) => item.category)
                  .filter(Boolean),
              ),
            ).sort(),
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load gallery");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, selectedCategory]);

  const filterCategories = useMemo(() => ["ALL", ...categories], [categories]);

  return (
    <div>
      <AboutBanner
        title="Project Gallery & Operations"
        description="A visual showcase of our structural craftsmanship, ongoing site operations, sub-contracting precision, and corporate growth across AM Management Group."
      />
      <section className="bg-background py-10 sm:py-12">
        <div className="container-am">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-2xl">
              Our Work In Pictures
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Explore published visuals from group operations and company
              activities.
            </p>
          </div>
          {filterCategories.length > 1 && (
            <div className="mb-10 overflow-x-auto pb-2">
              <div className="flex min-w-max justify-center gap-2.5 px-1">
                {filterCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 ${selectedCategory === category ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground hover:bg-muted"}`}
                  >
                    {category === "ALL" ? "All" : category}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="mb-3 size-8 animate-spin text-primary" />
              <p className="text-sm">Loading gallery...</p>
            </div>
          ) : error ? (
            <div className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
              No published gallery images found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <article
                    key={image.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.title || image.category}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <p className="line-clamp-2 text-base font-semibold text-white">
                        {image.title || image.category}
                      </p>
                      {image.company?.name && (
                        <p className="mt-1 text-xs text-white/80">
                          {image.company.name}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPage}
                total={meta.total}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
