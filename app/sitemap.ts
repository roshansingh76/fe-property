import type { MetadataRoute } from "next";
import { fetchProperties } from "@/lib/api/client";

const SITE = "https://paliaproperty.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/listings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    ...["privacy-policy", "terms-of-use", "disclaimer"].map(path => ({
      url: `${SITE}/${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  try {
    const properties = await fetchProperties();
    return [
      ...staticRoutes,
      ...properties.slice(0, 200).map(property => ({
        url: `${SITE}/property/${property.slug}`,
        lastModified: new Date(property.postedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
