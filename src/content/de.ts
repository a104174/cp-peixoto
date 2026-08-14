import type { SiteDictionary } from "@/content/types";

export const de = {
  locale: "de-CH",
  path: "/",
  metadata: {
    title: "CP Peixoto",
    description:
      "Professionelle Bodenbeschichtungen, Abdichtungen und dekorative Böden für private, gewerbliche und industrielle Projekte in Aargau und Umgebung.",
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
    cta: "MEHR BEISPIELE ANSEHEN",
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
      {
        title: "PERSÖNLICHE BERATUNG",
        description:
          "Wir beurteilen jedes Projekt individuell und empfehlen das passende System für Untergrund, Nutzung und gewünschtes Ergebnis.",
      },
      {
        title: "15+ JAHRE ERFAHRUNG",
        description:
          "Über 15 Jahre praktische Erfahrung mit Bodenbeschichtungen und Abdichtungen – mit Präzision und Sorgfalt in jeder Arbeitsphase.",
      },
      {
        title: "HOCHWERTIGE MATERIALIEN",
        description:
          "Wir arbeiten mit professionellen Systemen und hochwertigen Materialien, ausgewählt für Widerstandsfähigkeit und langlebige Ergebnisse.",
      },
      {
        title: "INDIVIDUELLE LÖSUNGEN",
        description:
          "Jede Lösung wird individuell auf den Bereich und die Anforderungen des Kunden abgestimmt – von der Vorbereitung bis zum fertigen Ergebnis.",
      },
    ],
  },
  contact: {
    label: "PROJEKT ANFRAGEN",
    headingLines: ["IHR PROJEKT.", "UNSERE LÖSUNG."],
    description:
      "Kontaktieren Sie uns. Wir prüfen Ihr Projekt und beraten Sie persönlich über die passende Lösung.",
    whatsappCta: "DIREKT KONTAKTIEREN",
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
  gallery: {
    ariaLabel: "Projektgalerie",
    eyebrow: "UNSERE ARBEIT",
    heading: "GALERIE",
    items: [
      {
        src: "/images/gallery/imagem1.jpeg",
        label: "BODENBESCHICHTUNG",
        alt: "Heller beschichteter Boden in einem Innenraum",
      },
      {
        src: "/images/gallery/imagem2.jpeg",
        label: "INDUSTRIEBODEN",
        alt: "Orangefarbener Industrieboden in einer Halle",
      },
      {
        src: "/images/gallery/imagem3.jpeg",
        label: "BALKON",
        alt: "Heller Balkonboden mit Aussicht",
      },
      {
        src: "/images/gallery/imagem4.jpeg",
        label: "GARAGE",
        alt: "Grüner beschichteter Boden in einer Garage",
        objectPosition: "center 35%",
      },
      {
        src: "/images/gallery/imagem5.jpeg",
        label: "TERRASSE",
        alt: "Heller Terrassenboden mit Randabschluss",
        objectPosition: "center 32%",
      },
    ],
  },
  footer: {
    descriptor: "BODENBESCHICHTUNGEN & ABDICHTUNGEN",
  },
} satisfies SiteDictionary;
