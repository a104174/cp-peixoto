import { getDictionary } from "@/content";
import type { Locale } from "@/content/types";
import { SiteHeader } from "@/components/layout/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { FutureSectionAnchors } from "@/components/sections/future-section-anchors";
import { Hero } from "@/components/sections/hero";
import { ReferencesSection } from "@/components/sections/references-section";
import { ServicesSection } from "@/components/sections/services-section";

interface LandingPageProps {
  locale: Locale;
}

export function LandingPage({ locale }: LandingPageProps) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <SiteHeader
        accessibility={dictionary.accessibility}
        brandSubtitle={dictionary.hero.eyebrow}
        header={dictionary.header}
        locale={locale}
      />
      <main id="main-content">
        <Hero content={dictionary.hero} locale={locale} />
        <ServicesSection content={dictionary.services} />
        <ReferencesSection content={dictionary.references} />
        <AboutSection content={dictionary.trust} />
        <FutureSectionAnchors dictionary={dictionary} />
      </main>
    </>
  );
}
