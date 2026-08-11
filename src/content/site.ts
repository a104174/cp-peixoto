export interface NavigationItem {
  label: string;
  href: string;
}

export interface ServiceSummary {
  id: string;
  title: string;
  description: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface SiteConfig {
  companyName: string;
  siteName: string;
  siteUrl: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  region: string | null;
  socialLinks: SocialLinks;
  navigation: NavigationItem[];
  services: ServiceSummary[];
  benefits: Benefit[];
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  companyName: "CP Peixoto",
  siteName: "CP Peixoto",
  // Reserved example domain until the real public domain is defined.
  siteUrl: configuredSiteUrl || "https://example.com",
  phone: null,
  email: null,
  address: null,
  region: null,
  socialLinks: {},
  navigation: [
    { label: "Serviços", href: "#servicos" },
    { label: "Antes / Depois", href: "#referencias" },
    { label: "Benefícios", href: "#beneficios" },
    { label: "Orçamento", href: "#orcamento" },
    { label: "Contactos", href: "#contactos" },
  ],
  // Business details are intentionally empty until they are confirmed.
  services: [],
  benefits: [],
} satisfies SiteConfig;
