import type { MetadataRoute } from "next";

import { localizedUrls } from "@/lib/metadata";

const languageAlternates = {
  "de-CH": localizedUrls["de-CH"],
  "pt-PT": localizedUrls["pt-PT"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: localizedUrls["de-CH"],
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: languageAlternates },
    },
    {
      url: localizedUrls["pt-PT"],
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: languageAlternates },
    },
  ];
}
