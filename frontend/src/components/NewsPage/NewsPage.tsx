"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Loader2, Newspaper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import { getPublishedNews } from "@/features/news/news.api";
import type { NewsRecord } from "@/features/news/news.types";

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPublishedNews({ limit: 100 });
        setNewsList(result.data?.news ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load news");
      } finally {
        setIsLoading(false);
      }
    };

    void loadNews();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    newsList.forEach((item) => {
      if (item.category?.trim()) set.add(item.category.trim());
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [newsList]);

  const filteredNews =
    selectedCategory === "All"
      ? newsList
      : newsList.filter((item) => item.category === selectedCategory);

  const featuredArticle = filteredNews[0] ?? null;
  const remainingArticles = filteredNews.slice(1);

  return (
    <div>
      <AboutBanner
        title="News & Press Releases"
        description="Stay updated with the latest project breakthroughs, operational updates, and corporate news from AM Management Group."
      />

      <div className="container mx-auto min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm">Loading news...</p>
          </div>
        ) : error ? (
          <div className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            No published news available yet.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {featuredArticle && (
              <section className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-12">
                <div className="relative min-h-[280px] bg-muted lg:col-span-7 lg:min-h-[420px]">
                  {featuredArticle.coverImage ? (
                    <Image
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary">
                      <Newspaper className="size-16 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between space-y-6 p-8 sm:p-10 lg:col-span-5">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {featuredArticle.category && (
                        <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                          {featuredArticle.category}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-2xl">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-sm leading-7 text-muted-foreground">
                      {featuredArticle.excerpt ||
                        featuredArticle.content.slice(0, 180) +
                          (featuredArticle.content.length > 180 ? "..." : "")}
                    </p>

                    {featuredArticle.author?.name && (
                      <p className="text-xs font-medium text-muted-foreground">
                        By {featuredArticle.author.name}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/news/${featuredArticle.slug}`}
                    className="inline-flex w-fit items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Read full story
                  </Link>
                </div>
              </section>
            )}

            {remainingArticles.length > 0 && (
              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingArticles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative h-48 bg-muted">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-primary">
                          <Newspaper className="size-10 opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.category && (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {item.category}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-lg font-bold text-foreground group-hover:text-primary">
                        {item.title}
                      </h3>

                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {item.excerpt || item.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {filteredNews.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                No news found for {selectedCategory}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
