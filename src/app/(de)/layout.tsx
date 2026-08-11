import { DocumentShell } from "@/components/layout/document-shell";

import "../globals.css";

export default function GermanRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DocumentShell locale="de-CH">{children}</DocumentShell>;
}
