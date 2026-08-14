import type { MetadataRoute } from "next";

import { getAbsoluteUrl, hasPublicSiteUrl } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!hasPublicSiteUrl) {
    return [];
  }

  const localizedUrls = {
    "de-CH": getAbsoluteUrl("/"),
    "pt-PT": getAbsoluteUrl("/pt"),
  };
  const languageAlternates = {
    ...localizedUrls,
    "x-default": localizedUrls["de-CH"],
  };

  return [
    {
      url: localizedUrls["de-CH"],
      alternates: { languages: languageAlternates },
    },
    {
      url: localizedUrls["pt-PT"],
      alternates: { languages: languageAlternates },
    },
  ];
}
