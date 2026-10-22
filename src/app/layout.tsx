import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageMotion } from "@/components/motion/PageMotion";
import { company } from "@/content/company";
import { allowIndexing, siteUrl } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
// Variable Archivo with the width axis, used semi-expanded for display type.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], display: "swap", axes: ["wdth"] });

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Siccotel — Smartphone Distribution, Manufacturing & Retail in Pakistan",
    template: "%s | Siccotel",
  },
  description: company.shortDescription,
  applicationName: "Siccotel",
  // Keep demos and staging out of search results until launch is approved.
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PK" className={`${inter.variable} ${archivo.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Suspense fallback={<div className="h-[var(--header-h)]" />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Suspense fallback={null}>
          <SmoothScroll />
          <PageMotion />
        </Suspense>
      </body>
    </html>
  );
}
