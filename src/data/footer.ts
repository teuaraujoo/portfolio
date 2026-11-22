export interface FooterContent {
  wordmark: string;
  backToTopLabel: string;
  backToTopAriaLabel: string;
  wordmarkWeight?: number;
  enableLens?: boolean;
}

/** Dados da Seção 7 (Footer), isolados da camada de apresentação. */
export const footerContent: FooterContent = {
  wordmark: "Mateus Araujo",
  backToTopLabel: "Voltar para topo",
  backToTopAriaLabel: "Voltar para o topo da página",
  wordmarkWeight: 450,
  enableLens: true,
};
