export type JornadaCategory = "tech" | "curso" | "programa" | "empresa";

export interface JornadaCategoryMeta {
  id: JornadaCategory;
  label: string;
  accentColor: string;
}

export type JornadaMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "gallery";
      images: [
        { src: string; alt: string },
        { src: string; alt: string },
      ];
    }
  | {
      type: "none";
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
  periodLabel: "2025 — 2026",
  titleLine1: "Minha",
  titleLine2: "jornada.",
  intro:
    "Formação, eventos, hackathons, programas e experiências que marcaram minha evolução como pessoa e profissional de tecnologia.",
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
      id: "stop-2025-jovem-tech",
      year: "2025",
      monthLabel: "Mai 25 – Mar 26",
      category: "curso",
      title: "Formação FullStack · Jovem Tech",
      organization: "INOVA-SE · MCTI",
      description:
        "Formação técnica em desenvolvimento fullstack pelo programa Jovem Tech, programa da empresa INOVA-SE em parceria com o Ministério de Ciência, Tecnologia e Inovação.",
      media: {
        type: "image",
        src: "/jornada/jovemtech.png",
        alt: "Formação técnica em desenvolvimento fullstack no programa Jovem Tech",
      },
    },
    {
      id: "stop-2026-unit",
      year: "2026",
      monthLabel: "Fev – Atual",
      category: "curso",
      title: "Análise e Desenvolvimento de Sistemas",
      organization: "UNIT-SE · Graduação Tecnológica",
      description:
        "Início da graduação em Análise e Desenvolvimento de Sistemas na UNIT-SE, atualmente em andamento.",
      media: {
        type: "none",
      },
    },
    {
      id: "stop-2026-hackai",
      year: "2026",
      monthLabel: "Jul",
      category: "tech",
      title: "HackAI · Projeto Mapâe",
      organization: "1º Hackathon · Descoberta Urbana",
      description:
        "Participação no meu primeiro hackathon, o HackAI, apresentando o Mapae, uma solução de descoberta urbana que atualmente está em desenvolvimento.",
      media: {
        type: "image",
        src: "/jornada/hacktoon.png",
        alt: "Participação no hackathon HackAI apresentando a solução urbana Mapae",
      },
    },
    {
      id: "stop-2026-google",
      year: "2026",
      monthLabel: "Ago",
      category: "programa",
      title: "Embaixador Estudantil da Google",
      organization: "Google · Programa Estudantil",
      description:
        "Participação no programa de Embaixadores Estudantis da Google, conectando comunidade acadêmica, aprendizado e ecossistema de inovação.",
      media: {
        type: "gallery",
        images: [
          {
            src: "/jornada/google.png",
            alt: "Participação no programa de Embaixadores Estudantis da Google",
          },
          {
            src: "/jornada/google2.png",
            alt: "Registro de atividades como Embaixador Estudantil da Google",
          },
        ],
      },
    },
    {
      id: "stop-2026-delfinance",
      year: "2026",
      monthLabel: "Set",
      category: "empresa",
      title: "Desenvolvedor FullStack · DelFinance",
      organization: "DelFinance · Fintech",
      description:
        "Ingresso na primeira oportunidade profissional no mercado de tecnologia na DelFinance, uma das maiores fintechs do estado de Sergipe.",
      media: {
        type: "none",
      },
    },
  ],
};
