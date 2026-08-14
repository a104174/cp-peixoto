import type { MetadataRoute } from "next";

import { getAbsoluteUrl, hasPublicSiteUrl } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  if (!hasPublicSiteUrl) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
  };
}
