import type { Locale } from "@/content/types";

export interface SiteConfig {
  companyName: string;
  siteName: string;
  siteUrl: string;
  phone: { display: string; href: `tel:${string}` };
  email: { display: string; href: `mailto:${string}` };
  socials: {
    instagram: string | null;
    facebook: string | null;
    whatsapp: string;
  };
  address: null;
  region: Record<Locale, string>;
  serviceArea: Record<Locale, string>;
  brand: { logoSrc: string; logoAlt: string };
  heroImage: { src: string; alt: Record<Locale, string> };
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const localSiteUrl = "http://localhost:3000";

if (process.env.NETLIFY && !configuredSiteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be configured for Netlify builds");
}

export const siteConfig: SiteConfig = {
  companyName: "CP Peixoto",
  siteName: "CP Peixoto",
  // Local fallback only; Netlify builds require NEXT_PUBLIC_SITE_URL.
  siteUrl: (configuredSiteUrl || localSiteUrl).replace(/\/+$/, ""),
  phone: {
    display: "+41 77 218 85 37",
    href: "tel:+41772188537",
  },
  email: {
    display: "contactoxvstudio@gmail.com",
    href: "mailto:contactoxvstudio@gmail.com",
  },
  socials: {
    instagram: null,
    facebook: null,
    whatsapp: "https://wa.me/41772188537",
  },
  address: null,
  region: {
    "de-CH": "Aargau & Umgebung",
    "pt-PT": "Aargau e região",
  },
  serviceArea: {
    "de-CH": "Schweiz",
    "pt-PT": "Suíça",
  },
  brand: {
    logoSrc: "/brand/cp-peixoto-logo.png",
    logoAlt: "CP Peixoto",
  },
  heroImage: {
    src: "/images/hero.jpeg",
    alt: {
      "de-CH": "Beschichtete Böden in einem Wohnraum und einer Industriehalle",
      "pt-PT": "Pavimentos revestidos numa habitação e num espaço industrial",
    },
  },
};

export function getAbsoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
