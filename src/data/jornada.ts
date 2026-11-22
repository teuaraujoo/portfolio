export type JornadaCategory = "tech" | "curso" | "programa" | "empresa";

export interface JornadaCategoryMeta {
  id: JornadaCategory;
  label: string;
  accentColor: string;
}

export type JornadaMedia =
  | {
      type: "placeholder";
      scene: JornadaCategory;
      caption: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    };

export interface JornadaStop {
  id: string;
  year: string;
  monthLabel: string;
  category: JornadaCategory;
  title: string;
  organization: string;
  description: string;
  media: JornadaMedia;
}

export interface JornadaContent {
  eyebrow: string;
  periodLabel: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  scrollCue: string;
  categories: Record<JornadaCategory, JornadaCategoryMeta>;
  stops: JornadaStop[];
}

/** Dados da Seção 4 (Jornada), isolados da camada de apresentação. */
export const jornadaContent: JornadaContent = {
  eyebrow: "04 — Jornada",
  periodLabel: "2021 — 2026",
  titleLine1: "Minha",
  titleLine2: "jornada.",
  intro:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  scrollCue: "Role para percorrer",
  categories: {
    tech: {
      id: "tech",
      label: "Tech",
      accentColor: "#793CFF",
    },
    curso: {
      id: "curso",
      label: "Curso",
      accentColor: "#9D72FF",
    },
    programa: {
      id: "programa",
      label: "Programa",
      accentColor: "#5B3DF5",
    },
    empresa: {
      id: "empresa",
      label: "Empresa",
      accentColor: "#4811ED",
    },
  },
  stops: [
    {
      id: "stop-2021-tech",
      year: "2021",
      monthLabel: "Mar",
      category: "tech",
      title: "Primeiro contato com código & Web",
      organization: "Base · HTML, CSS & JS",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.",
      media: {
        type: "placeholder",
        scene: "tech",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2022-curso",
      year: "2022",
      monthLabel: "Fev",
      category: "curso",
      title: "Formação FullStack & Fundamentos",
      organization: "Lorem Academy · Formação",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi aliquip.",
      media: {
        type: "placeholder",
        scene: "curso",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2022-programa",
      year: "2022",
      monthLabel: "Out",
      category: "programa",
      title: "Programa de Bolsas & Hackathon",
      organization: "Ipsum Labs · Desafio Tech",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.",
      media: {
        type: "placeholder",
        scene: "programa",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2023-empresa",
      year: "2023",
      monthLabel: "Jun",
      category: "empresa",
      title: "Primeira experiência profissional Tech",
      organization: "Dolor Studio · Desenvolvedor Jr.",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.",
      media: {
        type: "placeholder",
        scene: "empresa",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2024-curso",
      year: "2024",
      monthLabel: "Mar",
      category: "curso",
      title: "Especialização Arquitetura & Cloud",
      organization: "Sit Institute · Especialização",
      description:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.",
      media: {
        type: "placeholder",
        scene: "curso",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2024-programa",
      year: "2024",
      monthLabel: "Nov",
      category: "programa",
      title: "Comunidade & Programa Embaixador",
      organization: "Amet Community · Mentoria",
      description:
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
      media: {
        type: "placeholder",
        scene: "programa",
        caption: "Foto do momento",
      },
    },
    {
      id: "stop-2025-empresa",
      year: "2025",
      monthLabel: "Ago",
      category: "empresa",
      title: "Atuação como Desenvolvedor FullStack",
      organization: "Consectetur Tech · Produto Web",
      description:
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur adipisci.",
      media: {
        type: "placeholder",
        scene: "empresa",
        caption: "Foto do momento",
      },
    },
  ],
};
