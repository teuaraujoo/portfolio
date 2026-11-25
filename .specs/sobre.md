# Especificação Técnica — Seção 2: Sobre (`#sobre`)

## 1. Visão Geral e Fusão das Referências

A seção **Sobre (`#sobre`)** combina elementos visuais e comportamentais das duas referências escolhidas, traduzidos para a estética **Editorial-Tech** e os tokens de cor/tipografia do portfólio de **Mateus Araujo**:

1. **Referência 1 — `vitorcg.com.br` (Lado Esquerdo — Citação Narrativa Animada + Tag Interativa + Dialog Radial):**
   - Texto editorial de grande escala acompanhado de **4 tipos de marcações manuais em SVG** (marca-texto orgânico, círculo desenhado à mão, asterisco elástico e sublinhado duplo) que se desenham progressivamente quando a seção entra na viewport.
   - **Tag flutuante interativa** sobre o retrato (label curto `"Sobre mim"` + linha conectora + ponto pulsante roxo `#793CFF`) e **dialog/modal com animação radial** (`clip-path: circle(...)` partindo do ponto do clique) exibindo título, subtítulo e texto corrido de biografia (sem botões de redes sociais, abas ou stats extras).
2. **Referência 2 — `victordeveloper.com` (Lado Direito — Retrato + Faixa Inferior de Métricas):**
   - **Retrato quadrado (`aspect-square`)** usando a foto oficial em [public/foto_rosto.webp](../public/foto_rosto.webp), com revelação vertical por `clip-path`, leve parallax no scroll, legenda técnica inferior (`MATEUS ARAUJO` / `ARACAJU, SE`) e gatilho clicável para o modal de biografia.
   - **Faixa de 3 métricas monumentais** na base da seção (`border-t` + `border-b`), com números gigantes em `Space Grotesk` (`tabular-nums`) que contam de `0` até o valor real ao entrar na tela.

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/sobre.ts`):**
  - Centraliza eyebrow, segmentos da citação (com o tipo de anotação e delay de cada trecho), dados do retrato (`/foto_rosto.webp`, `alt`, legenda), dados do gatilho/modal editorial (`SobreModalContent`: labels acessíveis, título, subtítulo e array `paragraphs: string[]`) e array das 3 métricas (`value`, `prefix`, `suffix`, `label`).
  - Estruturada para `pt-BR` agora e pronta para internacionalização (`en`) ou API no futuro.
- **Componentes de anotação reutilizáveis (`src/components/portfolio/hand-drawn-annotations.tsx`):**
  - Exporta `BrushHighlight`, `HandCircle`, `SparkAsterisk` e `DoubleUnderline`.
  - Guiados pelo atributo `data-shown="true"` no ancestral `.group/sobre` (acionado por `IntersectionObserver`) e respeitando `prefers-reduced-motion: reduce`.
- **Dialog radial de biografia (`src/components/portfolio/sobre-dialog.tsx`):**
  - `"use client"` (renderiza overlay em tela cheia com transição radial via `clip-path: circle(...)` partindo da coordenada do clique no retrato/tag, bloqueio de scroll da página com `data-lenis-prevent`, gerenciamento de foco, fechamento via tecla `Escape`, botão fechar ou clique no backdrop).
  - Exibe exclusivamente **título**, **subtítulo** e **texto corrido em parágrafos** (`paragraphs`), **sem botões de redes sociais**, abas ou métricas extras.
- **Seção principal (`src/components/portfolio/sobre.tsx`):**
  - `"use client"` (gerencia `IntersectionObserver` das anotações, `useGSAP` / `ScrollTrigger` para revelação da foto, parallax e contagem dos números, além do estado de abertura e origem `(x, y)` do `SobreDialog`).
- **Integração:**
  - Renderizada dentro de `<main>` em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx), logo abaixo de `<Hero />`, recebendo `id="sobre"` para que os links `Sobre` do Header e `Role para explorar ↓` da Hero naveguem suavemente via Lenis.

---

## 3. Estrutura Visual, Dimensionamento e Layout

### Container Principal (`#sobre`)
- **Elemento:** `<section ref={scope} id="sobre" aria-labelledby="sobre-title" data-shown={shown} className="group/sobre relative w-full bg-background px-[clamp(20px,4vw,56px)] py-24 text-foreground md:py-32 lg:py-36">`
- **Largura Máxima Interna:** `mx-auto max-w-[1600px]` (alinhada exatamente ao grid de [hero.tsx](../src/components/portfolio/hero.tsx) para manter as margens verticais do site consistentes).

### Bloco Principal — Grid Assimétrico em 2 Colunas
- **Grid:** `grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-16 xl:gap-20`
- No mobile (`< 1024px`), empilha naturalmente em 1 coluna: **Citação** primeiro, **Retrato quadrado** logo abaixo.

#### A) Lado Esquerdo — Citação Editorial Animada (`1.4fr`)
1. **Eyebrow:**
   - Texto definido: `"Sobre mim"`.
   - Estilo: `mb-6 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground`.
2. **Citação Principal (`<h2 id="sobre-title">`):**
   - Tipografia: `font-display` (`Space Grotesk`), `font-semibold` (`600`), `text-[clamp(1.75rem,3.3vw,3.4rem)]`, `leading-[1.16]`, `tracking-[-0.03em]`, `text-foreground`.
   - Renderizada a partir de segmentos tipados (`QuoteSegment[]`) em **Lorem ipsum** (~28 palavras) que combinam texto plano com as 4 anotações animadas em sequência (`150ms` → `600ms` → `1050ms` → `1550ms` → `2000ms`).

#### B) Lado Direito — Retrato Quadrado + Gatilho Flutuante (`0.85fr`)
Seguindo a moldura, proporção quadrada pedida pelo usuário, legenda da referência `victordeveloper.com` e tag interativa inspirada em `vitorcg.com.br`:
- **Wrapper (`<figure className="about-photo w-full max-w-[400px] lg:justify-self-end">`):**
  - **Botão Gatilho Acessível (`<button type="button" onClick={handleOpenDialog} aria-label={content.modal.triggerAriaLabel} aria-haspopup="dialog" aria-expanded={dialogOpen}>`):**
    - Envolve todo o retrato quadrado e a tag flutuante (`group/photo relative block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[12px]`), deixando o clique evidente em qualquer ponto da foto ou da tag.
    - Ao clicar (mouse ou teclado), captura a coordenada de origem `{ x, y }` do clique (ou centro do botão quando acionado via teclado) para iniciar a animação radial do dialog.
  - **Container da Imagem (`.about-photo-inner`):**
    - `relative aspect-square w-full overflow-hidden rounded-[12px] bg-card border border-white/10 transition-colors duration-300 group-hover/photo:border-brand-bright/50`
  - **Imagem (`/foto_rosto.webp`):**
    - `<img src={content.photo.src} alt={content.photo.alt} width={800} height={800} loading="lazy" decoding="async" />`
    - Classes: `h-[115%] w-full max-w-none object-cover object-[50%_25%] will-change-transform transition-transform duration-500 ease-out group-hover/photo:scale-[1.02]`
    - *Por que `h-[115%]`?* Para que o parallax vertical (`yPercent: -8` → `0`) tenha sobra de imagem acima/abaixo e nunca revele o fundo durante o scroll.
  - **Tag / Indicador Flutuante Interativo (`Sobre mim` — estilo `vitorcg.com.br`):**
    - Posicionada de forma flutuante sobre o retrato (`pointer-events-none absolute -top-4 right-5 z-10 flex flex-col items-center`), deixando evidente que a foto é clicável sem repetir a imagem em miniatura:
    - **Composição (pill textual + conector vertical + ponto pulsante):**
      1. **Pill flutuante:** `flex items-center rounded-lg border border-white/15 bg-[#141318]/85 px-3 py-1.5 text-xs font-semibold text-white/95 shadow-lg backdrop-blur-md transition-[translate,background-color,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/photo:-translate-y-1 group-hover/photo:border-brand-bright/65 group-hover/photo:bg-[#141318] motion-reduce:transition-none`
         - **Label curto (sem mini foto repetida):** `<span>{content.modal.triggerLabel}</span>` (`"Sobre mim"`)
      2. **Linha conectora vertical:** `<span aria-hidden="true" className="h-6 w-px bg-white/55 transition-[height,background-color] duration-300 group-hover/photo:h-8 group-hover/photo:bg-brand-bright/80 motion-reduce:transition-none" />`
      3. **Ponto pulsante roxo (`#793CFF` / `--brand-bright`):**
         - Container `relative size-3`:
         - Halo pulsante: `absolute inset-0 animate-ping rounded-full bg-brand-bright/65 motion-reduce:animate-none`
         - Núcleo sólido: `absolute inset-0 rounded-full border-2 border-white/90 bg-brand-bright`
  - **Legenda Técnica (`<figcaption>`):**
    - `mt-3 flex items-center justify-between font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground`
    - Esquerda: `Mateus Araujo`
    - Direita: `Aracaju, SE`

### Dialog / Modal Radial de Biografia (`src/components/portfolio/sobre-dialog.tsx`)
Componente dedicado para exibir a história completa de Mateus ao clicar no retrato ou na tag:
- **Semântica e Acessibilidade:**
  - Renderizado com `role="dialog"`, `aria-modal="true"`, `aria-labelledby="sobre-dialog-title"`, `aria-describedby="sobre-dialog-subtitle"`.
  - **Bloqueio de Scroll e Lenis:** recebe `data-lenis-prevent` no container rolável do overlay e trava o scroll do `body` enquanto aberto (`overflow: hidden`), restaurando ao fechar.
  - **Gerenciamento de Foco:** ao abrir, move o foco para o botão de fechar (com `z-20 cursor-pointer` garantido acima do conteúdo); ao fechar, devolve o foco ao `<button>` gatilho do retrato.
  - **Fechamento:** tecla `Escape`, clique no botão fechar (`aria-label={content.closeAriaLabel}`, `z-20 cursor-pointer`) ou clique no backdrop fora do card/bloco de leitura.
- **Animação Radial (`clip-path: circle(...)` + `scale` suave):**
  - Parte exatamente do ponto do clique `(--ox, --oy)` com raio dinâmico `--or` calculado até o vértice mais distante do painel:
    - Estado fechado: `clip-path: circle(0px at var(--ox, 50%) var(--oy, 50%))` + `scale` inicial reduzido.
    - Estado aberto: `clip-path: circle(var(--or, 1200px) at var(--ox, 50%) var(--oy, 50%))` + `scale-100`.
  - Transição fluida em `cubic-bezier(0.16, 1, 0.3, 1)` combinando expansão radial e `scale` suave. Em `prefers-reduced-motion: reduce`, abre/fecha apenas por transição simples de opacidade sem expansão radial nem `scale`.
- **Conteúdo Editorial (Regra Obrigatória):**
  - Fundo escuro editorial (`bg-background/95 backdrop-blur-xl`), leitura centralizada (`max-w-2xl mx-auto`) com respiro generoso e tipografia consistente (`Space Grotesk` + `Inter`):
    1. **Título (`<h2 id="sobre-dialog-title">`):** `content.title` (`"Mateus Araujo"`)
    2. **Subtítulo (`<p id="sobre-dialog-subtitle">`):** `content.subtitle` (`"Desenvolvedor FullStack · Aracaju, SE"`)
    3. **Texto corrido (`content.paragraphs.map(...)`):** parágrafos editoriais em `text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.75] text-muted-foreground` (espaçados com `space-y-5`).
  - **Proibição explícita:** Diferente de `vitorcg.com.br`, **NÃO há botões de redes sociais**, **nem abas**, **nem cards/stats extras** dentro deste dialog — apenas cabeçalho editorial (título + subtítulo), botão fechar e os parágrafos de texto corrido.

### Bloco Inferior — Faixa de Métricas Centralizada (`.about-stats`)
Seguindo a referência de `victordeveloper.com`, com posicionamento centralizado abaixo do grid de 2 colunas e 3 contadores reais (`+5 projetos`, `+10 certificados`, `+2 formações`):
- **Container:** `<ul className="about-stats mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-x-8 border-t border-border sm:grid-cols-3 lg:mt-28">`
- **Cada Item (`<li className="about-stat-item ...">`):**
  - `flex flex-col items-center gap-3 border-b border-border py-6 text-center md:py-8`
  - **Número Monumental (`.stat-num`):**
    - `font-display font-medium text-[clamp(3rem,6.2vw,6.25rem)] leading-[0.9] tracking-[-0.045em] text-foreground tabular-nums`
    - Prefixo opcional (ex.: `+`) imediatamente antes do contador em `<sup className="-top-[1.05em] mr-1 text-[0.34em] tracking-normal text-brand-bright">` e sufixo opcional em `<sup className="-top-[1.05em] ml-1 text-[0.34em] tracking-normal text-brand-bright">`.
  - **Rótulo Inferior:**
    - `font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground`

---

## 4. Especificação das 4 Anotações SVG Animadas (`Editorial-Tech`)

Adaptando a paleta da referência (`vitorcg.com.br`) para os tokens de [src/app/globals.css](../src/app/globals.css):

| Componente | Efeito Visual | Técnica SVG / CSS | Cor no Nosso Tema |
| --- | --- | --- | --- |
| **`BrushHighlight`** | Marca-texto de pincelada orgânica atrás do texto | SVG `viewBox="0 0 100 24"` via `backgroundImage`, `bg-no-repeat bg-[position:0_88%] px-[0.08em] [box-decoration-break:clone]`, anima `bg-[length:0%_74%]` → `group-data-[shown=true]/sobre:bg-[length:100%_74%]` em `700ms cubic-bezier(0.65,0,0.35,1)` | 3 variantes: **`brand`** (`rgba(72, 17, 237, 0.78)`), **`bright`** (`rgba(121, 60, 255, 0.65)`) e **`subtle`** (`rgba(245, 245, 245, 0.16)`) |
| **`HandCircle`** | Círculo oval desenhado à mão ao redor de uma palavra | `<svg viewBox="0 0 200 80" preserveAspectRatio="none">` absoluto (`-inset-x-[0.35em] -inset-y-[0.12em]`), `pathLength={1}`, anima `[stroke-dashoffset:1]` → `group-data-[shown=true]/sobre:[stroke-dashoffset:0]` em `900ms cubic-bezier(0.65,0,0.35,1)` | `stroke="var(--brand-bright)"` (`#793CFF`), `strokeWidth={3}` |
| **`SparkAsterisk`** | Pequeno asterisco no canto superior direito da palavra | `<svg viewBox="0 0 24 24">` `size-[0.55em]` no canto superior direito (`-top-[0.1em] left-[0.02em]`), anima `scale-0 -rotate-90` → `group-data-[shown=true]/sobre:scale-100 group-data-[shown=true]/sobre:rotate-0` em `500ms cubic-bezier(0.34,1.56,0.64,1)` | `text-brand-bright` (`#793CFF`) |
| **`DoubleUnderline`** | Dois traços curvos horizontais abaixo da expressão | `<svg viewBox="0 0 200 20" preserveAspectRatio="none">` em `-bottom-[0.22em]`, dois `<path>` com `pathLength={1}` e `250ms` de diferença no `transitionDelay`, anima `stroke-dashoffset: 1 → 0` em `900ms` | `stroke="var(--brand-bright)"` (`#793CFF`), `strokeWidth={2.5}` |

### Paths SVG de Referência
- **`BrushHighlight`:** `M1.5 5.5C14 3.2 31 4.6 48 3.4S83 2 98.6 4.2L99.2 9 97.8 15.5 98.8 20.6C82 22.4 64 20.8 47 22.2S14 23.4 1.2 21 2.4 14 1 9.6Z`
- **`HandCircle`:** `M150 8C110 -2 40 2 14 22C-6 38 6 66 60 74C120 82 188 70 196 44C204 18 160 4 96 6C70 7 50 10 40 14`
- **`SparkAsterisk`:** `M12 2v20M3.5 7l17 10M3.5 17l17-10`
- **`DoubleUnderline`:** `["M2 6C60 3 130 4 198 6", "M8 15C70 11 140 12 186 14"]`

---

## 5. Coreografia de Animações e Acessibilidade

1. **Anotações da Citação (`IntersectionObserver`):**
   - Observa `#sobre` com `{ threshold: 0.28 }`; ao cruzar, define `data-shown="true"` uma única vez (`disconnect()`).
   - Com `prefers-reduced-motion: reduce`, inicializa já visível (`motion-reduce:transition-none`, estado final sem animação de desenho).
2. **Retrato (`GSAP + ScrollTrigger` dentro de `useGSAP` + `gsap.matchMedia()`):**
   - **Entrada por recorte:** `.about-photo-inner` de `{ clipPath: "inset(100% 0% 0% 0%)" }` para `{ clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }`, `scrollTrigger: { trigger: ".about-photo", start: "top 80%", once: true }`.
   - **Parallax contínuo:** `.about-photo-parallax` de `{ yPercent: -8 }` para `{ yPercent: 0, ease: "none" }`, `scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true }`.
3. **Contagem das Métricas (`GSAP + ScrollTrigger`):**
   - **Entrada sincronizada:** `.about-stat-item` anima com `gsap.from` (`y: 18`, `autoAlpha: 0`, `duration: 0.75`, `stagger: 0.12`, `ease: "expo.out"`, `clearProps: "opacity,visibility,transform"`) disparado por `scrollTrigger: { trigger: ".about-stats", start: "top 80%", once: true }`.
   - **Contadores (`[data-count]`):** cada item (índice `i`) é inicializado com `textContent = "0"` antes de entrar na tela e, ao atingir `trigger: ".about-stats"` / `start: "top 80%"` (`once: true`), anima `{ value: 0 }` até `targetValue` com `duration: 1.5`, `delay: i * 0.14` e `ease: "power1.out"`, atualizando `textContent` com `Math.floor(counter.value)` em `onUpdate` e finalizando com `String(targetValue)` em `onComplete` (sem layout shift graças a `tabular-nums`; restaura `String(targetValue)` no cleanup/`prefers-reduced-motion: reduce`).
4. **Dialog Radial de Biografia (`SobreDialog`):**
   - Ao clicar no retrato ou na tag flutuante, calcula a origem `(--ox, --oy)` (ou centro do botão via teclado) e o raio dinâmico `--or`, expandindo o overlay com `clip-path: circle(0px at var(--ox) var(--oy))` → `clip-path: circle(var(--or) at var(--ox) var(--oy))` e `scale` suave em `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Bloqueia o scroll do Lenis (`data-lenis-prevent`) enquanto o modal estiver aberto, move o foco para o botão fechar (`z-20 cursor-pointer`) e restaura o foco ao gatilho no fechamento (`Escape`, backdrop ou botão fechar).
5. **Acessibilidade (`WCAG 2.1 AA` + `prefers-reduced-motion`):**
   - Em `(prefers-reduced-motion: reduce)`: nenhuma animação de `clipPath`, parallax, pulso da tag (`motion-reduce:animate-none`), expansão radial/`scale` do modal ou contagem; foto, marcações e valores finais das métricas são exibidos imediatamente.
   - Os SVGs decorativos e a tag flutuante decorativa usam `aria-hidden="true"` para que leitores de tela leiam a citação como uma frase contínua e o gatilho do retrato com seu `aria-label` descritivo.

---

## 6. Modelo de Dados TypeScript (`src/data/sobre.ts`)

```ts
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
```

### Conteúdo Definido (`src/data/sobre.ts`)
A versão atual utiliza a **citação real aprovada pelo usuário** em português (mantendo a densidade, a sequência dos 4 tipos de marcações SVG animadas da referência `vitorcg.com.br` e a restrição de largura em mobile para `circle` e `underline`), **biografia real em 3 parágrafos no modal** e **métricas reais** centralizadas nos 3 contadores inferiores:

- **Eyebrow:** `"Sobre mim"`
- **Citação Principal:**
  > *"Escolhi a tecnologia por ser **autodidata** (`brush:brand`, `150ms`) e gostar de resolver **problemas** (`circle`, `600ms`) com autonomia. Hoje atuo construindo **produtos digitais completos** (`brush:bright` + `sparkAfter`, `1050ms`), **da interface** (`brush:subtle`, `1550ms`) até o deploy, sem deixar **pontas soltas.** (`underline`, `2000ms`)"*
- **Retrato (direita):**
  - `src`: `"/foto_rosto.webp"`
  - `alt`: `"Retrato de Mateus Araujo"`
  - `captionLeft`: `"Mateus Araujo"`
  - `captionRight`: `"Aracaju, SE"`
- **Gatilho e Dialog Radial (`modal`):**
  - `triggerLabel`: `"Sobre mim"`
  - `triggerAriaLabel`: `"Abrir história completa sobre Mateus Araujo"`
  - `closeAriaLabel`: `"Fechar janela sobre mim"`
  - `title`: `"Mateus Araujo"`
  - `subtitle`: `"Desenvolvedor FullStack · Aracaju, SE"`
  - `paragraphs`: 3 parágrafos reais de biografia em português (atuação na Delfinance com Node.js/NestJS/Vue.js, integrações e fluxos de crédito, e experiência paralela como freelancer, Salesforce e formação em ADS — sem botões de redes sociais, abas ou stats extras).
- **Métricas (3 itens centralizados abaixo do grid em `mx-auto max-w-4xl`):**
  - `+5` — `"projetos"`
  - `+10` — `"certificados"`
  - `+2` — `"formações"`

---

## 7. Status das Definições (Atualizado)

As definições da **Seção 2 (`#sobre`)** consolidadas em [src/data/sobre.ts](../src/data/sobre.ts):

1. **Citação (Lado Esquerdo):** Texto real aprovado pelo usuário (*"Escolhi a tecnologia por ser autodidata e gostar de resolver problemas com autonomia. Hoje atuo construindo produtos digitais completos, da interface até o deploy, sem deixar pontas soltas."*), mantendo as 4 marcações SVG animadas (`brush`, `circle`, `sparkAfter`, `underline`) distribuídas em sequência, com `circle` (`"problemas"`) e `underline` (`"pontas soltas."`) em expressões curtas (`1–2` palavras) para evitar overflow horizontal em viewports mobile (`375px`).
2. **Retrato + Tag Interativa (Lado Direito):** Foto quadrada (`/foto_rosto.webp`) envolvida por botão acessível com tag flutuante (`Sobre mim`, linha conectora e ponto pulsante roxo `#793CFF`, sem mini foto repetida), revelação vertical por `clip-path`, parallax no scroll e legenda técnica (`Mateus Araujo` / `Aracaju, SE`).
3. **Dialog Radial de Biografia (`SobreDialog`):** Abre com `clip-path: circle(var(--or) ...)` + `scale` suave em `cubic-bezier(0.16, 1, 0.3, 1)` a partir do ponto do clique, botão fechar `z-20 cursor-pointer`, exibindo apenas título, subtítulo e 3 parágrafos reais de biografia em português (sem botões de redes sociais).
4. **Métricas Inferiores (`.about-stats`):** 3 contadores reais (`+5 projetos`, `+10 certificados`, `+2 formações`, com `prefix?: string` antes do valor e `suffix?: string` opcional após) em bloco centralizado abaixo do grid de 2 colunas (`mx-auto max-w-4xl`, `items-center text-center`).
5. **Cabeçalho da Seção:** Eyebrow limpo (`"Sobre mim"`) acima da citação, estilo `vitorcg.com.br`.
