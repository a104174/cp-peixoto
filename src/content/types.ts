import type { ContactFormValidationMessages, ContactServiceValue } from "@/types/contact";

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

export type ReferenceProjectId = "garage" | "balcony" | "industrial";

export type ReferenceImagePath =
  | "/images/references/garage-before.png"
  | "/images/references/garage-after.png"
  | "/images/references/balcony-before.png"
  | "/images/references/balcony-after.png"
  | "/images/references/industrial-before.png"
  | "/images/references/industrial-after.png";

export interface ReferenceImageContent {
  src: ReferenceImagePath;
  alt: string;
  objectPosition?: string;
}

export interface ReferenceProjectContent {
  id: ReferenceProjectId;
  title: string;
  ariaLabel: string;
  beforeImage: ReferenceImageContent;
  afterImage: ReferenceImageContent;
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
    label: string;
    heading: string;
    description: string;
    before: string;
    after: string;
    valueLabel: string;
    process: readonly string[];
    cta: string;
    projects: readonly [
      ReferenceProjectContent,
      ReferenceProjectContent,
      ReferenceProjectContent,
    ];
  };
  trust: {
    label: string;
    headingLines: readonly [string, string, string];
    description: readonly [string, string];
    benefits: readonly string[];
  };
  contact: {
    label: string;
    headingLines: readonly [string, string];
    description: readonly [string, string];
    details: {
      phone: string;
      email: string;
      region: string;
    };
    form: {
      labels: {
        name: string;
        email: string;
        phone: string;
        location: string;
        service: string;
        message: string;
        optional: string;
      };
      servicePlaceholder: string;
      services: readonly {
        value: ContactServiceValue;
        label: string;
      }[];
      contactGuidance: string;
      submit: string;
      submitting: string;
      success: { heading: string; message: string };
      error: string;
      validation: ContactFormValidationMessages;
    };
  };
  footer: {
    descriptor: string;
    region: string;
  };
}
