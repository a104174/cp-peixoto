import type { Locale } from "@/content/types";
import { fontVariables } from "@/lib/fonts";

interface DocumentShellProps {
  children: React.ReactNode;
  locale: Locale;
}

export function DocumentShell({ children, locale }: DocumentShellProps) {
  return (
    <html lang={locale} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
