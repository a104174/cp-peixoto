import { DocumentShell } from "@/components/layout/document-shell";

import "../globals.css";

export default function PortugueseRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DocumentShell locale="pt-PT">{children}</DocumentShell>;
}
