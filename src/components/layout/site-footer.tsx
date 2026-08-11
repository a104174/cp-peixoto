import Image from "next/image";

import { siteConfig } from "@/content/site";
import type { Locale, SiteDictionary } from "@/content/types";

interface SiteFooterProps {
  accessibility: SiteDictionary["accessibility"];
  contactDetails: SiteDictionary["contact"]["details"];
  content: SiteDictionary["footer"];
  homePath: SiteDictionary["path"];
  locale: Locale;
  navigation: SiteDictionary["header"]["navigation"];
}

export function SiteFooter({
  accessibility,
  contactDetails,
  content,
  homePath,
  locale,
  navigation,
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
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

          <dl className="footer-contact">
            <div>
              <dt>{contactDetails.phone}</dt>
              <dd>
                <a href={siteConfig.phone.href}>
                  {siteConfig.phone.display}
                </a>
              </dd>
            </div>
            <div>
              <dt>{contactDetails.email}</dt>
              <dd>
                <a href={siteConfig.email.href}>
                  {siteConfig.email.display}
                </a>
              </dd>
            </div>
            <div>
              <dt>{contactDetails.region}</dt>
              <dd>{siteConfig.region[locale]}</dd>
            </div>
          </dl>
        </div>

        <div className="site-footer-bottom">
          <small>© {currentYear} {siteConfig.companyName}</small>
        </div>
      </div>
    </footer>
  );
}
