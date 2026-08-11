export type Locale = "de-CH" | "pt-PT";

export type SectionAnchor =
  | "start"
  | "leistungen"
  | "referenzen"
  | "ueber-uns"
  | "kontakt";

export interface NavigationItem {
  label: string;
  href: `#${SectionAnchor}`;
}

export interface ServiceContent {
  image: {
    src:
      | "/images/services/bodenbeschichtungen.png"
      | "/images/services/abdichtungen.png"
      | "/images/services/dekorative-boeden.png";
    alt: string;
  };
  title: string;
  tagline: string;
  description: string;
  applications: readonly string[];
  systems?: readonly string[];
  finishes?: readonly string[];
  cta: string;
}

export interface SiteDictionary {
  locale: Locale;
  path: "/" | "/pt";
  metadata: { title: string; description: string };
  accessibility: {
    mainNavigation: string;
    languageSwitcher: string;
    openMenu: string;
    closeMenu: string;
  };
  header: {
    navigation: readonly NavigationItem[];
    cta: string;
  };
  hero: {
    eyebrow: string;
    heading: readonly [string, string];
    description: string;
    cta: string;
  };
  services: {
    label: string;
    heading: string;
    labels: {
      applications: string;
      systems: string;
      finishes: string;
    };
    items: readonly ServiceContent[];
  };
  references: {
    heading: string;
    description: string;
    before: string;
    after: string;
    process: readonly string[];
    cta: string;
  };
  trust: {
    headingLines: readonly [string, string, string];
    description: readonly [string, string];
    benefits: readonly string[];
  };
  contact: {
    heading: string;
    description: readonly [string, string];
    cta: string;
  };
  footer: {
    descriptor: string;
    region: string;
  };
}
