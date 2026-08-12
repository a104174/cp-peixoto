import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/content/site";
import type { Locale, SiteDictionary } from "@/content/types";

type SocialName = "instagram" | "facebook" | "whatsapp";

const socialLabels: Record<SocialName, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
};

function SocialIcon({ name }: { name: SocialName }) {
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.35" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M13.45 20.5v-7.15h2.4l.36-2.79h-2.76V8.78c0-.81.23-1.36 1.39-1.36h1.48V4.93c-.26-.04-1.13-.11-2.15-.11-2.13 0-3.59 1.3-3.59 3.68v2.06H8.17v2.79h2.41v7.15h2.87Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M19.35 4.58A10.3 10.3 0 0 0 12.03 1.5C6.34 1.5 1.71 6.13 1.71 11.82c0 1.81.47 3.58 1.37 5.14L1.65 22.5l5.68-1.49a10.3 10.3 0 0 0 4.7 1.13h.01c5.68 0 10.31-4.63 10.31-10.32 0-2.76-1.07-5.35-3-7.24Z"
      />
      <path
        d="M8.14 6.86c.2-.44.42-.45.78-.46h.65c.2 0 .4.08.5.39l.94 2.27c.08.2.05.4-.1.58l-.53.7c-.16.2-.2.38-.07.6.32.57.79 1.24 1.5 1.9.78.74 1.44 1.04 2.02 1.34.24.12.42.1.58-.09l.72-.86c.16-.2.34-.25.57-.16l2.17 1.02c.24.12.4.17.45.3.05.13.05.75-.18 1.47-.23.72-1.32 1.37-1.84 1.43-.48.06-1.08.09-1.75-.12-.4-.13-.91-.3-1.57-.59-.64-.28-1.72-.86-2.96-1.99-1.02-.93-1.71-2.08-1.91-2.43-.2-.35-.83-1.48-.83-2.82 0-1.34.69-1.99.94-2.48Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

interface SiteFooterProps {
  accessibility: SiteDictionary["accessibility"];
  content: SiteDictionary["footer"];
  homePath: SiteDictionary["path"];
  locale: Locale;
  navigation: SiteDictionary["header"]["navigation"];
}

const localeOptions = [
  { locale: "de-CH", label: "DE", path: "/" },
  { locale: "pt-PT", label: "PT", path: "/pt" },
] as const;

export function SiteFooter({
  accessibility,
  content,
  homePath,
  locale,
  navigation,
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Reveal as="footer" className="site-footer">
      <div className="site-container">
        <div className="site-footer-main">
          <a className="footer-brand" href={homePath}>
            <Image
              className="footer-brand-logo"
              src={siteConfig.brand.logoSrc}
              alt={siteConfig.brand.logoAlt}
              width={72}
              height={72}
            />
            <span className="footer-brand-lockup">
              <strong>PEIXOTO</strong>
              <span>{content.descriptor}</span>
            </span>
          </a>

          <div className="footer-right">
            <nav
              className="footer-navigation"
              aria-label={accessibility.mainNavigation}
            >
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href === "#start" ? homePath : item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="footer-socials" aria-label="Redes sociais">
              {(Object.keys(socialLabels) as SocialName[]).map((name) => {
                const href = siteConfig.socials[name];
                const label = socialLabels[name];

                return href ? (
                  <a
                    className="footer-social-link"
                    href={href}
                    key={name}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  >
                    <SocialIcon name={name} />
                  </a>
                ) : (
                  <span
                    className="footer-social-link footer-social-link--disabled"
                    key={name}
                    role="img"
                    aria-label={`${label} (indisponível)`}
                  >
                    <SocialIcon name={name} />
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <small>
            © {currentYear} {siteConfig.companyName}
          </small>
          <nav
            className="footer-languages"
            aria-label={accessibility.languageSwitcher}
          >
            {localeOptions.map((option, index) => (
              <span className="footer-language-option" key={option.locale}>
                {index > 0 ? (
                  <span className="footer-language-divider" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {option.locale === locale ? (
                  <span aria-current="page" className="footer-language-current">
                    {option.label}
                  </span>
                ) : (
                  <a
                    href={option.path}
                    hrefLang={option.locale}
                    lang={option.locale}
                  >
                    {option.label}
                  </a>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </Reveal>
  );
}
