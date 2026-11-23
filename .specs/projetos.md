# Especificação Técnica — Seção 3: Projetos (`#projetos`)

## 1. Visão Geral e Fusão das Referências

A seção **Projetos (`#projetos`)** adapta o padrão **Sticky Card Stacking** (*Scroll-driven Card Overlap*) das duas referências analisadas para a estética **Editorial-Tech Fullscreen** do portfólio de **Mateus Araujo** (`#0D0D0D`, `#141318`, `#4811ED` / `#793CFF`, `Space Grotesk` + `Montserrat`):

1. **Referência 1 — `victordeveloper.com` (Profundidade no Scroll + Lista Secundária + Modal de Case):**
   - **Empilhamento com recuo físico:** Conforme o card seguinte sobe no scroll (`GSAP + ScrollTrigger` com `scrub: true`), o card anterior encolhe suavemente (`scale: 0.92`, `transform-origin: 50% 0%`) e recebe um escurecimento progressivo (`.project-shade` até `opacity: 0.65`), criando hierarquia clara entre o projeto em foco e os projetos já arquivados atrás dele.
   - **Bloco secundário `"Mais projetos"`:** Abaixo da pilha principal, uma lista editorial compacta exibe 3 projetos adicionais com numeração, título, preview fotográfico no hover e abertura de case.
   - **Dialog de Case (Obrigatório para todos os projetos):** Clicar em qualquer card da pilha ou linha da lista *"Mais projetos"* abre um modal estruturado de projeto, exibindo obrigatoriamente **Descrição geral**, galeria e tecnologias, além dos blocos opcionais **O desafio**, **A solução** e **Destaques** quando preenchidos (cases completos em destaque exibem todos os blocos; projetos mais simples da lista *"Mais projetos"* exibem apenas **Descrição geral**, galeria e tecnologias).
2. **Referência 2 — `ruancostadev.com.br` (Escala Fullscreen + Ritmo de Leitura + Spotlight):**
   - **Escala panorâmica de tela cheia:** Cards proporcionais à largura generosa do grid de `1600px` (`min-[900px]:min-h-[400px]`, mídia widescreen `aspect-[19/9]`), com cantos concêntricos e degrau superior escalonado (`--stack-index`).
   - **Ritmo de scroll controlado:** Espaçadores proporcionais à viewport entre os cards (`md:h-[36vh]`) garantem tempo de leitura confortável antes que o próximo card cubra o anterior.
   - **Spotlight sutil de ponteiro + CTA único no card:** Em desktop, um brilho radial discreto (`#793CFF` / `#4811ED`) reage ao cursor na borda e superfície do card (sem tilt 3D agressivo, mantendo o card arquitetonicamente firme durante o `scale` do scroll) e o rodapé do card apresenta apenas o CTA **`Ver case completo`**, mantendo os links externos (**`Acessar`** e **`GitHub`** condicional) exclusivamente no dialog de Case Study.

> [!NOTE]
> **Conteúdo Atual:** Os **4 projetos em destaque (`featured: true`)** utilizam títulos, capas, galerias reais (`public/projects/`) e links reais em [src/data/projetos.ts](../src/data/projetos.ts), mantendo textos descritivos em **Lorem ipsum** enquanto os cases completos estão em redação. Os **3 projetos adicionais (`featured: false`)** na lista *"Mais projetos"* (`Calculadora`, `Lista de Tarefas` e `Lâmpada Interativa`) utilizam capas reais em `public/projects/` e textos reais em português em [src/data/projetos.ts](../src/data/projetos.ts) — exibindo apenas título e preview fotográfico na lista e somente **Descrição geral**, galeria e tecnologias (`HTML`, `CSS`, `JavaScript`) no modal, omitindo `challenge`, `solution` e `highlights`.
> Os projetos suportam `visibility` (`"public" | "private"`) para controlar a exibição de links de repositório e `status` (`"completed" | "in_progress"`) exibido como badge editorial (`Concluído` / `Em desenvolvimento`) dentro do modal `ProjectDialog`.

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/projetos.ts`):**
  - Centraliza `eyebrow`, título e subtítulo da seção, **4 projetos em destaque (`featured`)** para a pilha Sticky e **3 projetos adicionais (`archive`)** para a lista `"Mais projetos"`, além de labels reutilizáveis de botões e modal (`pt-BR` agora, pronto para `en` ou API).
- **Preview Visual Placeholder / Mídia (`src/components/portfolio/project-media.tsx`):**
  - Renderiza mídia real (`<video>` com `IntersectionObserver` ou `<img>` com `object-contain` por padrão sobre `#0D0D0D` para preservar 100% das bordas sem zoom/recorte, respeitando `fit?: "cover" | "contain"` onde `"contain"` aplica respiro `p-2 sm:p-4` para screenshots verticais mobile) quando `media.type` for `"video"` ou `"image"`, ou um **Mockup Visual Editorial-Tech** em SVG/HTML estilizado (`#0D0D0D`, grade sutil, elementos de UI abstratos e acento `#793CFF`/`#4811ED`) quando `media.type === "placeholder"`, com container queries (`@container`, breakpoints `@[300px]` / `@[420px]`) para manter nitidez tanto nos cards grandes quanto no preview flutuante compacto (`aspect-[19/9] w-64 lg:w-80`).
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
   - Direita: `"7 projetos"` *(contagem dinâmica `featured.length + archive.length`)*
2. **Bloco Introdutório (`grid` 2 colunas em `lg`):**
   - **Esquerda (`<h2 id="projetos-title">`):** `font-display font-semibold text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em] text-foreground` (`"Projetos em / destaque."`).
   - **Direita (Lead):** `max-w-[46ch] text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.65] text-muted-foreground` (`"Uma seleção de projetos em que transformei ideias e desafios em soluções digitais, da ideia à implementação."`).

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
  - Estrutura: `group/card relative flex cursor-pointer flex-col origin-top overflow-hidden rounded-[24px] border border-white/10 bg-card p-3 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/20 will-change-transform md:p-5 min-[900px]:grid min-[900px]:h-auto min-[900px]:min-h-[400px] min-[900px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] min-[900px]:items-stretch`
  - `transform-origin: 50% 0%` + `will-change: transform`.
  - **Camadas Visuais do Card:**
    1. **Spotlight sutil de ponteiro (desktop apenas, `pointer-events-none hidden min-[900px]:block motion-reduce:hidden`):**
       - Glow radial interno no cursor (`size-72 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`) usando a cor de acento do projeto (padrão `--brand-bright` / `#793CFF` com opacidade baixa `0.14`).
       - Realce de borda via máscara CSS (`radial-gradient(380px circle at var(--mx) var(--my), rgba(121, 60, 255, 0.55), transparent 65%)` com `mask-composite: exclude`).
    2. **Coluna Esquerda — Mídia (`ProjectMedia`):**
       - Container `relative aspect-[19/9] w-full self-center overflow-hidden rounded-[14px] border border-white/8 bg-[#0D0D0D]` para enquadramento widescreen sem corte lateral.
       - Hover suave na mídia: `transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.01] motion-reduce:transition-none`.
    3. **Coluna Direita — Conteúdo Editorial (`flex flex-col justify-between gap-6 p-4 pt-6 min-[900px]:p-8 xl:p-10`):**
       - **Topo:** Exibe apenas o índice monumental alinhado à direita (`01`, `02`, `03`, `04` em `font-display text-3xl font-semibold text-white/18 tabular-nums` dentro de `flex items-start justify-end`), enquanto categoria, ano e badge de status (`PROJECT_STATUS_META[project.status]`: `"Concluído"` ou `"Em desenvolvimento"`) permanecem exclusivamente no `ProjectDialog`.
       - **Centro:**
         - Título (`<h3 className="font-display text-[clamp(1.6rem,2.6vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">`) + subtítulo curto (`mt-2 text-sm font-medium text-muted-foreground`).
         - Descrição concisa (`mt-4 max-w-[44ch] text-[0.95rem] leading-[1.65] text-muted-foreground`).
         - Pills de tecnologias (`mt-6 flex flex-wrap gap-2`): `rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-foreground/80`.
       - **Base (`mt-auto flex flex-wrap items-center gap-3 pt-4`):**
         - Exibe exclusivamente o botão principal **`Ver case completo`** (`ctaCaseLabel`, em `bg-brand text-foreground hover:brightness-110 rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer`).
         - Os links externos (**`Acessar ↗`** via `ctaLiveLabel` quando `Boolean(project.liveUrl)` e **`GitHub ↗`** via `ctaRepoLabel` quando `project.visibility === "public" && Boolean(project.repoUrl)`) são exibidos apenas dentro do `ProjectDialog`.
    4. **Scrim de Profundidade (`.project-shade`):**
       - `<div aria-hidden="true" className="project-shade pointer-events-none absolute inset-0 z-20 bg-background opacity-0" />`
       - Animado pelo GSAP quando o card seguinte avança sobre ele (`0` → `0.65`).

### C) Lista Secundária — `"Mais projetos"` (`.projects-more`)
Logo abaixo da pilha de cards (`mt-20 md:mt-28`, sem `overflow-hidden` na `.projects-more` nem na `.projects-list` para não recortar verticalmente o preview flutuante):
- **Cabeçalho:** Título `"Mais projetos"` (`font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold tracking-[-0.02em]`) + texto auxiliar discreto (`"Outros experimentos, estudos e entregas."`).
- **Lista Editorial (`<InteractiveHoverLinks className="projects-list mt-6 border-t border-border" rowClassName="project-row" ... />`):**
  - Cada item de `archiveItems` é mapeado para `InteractiveHoverLinkItem` com apenas `id`, `indexLabel`, `heading: project.title`, `preview: <ProjectMedia media={project.cover} />`, `onClick`, `ariaHasPopup: "dialog"` e `ariaExpanded` (omitindo `subheading`, `category` e `year`), sendo renderizado como `<button type="button">` interativo e acessível (`group/row`).
  - **Comportamento por linha (`.project-row`):**
    1. **Índice + Título com Stagger por Caractere:** Número (`05`–`07` em `tabular-nums text-xs text-muted-foreground`) + título (`Space Grotesk`, `text-2xl sm:text-3xl lg:text-4xl`) com `<span className="sr-only">` para leitores de tela e letras tokenizadas que deslocam com stagger (`22ms` por caractere, teto `320ms`, `cubic-bezier(0.34,1.56,0.64,1)`) em hover/focus-visible (`motion-safe`), exibindo exclusivamente o título na linha.
    2. **Preview Flutuante Inclinado (`md:block`, oculto em `motion-reduce`):** Card flutuante (`aspect-[19/9] w-64 lg:w-80`, `rounded-[16px]`, `pointer-events-none`) contendo `<ProjectMedia media={project.cover} />` que transiciona de `opacity-0 [transform:translate(-50%,-50%)_scale(0)_rotate(-12.5deg)]` para `opacity-100 [transform:translate(-50%,-50%)_scale(1)_rotate(10deg)]` e acompanha o cursor via variáveis CSS `--hover-x` / `--hover-y` (ignorando `pointerType === "touch"` e `prefers-reduced-motion: reduce`), enquanto a linha ativa sobe para `hover:z-20` / `focus-visible:z-20`.
    3. **Ação:** Ícone `ArrowUpRight` com slide-in da esquerda (`md:-translate-x-2 md:opacity-0` → `translate-x-0 opacity-100` em hover/focus-visible) em `text-brand-bright`.
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
  1. **Topo:** Categoria + Ano + badge de status (`PROJECT_STATUS_META[cachedProject.status]`) à esquerda; botão fechar (`X`) à direita.
  2. **Cabeçalho:** Título monumental (`Space Grotesk`) + subtítulo de uma linha.
  3. **Mídia / Galeria do Case:** Visual ampliado em `aspect-[19/9]` com suporte a imagens reais (`type: "image"`, renderizadas com `object-contain` para zero recorte e `fit?: "contain"` com respiro adicional para capturas mobile verticais), múltiplos slides/telas (setas `← →` + indicador `1 / N` + atalho de teclado `ArrowLeft` / `ArrowRight` quando houver 2+ itens) e visualizador em tela cheia (`z-[130]`, `bg-black/95`, `max-h-[92svh] max-w-[96vw] object-contain`) acionável pelo botão `Maximize2` no canto superior direito ou clique na imagem (`Escape` fecha primeiro a tela cheia antes do modal).
  4. **Corpo do Case em 2 colunas (`lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]`):**
     - **Coluna Principal — Narrativa do Case:**
       1. **Descrição geral (`overview`, obrigatório):** Visão macro do produto/projeto, público, contexto e objetivo principal em parágrafo editorial introdutório.
       2. **O desafio (`challenge`, opcional):** Qual problema real ou gargalo técnico/de negócio motivou o desenvolvimento (renderizado apenas quando definido).
       3. **A solução (`solution`, opcional):** Como a arquitetura, o design e a engenharia resolveram o desafio na prática (renderizado apenas quando definido).
       - *(Bloco complementar opcional)* **Destaques (`highlights`, opcional):** Lista objetiva de resultados, métricas ou funcionalidades-chave entregues (renderizado apenas quando definido e não vazio).
       - Projetos mais simples em `"Mais projetos"` omitem `challenge`, `solution` e `highlights`, exibindo apenas **Descrição geral** junto à galeria e tecnologias.
     - **Coluna Lateral (`aside`):** Stack completa de tecnologias em pills + bloco `Links` renderizado condicionalmente quando houver link visível (**Acessar ↗** via `ctaLiveLabel` para `Boolean(liveUrl)` e **GitHub ↗** via `ctaRepoLabel` apenas para `visibility === "public" && Boolean(repoUrl)`).

---

## 5. Coreografia GSAP + Lenis e Acessibilidade

Todo código GSAP roda isolado em `useGSAP` + `gsap.matchMedia()` dentro de `projetos.tsx`, garantindo cleanup automático e zero conflito com o Lenis (já sincronizado ao `gsap.ticker` em `smooth-scroll.tsx`):

1. **Desktop Stacking (`(min-width: 900px) and (prefers-reduced-motion: no-preference)`):**
   - Constantes sincronizadas com o CSS: `STACK_STEP_PX = 14`, e leitura dinâmica do `top` base (`clamp(88px, 11vh, 112px)` calculado via `Math.min(112, Math.max(88, window.innerHeight * 0.11))`).
   - Para cada card `i` em `.project-card` onde existe `next = cards[i + 1]`:
     - `scrollTrigger`: `{ trigger: next, start: "top bottom", end: () => "top " + (baseTop + (i + 1) * STACK_STEP_PX) + "px", scrub: true, invalidateOnRefresh: true }`
     - `gsap.to(cardInner, { scale: 0.92, ease: "none", scrollTrigger })`
     - `gsap.to(cardShade, { opacity: 0.65, ease: "none", scrollTrigger })`
   - Nota: Após montar imagens/layouts, chamar `ScrollTrigger.refresh()` se necessário ou usar proporções explícitas (`aspect-[19/9]`) para evitar recalculo inesperado.
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
export type ProjectVisibility = "public" | "private";
export type ProjectStatus = "completed" | "in_progress";

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; dotClass: string }
> = {
  completed: { label: "Concluído", dotClass: "bg-emerald-400" },
  in_progress: { label: "Em desenvolvimento", dotClass: "bg-amber-400" },
};

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
      fit?: "cover" | "contain";
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
  challenge?: string;
  /** A solução implementada para resolver o desafio */
  solution?: string;
  /** Principais entregas ou resultados do case */
  highlights?: string[];
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
  visibility: ProjectVisibility;
  status: ProjectStatus;
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

### Projetos em Destaque e Placeholder (`src/data/projetos.ts`)
- **Cabeçalho:** `"03 — Projetos"`, `"Projetos em / destaque."`, lead `"Uma seleção de projetos em que transformei ideias e desafios em soluções digitais, da ideia à implementação."`.
- **4 Projetos em Destaque (`featured: true`)** na pilha *Sticky Card Stacking* com fotos reais em `public/projects/`:
  1. `01` — **Anatolab - Anatomia Humana em 3D** (`"anatolab"`, `visibility: "public"`, `status: "completed"`, `liveUrl` + `repoUrl`, imagens em `/projects/anatolab/`)
  2. `02` — **CMF - Sistema de Gerenciamento** (`"cmf"`, `visibility: "private"`, `status: "completed"`, sem links públicos, imagens em `/projects/cmf/` incluindo `imagem5-celular.png` com `fit: "contain"`)
  3. `03` — **Civix - Chatbot para Construção Civil** (`"civix"`, `visibility: "private"`, `status: "completed"`, sem links públicos, imagens em `/projects/civix/`)
  4. `04` — **José William - Portfolio Pessoal** (`"jose-william"`, `visibility: "public"`, `status: "completed"`, `liveUrl` + `repoUrl`, imagens em `/projects/bahia/`)
- **3 Projetos Adicionais (`featured: false`)** na lista `"Mais projetos"` (exibindo apenas título + foto no hover na lista, e apenas **Descrição geral**, galeria e tecnologias `HTML`, `CSS`, `JavaScript` no `ProjectDialog`, com `challenge`, `solution` e `highlights` omitidos):
  1. `05` — **Calculadora** (`"calculadora"`, `visibility: "private"`, `status: "completed"`, imagem em `/projects/calculadora/capa.png`)
  2. `06` — **Lista de Tarefas** (`"lista-de-tarefas"`, `visibility: "private"`, `status: "completed"`, imagem em `/projects/lista-tarefas/capa.png`)
  3. `07` — **Lâmpada Interativa** (`"lampada-interativa"`, `visibility: "private"`, `status: "completed"`, imagem em `/projects/lampada/capa.png`)

---

## 7. Checklist de Verificação da Implementação

- [ ] `position: sticky` funciona perfeitamente em `>= 900px` sem nenhum `overflow: hidden` bloqueando ancestrais (`#projetos` usa `overflow-x-clip`).
- [ ] Ao rolar entre cards em desktop, o card anterior reduz suavemente para `scale: 0.92` e escurece (`0` → `0.65`) sem cortes ou saltos no Lenis.
- [ ] O topo dos cards empilhados nunca fica coberto pelo header flutuante `#navbar` (`top` ≥ `88px`).
- [ ] Em mobile (`375px` / `< 900px`), o stacking desativa e os cards fluem verticalmente sem overflow horizontal.
- [ ] Clicar em qualquer card, botão `Ver case completo` ou linha de `Mais projetos` abre o `ProjectDialog` estruturado com **Descrição geral** obrigatória e os blocos opcionais **O desafio**, **A solução** e **Destaques** quando presentes (além de galeria navegável por cliques e `←`/`→`, tecnologias, links externos `Acessar ↗` / `GitHub ↗` quando aplicáveis, bloqueio de scroll `data-lenis-prevent`, `Escape` e foco restaurado ao fechar).
- [ ] Cada card em destaque exibe exclusivamente o botão `Ver case completo` (`ctaCaseLabel`), mantendo os links externos (`Acessar ↗` via `ctaLiveLabel` e `GitHub ↗` via `ctaRepoLabel`, condicional à visibilidade pública) exclusivamente dentro do `ProjectDialog`.
- [ ] Na lista `"Mais projetos"` (`InteractiveHoverLinks`), o hover/focus-visible em desktop anima o stagger por letra do título, revela o preview flutuante inclinado (`ProjectMedia`) rastreando o ponteiro sem recortes verticais (`.projects-more`/`.projects-list` sem `overflow-hidden` e `clearProps: "transform"` no GSAP) e desliza a seta `ArrowUpRight`; em touch (`pointerType === "touch"`) e `prefers-reduced-motion: reduce`, o rastreamento de ponteiro, stagger e preview flutuante ficam desativados mantendo toda a linha legível e clicável.
- [ ] `prefers-reduced-motion: reduce` desativa `sticky`, `scale`, `shade`, spotlight e preview flutuante da lista mantendo tudo legível.
- [ ] `npm run check` e `npm run build` passam sem erros.
