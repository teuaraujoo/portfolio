export type Locale = "pt-BR" | "en";

export interface NavItem {
  id: string;
  label: string;
  href: `#${string}` | `/${string}`;
}

export interface HeaderContent {
  brandName: string;
  brandLogoPath: string;
  brandHref: string;
  items: NavItem[];
  cta: {
    label: string;
    href: string;
    external?: boolean;
  };
}

export interface PreloaderContent {
  author: string;
  yearLabel: string;
  loadingLabel: string;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface GitSkylineConfig {
  title?: string;
  footer?: string | null;
  username: string;
  locale: Locale;
  unit: string;
  unitPlural: string;
  defaultView: "2d" | "3d";
  heightScale: number;
  showStats: boolean;
  showLegend: boolean;
  showToggle: boolean;
  seed: number;
  palette: {
    dark: [string, string, string, string];
    light: [string, string, string, string];
  };
  /** Preenchido no servidor via API de contribuições do GitHub com fallback local */
  data?: ContributionDay[];
}

export interface HeroContent {
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  leadSegments: Array<{
    text: string;
    highlight?: boolean;
  }>;
  bioSegments: Array<{
    text: string;
    highlight?: boolean;
  }>;
  scrollHint: {
    label: string;
    targetHref: `#${string}`;
  };
  gitMap: GitSkylineConfig;
}

export interface HomePageData {
  locale: Locale;
  preloader: PreloaderContent;
  header: HeaderContent;
  hero: HeroContent;
}

/** Dados iniciais da Home (`pt-BR`), isolados da camada de apresentação. */
export const homeData: HomePageData = {
  locale: "pt-BR",
  preloader: {
    author: "Mateus Araujo",
    yearLabel: "Portfólio — 2026",
    loadingLabel: "Carregando",
  },
  header: {
    brandName: "Mateus Araujo",
    brandLogoPath: "/icon.svg",
    brandHref: "#hero",
    items: [
      { id: "inicio", label: "Início", href: "#hero" },
      { id: "sobre", label: "Sobre", href: "#sobre" },
      { id: "projetos", label: "Projetos", href: "#projetos" },
      { id: "jornada", label: "Jornada", href: "#jornada" },
      { id: "skills", label: "Skills", href: "#skills" },
      { id: "contato", label: "Contato", href: "#contato" },
    ],
    cta: {
      label: "Fale comigo",
      href: "https://wa.me/5579988081797",
      external: true,
    },
  },
  hero: {
    firstName: "Mateus",
    lastName: "Araujo",
    role: "Desenvolvedor FullStack",
    location: "Aracaju, SE",
    leadSegments: [
      {
        text: "Trabalho com tecnologia para transformar suas dores e ideias em ",
      },
      {
        text: "soluções sob medida, simples de usar e eficazes.",
        highlight: true,
      },
    ],
    bioSegments: [
      { text: "Embaixador da Google", highlight: true },
      { text: ", desenvolvedor fullstack e estudante de " },
      { text: "Análise e Desenvolvimento de Sistemas", highlight: true },
      {
        text: ", sempre me mantenho envolvido no ecossistema tecnológico, conectando ",
      },
      {
        text: "comunidade, aprendizado e inovação.", highlight: true
      }
    ],
    scrollHint: {
      label: "Role para explorar",
      targetHref: "#sobre",
    },
    gitMap: {
      username: "teuaraujoo",
      locale: "pt-BR",
      unit: "contribuição",
      unitPlural: "contribuições",
      defaultView: "3d",
      heightScale: 0.78,
      showStats: false,
      showLegend: false,
      showToggle: true,
      footer: null,
      seed: 7,
      palette: {
        dark: ["#241445", "#38189c", "#4811ed", "#793cff"],
        light: ["#e4d4fb", "#9f75ff", "#793cff", "#4811ed"],
      },
    },
  },
};
