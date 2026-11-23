export interface FooterContent {
  wordmark: string;
  copyright: string;
  backToTopLabel: string;
  backToTopAriaLabel: string;
  wordmarkWeight?: number;
  enableLens?: boolean;
}

/** Dados da Seção 7 (Footer), isolados da camada de apresentação. */
export const footerContent: FooterContent = {
  wordmark: "Mateus Araujo",
  copyright: "© 2026 Mateus Araujo. Todos os direitos reservados.",
  backToTopLabel: "Voltar para topo",
  backToTopAriaLabel: "Voltar para o topo da página",
  wordmarkWeight: 450,
  enableLens: true,
};
