import type { SiteDictionary } from "@/content/types";

interface FutureSectionAnchorsProps {
  dictionary: SiteDictionary;
}

export function FutureSectionAnchors({
  dictionary,
}: FutureSectionAnchorsProps) {
  const sections = [
    { id: "leistungen", title: dictionary.services.label },
    { id: "referenzen", title: dictionary.references.heading },
    { id: "ueber-uns", title: dictionary.trust.headingLines.join(" ") },
    { id: "kontakt", title: dictionary.contact.heading },
  ] as const;

  return (
    <div className="future-sections">
      {sections.map((section) => (
        <section
          className="future-section-anchor"
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          key={section.id}
        >
          <h2 className="screen-reader-only" id={`${section.id}-title`}>
            {section.title}
          </h2>
        </section>
      ))}
    </div>
  );
}
