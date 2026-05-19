import type { MetadataRoute } from "next";
import { BLOG_ARTICLES } from "@/lib/blog-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                priority: 1.0,  changeFrequency: "weekly" },
    { url: `${BASE}/tarifs`,          priority: 0.9,  changeFrequency: "monthly" },
    { url: `${BASE}/suivi-sanitaire`, priority: 0.9,  changeFrequency: "monthly" },
    { url: `${BASE}/blog`,            priority: 0.8,  changeFrequency: "weekly" },
    { url: `${BASE}/login`,           priority: 0.3,  changeFrequency: "yearly" },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...blogPages];
}
