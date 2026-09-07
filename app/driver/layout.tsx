import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Hub",
  robots: { index: false, follow: false },
};

export default function DriverLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
