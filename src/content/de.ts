import type { SiteDictionary } from "@/content/types";

export const de = {
  locale: "de-CH",
  path: "/",
  metadata: {
    title: "Bodenbeschichtungen & Abdichtungen in Aargau | CP Peixoto",
    description:
      "Professionelle Bodenbeschichtungen, Abdichtungen und dekorative Oberflächen für private, gewerbliche und industrielle Projekte in Aargau und Umgebung.",
  },
  accessibility: {
    skipToContent: "Zum Hauptinhalt springen",
    mainNavigation: "Hauptnavigation",
    languageSwitcher: "Sprache wählen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  header: {
    navigation: [
      { label: "Start", href: "#start" },
      { label: "Leistungen", href: "#leistungen" },
      { label: "Referenzen", href: "#referenzen" },
      { label: "Über uns", href: "#ueber-uns" },
      { label: "Kontakt", href: "#kontakt" },
    ],
    cta: "PROJEKT ANFRAGEN",
  },
  hero: {
    eyebrow: "BODENBESCHICHTUNGEN & ABDICHTUNGEN",
    heading: ["Qualität. Präzision.", "Langlebige Lösungen."],
    description:
      "Professionelle Bodenbeschichtungen, Abdichtungen und dekorative Oberflächen für private, gewerbliche und industrielle Projekte.",
    cta: "PROJEKT ANFRAGEN",
  },
  services: {
    label: "UNSERE LEISTUNGEN",
    heading: "DREI BEREICHE. EIN ANSPRUCH: PERFEKTION.",
    labels: {
      applications: "Einsatzbereiche",
      systems: "Systeme",
      finishes: "Oberflächen",
    },
    items: [
      {
        image: {
          src: "/images/services/bodenbeschichtungen.png",
          alt: "Hellgrau beschichteter Boden in einem Innenraum",
        },
        title: "BODENBESCHICHTUNGEN",
        tagline: "Stark. Widerstandsfähig. Langlebig.",
        description:
          "Hochwertige Bodenbeschichtungen für Flächen, die täglich hohen Anforderungen standhalten müssen.",
        applications: ["Garagen", "Keller", "Werkstätten", "Gewerbe", "Industrie", "Parkflächen"],
        systems: ["Epoxidharz", "PU", "PMMA", "Rutschhemmende Systeme"],
        cta: "MEHR ERFAHREN",
      },
      {
        image: {
          src: "/images/services/abdichtungen.png",
          alt: "Abgedichteter Bodenanschluss an einer Türschwelle",
        },
        title: "ABDICHTUNGEN",
        tagline: "Schutz, auf den Sie sich verlassen können.",
        description:
          "Nahtlose Abdichtungslösungen mit Flüssigkunststoff für dauerhaft beanspruchte Bereiche.",
        applications: ["Balkone", "Terrassen", "Treppen", "Anschlüsse", "Details", "Sanierungen"],
        systems: ["PMMA", "PU-Flüssigkunststoff"],
        cta: "MEHR ERFAHREN",
      },
      {
        image: {
          src: "/images/services/dekorative-boeden.png",
          alt: "Glänzender roter dekorativer Boden in einem Wohnraum",
        },
        title: "DEKORATIVE BÖDEN",
        tagline: "Funktion trifft Design.",
        description:
          "Fugenlose Oberflächen mit modernem Charakter – individuell abgestimmt auf Raum, Nutzung und gewünschte Optik.",
        applications: ["Wohnbereiche", "Garagen", "Büros", "Geschäfte", "Showrooms"],
        finishes: ["Farben", "Strukturen", "Flakes", "Individuelle Oberflächen"],
        cta: "MEHR ERFAHREN",
      },
    ],
  },
  references: {
    label: "AUS ALT WIRD NEU",
    heading: "AUS ALT WIRD NEU.",
    description: "Professionelle Sanierung bestehender Oberflächen.",
    before: "VORHER",
    after: "NACHHER",
    valueLabel: "Nachher sichtbar",
    process: [
      "Untergrundvorbereitung",
      "Grundierung",
      "Beschichtung",
      "Versiegelung",
    ],
    cta: "UNSERE PROJEKTE ANSEHEN",
    projects: [
      {
        id: "garage",
        title: "GARAGE",
        ariaLabel: "Vorher-Nachher-Vergleich der Garage",
        beforeImage: {
          src: "/images/references/garage-before.png",
          alt: "Garage vor der professionellen Bodenbeschichtung",
        },
        afterImage: {
          src: "/images/references/garage-after.png",
          alt: "Garage nach der professionellen Bodenbeschichtung",
        },
      },
      {
        id: "balcony",
        title: "BALKON",
        ariaLabel: "Vorher-Nachher-Vergleich des Balkons",
        beforeImage: {
          src: "/images/references/balcony-before.png",
          alt: "Balkon vor der professionellen Sanierung",
        },
        afterImage: {
          src: "/images/references/balcony-after.png",
          alt: "Balkon nach der professionellen Sanierung",
        },
      },
      {
        id: "industrial",
        title: "INDUSTRIEBODEN",
        ariaLabel: "Vorher-Nachher-Vergleich des Industriebodens",
        beforeImage: {
          src: "/images/references/industrial-before.png",
          alt: "Industrieboden vor der professionellen Beschichtung",
        },
        afterImage: {
          src: "/images/references/industrial-after.png",
          alt: "Industrieboden nach der professionellen Beschichtung",
        },
      },
    ],
  },
  trust: {
    label: "ÜBER UNS",
    headingLines: [
      "SAUBERE ARBEIT.",
      "PROFESSIONELLE AUSFÜHRUNG.",
      "LANGLEBIGE ERGEBNISSE.",
    ],
    description: [
      "Langjährige praktische Erfahrung mit professionellen Beschichtungs- und Flüssigkunststoffsystemen.",
      "Jedes Projekt beginnt mit einer sorgfältigen Beurteilung des Untergrunds und der Auswahl des passenden Systems.",
    ],
    benefits: [
      "PERSÖNLICHE BERATUNG",
      "SAUBERE AUSFÜHRUNG",
      "HOCHWERTIGE MATERIALIEN",
      "INDIVIDUELLE LÖSUNGEN",
    ],
  },
  contact: {
    label: "PROJEKT ANFRAGEN",
    headingLines: ["IHR PROJEKT.", "UNSERE LÖSUNG."],
    description: [
      "Sie möchten Ihre Garage beschichten, einen Balkon abdichten oder eine bestehende Fläche sanieren?",
      "Kontaktieren Sie uns. Wir prüfen Ihr Projekt und beraten Sie persönlich über die passende Lösung.",
    ],
    details: {
      phone: "Telefon",
      email: "E-Mail",
      region: "Region",
    },
    form: {
      labels: {
        name: "NAME",
        email: "E-MAIL",
        phone: "TELEFON",
        location: "ORT / REGION",
        service: "LEISTUNG",
        message: "NACHRICHT",
        optional: "OPTIONAL",
      },
      servicePlaceholder: "Leistung auswählen",
      services: [
        { value: "floor-coatings", label: "Bodenbeschichtungen" },
        { value: "waterproofing", label: "Abdichtungen" },
        { value: "decorative-floors", label: "Dekorative Böden" },
        { value: "other", label: "Andere Anfrage" },
      ],
      contactGuidance:
        "Bitte geben Sie mindestens eine E-Mail-Adresse oder Telefonnummer an.",
      submit: "UNVERBINDLICHE OFFERTE ANFRAGEN",
      submitting: "ANFRAGE WIRD GESENDET…",
      success: {
        heading: "VIELEN DANK.",
        message:
          "Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns so bald wie möglich bei Ihnen.",
      },
      error:
        "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
      validation: {
        required: "Dieses Feld ist erforderlich.",
        invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein.",
        contactRequired:
          "Bitte geben Sie mindestens eine E-Mail-Adresse oder Telefonnummer an.",
        tooLong: "Der eingegebene Wert ist zu lang.",
      },
    },
  },
  footer: {
    descriptor: "BODENBESCHICHTUNGEN & ABDICHTUNGEN",
  },
} satisfies SiteDictionary;
