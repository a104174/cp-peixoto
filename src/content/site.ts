import type { Locale } from "@/content/types";

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface SiteConfig {
  companyName: string;
  siteName: string;
  siteUrl: string;
  phone: { display: string; href: `tel:${string}` };
  email: { display: string; href: `mailto:${string}` };
  address: null;
  region: Record<Locale, string>;
  serviceArea: Record<Locale, string>;
  socialLinks: SocialLinks;
  brand: { logoSrc: string; logoAlt: string };
  heroImage: { src: string; alt: Record<Locale, string> } | null;
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig: SiteConfig = {
  companyName: "CP Peixoto",
  siteName: "CP Peixoto",
  // Reserved example domain until NEXT_PUBLIC_SITE_URL is configured.
  siteUrl: (configuredSiteUrl || "https://example.com").replace(/\/+$/, ""),
  phone: {
    display: "+41 77 218 85 37",
    href: "tel:+41772188537",
  },
  email: {
    display: "contactoxvstudio@gmail.com",
    href: "mailto:contactoxvstudio@gmail.com",
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
  socialLinks: {},
  brand: {
    logoSrc: "/brand/cp-peixoto-logo.png",
    logoAlt: "CP Peixoto",
  },
  // Replace this with a local /images/hero asset when the final image exists.
  heroImage: null,
};

export function getAbsoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
