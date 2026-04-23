import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { LanguageSync } from "@/components/language-sync";
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
        <LanguageSync />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
