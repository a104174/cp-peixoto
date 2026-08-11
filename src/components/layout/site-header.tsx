"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { siteConfig } from "@/content/site";
import type { Locale, SiteDictionary } from "@/content/types";

interface SiteHeaderProps {
  accessibility: SiteDictionary["accessibility"];
  brandSubtitle: string;
  header: SiteDictionary["header"];
  locale: Locale;
}

const localeOptions = [
  { locale: "de-CH", label: "DE", path: "/" },
  { locale: "pt-PT", label: "PT", path: "/pt" },
] as const;

function preserveCurrentSection(
  event: ReactMouseEvent<HTMLAnchorElement>,
  path: string,
  navigate: (href: string) => void,
) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  navigate(`${path}${window.location.hash}`);
}

export function SiteHeader({
  accessibility,
  brandSubtitle,
  header,
  locale,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const router = useRouter();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="site-header" data-menu-open={menuOpen}>
      <div className="site-container header-inner">
        <a
          className="brand-link"
          href="#start"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            className="brand-logo"
            src={siteConfig.brand.logoSrc}
            alt={siteConfig.brand.logoAlt}
            width={58}
            height={58}
            priority
          />
          <span className="brand-lockup" aria-hidden="true">
            <strong className="brand-name">Peixoto</strong>
            <span className="brand-tagline">{brandSubtitle}</span>
          </span>
        </a>

        <nav
          id={menuId}
          className="site-navigation"
          aria-label={accessibility.mainNavigation}
          data-open={menuOpen}
        >
          <ul className="navigation-list">
            {header.navigation.map((item) => (
              <li key={item.href}>
                <a
                  className="navigation-link"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="button button-primary mobile-menu-cta"
            href="#kontakt"
            onClick={() => setMenuOpen(false)}
          >
            {header.cta}
          </a>
        </nav>

        <div className="header-actions">
          <nav
            className="language-switcher"
            aria-label={accessibility.languageSwitcher}
          >
            {localeOptions.map((option, index) => (
              <span className="language-option" key={option.locale}>
                {index > 0 ? (
                  <span className="language-divider" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {option.locale === locale ? (
                  <span aria-current="page" className="language-current">
                    {option.label}
                  </span>
                ) : (
                  <a
                    href={option.path}
                    hrefLang={option.locale}
                    lang={option.locale}
                    onClick={(event) =>
                      preserveCurrentSection(event, option.path, router.push)
                    }
                  >
                    {option.label}
                  </a>
                )}
              </span>
            ))}
          </nav>

          <a className="button button-primary header-cta" href="#kontakt">
            {header.cta}
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-controls={menuId}
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? accessibility.closeMenu : accessibility.openMenu
            }
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
