export type AnnotationKind = "none" | "brush" | "circle" | "underline";
export type BrushTone = "brand" | "bright" | "subtle";

export interface QuoteSegment {
  text: string;
  annotation?: AnnotationKind;
  tone?: BrushTone;
  /** Renderiza um asterisco decorativo imediatamente após este segmento */
  sparkAfter?: boolean;
  /** Delay em milissegundos para entrada sequencial da anotação */
  delayMs?: number;
}

export interface SobreStat {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface SobreModalContent {
  triggerLabel: string;
  triggerAriaLabel: string;
  closeAriaLabel: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
}

export interface SobreContent {
  eyebrow: string;
  quoteAriaLabel: string;
  segments: QuoteSegment[];
  photo: {
    src: string;
    alt: string;
    captionLeft: string;
    captionRight: string;
  };
  modal: SobreModalContent;
  stats: SobreStat[];
}

/** Dados da Seção 2 (Sobre), isolados da camada de apresentação. */
export const sobreData: SobreContent = {
  eyebrow: "Sobre mim",
  quoteAriaLabel:
    "Escolhi a tecnologia por ser autodidata e gostar de resolver problemas com autonomia. Hoje atuo construindo produtos digitais completos, da interface até o deploy, sem deixar pontas soltas.",
  segments: [
    { text: "Escolhi a tecnologia por ser ", annotation: "none" },
    { text: "autodidata", annotation: "brush", tone: "brand", delayMs: 150 },
    { text: " e gostar de resolver ", annotation: "none" },
    { text: "problemas", annotation: "circle", delayMs: 600 },
    { text: " com autonomia. Hoje atuo construindo ", annotation: "none" },
    {
      text: "produtos digitais completos",
      annotation: "brush",
      tone: "bright",
      sparkAfter: true,
      delayMs: 1050,
    },
    { text: ", ", annotation: "none" },
    {
      text: "da interface",
      annotation: "brush",
      tone: "subtle",
      delayMs: 1550,
    },
    { text: " até o deploy, sem deixar ", annotation: "none" },
    { text: "pontas soltas.", annotation: "underline", delayMs: 2000 },
  ],
  photo: {
    src: "/foto_rosto.jpg",
    alt: "Retrato de Mateus Araujo",
    captionLeft: "Mateus Araujo",
    captionRight: "Aracaju, SE",
  },
  modal: {
    triggerLabel: "Sobre mim",
    triggerAriaLabel: "Abrir história completa sobre Mateus Araujo",
    closeAriaLabel: "Fechar janela sobre mim",
    title: "Mateus Araujo",
    subtitle: "Desenvolvedor FullStack · Aracaju, SE",
    paragraphs: [
      "Sou autodidata e encontrei na tecnologia o caminho para resolver problemas do meu jeito. Iniciei minha base técnica em desenvolvimento fullstack pelo programa Jovem Tech (INOVA-SE em parceria com o MCTI) e atualmente curso Análise e Desenvolvimento de Sistemas na UNIT-SE.",
      "Atuo como Desenvolvedor FullStack na DelFinance, uma das maiores fintechs de Sergipe, transformando necessidades reais em soluções digitais completas — da interface e experiência do usuário até a arquitetura de backend, banco de dados e deploy.",
      "Também participo ativamente da comunidade tecnológica como Embaixador Estudantil da Google e em iniciativas como o HackAI, conectando aprendizado contínuo, troca técnica e desenvolvimento de produtos como o Anatolab, CMF, Civix e Mapae.",
    ],
  },
  stats: [
    { id: "stat-1", value: 5, prefix: "+", label: "projetos" },
    { id: "stat-2", value: 10, prefix: "+", label: "certificados" },
    { id: "stat-3", value: 2, prefix: "+", label: "formações" },
  ],
};
