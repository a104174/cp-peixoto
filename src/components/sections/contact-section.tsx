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
            <p>{content.description}</p>
          </div>

          <a
            className="contact-whatsapp-cta"
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M19.35 4.58A10.3 10.3 0 0 0 12.03 1.5C6.34 1.5 1.71 6.13 1.71 11.82c0 1.81.47 3.58 1.37 5.14L1.65 22.5l5.68-1.49a10.3 10.3 0 0 0 4.7 1.13h.01c5.68 0 10.31-4.63 10.31-10.32 0-2.76-1.07-5.35-3-7.24Z" />
              <path
                d="M8.14 6.86c.2-.44.42-.45.78-.46h.65c.2 0 .4.08.5.39l.94 2.27c.08.2.05.4-.1.58l-.53.7c-.16.2-.2.38-.07.6.32.57.79 1.24 1.5 1.9.78.74 1.44 1.04 2.02 1.34.24.12.42.1.58-.09l.72-.86c.16-.2.34-.25.57-.16l2.17 1.02c.24.12.4.17.45.3.05.13.05.75-.18 1.47-.23.72-1.32 1.37-1.84 1.43-.48.06-1.08.09-1.75-.12-.4-.13-.91-.3-1.57-.59-.64-.28-1.72-.86-2.96-1.99-1.02-.93-1.71-2.08-1.91-2.43-.2-.35-.83-1.48-.83-2.82 0-1.34.69-1.99.94-2.48Z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            <span>{content.whatsappCta}</span>
          </a>

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
