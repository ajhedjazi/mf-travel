import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MF Travel | Airport Transfers & Pre-Booked Travel from Hull",
  description: "MF Travel provides pre-booked airport transfers and long-distance private-hire travel from Hull.",
  keywords: ["Hull airport transfers", "airport transfer Hull", "private hire Hull", "long distance taxi Hull", "MF Travel"],
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
