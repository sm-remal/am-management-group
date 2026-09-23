"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Loader2, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedNews, getPublishedNewsBySlug } from "@/features/news/news.api";
import type { NewsRecord } from "@/features/news/news.types";

interface NewsDetailPageProps {
  slug: string;
}

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function NewsDetailPage({ slug }: NewsDetailPageProps) {
  const [article, setArticle] = useState<NewsRecord | null>(null);
  const [related, setRelated] = useState<NewsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [detailResult, listResult] = await Promise.all([
          getPublishedNewsBySlug(slug),
          getPublishedNews({ limit: 6 }),
        ]);

        const current = detailResult.data?.news ?? null;
        setArticle(current);

        const others = (listResult.data?.news ?? []).filter((item) => item.slug !== slug).slice(0, 3);
        setRelated(others);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load news article");
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
        <Loader2 className="mb-3 size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto min-h-[50vh] px-4 py-12">
        <div className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p>{error || "News article not found."}</p>
            <Link href="/news" className="mt-3 inline-block font-semibold text-primary hover:underline">
              ← Back to all news
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-10 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-12">
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back to All News
          </Link>
        </div>

        <div className="space-y-4">
          {article.category && (
            <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
              {article.category}
            </span>
          )}

          <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 border-y border-border py-3 text-xs font-semibold text-muted-foreground">
            {article.author?.name && <span>By {article.author.name}</span>}
            {article.author?.name && <span>•</span>}
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>

        <div className="relative h-64 overflow-hidden rounded-xl bg-muted sm:h-96">
          {article.coverImage ? (
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <Newspaper className="size-16 opacity-40" />
            </div>
          )}
        </div>

        {article.excerpt && (
          <p className="text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
        )}

        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-base leading-8 text-foreground">
          {article.content}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Related news</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-40 bg-muted">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary">
                      <Newspaper className="size-8 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.publishedAt || item.createdAt)}
                  </p>
                  <h3 className="line-clamp-2 font-bold text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
