import { getDictionary } from "@/content";
import type { Locale } from "@/content/types";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
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
        <ContactSection content={dictionary.contact} locale={locale} />
      </main>
      <SiteFooter
        accessibility={dictionary.accessibility}
        contactDetails={dictionary.contact.details}
        content={dictionary.footer}
        homePath={dictionary.path}
        locale={locale}
        navigation={dictionary.header.navigation}
      />
    </>
  );
}
