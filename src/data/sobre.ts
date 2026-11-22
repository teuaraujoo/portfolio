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
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed eiusmod tempor incididunt. Labore et dolore magna: aliqua ut enim ad minim veniam quis nostrud, exercitation ullamco nisi aliquip.",
  segments: [
    { text: "Lorem ipsum ", annotation: "none" },
    { text: "dolor sit", annotation: "brush", tone: "brand", delayMs: 150 },
    { text: " amet, consectetur adipiscing elit sed ", annotation: "none" },
    { text: "eiusmod", annotation: "circle", delayMs: 600 },
    { text: " tempor incididunt. Labore ", annotation: "none" },
    {
      text: "et dolore magna",
      annotation: "brush",
      tone: "bright",
      sparkAfter: true,
      delayMs: 1050,
    },
    { text: ": aliqua ut enim ad minim veniam ", annotation: "none" },
    {
      text: "quis nostrud",
      annotation: "brush",
      tone: "subtle",
      delayMs: 1550,
    },
    { text: ", exercitation ullamco ", annotation: "none" },
    { text: "nisi aliquip.", annotation: "underline", delayMs: 2000 },
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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum curabitur pretium.",
      "Integer nec odio praesent libero sed cursus ante dapibus diam. Sed nisi nulla quis sem at nibh elementum imperdiet, duis sagittis ipsum praesent mauris fusce nec tellus sed augue semper porta mauris massa.",
    ],
  },
  stats: [
    { id: "stat-1", value: 12, suffix: "+", label: "Lorem ipsum" },
    { id: "stat-2", value: 37, label: "Dolor sit amet" },
    { id: "stat-3", value: 15, suffix: "+", label: "Consectetur elit" },
  ],
};
