import type { MetadataRoute } from "next";
import { airportRoutes } from "./airport-transfers/route-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mftravel.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/airport-transfers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  return [
    ...staticPages,
    ...airportRoutes.map((route) => ({
      url: `${siteUrl}/airport-transfers/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
