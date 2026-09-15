import type { Metadata } from "next";

import "./backoffice.css";

export const metadata: Metadata = {
  title: {
    default: "Backoffice | CP Peixoto",
    template: "%s | Backoffice CP Peixoto",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function BackofficeRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body className="backoffice-body">{children}</body>
    </html>
  );
}

