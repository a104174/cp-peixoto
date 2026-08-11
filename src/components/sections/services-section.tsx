import Image from "next/image";

import type { ServiceContent, SiteDictionary } from "@/content/types";

interface ServicesSectionProps {
  content: SiteDictionary["services"];
}

interface ServiceCardProps {
  labels: SiteDictionary["services"]["labels"];
  service: ServiceContent;
}

function DetailLine({ items }: { items: readonly string[] }) {
  return (
    <span className="service-detail-items">
      {items.map((item) => (
        <span className="service-detail-item" key={item}>
          {item}
        </span>
      ))}
    </span>
  );
}

function ServiceCard({ labels, service }: ServiceCardProps) {
  const secondary = service.systems
    ? { label: labels.systems, items: service.systems }
    : { label: labels.finishes, items: service.finishes ?? [] };

  return (
    <article className="service-card">
      <div className="service-card-media">
        <Image
          className="service-card-image"
          src={service.image.src}
          alt={service.image.alt}
          fill
          sizes="(max-width: 42rem) calc(100vw - 2.3rem), (max-width: 68.75rem) calc(50vw - 3rem), 27rem"
        />
      </div>

      <div className="service-card-content">
        <div>
          <h3 className="service-card-title">{service.title}</h3>
          <p className="service-card-tagline">{service.tagline}</p>
          <p className="service-card-description">{service.description}</p>
        </div>

        <dl className="service-card-details">
          <div>
            <dt>{labels.applications}</dt>
            <dd>
              <DetailLine items={service.applications} />
            </dd>
          </div>
          <div>
            <dt>{secondary.label}</dt>
            <dd>
              <DetailLine items={secondary.items} />
            </dd>
          </div>
        </dl>

        <a
          className="service-card-cta"
          href="#kontakt"
          aria-label={`${service.cta}: ${service.title}`}
        >
          <span>{service.cta}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
            <path d="M4 10h11M11 6l4 4-4 4" />
          </svg>
        </a>
      </div>
    </article>
  );
}

export function ServicesSection({ content }: ServicesSectionProps) {
  return (
    <section
      className="services-section"
      id="leistungen"
      aria-labelledby="services-title"
    >
      <div className="site-container">
        <header className="services-header">
          <p className="eyebrow services-eyebrow">
            <span aria-hidden="true" />
            {content.label}
          </p>
          <h2 className="services-title" id="services-title">
            {content.heading}
          </h2>
        </header>

        <div className="services-grid">
          {content.items.map((service) => (
            <ServiceCard
              key={service.title}
              labels={content.labels}
              service={service}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
