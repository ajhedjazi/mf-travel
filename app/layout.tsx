import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mftravel.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MF Travel | Airport Transfers from Hull",
    template: "%s | MF Travel Hull",
  },
  description: "Pre-booked airport transfers from Hull and East Riding to Manchester, Leeds Bradford, Humberside, East Midlands, Liverpool, Newcastle and Birmingham.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "MF Travel",
    title: "MF Travel | Airport Transfers from Hull",
    description: "Journeys that matter. Pre-booked airport transfers and long-distance travel from Hull and East Riding.",
    images: [{ url: "/mf-travel-airport-hero.webp", width: 1536, height: 1024, alt: "MF Travel airport transfer vehicles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MF Travel | Airport Transfers from Hull",
    description: "Journeys that matter. Pre-booked airport transfers and long-distance travel from Hull and East Riding.",
    images: ["/mf-travel-airport-hero.webp"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
