# Especificação Técnica — Seção 3: Projetos (`#projetos`)

## 1. Visão Geral e Fusão das Referências

A seção **Projetos (`#projetos`)** adapta o padrão **Sticky Card Stacking** (*Scroll-driven Card Overlap*) das duas referências analisadas para a estética **Editorial-Tech Fullscreen** do portfólio de **Mateus Araujo** (`#0D0D0D`, `#141318`, `#4811ED` / `#793CFF`, `Space Grotesk` + `Montserrat`):

1. **Referência 1 — `victordeveloper.com` (Profundidade no Scroll + Lista Secundária + Modal de Case):**
   - **Empilhamento com recuo físico:** Conforme o card seguinte sobe no scroll (`GSAP + ScrollTrigger` com `scrub: true`), o card anterior encolhe suavemente (`scale: 0.92`, `transform-origin: 50% 0%`) e recebe um escurecimento progressivo (`.project-shade` até `opacity: 0.65`), criando hierarquia clara entre o projeto em foco e os projetos já arquivados atrás dele.
   - **Bloco secundário `"Mais projetos"`:** Abaixo da pilha principal, uma lista editorial compacta exibe projetos adicionais com numeração, resumo, categoria e abertura de case.
   - **Dialog de Case Completo (Obrigatório para todos os projetos):** Clicar em qualquer card da pilha ou linha da lista *"Mais projetos"* abre um modal estruturado como **Case Study**, exibindo obrigatoriamente **Descrição geral**, **O desafio** e **A solução** (além de galeria, destaques e tecnologias).
2. **Referência 2 — `ruancostadev.com.br` (Escala Fullscreen + Ritmo de Leitura + Spotlight + Ações Diretas):**
   - **Escala panorâmica de tela cheia:** Cards altos (`md:h-[min(74svh,680px)]`) e largura generosa alinhada ao grid de `1600px`, com cantos concêntricos e degrau superior escalonado (`--stack-index`).
   - **Ritmo de scroll controlado:** Espaçadores proporcionais à viewport entre os cards (`md:h-[36vh]`) garantem tempo de leitura confortável antes que o próximo card cubra o anterior.
   - **Spotlight sutil de ponteiro + links rápidos:** Em desktop, um brilho radial discreto (`#793CFF` / `#4811ED`) reage ao cursor na borda e superfície do card (sem tilt 3D agressivo, mantendo o card arquitetonicamente firme durante o `scale` do scroll) e botões secundários permitem acessar **Live Demo** ou **Repositório** diretamente.

> [!NOTE]
> **Conteúdo Inicial (Placeholder):** Seguindo o padrão já adotado em Home e Sobre, os projetos iniciais utilizam títulos/contextos de exemplo + textos descritivos em **Lorem ipsum** em [src/data/projetos.ts](../src/data/projetos.ts) e **mockups visuais placeholder estilizados** em dark + roxo (preparados para receber prints reais, vídeos `.mp4`/`.webm` ou dados vindos de API/CMS no futuro).

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/projetos.ts`):**
  - Centraliza `eyebrow`, título e subtítulo da seção, **4 projetos em destaque (`featured`)** para a pilha Sticky e **4 projetos adicionais (`archive`)** para a lista `"Mais projetos"`, além de labels reutilizáveis de botões e modal (`pt-BR` agora, pronto para `en` ou API).
- **Preview Visual Placeholder / Mídia (`src/components/portfolio/project-media.tsx`):**
  - Renderiza mídia real (`<video>` com `IntersectionObserver` ou `<img>` otimizada) quando `media.type` for `"video"` ou `"image"`, ou um **Mockup Visual Editorial-Tech** em SVG/HTML estilizado (`#0D0D0D`, grade sutil, elementos de UI abstratos e acento `#793CFF`/`#4811ED`) quando `media.type === "placeholder"`, com container queries (`@container`, breakpoints `@[300px]` / `@[420px]`) para manter nitidez tanto nos cards grandes quanto no preview flutuante compacto (`h-36 w-60 lg:h-44 lg:w-72`).
- **Primitivo UI da Lista Interativa (`src/components/ui/interactive-hover-links.tsx`):**
  - `"use client"` reutilizável adaptado do padrão **Interactive Hover Links** (21st.dev), implementado sem dependência extra de `motion` utilizando CSS transitions nativas, variáveis CSS rastreadas por ponteiro (`--hover-x` / `--hover-y`), stagger por caractere no título (`22ms` por letra até `320ms`) e preview flutuante inclinado alimentado por `ProjectMedia` (ou `imgSrc`).
- **Dialog de Case Completo (`src/components/portfolio/project-dialog.tsx`):**
  - `"use client"` seguindo a mesma linguagem visual e de acessibilidade do [sobre-dialog.tsx](../src/components/portfolio/sobre-dialog.tsx) (overlay escuro com `backdrop-blur-xl`, `role="dialog"`, `aria-modal="true"`, `data-lenis-prevent`, lock de scroll no `body`, fechamento por `Escape`, backdrop ou botão fechar com `z-20 cursor-pointer`, e restauração de foco ao gatilho).
- **Seção principal (`src/components/portfolio/projetos.tsx`):**
  - `"use client"` gerenciando `useGSAP` + `ScrollTrigger` (sticky stacking + recuo/scrim em desktop, stagger de entrada em mobile), efeito de spotlight sutil por ponteiro em desktop e estado do `ProjectDialog`.
- **Integração:**
  - Renderizada em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx) logo abaixo de `<Sobre />`, recebendo `projetos` via props tipadas de [src/app/page.tsx](../src/app/page.tsx).
  - Mantém `id="projetos"` para integração automática com o indicador ativo e scroll suave do [header.tsx](../src/components/portfolio/header.tsx).

---

## 3. Estrutura Visual, Dimensionamento e Layout

### Regra Crítica de Scroll para `position: sticky`
- **Proibição de `overflow: hidden`:** Nenhum ancestral direto da pilha `.projects-stack` (incluindo `<section id="projetos">`, `<main>` e wrapper raiz do shell) pode ter `overflow: hidden` ou `overflow-y: auto` — isso impediria o comportamento `position: sticky` no navegador.
- Usar exclusivamente `overflow-x-clip` (`overflow-x: clip`) na seção `#projetos`.

### Container Principal (`#projetos`)
- **Elemento:** `<section ref={scope} id="projetos" aria-labelledby="projetos-title" className="relative w-full overflow-x-clip bg-background px-[clamp(20px,4vw,56px)] py-24 text-foreground md:py-32 lg:py-36">`
- **Largura Máxima Interna:** `mx-auto max-w-[1600px]` (alinhada ao grid de [hero.tsx](../src/components/portfolio/hero.tsx) e [sobre.tsx](../src/components/portfolio/sobre.tsx)).

### A) Cabeçalho Editorial da Seção
1. **Barra de Metadados (topo):**
   - `mb-10 flex items-center justify-between border-b border-border pb-4 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground`
   - Esquerda: `"03 — Projetos"`
   - Direita: `"8 projetos"` *(contagem dinâmica `featured.length + archive.length`)*
2. **Bloco Introdutório (`grid` 2 colunas em `lg`):**
   - **Esquerda (`<h2 id="projetos-title">`):** `font-display font-semibold text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em] text-foreground` (`"Projetos em / destaque."`).
   - **Direita (Lead):** `max-w-[46ch] text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.65] text-muted-foreground` (`Lorem ipsum` curto convidando a explorar os cases).

### B) Pilha de Cards (`Sticky Card Stacking`)
- **Container da Pilha (`.projects-stack`):**
  - `relative mt-14 md:mt-20`
  - Renderiza os **4 projetos em destaque (`featured`)**, intercalados em desktop por espaçadores dedicados (`<div aria-hidden="true" className="h-8 md:h-[36vh]" />`) e um respiro inferior (`<div aria-hidden="true" className="hidden md:block md:h-[16vh]" />`) para desacelerar a transição entre o último card empilhado e a lista abaixo.
- **Wrapper de Cada Card (`.project-card`):**
  - Em `>= 900px` (`min-[900px]`) e sem `prefers-reduced-motion`:
    - `position: sticky`
    - `top: calc(clamp(88px, 11vh, 112px) + var(--stack-index) * 14px)` *(posicionado abaixo do header flutuante `#navbar`, revelando um degrau de `14px` no topo dos cards empilhados)*
    - `style={{ zIndex: index + 1, "--stack-index": index }}`
- **Card Interno (`.project-card-inner`) — Raios Concêntricos:**
  - Tokens locais concêntricos: `[--card-radius:24px] [--card-pad:16px] md:[--card-pad:24px] [--card-media-radius:calc(var(--card-radius)_-_var(--card-pad))]` *(24px - 24px? Usar `max(12px, calc(var(--card-radius) - var(--card-pad) * 0.5))` ou `--card-radius:24px` + `--card-pad:12px` / `--card-media-radius:14px` para arco concêntrico limpo).*
  - Definição exata de concêntrico:
    - Externo: `rounded-[24px]` (`24px`)
    - Padding no frame da mídia: `p-3 md:p-5` com mídia `rounded-[14px]` (`24px - 10px ≈ 14px`, paralelo ao canto externo).
  - Estrutura: `group/card relative grid cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/20 min-[900px]:h-[min(74svh,680px)] min-[900px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]`
  - `transform-origin: 50% 0%` + `will-change: transform`.
  - **Camadas Visuais do Card:**
    1. **Spotlight sutil de ponteiro (desktop apenas, `pointer-events-none hidden min-[900px]:block motion-reduce:hidden`):**
       - Glow radial interno no cursor (`size-72 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`) usando a cor de acento do projeto (padrão `--brand-bright` / `#793CFF` com opacidade baixa `0.14`).
       - Realce de borda via máscara CSS (`radial-gradient(380px circle at var(--mx) var(--my), rgba(121, 60, 255, 0.55), transparent 65%)` com `mask-composite: exclude`).
    2. **Coluna Esquerda — Mídia (`ProjectMedia`):**
       - Container `relative overflow-hidden rounded-[14px] bg-[#0D0D0D] border border-white/8 aspect-[16/10] min-[900px]:aspect-auto min-[900px]:h-full`.
       - Hover suave na mídia: `transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03] motion-reduce:transition-none`.
    3. **Coluna Direita — Conteúdo Editorial (`flex flex-col justify-between gap-6 p-4 pt-6 min-[900px]:p-8 xl:p-10`):**
       - **Topo:** Linha com categoria/ano à esquerda (`font-sans text-xs font-medium uppercase tracking-[0.1em] text-brand-bright`) e índice monumental à direita (`01`, `02`, `03`, `04` em `font-display text-3xl font-semibold text-white/18 tabular-nums`).
       - **Centro:**
         - Título (`<h3 className="font-display text-[clamp(1.6rem,2.6vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">`) + subtítulo curto (`mt-2 text-sm font-medium text-muted-foreground`).
         - Descrição concisa (`mt-4 max-w-[44ch] text-[0.95rem] leading-[1.65] text-muted-foreground`).
         - Pills de tecnologias (`mt-6 flex flex-wrap gap-2`): `rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-foreground/80`.
       - **Base (`mt-auto pt-4 flex flex-wrap items-center gap-3`):**
         - Botão principal: **`Ver case completo`** (`bg-brand text-foreground hover:brightness-110 rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer`).
         - Links diretos opcionais (se presentes no item): **`Acessar ↗`** e **`GitHub ↗`** em botões secundários `border border-white/15 bg-white/[0.03] hover:border-white/30` (com `e.stopPropagation()` para não abrir o modal ao clicar no link externo).
    4. **Scrim de Profundidade (`.project-shade`):**
       - `<div aria-hidden="true" className="project-shade pointer-events-none absolute inset-0 z-20 bg-background opacity-0" />`
       - Animado pelo GSAP quando o card seguinte avança sobre ele (`0` → `0.65`).

### C) Lista Secundária — `"Mais projetos"` (`.projects-more`)
Logo abaixo da pilha de cards (`mt-20 md:mt-28`, sem `overflow-hidden` na `.projects-more` nem na `.projects-list` para não recortar verticalmente o preview flutuante):
- **Cabeçalho:** Título `"Mais projetos"` (`font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold tracking-[-0.02em]`) + texto auxiliar discreto (`"Outros experimentos, estudos e entregas."`).
- **Lista Editorial (`<InteractiveHoverLinks className="projects-list mt-6 border-t border-border" rowClassName="project-row" ... />`):**
  - Cada item de `archiveItems` é mapeado para `InteractiveHoverLinkItem` (`id`, `indexLabel`, `heading`, `subheading`, `category`, `year`, `preview: <ProjectMedia media={project.cover} />`, `onClick`, `ariaHasPopup: "dialog"`, `ariaExpanded`) e renderizado como `<button type="button">` interativo e acessível (`group/row`).
  - **Comportamento por linha (`.project-row`):**
    1. **Índice + Título com Stagger por Caractere:** Número (`05`–`08` em `tabular-nums text-xs text-muted-foreground`) + título (`Space Grotesk`, `text-2xl sm:text-3xl lg:text-4xl`) com `<span className="sr-only">` para leitores de tela e letras tokenizadas que deslocam com stagger (`22ms` por caractere, teto `320ms`, `cubic-bezier(0.34,1.56,0.64,1)`) em hover/focus-visible (`motion-safe`), além de resumo (`line-clamp-2`).
    2. **Preview Flutuante Inclinado (`md:block`, oculto em `motion-reduce`):** Card flutuante (`h-36 w-60 lg:h-44 lg:w-72`, `rounded-[16px]`, `pointer-events-none`) contendo `<ProjectMedia media={project.cover} />` que transiciona de `opacity-0 [transform:translate(-50%,-50%)_scale(0)_rotate(-12.5deg)]` para `opacity-100 [transform:translate(-50%,-50%)_scale(1)_rotate(10deg)]` e acompanha o cursor via variáveis CSS `--hover-x` / `--hover-y` (ignorando `pointerType === "touch"` e `prefers-reduced-motion: reduce`), enquanto a linha ativa sobe para `hover:z-20` / `focus-visible:z-20`.
    3. **Metadados & Ação:** Pill de categoria (`hidden sm:inline-flex`), ano (`tabular-nums`) e ícone `ArrowUpRight` com slide-in da esquerda (`md:-translate-x-2 md:opacity-0` → `translate-x-0 opacity-100` em hover/focus-visible) em `text-brand-bright`.
    4. **Gatilho de Case Study:** Clicar ou acionar via teclado abre o **`ProjectDialog`** correspondente e restaura o foco ao botão de origem ao fechar.

---

## 4. Dialog de Case Completo (`src/components/portfolio/project-dialog.tsx`)

Todos os projetos da seção (tanto os cards em destaque quanto os itens de *"Mais projetos"*) abrem um modal dedicado estruturado como **Case Study completo**, inspirado em `victordeveloper.com` e padronizado visualmente com [sobre-dialog.tsx](../src/components/portfolio/sobre-dialog.tsx):

- **Semântica e Comportamento:**
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="project-dialog-title"`.
  - Bloqueia scroll da página (`document.body.style.overflow = "hidden"`) + `data-lenis-prevent` no container rolável interno.
  - Botão de fechar no topo direito com `z-20 cursor-pointer`, foco automático na abertura e devolução do foco ao botão/card de origem ao fechar (`Escape`, clique no backdrop ou botão fechar).
  - Animação de entrada/saída fluida em `cubic-bezier(0.16, 1, 0.3, 1)` (fade + `translateY(16px)` → `0` + `scale(0.98)` → `1`); em `prefers-reduced-motion: reduce`, apenas transição imediata/opacidade.
- **Estrutura Obrigatória do Case dentro do Modal:**
  1. **Topo:** Categoria + Ano à esquerda; botão fechar (`X`) à direita.
  2. **Cabeçalho:** Título monumental (`Space Grotesk`) + subtítulo de uma linha.
  3. **Mídia / Galeria do Case:** Visual ampliado em `aspect-[16/9]` com suporte a múltiplos slides/telas (setas `← →` + indicador `1 / N` + atalho de teclado `ArrowLeft` / `ArrowRight` quando houver 2+ itens).
  4. **Corpo do Case em 2 colunas (`lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]`):**
     - **Coluna Principal — Narrativa do Case (3 blocos obrigatórios em todo projeto):**
       1. **Descrição geral (`overview`):** Visão macro do produto/projeto, público, contexto e objetivo principal em parágrafo editorial introdutório.
       2. **O desafio (`challenge`):** Qual problema real ou gargalo técnico/de negócio motivou o desenvolvimento.
       3. **A solução (`solution`):** Como a arquitetura, o design e a engenharia resolveram o desafio na prática.
       - *(Bloco complementar)* **Destaques (`highlights`):** Lista objetiva de resultados, métricas ou funcionalidades-chave entregues.
     - **Coluna Lateral (`aside`):** Stack completa de tecnologias em pills + botões de ação externa (**Acessar projeto ↗**, **Ver código no GitHub ↗**) quando disponíveis.

---

## 5. Coreografia GSAP + Lenis e Acessibilidade

Todo código GSAP roda isolado em `useGSAP` + `gsap.matchMedia()` dentro de `projetos.tsx`, garantindo cleanup automático e zero conflito com o Lenis (já sincronizado ao `gsap.ticker` em `smooth-scroll.tsx`):

1. **Desktop Stacking (`(min-width: 900px) and (prefers-reduced-motion: no-preference)`):**
   - Constantes sincronizadas com o CSS: `STACK_STEP_PX = 14`, e leitura dinâmica do `top` base (`clamp(88px, 11vh, 112px)` calculado via `Math.min(112, Math.max(88, window.innerHeight * 0.11))`).
   - Para cada card `i` em `.project-card` onde existe `next = cards[i + 1]`:
     - `scrollTrigger`: `{ trigger: next, start: "top bottom", end: () => "top " + (baseTop + (i + 1) * STACK_STEP_PX) + "px", scrub: true, invalidateOnRefresh: true }`
     - `gsap.to(cardInner, { scale: 0.92, ease: "none", scrollTrigger })`
     - `gsap.to(cardShade, { opacity: 0.65, ease: "none", scrollTrigger })`
   - Nota: Após montar imagens/layouts, chamar `ScrollTrigger.refresh()` se necessário ou usar alturas explícitas (`h-[min(74svh,680px)]`) para evitar recalculo inesperado.
2. **Mobile (`(max-width: 899px) and (prefers-reduced-motion: no-preference)`):**
   - Sem `sticky`, sem `scale` e sem `.project-shade` animada.
   - Cada `.project-card` entra suavemente com `gsap.from(card, { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 86%", once: true } })`.
3. **Lista `"Mais projetos"` (`prefers-reduced-motion: no-preference`):**
   - `gsap.from(".project-row", { y: 20, autoAlpha: 0, duration: 0.75, stagger: 0.06, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: ".projects-list", start: "top 88%", once: true } })` (`clearProps: "transform"` garante remoção de `transform` inline após a entrada para preservar `z-20` no hover/focus do preview flutuante).
4. **Reduced Motion (`prefers-reduced-motion: reduce`):**
   - Nenhuma animação de scroll, spotlight ou hover 3D; todos os cards e linhas visíveis em fluxo vertical limpo, mantendo contraste e navegação completa.

---

## 6. Modelo de Dados TypeScript (`src/data/projetos.ts`)

```ts
export type ProjectMedia =
  | {
      type: "placeholder";
      variant: "dashboard" | "ecommerce" | "saas" | "devtools" | "editorial";
      label: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      poster: string;
      alt: string;
    };

export interface ProjectCaseDetails {
  /** Descrição geral do projeto (visão macro e contexto) */
  overview: string;
  /** O desafio enfrentado (problema técnico ou de negócio) */
  challenge: string;
  /** A solução implementada para resolver o desafio */
  solution: string;
  /** Principais entregas ou resultados do case */
  highlights: string[];
  /** Mídias exibidas na galeria do modal */
  gallery: ProjectMedia[];
}

export interface ProjectItem {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  summary: string;
  accentColor?: string;
  featured: boolean;
  techs: string[];
  liveUrl?: string;
  repoUrl?: string;
  cover: ProjectMedia;
  details: ProjectCaseDetails;
}

export interface ProjetosContent {
  eyebrow: string;
  countSuffix: string;
  titleLine1: string;
  titleLine2: string;
  lead: string;
  moreTitle: string;
  moreSubtitle: string;
  ctaCaseLabel: string;
  ctaLiveLabel: string;
  ctaRepoLabel: string;
  closeDialogAriaLabel: string;
  items: ProjectItem[];
}
```

### Conteúdo Placeholder Inicial (`src/data/projetos.ts`)
- **Cabeçalho:** `"03 — Projetos"`, `"Projetos em / destaque."`, lead conciso em *Lorem ipsum*.
- **4 Projetos em Destaque (`featured: true`)** na pilha *Sticky Card Stacking*:
  1. `01` — **Lorem Dashboard IA** (`"Dashboard · IA"`, `2026`, `variant: "dashboard"`)
  2. `02` — **Dolor Commerce** (`"E-commerce · FullStack"`, `2025`, `variant: "ecommerce"`)
  3. `03` — **Consectetur Cloud SaaS** (`"SaaS · Arquitetura"`, `2025`, `variant: "saas"`)
  4. `04` — **Adipiscing CLI & Docs** (`"DevTools · Open Source"`, `2024`, `variant: "devtools"`)
- **4 Projetos Adicionais (`featured: false`)** na lista `"Mais projetos"`:
  - `05` a `08` com títulos, resumos em *Lorem ipsum*, categorias, anos, stack completa e `details` prontos para abrir no `ProjectDialog`.

---

## 7. Checklist de Verificação da Implementação

- [ ] `position: sticky` funciona perfeitamente em `>= 900px` sem nenhum `overflow: hidden` bloqueando ancestrais (`#projetos` usa `overflow-x-clip`).
- [ ] Ao rolar entre cards em desktop, o card anterior reduz suavemente para `scale: 0.92` e escurece (`0` → `0.65`) sem cortes ou saltos no Lenis.
- [ ] O topo dos cards empilhados nunca fica coberto pelo header flutuante `#navbar` (`top` ≥ `88px`).
- [ ] Em mobile (`375px` / `< 900px`), o stacking desativa e os cards fluem verticalmente sem overflow horizontal.
- [ ] Clicar em qualquer card, botão `Ver case completo` ou linha de `Mais projetos` abre o `ProjectDialog` estruturado como Case Study completo com os blocos obrigatórios **Descrição geral**, **O desafio** e **A solução** (além de galeria navegável por cliques e `←`/`→`, destaques, tecnologias, bloqueio de scroll `data-lenis-prevent`, `Escape` e foco restaurado ao fechar).
- [ ] Clicar nos links externos (`Acessar ↗` / `GitHub ↗`) dentro do card não dispara abertura indesejada do modal.
- [ ] Na lista `"Mais projetos"` (`InteractiveHoverLinks`), o hover/focus-visible em desktop anima o stagger por letra do título, revela o preview flutuante inclinado (`ProjectMedia`) rastreando o ponteiro sem recortes verticais (`.projects-more`/`.projects-list` sem `overflow-hidden` e `clearProps: "transform"` no GSAP) e desliza a seta `ArrowUpRight`; em touch (`pointerType === "touch"`) e `prefers-reduced-motion: reduce`, o rastreamento de ponteiro, stagger e preview flutuante ficam desativados mantendo toda a linha legível e clicável.
- [ ] `prefers-reduced-motion: reduce` desativa `sticky`, `scale`, `shade`, spotlight e preview flutuante da lista mantendo tudo legível.
- [ ] `npm run check` e `npm run build` passam sem erros.
