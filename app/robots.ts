import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/tarifs", "/suivi-sanitaire"],
        disallow: ["/dashboard/", "/admin/", "/technicien/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
