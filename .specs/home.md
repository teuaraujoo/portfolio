# Especificação Técnica — Home (`Header` + `Hero`)

## 1. Visão Geral e Contexto Geral do Projeto

### Posicionamento e Público-Alvo
O portfólio de **Mateus Araujo** atende a três públicos principais simultaneamente:
1. **Recrutadores:** precisam identificar senioridade, clareza técnica e experiência rapidamente.
2. **Clientes:** buscam confiança, capacidade de entrega e um caminho direto para contato/orçamento.
3. **Comunidade / Interessados em conteúdo Tech:** valorizam consistência técnica, código aberto e contribuições (evidenciadas logo na primeira dobra pelo Mapa de Contribuições do Git).

### Idioma e Estratégia de Dados
- **Idioma inicial:** `pt-BR` (preparado estruturalmente para receber internacionalização `en` no futuro).
- **Camada de dados:** TypeScript local e fortemente tipado (`src/data/home.ts` / `src/types/portfolio.ts`), isolado dos componentes de UI para permitir migração transparente para consumo via API no futuro.

### Mapa das 8 Seções da Single Page (`/`)
*(Com previsão de páginas dedicadas para sessões específicas em etapas futuras)*

1. **Home** *(Preloader + Header/Navbar + Hero com Git Contribution Map)*
2. **Sobre**
3. **Projetos**
4. **Jornada**
5. **Skills**
6. **CTA**
7. **Contato**
8. **Footer**

### Stack da Seção
- **Next.js 16** (App Router, React 19, estrutura *Server-first* onde a página lê os dados tipados e passa para os módulos interativos).
- **TypeScript** estrito.
- **Tailwind CSS 4** consumindo tokens semânticos de [src/app/globals.css](../src/app/globals.css).
- **GSAP + `@gsap/react`** (`useGSAP`) para entradas, timeline sincronizada com o Preloader e saída opcional no scroll.
- **Lenis (`lenis` `^1.3.27`)** já instalado no projeto para smooth scroll integrado ao `gsap.ticker`.

---

## 2. Estrutura Visual da Home (Tela Cheia `100svh`)

A seção Home adota uma composição **fullscreen (`100svh`)**, com bastante espaço negativo e estética **editorial-tech**.

### Diferenças críticas em relação à referência (`victordeveloper.com`)
1. **Remoção total da logo 3D em partículas:** não haverá canvas WebGL nem animação de logo flutuante; o espaço visual na coluna direita é ocupado pelo **Mapa de Contribuições do Git (`ContributionSkyline`)**.
2. **Distribuição assimétrica da Hero (espelhando a referência `victordeveloper.com`):**
   - **Lado Esquerdo:** concentra toda a identidade verbal e tipográfica — o nome **`Mateus Araujo`** em escala monumental como título principal (`<h1>`, com `Mateus` alinhado à esquerda e `Araujo` deslocado para a direita), a **tag de cargo e localização** logo abaixo e o **pequeno texto introdutório** (*Lorem ipsum* inicial).
   - **Lado Direito:** abriga o **Mapa do Git** (`ContributionSkyline`, componente do **21st.dev**) em escala compacta (`max-w-[400px] xl:max-w-[440px]`), posicionado na **parte inferior direita** logo acima do **indicador de scroll** ancorado no **canto inferior direito**, preservando amplo respiro visual no quadrante superior direito para o título monumental.
3. **Header / Navbar Flutuante Unificado:** em vez de elementos separados nas pontas ou barra de largura total, adota **um único dock de vidro luminoso centralizado no topo** (`fixed top-4 inset-x-0 flex justify-center`) sem fundo externo, abrigando internamente o **ícone da marca (`/icon.svg`) à esquerda**, os **links de navegação com indicador ativo deslizante ao centro** e o **CTA roxo `Fale comigo ↗` à direita**.

---

## 3. Especificação Detalhada do Header / Navbar (`#navbar`)

### Posicionamento e Wrapper Flutuante (compatível com GSAP)
- **Wrapper Externo (`<header id="navbar">`):** sem fundo, sem borda e sem barra de largura total em nenhum estado de scroll:
  - `pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4`
  - **Por que `inset-x-0 flex justify-center` (sem `-translate-x-1/2`)?** Permite que a timeline de entrada GSAP (`gsap.fromTo("#navbar", { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, clearProps: "transform" })`) anime `y` sem conflitar ou sobrescrever a centralização horizontal.
- **Container Único Principal (Dock Translúcido de Vidro Luminoso + `ConcentricRectangle`):**
  - `pointer-events-auto relative flex w-max max-w-full items-center gap-1 rounded-(--dock-radius) p-(--dock-pad)`
  - Tokens locais concêntricos (baseado no `ConcentricRectangle` da Apple: `R_interno = max(R_minimo, R_externo - inset)`):
    - `[--dock-radius:14px] [--dock-pad:6px] [--dock-inner-radius:max(4px,calc(var(--dock-radius)_-_var(--dock-pad)))]` (`14px - 6px = 8px` interno paralelo ao arco externo).
  - `border border-white/25 bg-linear-to-b from-white/18 to-white/6`
  - `shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_12px_40px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl backdrop-saturate-150`

### 1. Esquerda dentro do Dock (`.nav-brand`)
- Link âncora para `#hero`: `group/brand flex h-10 shrink-0 items-center rounded-(--dock-inner-radius) px-2.5 sm:px-3`
- Conteúdo: Ícone da marca **`/icon.svg`** ([public/icon.svg](../public/icon.svg), `268x239`, renderizado com `<img width={268} height={239} className="h-5 w-auto shrink-0 sm:h-6 ..."/>`).
- Microinteração no hover/focus: `transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/brand:-rotate-12 group-hover/brand:scale-110 group-focus-visible/brand:-rotate-12 group-focus-visible/brand:scale-110 motion-reduce:transition-none` (inclinação para a esquerda `-12deg` combinada com leve zoom `1.10`).
- Separador vertical sutil antes dos links no desktop (`lg:`): `<span aria-hidden="true" className="mx-1 hidden h-5 w-px shrink-0 bg-white/15 lg:block" />`.

### 2. Meio dentro do Dock (`<nav aria-label="Navegação principal">` — Desktop `lg: >= 1024px`)
- **Wrapper relativo para os links:** `relative hidden items-center gap-1 lg:flex`
- **Indicador Ativo Deslizante (`sliding pill` via `useLayoutEffect`):**
  - `<span ref={indicatorRef} aria-hidden="true" />` posicionado atrás dos links dentro do mesmo `<nav>`:
    - `pointer-events-none absolute top-0 bottom-0 left-0 rounded-(--dock-inner-radius) bg-white/18 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[translate,width,opacity] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none`
  - Referências de cada `<a>` armazenadas em `Map<string, HTMLAnchorElement>` e medidas em `useLayoutEffect` (recalculando em mudança de `activeId`, `resize`, `ResizeObserver` e `document.fonts.ready`) usando `offsetWidth` e `offsetLeft`:
    - `indicator.style.opacity = activeEl && activeEl.offsetWidth > 0 ? "1" : "0"`
    - `indicator.style.width = "${activeEl.offsetWidth}px"`
    - `indicator.style.translate = "${activeEl.offsetLeft}px 0"`
- **Links de Navegação (apenas textos, sem avatar nem prefixos numéricos `01, 02...`):**
  - `Início` (`#hero`), `Sobre` (`#sobre`), `Projetos` (`#projetos`), `Jornada` (`#jornada`), `Skills` (`#skills`), `Contato` (`#contato`).
  - **Proporções e Tipografia:** `relative z-10 flex h-10 items-center gap-2 rounded-(--dock-inner-radius) px-3 xl:px-4 font-sans text-[0.95rem] font-semibold tracking-[-0.01em] whitespace-nowrap outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/70`.
  - **Estado Ativo:** `text-white`.
  - **Estado Inativo:** `text-white/75 hover:text-white`.

### 3. Direita dentro do Dock (CTA + Botão Mobile)
- **Botão CTA (`Fale comigo ↗`):**
  - Link/botão na ponta direita **dentro do mesmo dock** (`ml-1 hidden min-[420px]:flex h-10 shrink-0 items-center gap-1.5 rounded-(--dock-inner-radius) px-3.5 sm:px-4`).
  - Cores e brilho roxo da marca: `bg-brand text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]` (`#4811ED` com `#F5F5F5`).
  - Tipografia: `font-sans text-sm lg:text-[0.95rem] font-bold tracking-[-0.01em] whitespace-nowrap`.
  - Hover / Focus: `hover:brightness-110`; ícone `ArrowUpRight` (`strokeWidth={2.5}`, `size-4`) translada `group-hover:translate-x-0.5 group-hover:-translate-y-0.5` em `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Botão Mobile (`Menu`):**
  - Visível abaixo de `1024px` (`lg:hidden`) dentro do mesmo dock flutuante centralizado (`ml-1 flex h-10 min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-(--dock-inner-radius) bg-white/12 px-3 hover:bg-white/20`), garantindo que em `375px` (`< 420px`) o dock exiba apenas `[Logo | Menu]` sem transbordar (`max-w-full`).
  - Abre drawer/overlay fullscreen (`#mobile-menu`) em `#0D0D0D` com todos os links em tipografia grande (`Space Grotesk`, `clamp(2rem, 8vw, 3rem)`), fechamento por `Escape` e botão `Fale comigo ↗` na base.

---

## 4. Especificação Detalhada da Hero (`#hero`)

### Container Principal
- **Elemento:** `<section id="hero" aria-label="Apresentação">`
- **Dimensões:** `relative min-h-svh lg:h-svh w-full overflow-hidden bg-background text-foreground`
- **Espaçamento interno:** `px-[clamp(20px,4vw,56px)] pt-24 pb-6 md:pt-28 md:pb-8`
- **Grid de Composição (Desktop `>= 1024px`):**
  - Estrutura de 2 colunas assimétricas ocupando `h-full` (`max-w-[1600px]`):
    - `mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-stretch lg:gap-8 xl:gap-10`
  - A **Coluna 1 (Esquerda)** concentra o bloco principal de identidade (`Mateus Araujo` em escala monumental, tag de cargo e localização e texto introdutório), centralizado verticalmente na altura disponível (`lg:justify-center`), com largura generosa (`1.25fr`) para que o título escalonado jamais sofra recorte horizontal (`1024px`–`1920px`).
  - A **Coluna 2 (Direita)** (`lg:h-full lg:items-end lg:justify-end`) ancora o **Mapa do Git (`ContributionSkyline`)** compacto na **parte inferior direita** (`lg:mt-auto lg:mb-4 lg:self-end`), logo acima do indicador de scroll (`Role para explorar ↓`) fixado no **canto inferior direito**.
- **Responsividade Mobile (`< 1024px`):**
  - Coluna única vertical natural (`grid-cols-1`): Nome `Mateus Araujo` → Tag `Desenvolvedor FullStack · Aracaju, SE` → Frase introdutória → `ContributionSkyline` → `Role para explorar ↓`.

### Lado Esquerdo (Coluna Esquerda — Identidade & Narrativa)

Disposição vertical de cima para baixo dentro da coluna esquerda (espelhando o layout editorial da referência `victordeveloper.com`):

1. **Título Monumental — Nome como Título da Página (`<h1 class="hero-name">`):**
   - Texto em 2 linhas com quebra assimétrica:
     - Linha 1: `Mateus` (alinhada à esquerda com `ml-[-0.04em]` e máscara `pt-[0.04em] pb-[0.06em]`).
     - Linha 2: `Araujo` (deslocada para a direita com `pl-[0.75em] pr-[0.04em] lg:pl-[0.85em]` e máscara `-mt-[0.04em] pt-[0.04em] pb-[0.22em]` para preservar integralmente o descendente da letra `j` sem recorte pelo `overflow-hidden`).
   - Tipografia:
     - Família: `font-display` (`Space Grotesk`)
     - Peso: `font-medium` (`500`)
     - Escala fluida: `text-[clamp(4.5rem,13vw,14.5rem)]` *(presença monumental calibrada para caber integralmente na coluna esquerda em `1024px`, `1280px`, `1440px` e `1920px` dentro de `100svh` junto ao header superior)*
     - Entrelinha e Tracking: `leading-[0.84] tracking-[-0.055em]`
   - **Estrutura DOM para GSAP (split por caractere):**
     - `aria-label="Mateus Araujo"` no `<h1>` para leitura limpa em leitores de tela.
     - Linha 1 (`<span class="line ml-[-0.04em] block overflow-hidden pt-[0.04em] pb-[0.06em]" aria-hidden="true">`) e Linha 2 (`<span class="line -mt-[0.04em] block overflow-hidden pt-[0.04em] pb-[0.22em]" aria-hidden="true">`) -> `<span class="line-inner block will-change-transform">` -> caracteres individuais `<span class="char inline-block will-change-transform">`.

2. **Tag de Cargo e Localização (`.hero-eyebrow`):**
   - Posicionada logo abaixo do `<h1>` (`mt-3`, compensando o `pb-[0.22em]` da segunda linha para manter o respiro visual abaixo de `Araujo`).
   - Estilo: `inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-white/14 bg-white/[0.04] px-4 py-2.5 text-[clamp(13px,1.05vw,15px)] leading-none sm:flex-nowrap sm:whitespace-nowrap backdrop-blur-md`.
   - **Indicador pulsante (`.dot`):**
     - `size-2 shrink-0 rounded-full bg-brand-bright` (`#793CFF`)
     - Animação CSS `@keyframes hero-pulse` com anel expansivo em `rgba(121, 60, 255, 0.5)` → `rgba(121, 60, 255, 0)` (desativada em `prefers-reduced-motion`).
   - **Conteúdo:**
     - Cargo: `<span class="font-medium text-foreground">Desenvolvedor FullStack</span>`
     - Separador: `<span class="h-3.5 w-px bg-white/20" aria-hidden="true" />`
     - Localização: `<span class="text-muted-foreground">Aracaju, SE</span>`

3. **Pequeno Texto Introdutório (`.hero-lead`):**
   - Posicionado logo abaixo da tag (`mt-6 max-w-[46ch]`).
   - Tipografia: `font-sans` (`Montserrat`), `text-[clamp(0.95rem,1.2vw,1.125rem)]` (`15px–18px`), `leading-[1.6]`, `text-muted-foreground`.
   - Destaques em `<strong class="font-medium text-foreground">`.
   - Conteúdo inicial: *Lorem ipsum* estruturado no arquivo de dados `src/data/home.ts` como placeholder até o copy final.

### Lado Direito (Coluna Direita — Mapa do Git & Indicador de Scroll)

- **Mapa do Git (`ContributionSkyline` — 21st.dev):**
  - Componente base em `src/components/ui/contribution-skyline.tsx` (`"use client"`), recebendo os dados reais do servidor via props tipadas (`animate={active}`, `footer={null}`).
  - **Posição e Dimensões na Hero:** Ancorado na **parte inferior direita** da Hero (`w-full max-w-[400px] lg:mt-auto lg:mb-4 lg:self-end xl:max-w-[440px]`), dentro da coluna direita (`lg:h-full lg:items-end lg:justify-end`), logo acima de `.hero-foot`.
  - **Layout Minimalista Flutuante na Hero (sem fundo e sem bordas de card):** Com `showStats={false}`, `showLegend={false}`, `showToggle={true}` e `footer={null}`, o container raiz utiliza `bg-transparent border-0 p-0` e o palco usa `overflow-visible` sem caixa ou borda de fundo, fazendo os elementos flutuarem diretamente sobre `--background` (`#0D0D0D`):
    1. O cabeçalho com o total de contribuições (`"{total} contribuições no último ano"`) e o toggle **2D / 3D** em moldura sutil transparente.
    2. O palco do `<canvas>` interativo com cubos/barras 2D/3D flutuantes (altura de palco 3D calibrada em `Math.max(168, Math.min(212, width * 0.46))` para `< 500px`, `heightScale={0.78}`, `topClear: 12`, `bottomClear: 10`, `sideClear: 14`), mantendo tooltip flutuante ao passar o mouse sem recorte por `overflow-hidden`.
  - **Papel na Composição:** Traz prova visual técnica e profundidade 3D interativa de forma discreta no quadrante inferior direito sem competir com o título monumental `Mateus Araujo`.
- **Indicador de Scroll (`.hero-foot`):**
  - Ancorado no **canto inferior direito** da Hero (`mt-6 flex w-full justify-end lg:mt-0`).
  - Link para `#sobre`: `Role para explorar ↓` com `min-h-[44px]` para acessibilidade de toque.
  - Estilo: `font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors`.

#### Como o `ContributionSkyline` funciona internamente
- **Zero dependências externas além do React:** renderização híbrida em `<canvas>` 2D + controles DOM leves (usa ícones inline `GridIcon`/`CubeIcon` ou pode usar `lucide-react` conforme padrão shadcn).
- **Cena única 2D ↔ 3D:** projeta um grid semanal (colunas = semanas, linhas = dias da semana) que transiciona suavemente entre o heat map plano (`2d`, câmera de cima `e = 0`) e uma skyline isométrica (`3d`, câmera inclinada `e = 1`) onde as barras sobem em onda da semana mais antiga para a mais recente (`riseAt`, `WAVE = 0.42`, `duration = 1300ms`).
- **Interatividade nativa:**
  - *Drag-to-orbit* em 3D (`orbit={true}`) com duplo clique para resetar o ângulo.
  - *Tooltip* dinâmico que acompanha a célula selecionada/hover durante o morph 2D/3D e órbita.
  - *Filtro de legenda* ao passar o mouse ou clicar nos níveis `0–4`.
  - *Navegação por teclado* completa (`ArrowLeft/Right/Up/Down`, `Home`, `End`, `Enter/Space`, `Escape`) com região `aria-live="polite"`.
- **Gatilho de entrada e Acessibilidade:**
  - Dispara a transição `2d → 3d` automaticamente ao entrar em viewport via `IntersectionObserver` (`threshold: 0.35`), podendo ser coordenado com o fim do Preloader.
  - Suporte nativo a `prefers-reduced-motion: reduce` via `window.matchMedia` (remove transições e exibe o estado final diretamente).

#### Integração com Dados Reais do GitHub (`@teuaraujoo`) e Equivalência com o README
No `README.md` do perfil `teuaraujoo/teuaraujoo`, são exibidos os cards `streak-stats.demolab.com?user=teuaraujoo` e `github-readme-activity-graph.vercel.app/graph?username=teuaraujoo`, que destacam: **Total de Contribuições**, **Sequência Atual (Current Streak)**, **Maior Sequência (Longest Streak)** e o gráfico de contribuições.

O `ContributionSkyline` calcula nativamente o total anual (e suporta métricas opcionais quando `showStats={true}`), sendo configurado na Hero com `showStats={false}` para manter foco total no gráfico e no contador anual:

- **Fonte de dados no Server Component (`src/lib/github.ts`):**
  - Fetch server-side no endpoint público validado `https://github-contributions-api.jogruber.de/v4/teuaraujoo?y=last` (sem necessidade de token privado, retornando `{ total, contributions: Array<{ date, count, level }> }`), utilizando cache incremental do Next.js (`next: { revalidate: 3600 }`, revalidando a cada 1 hora).
  - Mapeia `contributions` para `ContributionDay[]` (`{ date, count }`).
- **Fallback resiliente em TypeScript local:**
  - Caso a requisição falhe ou o ambiente esteja offline, retorna um snapshot local tipado em `src/data/home.ts` (ou fallback determinístico), garantindo que a página nunca quebre e mantendo o carregamento SSR instantâneo.

#### Adaptação para o Design System (`globals.css`) e `pt-BR`
Seguindo o checklist de [CONTRIBUTING.md](../docs/CONTRIBUTING.md):
- **Paleta Roxa Editorial-Tech:**
  - Passar paleta customizada alinhada aos tokens locais em vez do verde padrão `"github"`:
    ```ts
    palette: {
      dark: ["#241445", "#38189c", "#4811ed", "#793cff"],
      light: ["#e4d4fb", "#9f75ff", "#793cff", "#4811ed"],
    }
    ```
  - O nível `0` (célula vazia) é calculado automaticamente pelo `retheme()` misturando `--color-background` (`#0D0D0D`, com fallback em `document.body.backgroundColor` ignorando valores transparentes) com `--color-foreground` (`#F5F5F5`), mantendo harmonia direta com os cubos flutuando sobre o fundo `#0D0D0D`.
- **Superfície Flutuante (Sem Card):**
  - Container raiz transparente (`border-0 bg-transparent p-0`) e palco `overflow-visible` sem caixa de fundo ou borda, deixando título, alternador `2D / 3D`, barras do canvas e tooltip flutuarem diretamente sobre `--background` (`#0D0D0D`).
- **Localização completa em `pt-BR`:**
  - Props: `locale="pt-BR"`, `unit="contribuição"`, `unitPlural="contribuições"`, `weekStart={0}`.
  - Traduzir as strings fixas internas da adaptação do componente:
    - `"in the last year"` → `"no último ano"`
    - `"1 year total"` → `"Total no ano"` / `"Busiest day"` → `"Dia mais ativo"` / `"Longest streak"` → `"Maior sequência"` / `"Current streak"` → `"Sequência atual"`
    - `"day"` / `"days"` → `"dia"` / `"dias"`
    - `"Less"` / `"More"` → `"Menos"` / `"Mais"`
    - `"No ... on"` → `"Nenhuma ... em"`
    - Hints opcionais (padrão quando `footer === undefined`, suprimidos na Hero via `footer={null}`): `"Passe o mouse para detalhes · setas para navegar"` e `"Arraste para girar · duplo clique para resetar"`
    - `aria-label` e labels de acessibilidade em português.
- **Modo Minimalista Flutuante e Ajuste de Encaixe na Hero (`100svh`):**
  - Na Hero, utiliza `showStats={false}`, `showLegend={false}`, `showToggle={true}`, `footer={null}` e `heightScale={0.78}`, sem fundo nem bordas de card, exibindo apenas a mensagem de total de contribuições, o alternador 2D/3D e os blocos do mapa flutuando diretamente sobre `--background`.

---

## 5. Coreografia de Animações (GSAP + Lenis)

### Setup do Lenis (`lenis ^1.3.27`)
Um provider ou hook dedicado (ex: `src/components/portfolio/smooth-scroll.tsx` ou `src/hooks/use-lenis.ts`) gerencia a instância global do Lenis:
- Desativado automaticamente quando `(prefers-reduced-motion: reduce)` for verdadeiro.
- Configuração base:
  ```ts
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- Links âncora internos (`a[href^="#"]`) usam `lenis.scrollTo(target)` quando Lenis estiver ativo (e `#hero` rola para `0`).

### Timeline de Entrada da Hero (`heroIn`)
Inicia pausada (`paused: true`) e é disparada pelo callback `onExitStart` do Preloader (ou executada imediatamente em `progress(1)` se `prefers-reduced-motion` estiver ativo):

```ts
const heroIn = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
  .from(".hero-name .char", { yPercent: 135, duration: 1.4, stagger: 0.045 }, 0.1)
  .from("[data-hero-fade]", { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 0.5)
  .from("#navbar", { autoAlpha: 0, y: -12, duration: 1.0 }, 0.6);
```
- Os elementos com `data-hero-fade` são:
  1. `.hero-eyebrow` (tag de cargo + localização)
  2. `.hero-lead` (texto introdutório)
  3. Container do **Mapa do Git** (coluna direita)
  4. `.hero-foot` (canto inferior direito — `Role para explorar ↓`)

### Comportamento no Scroll (Parallax em Camadas sem `pin`)
- **Scroll contínuo natural (sem `pin: true`):** Ao sair da Hero rumo à seção `Sobre`, a página flui naturalmente com a suavidade do **Lenis**, sem travar a viewport (`pin`).
- **Parallax de 3 planos no desktop (`min-width: 1024px` e `prefers-reduced-motion: no-preference`):**
  - Sincronizado via `ScrollTrigger` (`trigger: #hero`, `start: "top top"`, `end: "bottom top"`, `scrub: true`, `invalidateOnRefresh: true`) sobre wrappers **isolados** dos alvos de `heroIn` (`.char` e `[data-hero-fade]`):
    1. **Plano 1 — Título monumental (mais lento):** `.hero-parallax-title-1` (`y: 48, opacity: 0.22`) e `.hero-parallax-title-2` (`y: 78, opacity: 0.18`), aplicadas nas máscaras `.line` externas de `Mateus` e `Araujo` (sem tocar em `.char` nem `.line-inner`, preservando o descendente do `j`).
    2. **Plano 2 — Narrativa (ritmo intermediário):** `.hero-parallax-copy` (`y: -22, opacity: 0.28`), envolvendo `.hero-eyebrow` e `.hero-lead`.
    3. **Plano 3 — Mapa do Git & Scroll Cue (mais rápido):** `.hero-parallax-map` (`y: -76, opacity: 0.15`), envolvendo o container do `ContributionSkyline`, e `.hero-parallax-foot` (`y: -36, opacity: 0`), envolvendo `.hero-foot`.
  - Em `scrollY = 0`, todas as camadas permanecem em `y: 0, opacity: 1` (nenhuma alteração na dobra inicial); em `(prefers-reduced-motion: reduce)`, todas as propriedades de entrada e parallax são limpas via `clearProps: "opacity,visibility,transform"`.

---

## 6. Modelo de Dados TypeScript (`src/data/home.ts`)

Contrato tipado preparado para **TypeScript local agora** (alimentado com fallback local + fetch server-side das contribuições de `teuaraujoo`) e pronto para **i18n (`pt-BR` / `en`)** no futuro:

```ts
export type Locale = "pt-BR" | "en";

export interface NavItem {
  id: string;
  label: string;
  href: `#${string}` | `/${string}`;
}

export interface HeaderContent {
  brandName: string;
  brandLogoPath: string;
  brandHref: string;
  items: NavItem[];
  cta: {
    label: string;
    href: string;
    external?: boolean;
  };
}

export interface PreloaderContent {
  author: string;
  yearLabel: string;
  loadingLabel: string;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface GitSkylineConfig {
  title?: string;
  footer?: string | null;
  username: string;
  locale: Locale;
  unit: string;
  unitPlural: string;
  defaultView: "2d" | "3d";
  heightScale: number;
  showStats: boolean;
  showLegend: boolean;
  showToggle: boolean;
  seed: number;
  palette: {
    dark: [string, string, string, string];
    light: [string, string, string, string];
  };
  /** Preenchido no servidor via API de contribuições do GitHub com fallback local */
  data?: ContributionDay[];
}

export interface HeroContent {
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  leadSegments: Array<{
    text: string;
    highlight?: boolean;
  }>;
  scrollHint: {
    label: string;
    targetHref: `#${string}`;
  };
  gitMap: GitSkylineConfig;
}

export interface HomePageData {
  locale: Locale;
  preloader: PreloaderContent;
  header: HeaderContent;
  hero: HeroContent;
}
```

### Exemplo de dados iniciais (`pt-BR`)

```ts
export const homeData: HomePageData = {
  locale: "pt-BR",
  preloader: {
    author: "Mateus Araujo",
    yearLabel: "Portfólio — 2026",
    loadingLabel: "Carregando",
  },
  header: {
    brandName: "Mateus Araujo",
    brandLogoPath: "/icon.svg",
    brandHref: "#hero",
    items: [
      { id: "inicio", label: "Início", href: "#hero" },
      { id: "sobre", label: "Sobre", href: "#sobre" },
      { id: "projetos", label: "Projetos", href: "#projetos" },
      { id: "jornada", label: "Jornada", href: "#jornada" },
      { id: "skills", label: "Skills", href: "#skills" },
      { id: "contato", label: "Contato", href: "#contato" },
    ],
    cta: {
      label: "Fale comigo",
      href: "#contato",
    },
  },
  hero: {
    firstName: "Mateus",
    lastName: "Araujo",
    role: "Desenvolvedor FullStack",
    location: "Aracaju, SE",
    leadSegments: [
      { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " },
      { text: "Sed do eiusmod tempor incididunt", highlight: true },
      { text: " ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    ],
    scrollHint: {
      label: "Role para explorar",
      targetHref: "#sobre",
    },
    gitMap: {
      username: "teuaraujoo",
      locale: "pt-BR",
      unit: "contribuição",
      unitPlural: "contribuições",
      defaultView: "3d",
      heightScale: 0.78,
      showStats: false,
      showLegend: false,
      showToggle: true,
      footer: null,
      seed: 7,
      palette: {
        dark: ["#241445", "#38189c", "#4811ed", "#793cff"],
        light: ["#e4d4fb", "#9f75ff", "#793cff", "#4811ed"],
      },
    },
  },
};
```

---

## 7. Decisões Fechadas (Home)

- ✅ **Header — Dock único flutuante centralizado:** Sem fundo externo (`fixed top-4 inset-x-0 flex justify-center`), abrigando dentro do mesmo container de vidro luminoso com arredondamento concêntrico (`--dock-radius: 14px`, `--dock-pad: 6px` → `--dock-inner-radius: 8px`) o ícone da marca (`/icon.svg`, `268x239`, com microinteração hover/focus `-rotate-12` e `scale-110`) à esquerda, os links de navegação (`Início`, `Sobre`, `Projetos`, `Jornada`, `Skills`, `Contato`) com sliding pill (`useLayoutEffect`) ao centro e o botão roxo tátil `Fale comigo ↗` (`h-10`) à direita (com menu fullscreen abaixo de `1024px` e `max-w-full` seguro em `375px`).
- ✅ **Hero — Lado Esquerdo:** Nome `Mateus Araujo` em escala monumental (`clamp(4.5rem, 13vw, 14.5rem)`, `leading-[0.84]`, `Mateus` alinhado à esquerda e `Araujo` deslocado para a direita com `pl-[0.75em] lg:pl-[0.85em]`) dentro de coluna `1.25fr` + tag pulsante `Desenvolvedor FullStack · Aracaju, SE` + texto *Lorem ipsum* inicial.
- ✅ **Hero — Lado Direito:** `ContributionSkyline` (21st.dev) em escala compacta (`max-w-[400px] xl:max-w-[440px]`, `heightScale={0.78}`, paleta roxa e `pt-BR`), posicionado na **parte inferior direita** (`lg:mt-auto lg:mb-4 lg:self-end`), alimentado pelos dados reais de `@teuaraujoo` via Server Component (`https://github-contributions-api.jogruber.de/v4/teuaraujoo?y=last` com `revalidate: 3600` e fallback local), em modo minimalista flutuante sem fundo e sem bordas (`showStats={false}`, `showLegend={false}`, `showToggle={true}`, `footer={null}`, `bg-transparent border-0 p-0`) exibindo apenas o total anual de contribuições, alternância 2D/3D e o mapa interativo sobre `#0D0D0D`, junto ao indicador de scroll (`Role para explorar ↓`) ancorado no canto inferior direito.
- ✅ **Scroll da Hero:** Scroll contínuo natural com **Lenis** (sem `pin: true`) + parallax em 3 planos via `ScrollTrigger` (`scrub: true`, `min-width: 1024px`) em wrappers isolados da entrada `heroIn`.
- **Status:** Todas as decisões da Seção 1 (Preloader + Home) implementadas e sincronizadas com o layout final.

*(Observação de responsividade: no mobile `< 1024px`, empilha naturalmente em coluna única: Nome `Mateus Araujo` → Tag `Desenvolvedor FullStack · Aracaju, SE` → Frase → `ContributionSkyline` → `Role para explorar ↓`, garantindo leitura e proporção sem cortes horizontais).*
