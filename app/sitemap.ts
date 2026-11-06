import type { MetadataRoute } from "next";
import { airportRoutes } from "./airport-transfers/route-data";
import { siteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
    },
    {
      url: `${siteUrl}/airport-transfers`,
    },
  ];

  return [
    ...staticPages,
    ...airportRoutes.map((route) => ({
      url: `${siteUrl}/airport-transfers/${route.slug}`,
    })),
  ];
}
