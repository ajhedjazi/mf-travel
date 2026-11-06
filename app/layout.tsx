import type { Metadata } from "next";
import { siteUrl } from "./site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Airport Transfers Hull & Long-Distance Travel | MF Travel",
    template: "%s | MF Travel",
  },
  description: "Pre-booked airport transfers from Hull and East Riding to Manchester, Leeds Bradford, Humberside, East Midlands, Liverpool, Newcastle and Birmingham.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "MF Travel",
    title: "Airport Transfers Hull & Long-Distance Travel | MF Travel",
    url: "/",
    description: "Journeys that matter. Pre-booked airport transfers and long-distance travel from Hull and East Riding.",
    images: [{ url: "/mf-travel-airport-hero.webp", width: 1536, height: 1024, alt: "MF Travel airport transfer vehicles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Transfers Hull & Long-Distance Travel | MF Travel",
    description: "Journeys that matter. Pre-booked airport transfers and long-distance travel from Hull and East Riding.",
    images: ["/mf-travel-airport-hero.webp"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon-mf.svg", shortcut: "/favicon-mf.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
