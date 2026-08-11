import { getDictionary } from "@/content";
import type { Locale } from "@/content/types";
import { fontVariables } from "@/lib/fonts";

interface DocumentShellProps {
  children: React.ReactNode;
  locale: Locale;
}

export function DocumentShell({ children, locale }: DocumentShellProps) {
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <a className="skip-link" href="#main-content">
          {dictionary.accessibility.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
