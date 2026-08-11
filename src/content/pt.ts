import type { SiteDictionary } from "@/content/types";

export const pt = {
  locale: "pt-PT",
  path: "/pt",
  metadata: {
    title: "Revestimentos e impermeabilizações em Aargau | CP Peixoto",
    description:
      "Revestimentos profissionais, impermeabilizações e superfícies decorativas para projetos particulares, comerciais e industriais em Aargau e região.",
  },
  accessibility: {
    mainNavigation: "Navegação principal",
    languageSwitcher: "Selecionar idioma",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },
  header: {
    navigation: [
      { label: "Início", href: "#start" },
      { label: "Serviços", href: "#leistungen" },
      { label: "Referências", href: "#referenzen" },
      { label: "Sobre nós", href: "#ueber-uns" },
      { label: "Contacto", href: "#kontakt" },
    ],
    cta: "PEDIR ORÇAMENTO",
  },
  hero: {
    eyebrow: "REVESTIMENTOS & IMPERMEABILIZAÇÕES",
    heading: ["Qualidade. Precisão.", "Soluções duradouras."],
    description:
      "Revestimentos profissionais, impermeabilizações e superfícies decorativas para projetos particulares, comerciais e industriais.",
    cta: "PEDIR ORÇAMENTO",
  },
  services: {
    label: "OS NOSSOS SERVIÇOS",
    heading: "TRÊS ÁREAS. UMA MISSÃO: PERFEIÇÃO.",
    labels: {
      applications: "Aplicações",
      systems: "Sistemas",
      finishes: "Acabamentos",
    },
    items: [
      {
        image: {
          src: "/images/services/bodenbeschichtungen.png",
          alt: "Pavimento cinzento-claro revestido num espaço interior",
        },
        title: "REVESTIMENTOS DE PAVIMENTOS",
        tagline: "Resistentes. Robustos. Duradouros.",
        description:
          "Revestimentos de elevada qualidade para pavimentos sujeitos às exigências do dia a dia.",
        applications: ["Garagens", "Caves", "Oficinas", "Comércio", "Indústria", "Estacionamentos"],
        systems: ["Epóxi", "PU", "PMMA", "Sistemas antiderrapantes"],
        cta: "SABER MAIS",
      },
      {
        image: {
          src: "/images/services/abdichtungen.png",
          alt: "Ligação de pavimento impermeabilizada junto a uma porta",
        },
        title: "IMPERMEABILIZAÇÕES",
        tagline: "Proteção em que pode confiar.",
        description:
          "Soluções contínuas de impermeabilização com resinas líquidas para áreas permanentemente expostas à água, humidade e condições exigentes.",
        applications: ["Varandas", "Terraços", "Escadas", "Ligações", "Detalhes", "Renovações"],
        systems: ["PMMA", "Resinas líquidas PU"],
        cta: "SABER MAIS",
      },
      {
        image: {
          src: "/images/services/dekorative-boeden.png",
          alt: "Pavimento decorativo vermelho brilhante numa habitação",
        },
        title: "PAVIMENTOS DECORATIVOS",
        tagline: "Funcionalidade aliada ao design.",
        description:
          "Superfícies contínuas e sem juntas, adaptadas ao espaço, utilização e acabamento pretendido.",
        applications: ["Habitações", "Garagens", "Escritórios", "Comércio", "Showrooms"],
        finishes: ["Cores", "Texturas", "Flakes", "Acabamentos personalizados"],
        cta: "SABER MAIS",
      },
    ],
  },
  references: {
    label: "DO ANTIGO AO NOVO",
    heading: "DO ANTIGO AO NOVO.",
    description: "Renovação profissional de superfícies existentes.",
    before: "ANTES",
    after: "DEPOIS",
    valueLabel: "Depois visível",
    process: ["Preparação", "Primário", "Revestimento", "Selagem"],
    cta: "VER OS NOSSOS PROJETOS",
    projects: [
      {
        id: "garage",
        title: "GARAGEM",
        ariaLabel: "Comparação antes e depois da garagem",
        beforeImage: {
          src: "/images/references/garage-before.png",
          alt: "Garagem antes do revestimento profissional do pavimento",
        },
        afterImage: {
          src: "/images/references/garage-after.png",
          alt: "Garagem depois do revestimento profissional do pavimento",
        },
      },
      {
        id: "balcony",
        title: "VARANDA",
        ariaLabel: "Comparação antes e depois da varanda",
        beforeImage: {
          src: "/images/references/balcony-before.png",
          alt: "Varanda antes da renovação profissional",
        },
        afterImage: {
          src: "/images/references/balcony-after.png",
          alt: "Varanda depois da renovação profissional",
        },
      },
      {
        id: "industrial",
        title: "PAVIMENTO INDUSTRIAL",
        ariaLabel: "Comparação antes e depois do pavimento industrial",
        beforeImage: {
          src: "/images/references/industrial-before.png",
          alt: "Pavimento industrial antes do revestimento profissional",
        },
        afterImage: {
          src: "/images/references/industrial-after.png",
          alt: "Pavimento industrial depois do revestimento profissional",
        },
      },
    ],
  },
  trust: {
    headingLines: ["TRABALHO CUIDADO.", "EXECUÇÃO PROFISSIONAL.", "RESULTADOS DURADOUROS."],
    description: [
      "Experiência prática de vários anos na aplicação profissional de revestimentos e sistemas de impermeabilização com resinas líquidas.",
      "Cada projeto começa com uma avaliação cuidada da superfície e com a escolha do sistema mais adequado.",
    ],
    benefits: ["Aconselhamento personalizado", "Execução cuidada", "Materiais de qualidade", "Soluções personalizadas"],
  },
  contact: {
    heading: "O SEU PROJETO. A NOSSA SOLUÇÃO.",
    description: [
      "Pretende revestir uma garagem, impermeabilizar uma varanda ou renovar uma superfície existente?",
      "Contacte-nos. Analisamos o seu projeto e aconselhamos pessoalmente a solução mais adequada.",
    ],
    cta: "PEDIR ORÇAMENTO SEM COMPROMISSO",
  },
  footer: {
    descriptor: "REVESTIMENTOS · IMPERMEABILIZAÇÕES · PAVIMENTOS DECORATIVOS",
    region: "Aargau e região",
  },
} satisfies SiteDictionary;
