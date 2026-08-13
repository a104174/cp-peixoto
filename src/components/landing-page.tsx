import { getDictionary } from "@/content";
import type { Locale } from "@/content/types";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { AccordionGallery } from "@/components/ui/accordion-gallery";
import { Hero } from "@/components/sections/hero";
import { ReferencesSection } from "@/components/sections/references-section";
import { ServicesSection } from "@/components/sections/services-section";

interface LandingPageProps {
  locale: Locale;
}

export function LandingPage({ locale }: LandingPageProps) {
  const dictionary = getDictionary(locale);
  const galleryItems = dictionary.gallery.items.map((item) => ({
    image: item.src,
    label: item.label,
    alt: item.alt,
    objectPosition: item.objectPosition,
  }));

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
        <section
          className="accordion-gallery-section"
          aria-labelledby="accordion-gallery-title"
        >
          <div className="site-container accordion-gallery-section__inner">
            <header className="accordion-gallery-header">
              <p className="eyebrow accordion-gallery-eyebrow">
                <span aria-hidden="true" />
                {dictionary.gallery.eyebrow}
              </p>
              <h2 className="accordion-gallery-title" id="accordion-gallery-title">
                {dictionary.gallery.heading}
              </h2>
            </header>
            <AccordionGallery
              items={galleryItems}
              ariaLabel={dictionary.gallery.ariaLabel}
              defaultIndex={0}
              expandRatio={0.4}
              trigger="hover"
              accentColor="var(--color-accent)"
              overlayColor="#080909"
              textColor="var(--color-foreground)"
              grayscale={false}
              radius={3}
              duration={0.6}
              ease="power3.out"
              parallax={0.25}
              tilt={3}
              gap={14}
              height={420}
            />
          </div>
        </section>
      </main>
      <SiteFooter
        accessibility={dictionary.accessibility}
        content={dictionary.footer}
        homePath={dictionary.path}
        locale={locale}
        navigation={dictionary.header.navigation}
      />
    </>
  );
}
