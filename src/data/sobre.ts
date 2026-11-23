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
      "Sou Mateus Araujo, Desenvolvedor Full Stack de Aracaju, Brasil. Atualmente trabalho na Delfinance, uma fintech onde desenvolvo e mantenho sistemas de crédito consignado utilizando Node.js, NestJS, TypeScript, TypeORM, MySQL, Redis e BullMQ, além de contribuir com aplicações frontend em Vue.js.",
      "Meu trabalho inclui APIs REST, fluxos de propostas e contratos de empréstimo, autenticação JWT, autenticação multifator e integrações com serviços de verificação de identidade, enriquecimento de dados, operações bancárias e armazenamento de documentos, como CAF, BigDataCorp, Autbank e AWS S3.",
      "Em paralelo à minha função, desenvolvo aplicações web como freelancer e também possuo experiência profissional com Salesforce, Apex e Flow. Curso Análise e Desenvolvimento de Sistemas e sigo fortalecendo continuamente minhas habilidades em arquitetura de software, segurança, testes automatizados e desenvolvimento de aplicações fáceis de manter.",
    ],
  },
  stats: [
    { id: "stat-1", value: 5, prefix: "+", label: "projetos" },
    { id: "stat-2", value: 10, prefix: "+", label: "certificados" },
    { id: "stat-3", value: 2, prefix: "+", label: "formações" },
  ],
};
