import type { Metadata } from "next";

import { siteConfig } from "@/content/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.siteName,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: "Website institucional em preparação para a CP Peixoto.",
  openGraph: {
    title: siteConfig.siteName,
    description: "Website institucional em preparação para a CP Peixoto.",
    siteName: siteConfig.siteName,
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
