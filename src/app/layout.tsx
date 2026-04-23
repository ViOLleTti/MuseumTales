import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { LanguageSync } from "@/components/language-sync";
import { PersistentScanLayer } from "@/components/scan/persistent-scan-layer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crossroads of Twenty Years · Story Reconstruction",
  description: "An interactive museum narrative prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Script src="/vendor/aframe.min.js" strategy="afterInteractive" />
        <Script src="/vendor/mindar-image-aframe.prod.js" strategy="afterInteractive" />
        <LanguageSync />
        {children}
        <PersistentScanLayer />
        <Analytics />
      </body>
    </html>
  );
}
