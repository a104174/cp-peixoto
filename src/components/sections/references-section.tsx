import { Reveal } from "@/components/motion/reveal";
import { BeforeAfterComparison } from "@/components/sections/before-after-comparison";
import type { SiteDictionary } from "@/content/types";

interface ReferencesSectionProps {
  content: SiteDictionary["references"];
}

export function ReferencesSection({ content }: ReferencesSectionProps) {
  return (
    <section
      className="references-section"
      id="referenzen"
      aria-labelledby="references-title"
    >
      <div className="site-container references-layout">
        <Reveal as="div" className="references-copy motion-section-heading">
          <p className="eyebrow references-eyebrow">
            <span aria-hidden="true" />
            {content.label}
          </p>

          <h2 className="references-title" id="references-title">
            {content.heading}
          </h2>

          <p className="references-description">{content.description}</p>

          <ol className="references-process">
            {content.process.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <a className="references-cta" href="#galeria">
            <span>{content.cta}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </a>
        </Reveal>

        <div className="references-showcase">
          {content.projects.map((project, index) => (
            <BeforeAfterComparison
              afterLabel={content.after}
              beforeLabel={content.before}
              index={index}
              key={project.id}
              project={project}
              valueLabel={content.valueLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
