import type { Metadata } from "next";

import { getDictionary } from "@/content";
import { getAbsoluteUrl, siteConfig } from "@/content/site";
import type { Locale } from "@/content/types";

const languageAlternates = {
  "de-CH": "/",
  "pt-PT": "/pt",
  "x-default": "/",
};

export function createLocalizedMetadata(locale: Locale): Metadata {
  const dictionary = getDictionary(locale);
  const alternateLocale = locale === "de-CH" ? "pt_PT" : "de_CH";

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    icons: {
      icon: siteConfig.brand.logoSrc,
    },
    alternates: {
      canonical: dictionary.path,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      url: dictionary.path,
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      siteName: siteConfig.siteName,
      locale: locale.replace("-", "_"),
      alternateLocale: [alternateLocale],
    },
    other: {
      "content-language": locale,
    },
  };
}

export const localizedUrls = {
  "de-CH": getAbsoluteUrl("/"),
  "pt-PT": getAbsoluteUrl("/pt"),
} satisfies Record<Locale, string>;
