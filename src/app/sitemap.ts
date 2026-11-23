import type { MetadataRoute } from "next";
import { getSiteUrl, SEO_LAST_MODIFIED } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
