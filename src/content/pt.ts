import type { SiteDictionary } from "@/content/types";

export const pt = {
  locale: "pt-PT",
  path: "/pt",
  metadata: {
    title: "CP Peixoto",
    description:
      "Revestimentos de pavimentos, impermeabilizações e pavimentos decorativos para projetos particulares, comerciais e industriais em Aargau e região.",
  },
  accessibility: {
    skipToContent: "Saltar para o conteúdo principal",
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
          src: "/images/services/bodenbeschichtungen.jpeg",
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
          src: "/images/services/abdichtungen.jpeg",
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
    cta: "VER MAIS EXEMPLOS",
    projects: [
      {
        id: "garage",
        title: "INTERIORES",
        ariaLabel: "Comparação antes e depois de um espaço interior",
        beforeImage: {
          src: "/images/references/garage-before.png",
          alt: "Espaço interior antes do revestimento profissional do pavimento",
        },
        afterImage: {
          src: "/images/references/garage-after.png",
          alt: "Espaço interior depois do revestimento profissional do pavimento",
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
        title: "ISOLAÇÃO",
        ariaLabel: "Comparação antes e depois da isolação",
        beforeImage: {
          src: "/images/references/industrial-before.png",
          alt: "Superfície antes do trabalho profissional de isolação",
        },
        afterImage: {
          src: "/images/references/industrial-after.png",
          alt: "Superfície depois do trabalho profissional de isolação",
        },
      },
    ],
  },
  trust: {
    label: "SOBRE NÓS",
    headingLines: [
      "TRABALHO CUIDADO.",
      "EXECUÇÃO PROFISSIONAL.",
      "RESULTADOS DURADOUROS.",
    ],
    description: [
      "Experiência prática de vários anos na aplicação profissional de revestimentos e sistemas de impermeabilização com resinas líquidas.",
      "Cada projeto começa com uma avaliação cuidada da superfície e com a escolha do sistema mais adequado.",
    ],
    benefits: [
      {
        title: "ACONSELHAMENTO PERSONALIZADO",
        description:
          "Analisamos cada projeto individualmente e recomendamos o sistema mais adequado à superfície, utilização e resultado pretendido.",
      },
      {
        title: "15+ ANOS DE EXPERIÊNCIA",
        description:
          "Mais de 15 anos de experiência prática na aplicação de revestimentos e impermeabilizações, com atenção ao detalhe em cada etapa.",
      },
      {
        title: "MATERIAIS DE QUALIDADE",
        description:
          "Trabalhamos com sistemas profissionais e materiais de qualidade, selecionados para garantir resistência e durabilidade.",
      },
      {
        title: "SOLUÇÕES PERSONALIZADAS",
        description:
          "Cada solução é adaptada ao espaço e às necessidades do cliente, desde a preparação até ao acabamento final.",
      },
    ],
  },
  contact: {
    label: "PEDIR ORÇAMENTO",
    headingLines: ["O SEU PROJETO.", "A NOSSA SOLUÇÃO."],
    description:
      "Contacte-nos. Analisamos o seu projeto e aconselhamos pessoalmente a solução mais adequada.",
    whatsappCta: "CONTACTAR DIRETAMENTE",
    details: {
      phone: "Telefone",
      email: "Email",
      region: "Região",
    },
    form: {
      labels: {
        name: "NOME",
        email: "EMAIL",
        phone: "TELEFONE",
        location: "LOCALIZAÇÃO / REGIÃO",
        service: "SERVIÇO",
        message: "MENSAGEM",
        optional: "OPCIONAL",
      },
      servicePlaceholder: "Selecionar serviço",
      services: [
        { value: "floor-coatings", label: "Revestimentos de pavimentos" },
        { value: "waterproofing", label: "Impermeabilizações" },
        { value: "decorative-floors", label: "Pavimentos decorativos" },
        { value: "other", label: "Outro pedido" },
      ],
      contactGuidance: "Indique pelo menos um email ou número de telefone.",
      submit: "PEDIR ORÇAMENTO SEM COMPROMISSO",
      submitting: "A ENVIAR PEDIDO…",
      success: {
        heading: "OBRIGADO.",
        message:
          "O seu pedido foi enviado com sucesso. Entraremos em contacto consigo assim que possível.",
      },
      error:
        "Não foi possível enviar o pedido. Tente novamente ou contacte-nos diretamente.",
      validation: {
        required: "Este campo é obrigatório.",
        invalidEmail: "Introduza um endereço de email válido.",
        invalidPhone: "Introduza um número de telefone válido.",
        contactRequired:
          "Indique pelo menos um email ou número de telefone.",
        tooLong: "O valor introduzido é demasiado longo.",
      },
    },
  },
  gallery: {
    ariaLabel: "Galeria de projetos",
    eyebrow: "O NOSSO TRABALHO",
    heading: "GALERIA",
    items: [
      {
        src: "/images/gallery/imagem1.jpeg",
        label: "REVESTIMENTO DE PAVIMENTO",
        alt: "Pavimento interior claro revestido",
      },
      {
        src: "/images/gallery/imagem2.jpeg",
        label: "PAVIMENTO INDUSTRIAL",
        alt: "Pavimento industrial laranja num espaço amplo",
      },
      {
        src: "/images/gallery/imagem3.jpeg",
        label: "VARANDA",
        alt: "Pavimento claro de uma varanda com vista",
      },
      {
        src: "/images/gallery/imagem4.jpeg",
        label: "INTERIORES",
        alt: "Pavimento revestido a verde num espaço interior",
        objectPosition: "center 35%",
      },
      {
        src: "/images/gallery/imagem5-nova.jpeg",
        label: "ESCADAS",
        alt: "Escadas com acabamento revestido a cinzento",
        objectPosition: "center 32%",
      },
    ],
  },
  footer: {
    descriptor: "REVESTIMENTOS & IMPERMEABILIZAÇÕES",
  },
} satisfies SiteDictionary;
