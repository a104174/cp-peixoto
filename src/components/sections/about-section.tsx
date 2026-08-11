import type { SiteDictionary } from "@/content/types";

interface AboutSectionProps {
  content: SiteDictionary["trust"];
}

interface BenefitItemProps {
  index: number;
  title: string;
}

function BenefitItem({ index, title }: BenefitItemProps) {
  return (
    <li className="about-benefit">
      <span className="about-benefit-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3>{title}</h3>
    </li>
  );
}

export function AboutSection({ content }: AboutSectionProps) {
  return (
    <section
      className="about-section"
      id="ueber-uns"
      aria-labelledby="about-title"
    >
      <div className="site-container">
        <div className="about-intro">
          <header className="about-heading-group">
            <p className="eyebrow about-eyebrow">
              <span aria-hidden="true" />
              {content.label}
            </p>

            <h2 className="about-title" id="about-title">
              {content.headingLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </header>

          <div className="about-description">
            {content.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <ol className="about-benefits">
          {content.benefits.map((benefit, index) => (
            <BenefitItem index={index} key={benefit} title={benefit} />
          ))}
        </ol>
      </div>
    </section>
  );
}
