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
    items: [
      {
        title: "BODENBESCHICHTUNGEN",
        tagline: "Stark. Widerstandsfähig. Langlebig.",
        description:
          "Hochwertige Bodenbeschichtungen für Flächen, die täglich hohen Anforderungen standhalten müssen.",
        applications: ["Garagen", "Keller", "Werkstätten", "Gewerbe", "Industrie", "Parkflächen"],
        systems: ["Epoxidharz", "PU", "PMMA", "Rutschhemmende Systeme"],
        cta: "MEHR ERFAHREN",
      },
      {
        title: "ABDICHTUNGEN",
        tagline: "Schutz, auf den Sie sich verlassen können.",
        description:
          "Nahtlose Abdichtungslösungen mit Flüssigkunststoff für dauerhaft beanspruchte Bereiche.",
        applications: ["Balkone", "Terrassen", "Treppen", "Anschlüsse", "Details", "Sanierungen"],
        systems: ["PMMA", "PU-Flüssigkunststoff"],
        cta: "MEHR ERFAHREN",
      },
      {
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
    heading: "AUS ALT WIRD NEU.",
    description: "Professionelle Sanierung bestehender Oberflächen.",
    before: "VORHER",
    after: "NACHHER",
    process: ["Untergrundvorbereitung", "Grundierung", "Beschichtung", "Versiegelung"],
    cta: "UNSERE PROJEKTE ANSEHEN",
  },
  trust: {
    headingLines: ["SAUBERE ARBEIT.", "PROFESSIONELLE AUSFÜHRUNG.", "LANGLEBIGE ERGEBNISSE."],
    description: [
      "Langjährige praktische Erfahrung mit professionellen Beschichtungs- und Flüssigkunststoffsystemen.",
      "Jedes Projekt beginnt mit einer sorgfältigen Beurteilung des Untergrunds und der Auswahl des passenden Systems.",
    ],
    benefits: ["Persönliche Beratung", "Saubere Ausführung", "Hochwertige Materialien", "Individuelle Lösungen"],
  },
  contact: {
    heading: "IHR PROJEKT. UNSERE LÖSUNG.",
    description: [
      "Sie möchten Ihre Garage beschichten, einen Balkon abdichten oder eine bestehende Fläche sanieren?",
      "Kontaktieren Sie uns. Wir prüfen Ihr Projekt und beraten Sie persönlich über die passende Lösung.",
    ],
    cta: "UNVERBINDLICHE OFFERTE ANFRAGEN",
  },
  footer: {
    descriptor: "BODENBESCHICHTUNGEN · ABDICHTUNGEN · DEKORATIVE BÖDEN",
    region: "Aargau & Umgebung",
  },
} satisfies SiteDictionary;
