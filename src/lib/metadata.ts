import type { Metadata } from "next";

import { getDictionary } from "@/content";
import { hasPublicSiteUrl, siteConfig } from "@/content/site";
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
    metadataBase: hasPublicSiteUrl ? new URL(siteConfig.siteUrl) : undefined,
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    icons: {
      icon: siteConfig.brand.logoSrc,
    },
    robots: hasPublicSiteUrl
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: hasPublicSiteUrl
      ? {
          canonical: dictionary.path,
          languages: languageAlternates,
        }
      : undefined,
    openGraph: {
      type: "website",
      url: hasPublicSiteUrl ? dictionary.path : undefined,
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
