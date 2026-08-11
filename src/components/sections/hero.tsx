import Image from "next/image";

import { siteConfig } from "@/content/site";
import type { Locale, SiteDictionary } from "@/content/types";

interface HeroProps {
  content: SiteDictionary["hero"];
  locale: Locale;
}

export function Hero({ content, locale }: HeroProps) {
  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <div className="hero-media">
        <Image
          src={siteConfig.heroImage.src}
          alt={siteConfig.heroImage.alt[locale]}
          fill
          preload
          sizes="100vw"
          className="hero-image"
        />
      </div>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="site-container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1 className={`hero-title${locale === "pt-PT" ? " hero-title--pt" : ""}`} id="hero-title">
            {content.heading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero-description">{content.description}</p>
          <a className="button button-primary hero-cta" href="#kontakt">
            <span>{content.cta}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              width="20"
              height="20"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
