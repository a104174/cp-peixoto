import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { siteConfig } from "@/content/site";
import type { Locale, SiteDictionary } from "@/content/types";

interface ContactSectionProps {
  content: SiteDictionary["contact"];
  locale: Locale;
}

export function ContactSection({ content, locale }: ContactSectionProps) {
  return (
    <section
      className="contact-section"
      id="kontakt"
      aria-labelledby="contact-title"
    >
      <div className="site-container contact-layout">
        <Reveal
          as="div"
          className="contact-copy motion-section-heading motion-heading-lines"
        >
          <p className="eyebrow contact-eyebrow">
            <span aria-hidden="true" />
            {content.label}
          </p>

          <h2 className="contact-title" id="contact-title">
            {content.headingLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <div className="contact-description">
            {content.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="contact-details">
            <div>
              <dt>{content.details.phone}</dt>
              <dd>
                <a href={siteConfig.phone.href}>
                  {siteConfig.phone.display}
                </a>
              </dd>
            </div>
            <div>
              <dt>{content.details.email}</dt>
              <dd>
                <a href={siteConfig.email.href}>
                  {siteConfig.email.display}
                </a>
              </dd>
            </div>
            <div>
              <dt>{content.details.region}</dt>
              <dd>{siteConfig.region[locale]}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal as="div" className="contact-form-reveal" delay={120}>
          <ContactForm
            content={content.form}
            email={siteConfig.email}
            phone={siteConfig.phone}
          />
        </Reveal>
      </div>
    </section>
  );
}
