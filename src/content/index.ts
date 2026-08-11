import { de } from "@/content/de";
import { pt } from "@/content/pt";
import type { Locale, SiteDictionary } from "@/content/types";

export const defaultLocale: Locale = "de-CH";

export const dictionaries = {
  "de-CH": de,
  "pt-PT": pt,
} satisfies Record<Locale, SiteDictionary>;

export function getDictionary(locale: Locale): SiteDictionary {
  return dictionaries[locale];
}
