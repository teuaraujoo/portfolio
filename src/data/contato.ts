export type SocialPlatform =
  | "github"
  | "linkedin"
  | "linktree"
  | "instagram"
  | "whatsapp"
  | "email";

export interface ContatoLinkItem {
  id: string;
  platform: SocialPlatform;
  label: string;
  handle: string;
  href: string;
  external: boolean;
  copyValue?: string;
}

export interface ContatoFormFields {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
}

export interface ContatoFormValidation {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  messageMinLength: string;
}

export interface ContatoFormContent {
  heading: string;
  badge: string;
  fields: ContatoFormFields;
  submitLabel: string;
  submittingLabel: string;
  resetLabel: string;
  successTitle: string;
  successDescription: string;
  errorMessage: string;
  validation: ContatoFormValidation;
}

export interface ContatoContent {
  eyebrow: string;
  headlineLines: [string, string, string];
  lead: string;
  form: ContatoFormContent;
  socialsHeading: string;
  socials: ContatoLinkItem[];
}

/** Dados da Seção 6 (Contato — `#contato`), isolados da camada de apresentação. */
export const contatoContent: ContatoContent = {
  eyebrow: "06 — Contato",
  headlineLines: ["Vamos", "trabalhar", "juntos?"],
  lead: "Estou disponível para oportunidades profissionais, projetos sob demanda, parcerias, eventos e palestras. Entre em contato por onde preferir. Respondo rápido.",
  form: {
    heading: "Enviar mensagem",
    badge: "Resposta rápida",
    fields: {
      nameLabel: "Nome",
      namePlaceholder: "Seu nome",
      emailLabel: "E-mail",
      emailPlaceholder: "voce@exemplo.com",
      subjectLabel: "Assunto (opcional)",
      subjectPlaceholder: "Projeto, consultoria ou dúvida",
      messageLabel: "Mensagem",
      messagePlaceholder: "Conte um pouco sobre seu projeto, prazo ou ideia...",
    },
    submitLabel: "Enviar mensagem",
    submittingLabel: "Enviando...",
    resetLabel: "Enviar outra mensagem",
    successTitle: "Mensagem recebida!",
    successDescription:
      "Obrigado pelo contato. Sua mensagem foi encaminhada e retornarei o mais breve possível.",
    errorMessage:
      "Não foi possível enviar sua mensagem. Tente novamente ou utilize uma das redes abaixo.",
    validation: {
      nameRequired: "Informe seu nome (mínimo de 2 caracteres).",
      emailRequired: "Informe seu e-mail.",
      emailInvalid: "Informe um endereço de e-mail válido.",
      messageRequired: "Escreva uma mensagem antes de enviar.",
      messageMinLength: "A mensagem deve ter pelo menos 10 caracteres.",
    },
  },
  socialsHeading: "Redes sociais",
  socials: [
    {
      id: "linkedin",
      platform: "linkedin",
      label: "LinkedIn",
      handle: "in/teuaraujoo",
      href: "https://www.linkedin.com/in/teuaraujoo/",
      external: true,
    },
    {
      id: "github",
      platform: "github",
      label: "GitHub",
      handle: "@teuaraujoo",
      href: "https://github.com/teuaraujoo",
      external: true,
    },
    {
      id: "whatsapp",
      platform: "whatsapp",
      label: "WhatsApp",
      handle: "(79) 98808-1797",
      href: "https://wa.me/5579988081797",
      external: true,
    },
    {
      id: "linktree",
      platform: "linktree",
      label: "Linktree",
      handle: "linktr.ee/teuaraujodev",
      href: "https://linktr.ee/teuaraujodev",
      external: true,
    },
  ],
};
