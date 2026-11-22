# Especificação Técnica — Seção 6: Contato (`#contato`)

## 1. Visão Geral e Papel na Single Page (`/`)

A Seção 6 (`#contato`) fecha o fluxo principal de conversão do portfólio de **Mateus Araujo** antes do rodapé, transformando o interesse técnico construído nas seções anteriores (`#hero` → `#skills`) em ação direta:

- **Equilíbrio Editorial-Tech:** retoma a composição assimétrica de duas colunas inspirada na `#hero`, com espaço negativo generoso, superfície escura `--background` (`#0D0D0D`), superfícies discretas `--card` (`#141318`) e acento roxo `--brand` (`#4811ED`) / `--brand-bright` (`#793CFF`).
- **Conversão direta e sem fricção:** combina uma chamada monumental à ação na coluna esquerda com um card de formulário enxuto (`Nome`, `E-mail`, `Assunto` opcional e `Mensagem`) na coluna direita, seguido logo abaixo por uma faixa horizontal compacta de botões de redes sociais (`LinkedIn`, `GitHub`, `WhatsApp` e `Linktree`).
- **Idioma e Isolamento de Dados:** conteúdo inicial em `pt-BR`, tipado em [src/data/contato.ts](../src/data/contato.ts) e passado do Server Component [src/app/page.tsx](../src/app/page.tsx) via [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx).

---

## 2. Arquitetura e Fronteiras de Componente

- **Camada de dados (`src/data/contato.ts`):**
  - Exporta `SocialPlatform`, `ContatoLinkItem`, `ContatoFormFields`, `ContatoFormValidation`, `ContatoFormContent`, `ContatoContent` e `contatoContent`.
  - Mantém textos, placeholders, mensagens de validação/feedback do formulário e canais sociais desacoplados da apresentação.
- **Route Handler (`src/app/api/contact/route.ts`):**
  - Exporta `POST(request: Request)` para processar submissões do formulário em `/api/contact`.
  - Faz parsing seguro do JSON, valida no servidor `name` (`>= 2` caracteres após `trim`), `email` (regex de formato válido), `subject` opcional e `message` (`>= 10` caracteres após `trim`), retornando `400` `{ ok: false, error }` quando inválido ou `200` `{ ok: true }` (pronto para integração com provedor de e-mail como Resend ou Nodemailer via variáveis de ambiente).
- **Componente de seção (`src/components/portfolio/contato.tsx`):**
  - `"use client"` — recebe `content: ContatoContent` via props, gerencia o estado dos campos do formulário, validação no cliente, ciclo de envio para `POST /api/contact` (`idle` / `submitting` / `success` / `error`), feedback acessível (`aria-live="polite"` / `role="alert"`) e registra as animações de entrada com `useGSAP` + `ScrollTrigger`.
  - Utiliza ícones vetoriais limpos (`lucide-react` ou SVG inline consistente com `src/components/portfolio/skill-icons.tsx`, sempre com `aria-hidden="true"`).
- **Integração com a página e navegação:**
  - Renderizado em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx) logo após `<Skills />`.
  - Recebe `id="contato"` e `aria-labelledby="contato-title"`, permitindo navegação direta pelo link `Contato` do [Header](../src/components/portfolio/header.tsx) (enquanto o botão CTA `Fale comigo ↗` do header abre o WhatsApp em nova aba).

---

## 3. Estrutura Visual, Layout e Tipografia

### Container Principal (`<section id="contato">`)
- **Elemento e landmarks:** `<section id="contato" aria-labelledby="contato-title">`
- **Dimensões e espaçamento:**
  - `relative w-full overflow-x-clip bg-background text-foreground`
  - Padding alinhado às demais seções com transição enxuta para o footer: `px-[clamp(20px,4vw,56px)] pt-24 pb-10 md:pt-28 md:pb-12 lg:pt-32 lg:pb-14`
  - Container interno: `mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)] lg:items-end lg:gap-12 xl:gap-16`
- **Responsividade (`< 1024px`):**
  - Empilha em coluna única (`grid-cols-1`): bloco de chamada (eyebrow → título → lead) acima do card de formulário e da linha de redes sociais.

### Coluna Esquerda (`1.2fr` — Chamada Monumental & Lead)
1. **Eyebrow da Seção:**
   - Texto: `"06 — Contato"` (`eyebrow`).
   - Estilo: `font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground`.
2. **Headline Monumental Escalonada (`<h2 id="contato-title">`):**
   - Família e escala: `font-display` (`Space Grotesk`), `font-medium` (`500`), `text-[clamp(2.65rem,7.2vw,7.75rem)]`, `leading-[0.9]`, `tracking-[-0.04em]`, `text-foreground` (bloco vertical coeso sem `space-y-*` nem `[word-spacing:*]`).
   - Composição em 3 linhas em **escadinha lateral acentuada** (`headlineLines: ["Vamos", "trabalhar", "juntos?"]`) com deslocamento assimétrico compensando a largura maior de `"trabalhar"` para que tanto o início quanto a borda direita de `"juntos?"` ultrapassem claramente a linha do meio:
     - Linha 1 (`"Vamos"`): alinhada exatamente na origem da grade (`pl-0 whitespace-nowrap`, sem `ml-[-0.03em]`), máscara `block overflow-hidden pt-[0.04em] pb-[0.08em]`.
     - Linha 2 (`"trabalhar"`): deslocada para a direita (`pl-[0.8em] md:pl-[1.15em] whitespace-nowrap`), máscara `block overflow-hidden pt-[0.04em] pb-[0.08em]`.
     - Linha 3 (`"juntos?"`): deslocada acentuadamente além do centro visual e da borda direita de `"trabalhar"` (`pl-[1.95em] md:pl-[2.85em] lg:pl-[3.05em] whitespace-nowrap`), máscara `block overflow-hidden pt-[0.04em] pb-[0.16em]` (preservando descendentes como `j`), com o caractere `?` destacado em `text-brand-bright` (`#793CFF`).
   - Cada linha envolve `<span className="contact-line-inner block whitespace-nowrap ... pr-[0.04em] will-change-transform">` para revelação mascarada via GSAP, mantendo `aria-label="Vamos trabalhar juntos?"` no `<h2>` (leitura contínua acessível sem quebrar palavras para leitores de tela) e sem clipping horizontal ou quebra de linha entre `375px` e `1920px`.
3. **Lead Introdutório:**
   - Posicionado diretamente abaixo do título (`mt-7 max-w-[44ch]`), mantendo a coluna esquerda limpa (sem pill de localização/disponibilidade):
     - `font-sans text-[clamp(0.95rem,1.2vw,1.125rem)] leading-[1.6] tracking-normal text-muted-foreground`
   - Texto (`lead`): `"Estou disponível para oportunidades profissionais, projetos sob demanda, parcerias, eventos e palestras. Entre em contato por onde preferir. Respondo rápido."`

### Coluna Direita (`0.85fr` — Card de Formulário Editorial-Tech & Redes Sociais)
1. **Card do Formulário de Mensagem:**
   - Superfície Editorial-Tech: `bg-card border border-white/10 rounded-[24px] p-6 sm:p-8` (superfície `#141318`).
   - **Cabeçalho do Card:**
     - Linha superior alinhada (`flex items-center justify-between gap-3 mb-6`):
       - Esquerda (`form.heading`): `"Enviar mensagem"` (`font-display text-lg sm:text-xl font-medium tracking-[-0.02em] text-foreground`).
       - Direita (`form.badge`): `"Resposta rápida"` (`font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground`).
   - **Campos e Validação (`<form noValidate>`):**
     - `Nome` (`fields.nameLabel` / `namePlaceholder`, obrigatório, mínimo 2 caracteres após `trim`).
     - `E-mail` (`fields.emailLabel` / `emailPlaceholder`, `type="email"`, obrigatório, formato de e-mail válido).
     - `Assunto` (`fields.subjectLabel`: `"Assunto (opcional)"` / `subjectPlaceholder`, opcional).
     - `Mensagem` (`fields.messageLabel` / `messagePlaceholder`, `<textarea>`, obrigatório, mínimo 10 caracteres após `trim`).
     - Inputs com borda discreta (`border border-white/10 bg-background/70 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70`), foco nítido (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:border-brand-bright/60`) e destaque semântico em erro (`aria-invalid="true"`, `aria-describedby` apontando para a mensagem do campo).
   - **Submissão e Estados Acessíveis (`POST /api/contact`):**
     - **Validação cliente + servidor:** valida no cliente antes do envio usando `form.validation` e envia `POST /api/contact` com `Content-Type: application/json`; se o servidor responder erro (`400`/`500`), exibe feedback claro sem perder os dados preenchidos.
     - **Carregamento (`submitting`):** botão principal desabilitado (`disabled`, `aria-busy="true"`) exibindo `form.submittingLabel` (`"Enviando..."`).
     - **Sucesso (`success`):** painel de confirmação dentro do card com `aria-live="polite"`, título `form.successTitle` (`"Mensagem recebida!"`), descrição `form.successDescription` e botão secundário `form.resetLabel` (`"Enviar outra mensagem"`) que limpa e restaura o formulário.
     - **Erro (`error`):** banner de erro acessível (`role="alert"` / `aria-live="polite"`) exibindo a mensagem retornada pela API ou `form.errorMessage`.

2. **Linha Horizontal de Redes Sociais (diretamente abaixo do formulário):**
   - Container espaçado abaixo do card (`mt-5 flex flex-col gap-3` ou barra horizontal alinhada):
     - Rótulo discreto (`socialsHeading`: `"Redes sociais"`): `font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground`.
     - **Lista horizontal (`<ul className="flex flex-wrap items-center gap-2.5">`)**:
       - Cada item (`LinkedIn`, `GitHub`, `WhatsApp`, `Linktree`) renderiza um botão/link compacto `44×44px` (`flex size-11 items-center justify-center rounded-[12px] border border-white/10 bg-card text-foreground/85 transition-colors duration-300 hover:border-brand-bright/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright`).
       - Cada `<a>` inclui `aria-label` descritivo (ex.: `"GitHub: @teuaraujoo"`) e `title`, enquanto o ícone interno usa `aria-hidden="true"`.
   - **Links externos:**
     - Todos os 4 canais configurados possuem `external: true` e aplicam `target="_blank" rel="noopener noreferrer"`.

---

## 4. Coreografia GSAP (`ScrollTrigger`) e Acessibilidade

### Animação de Entrada (`useGSAP` + `gsap.matchMedia()`)
- **Escopo:** `useGSAP(() => { ... }, { scope: sectionRef })` com `ScrollTrigger` registrado.
- **`(prefers-reduced-motion: no-preference)`:**
  - Revelação mascarada das 3 linhas do título + fade escalonado dos elementos complementares (`[data-contato-fade]`: lead, card do formulário e linha de ícones sociais) disparada uma única vez (`once: true`):
    ```ts
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
      },
      defaults: { ease: "expo.out" },
    });

    tl.from(".contato-line-inner", {
      yPercent: 115,
      duration: 1.05,
      stagger: 0.08,
      clearProps: "transform",
    }).from(
      "[data-contato-fade]",
      {
        y: 20,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.06,
        clearProps: "opacity,visibility,transform",
      },
      0.22,
    );
    ```
- **`(prefers-reduced-motion: reduce)`:**
  - Limpa quaisquer transformações/opacidades (`gsap.set([".contato-line-inner", "[data-contato-fade]"], { clearProps: "opacity,visibility,transform" })`), exibindo todo o conteúdo imediatamente sem movimento e desativando o pulso CSS (`motion-reduce:animate-none`).

### Conformidade WCAG 2.1 AA
- **Contraste:** texto principal `#F5F5F5` sobre `#0D0D0D` (> 18:1) e texto secundário `#AAA4B8` sobre `#0D0D0D` / `#141318` (> 7:1).
- **Semântica e teclado:** `<h2>` conectado ao `<section>` via `aria-labelledby="contato-title"`, `<label htmlFor>` explícito em todos os campos, atributos `aria-invalid` e `aria-describedby` nos campos com erro, lista `<ul>/<li>` para a linha de botões sociais (`44×44px` com `aria-label`), anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-brand-bright`) e ordem de tabulação linear.
- **Leitores de tela:** regiões `aria-live="polite"` / `role="alert"` anunciam erros de envio e confirmação de sucesso do formulário; ícones decorativos usam `aria-hidden="true"`.

---

## 5. Integração com o Header (`#navbar`) e Lenis

- Em [src/data/home.ts](../src/data/home.ts):
  - O item de navegação `{ id: "contato", label: "Contato", href: "#contato" }` aponta diretamente para `#contato`, enquanto o botão CTA `{ label: "Fale comigo", href: "https://wa.me/5579988081797", external: true }` abre o WhatsApp em nova aba.
- Em [src/components/portfolio/header.tsx](../src/components/portfolio/header.tsx):
  - Cliques em `Contato` (tanto no dock desktop quanto no drawer mobile `#mobile-menu`) acionam `scrollTo("#contato")` via `Lenis` (`useSmoothScroll`).
  - O listener de scrollspy localiza `document.getElementById("contato")` e, ao atingir o terço superior/base da página (`nearBottom`), desliza o indicador ativo (`sliding pill`) automaticamente para o link `Contato`.

---

## 6. Modelo de Dados TypeScript (`src/data/contato.ts`)

```ts
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
```

### Canais Iniciais (`contatoContent.socials`)
1. **LinkedIn (`linkedin`):** `in/teuaraujoo` → `https://www.linkedin.com/in/teuaraujoo/` (`external: true`)
2. **GitHub (`github`):** `@teuaraujoo` → `https://github.com/teuaraujoo` (`external: true`)
3. **WhatsApp (`whatsapp`):** `(79) 98808-1797` → `https://wa.me/5579988081797` (`external: true`)
4. **Linktree (`linktree`):** `linktr.ee/teuaraujodev` → `https://linktr.ee/teuaraujodev` (`external: true`)
