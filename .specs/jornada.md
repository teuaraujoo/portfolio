# Especificação Técnica — Seção 4: Jornada (`#jornada`)

## 1. Análise do Prompt de Referência e Adaptação ao Projeto

O snippet de referência (**Hyperiux Vault / s1stdev `timeline.tsx`**) utiliza uma faixa horizontal acionada pelo scroll vertical (*Horizontal Scroll Pin via `position: sticky` + GSAP `ScrollTrigger`*) com uma linha de progresso central e marcos alternados acima e abaixo dela, ligados por pontos (`.jd-*`) e hastes verticais (`.jl-*`).

Para adequá-lo à realidade do portfólio de **Mateus Araujo** (Next.js 16, React 19, Tailwind CSS v4, `@gsap/react`, `Lenis`, estética **Editorial-Tech** escura `#0D0D0D` / `#141318` / `#4811ED` / `#793CFF`) e ao pedido do usuário (**trajetória em tecnologia, cursos, programas e empresas com Foto Principal + Texto Secundário por parada**), foram identificadas e resolvidas as seguintes adaptações críticas:

1. **Inversão de Hierarquia em Cada Parada (Foto Principal + Texto Secundário):**
   - **Original:** Trazia apenas **1 foto de abertura** à esquerda e todas as paradas da linha do tempo continham apenas data e texto.
   - **Adaptação:** Cada marco da timeline (`TimelineStop`) passa a ser protagonizado por uma **Fotografia / Visual Principal (`JornadaMedia`)** seguindo o **padrão exato de retrato de `#sobre` ([sobre.tsx](../src/components/portfolio/sobre.tsx))**: moldura quadrada **`aspect-square` (`1:1`)**, `rounded-[12px]`, `border border-white/10 bg-card`, `hover:border-brand-bright/50`, escala interna suave (`scale-[1.03]`) no hover e `<figcaption>` técnico inferior (`font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground`) exibindo categoria à esquerda e data (`YEAR · MONTH`) à direita, acompanhada logo abaixo por **texto secundário enxuto** (`title`, `organization`, `description`).
2. **Motor Dinâmico (`containerAnimation`) em vez de porcentagens hardcoded:**
   - **Original:** Usava `xPercent: -65`, largura fixa `w-[240vw]` e array manual de 7 gatilhos `[6, 26] ... [65, 85]`, quebrando caso o número de paradas mudasse.
   - **Adaptação:** Calcula dinamicamente o deslocamento horizontal exato (`-(track.scrollWidth - stage.clientWidth)`) via `invalidateOnRefresh: true` e vincula a animação de cada parada diretamente ao `scrollTween` horizontal usando **`ScrollTrigger` com `containerAnimation`**. Assim, a linha do tempo aceita qualquer quantidade de marcos (ex.: 6, 8, 12 paradas) sem ajustes manuais.
3. **Dependências e Boilerplate GSAP:**
   - **Original:** Recriava um `useGSAP` inline manual, usava `id="journey"`, tinha erro de digitação CSS (`tranlate-y-[-50%]`), cores fixas `#ff5f00` / `#000` / `#fff` e `SplitText` direto no DOM sem fallback simples de responsividade.
   - **Adaptação:** Usa o `@gsap/react` (`useGSAP`) já instalado, registra `ScrollTrigger` (e opcionalmente `SplitText` apenas onde agrega ou máscara CSS/GSAP `yPercent` nas linhas para evitar quebras de texto em múltiplos idiomas), aplica `id="jornada"` alinhado ao Header em [src/data/home.ts](../src/data/home.ts) (`href: "#jornada"`), e consome exclusivamente os tokens semânticos de [globals.css](../src/app/globals.css).
4. **Responsividade Mobile + `prefers-reduced-motion`:**
   - **Original:** Aplicava scroll horizontal gigante no mobile (`max-[600px]:h-[400vh] w-[800vw]`), difícil de navegar com fotos grandes em telas estreitas.
   - **Adaptação:** No desktop (`>= 900px` com `prefers-reduced-motion: no-preference`), mantém a experiência fiel de **trilho horizontal `sticky`** alternando paradas acima e abaixo da linha central. Em **mobile (`< 900px`)** e sob **`prefers-reduced-motion: reduce`**, converte automaticamente para uma **Timeline Vertical Editorial** com linha roxa contínua à esquerda, mantendo as fotos em tamanho pleno de leitura e zero scroll travado.

> [!NOTE]
> **Conteúdo e Mídias Reais (`2025 — 2026`):** A seção apresenta **5 marcos cronológicos reais** cobrindo as quatro categorias (**Tech**, **Cursos**, **Programas**, **Empresas**) em [src/data/jornada.ts](../src/data/jornada.ts), combinando paradas com foto única (`image` em `public/jornada/`), galeria dupla (`gallery` com 2 fotos lado a lado) e marcos textuais puros sem foto (`none`).

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/jornada.ts`):**
  - Define as categorias da trajetória (`"tech" | "curso" | "programa" | "empresa"`), os contratos `JornadaStop`, `JornadaCategoryMeta` e `JornadaContent`, além dos dados iniciais em `pt-BR` prontos para internacionalização (`en`) ou API/CMS no futuro.
- **Primitive genérica reutilizável (`src/components/ui/timeline.tsx`):**
  - `"use client"` — componente de UI genérico adaptado do snippet de referência para aceitar um array tipado de `TimelineItem[]`, cores via CSS tokens, slots/renders customizáveis para a foto principal de cada parada, altura dinâmica do scroll e alternância automática cima/baixo em torno do eixo central no desktop (com layout vertical no mobile e reduced-motion).
- **Seção da Jornada (`src/components/portfolio/jornada.tsx`):**
  - `"use client"` — orquestra o cabeçalho editorial (`04 — Jornada`), barra opcional de legenda/filtro visual das categorias (*Tecnologia*, *Cursos*, *Programas*, *Empresas*), renderização de cada card fotográfico (`JornadaStopCard`) dentro da `Timeline` e clique opcional para ampliar/inspecionar a foto ou detalhes se desejado em evoluções futuras.
- **Integração:**
  - Conectada em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx) abaixo de `<Projetos />` e alimentada por [src/app/page.tsx](../src/app/page.tsx) com `jornadaContent`.

---

## 3. Estrutura Visual, Dimensionamento e Layout

### Regra Crítica de Scroll para `position: sticky`
- Assim como em `#projetos`, a seção `<section id="jornada">` usa **`overflow-x-clip`** (nunca `overflow-hidden`) para que o palco interno `position: sticky` (`sticky top-0 h-svh overflow-hidden`) cole corretamente durante todo o percurso da seção.

### A) Cabeçalho de Abertura & Trilho Horizontal (`Desktop >= 900px`)

- **Container da Seção (`#jornada`):**
  - `relative w-full overflow-x-clip bg-background text-foreground`
  - A altura externa no desktop é controlada dinamicamente ou definida por CSS/ref proporcional à quantidade de paradas (ex.: `min-h-[calc(100svh+var(--track-scroll,2200px))]`, ou medida pelo container wrapper cujo height garante espaço exato para percorrer todos os cards sem sobra vazia).
- **Palco Fixo (`sticky top-0 flex h-svh w-full flex-col justify-between overflow-hidden pt-20 pb-8 md:pt-24`):**
  - Respeita `pt-20 md:pt-24` no topo para **nunca colidir com o header flutuante `#navbar`**.
  - **Faixa Superior Fixa do Palco (Contextualização):**
    - Alinhada a `mx-auto w-full max-w-[1600px] px-[clamp(20px,4vw,56px)]`:
    - Barra de metadados discreta: `"04 — Jornada"` à esquerda, período total `"2025 — 2026"` + legenda das categorias (*Tech · Cursos · Programas · Empresas*) à direita.
  - **Área Central do Trilho (`relative flex-1 flex items-center`):**
    - **Eixo Central Horizontal (`.journey-axis`):**
      - Posicionado na linha média vertical (`top-1/2 -translate-y-1/2`).
      - Ponto inicial fixo + linha de progresso horizontal (`.journey-line`) em gradiente/cor da marca (`bg-brand-bright` / `#793CFF`) com leve glow (`shadow-[0_0_16px_rgba(121,60,255,0.45)]`), crescendo da esquerda para a direita de acordo com o scroll (`scrub: true`).
    - **Bloco Introdutório no Início do Trilho (Slot 0, antes da 1ª parada):**
      - Deslocamento lateral amplo (`w-[clamp(380px,42vw,680px)] shrink-0 pl-[clamp(36px,7vw,140px)] pr-[clamp(48px,6vw,112px)]`) para posicionar o título mais à direita e manter apenas as **2 primeiras paradas (`01` e `02`)** visíveis no viewport inicial enquanto o restante da linha do tempo (`03+`) entra progressivamente fora da tela à direita.
      - Título monumental (`<h2 id="jornada-title">`) em `Space Grotesk`, `text-[clamp(3.15rem,5.8vw,6rem)]`, `leading-[0.94]`, `tracking-[-0.045em]` (`"Minha / jornada."`).
      - Descrição introdutória curta em `Montserrat` (`mt-5 max-w-[36ch] text-sm lg:text-base leading-relaxed text-muted-foreground`) + indicador discreto `"Role para percorrer"`.
    - **Paradas Alternadas (Cima / Baixo em torno da linha central):**
      - Os marcos cronológicos alternam posição automaticamente (`index % 2 === 0` acima do eixo central; `index % 2 === 1` abaixo do eixo central), mantendo espaçamento horizontal confortável (`gap-x-[clamp(44px,5.5vw,92px)]`) e largura padrão `w-[clamp(420px,38vw,580px)]` por parada — ou `w-[clamp(540px,48vw,760px)]` quando `isWideStop` retorna `true` (como nas paradas de galeria dupla) para preservar folga para o texto ao lado das fotos ampliadas.
      - **Estrutura de Cada Parada (Layout Lado a Lado Desktop com Padrão Retrato `#sobre` — Foto Principal à Esquerda + Texto Secundário à Direita):**
        1. **Haste Conectora (`.jl-*`) + Nó Circular (`.jd-*`):**
           - Haste fina (`w-px bg-brand-bright/75`) e ponto sólido com halo roxo (`size-2.5 rounded-full bg-brand-bright ring-4 ring-brand-bright/20`) conectando o eixo central ao card da parada.
        2. **Bloco de Conteúdo da Parada (`flex items-center gap-4 lg:gap-5` no desktop com mídia, `flex items-center` sem mídia; `flex-col` empilhado no mobile):**
           - **Modo 1 — Foto Única (`media.type === "image"`, `<figure className="w-[clamp(210px,29svh,315px)] shrink-0">`):**
             - Frame quadrado **`aspect-square` (`1:1`)** com dimensionamento fluido **`w-[clamp(210px,29svh,315px)]`** no trilho horizontal desktop, garantindo folga vertical dentro de `100svh` tanto em `1280×720` quanto em `1920×1080` sem clipping.
             - Moldura (`.journey-stop-media`): `relative aspect-square w-full overflow-hidden rounded-[12px] border border-white/10 bg-card transition-colors duration-300 group-hover/stop-photo:border-brand-bright/50`.
             - Wrapper dedicado `.journey-stop-media-inner` para o zoom-out cinematográfico de entrada (`scale: 1.24 -> 1` no GSAP), envolvendo o container de escala CSS no hover (`group-hover/stop-photo:scale-[1.03]`) sem conflito de `transform`.
           - **Modo 2 — Galeria Dupla (`media.type === "gallery"`, `<figure className="w-[clamp(300px,42svh,440px)] shrink-0">` no desktop / `w-full max-w-[580px]` no mobile, combinada com `isWideStop`):**
             - Moldura `.journey-stop-media` (`rounded-[12px] border border-white/10 bg-card p-1.5`) contendo `.journey-stop-media-inner` em `grid grid-cols-2 gap-2` com 2 fotos lado a lado em `aspect-[4/5]` (desktop e mobile), `rounded-[8px]` e `object-cover object-center`, preservando a coreografia GSAP de `clipPath` + zoom-out.
           - **Modo 3 — Ponto Puro Sem Foto (`media.type === "none"`):**
             - Não renderiza `<figure>` nem placeholder visual; exibe apenas `.journey-stop-copy` (`min-w-0 max-w-[36ch]` no desktop / `py-1` no mobile) com faixa superior de metadados (ponto colorido + `{category.label}` e `{year} · {monthLabel}`), `title`, `organization` e `description` exibida integralmente sem truncamento.
           - **Legenda Técnica Inferior (`<figcaption>`, nos modos com mídia):**
             - `mt-2 flex items-center justify-between gap-2 font-sans text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground`:
             - Esquerda: rótulo da **categoria** (`Tech`, `Curso`, `Programa`, `Empresa`).
             - Direita: **data (`YEAR · MONTH`)**, ex.: `2025 · Mai 25 – Mar 26`.
           - **Texto Secundário (`.journey-stop-copy`, `min-w-0 flex-1` ao lado direito da foto no desktop):**
             - `title`: título conciso com quebra natural (`font-display text-sm lg:text-base font-semibold leading-snug text-foreground`).
             - `organization`: organização / contexto sem `truncate` (`mt-1 text-xs font-medium text-brand-bright`).
             - `description`: descrição secundária completa sem `line-clamp-*` (`mt-1.5 text-xs leading-relaxed text-muted-foreground` no desktop e `text-sm` no mobile).

### B) Layout Mobile & Reduced Motion (`< 900px` ou `prefers-reduced-motion: reduce`)

- Sem `position: sticky` nem deslocamento horizontal forçado.
- Container padrão com padding lateral (`px-[clamp(20px,4vw,56px)] py-24`):
  - Cabeçalho empilhado: Eyebrow `"04 — Jornada"`, período `"2025 — 2026"`, título `"Minha jornada."` e resumo curto.
  - **Lista Vertical com Eixo à Esquerda:**
    - Linha vertical contínua (`border-l border-brand-bright/35 ml-2.5 pl-6 sm:pl-8 space-y-10`).
    - Cada parada tem um nó roxo alinhado à linha vertical esquerda + **Foto Única (`w-full max-w-[460px] aspect-square`) / Galeria Dupla (`w-full max-w-[580px]`, `grid-cols-2 gap-2`, `aspect-[4/5]`) / ou Ponto Puro Sem Foto (`media.type === "none"` com metadados no topo do bloco textual)** + texto secundário conciso (`title`, `organization`, `description`).

---

## 4. Coreografia GSAP + Lenis e Acessibilidade

Toda lógica GSAP fica encapsulada em `useGSAP(() => { ... }, { scope: sectionRef })` com `gsap.matchMedia()`, sem depender de constantes hardcoded para o total de itens:

1. **Desktop Horizontal Track (`(min-width: 900px) and (prefers-reduced-motion: no-preference)`):**
   - Mede a largura rolável real do trilho: `const getScrollDistance = () => Math.max(0, track.scrollWidth - stage.clientWidth + 64)`.
   - Atualiza dinamicamente a altura reservada no wrapper externo da seção (`wrapperHeight = window.innerHeight + getScrollDistance()`) e re-calcula no `resize` / `ScrollTrigger.refresh()` (`invalidateOnRefresh: true`).
   - Tween mestre horizontal:
     - `const horizontalTween = gsap.to(track, { x: () => -getScrollDistance(), ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + getScrollDistance(), scrub: 0.6, invalidateOnRefresh: true } })`
   - Progresso da linha central (`.journey-line`):
     - `gsap.fromTo(".journey-line", { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "left center", scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + getScrollDistance(), scrub: true, invalidateOnRefresh: true } })`
   - **Coreografia Cinética de Entrada por Parada (Timeline GSAP Disparada):**
     - Paradas iniciais visíveis no primeiro viewport (`index < 2` — `01` e `02`) disparam em sequência na entrada vertical da seção (`trigger: section, start: "top 72%", once: true`, com `delay` escalonado em `0s` e `0.18s`).
     - Paradas seguintes (`index >= 2`) entrando pela direita disparam dinamicamente via `containerAnimation: horizontalTween` (`trigger: stopEl, start: "left 88%", toggleActions: "play none none reverse"`).
     - Em cada parada `.journey-stop`, uma timeline `tl` coreografa:
       1. Nó circular (`.jd-dot`): pop elástico `{ scale: 0 } -> { scale: 1, duration: 0.45, ease: "back.out(2.6)" }` em `0`
       2. Haste vertical (`.jl-stem`): crescimento rápido `{ scaleY: 0 } -> { scaleY: 1, duration: 0.45, ease: "expo.out", transformOrigin: isTop ? "bottom center" : "top center" }` em `0.06`
       3. Moldura fotográfica (`.journey-stop-media`): revelação editorial por `clipPath` + deslocamento + escala `{ clipPath: isTop ? "inset(100% 0% 0% 0% round 12px)" : "inset(0% 0% 100% 0% round 12px)", y: isTop ? 36 : -36, scale: 0.88, autoAlpha: 0 } -> { clipPath: "inset(0% 0% 0% 0% round 12px)", y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" }` em `0.1`
       4. Imagem/cena interna (`.journey-stop-media-inner`): zoom-out cinematográfico `{ scale: 1.24 } -> { scale: 1, duration: 1.15, ease: "expo.out" }` em `0.1`
       5. Bloco textual secundário (`.journey-stop-copy`): entrada lateral `{ x: 28, autoAlpha: 0 } -> { x: 0, autoAlpha: 1, duration: 0.75, ease: "expo.out" }` em `0.22`
2. **Mobile Vertical (`(max-width: 899px) and (prefers-reduced-motion: no-preference)`):**
   - Cada parada vertical entra suavemente ao cruzar o viewport com `gsap.from(stopEl, { y: 36, scale: 0.96, autoAlpha: 0, duration: 0.85, ease: "expo.out", scrollTrigger: { trigger: stopEl, start: "top 88%", once: true } })`.
3. **`prefers-reduced-motion: reduce`:**
   - Desativa o pin/scroll horizontal e limpa todas as propriedades animadas (`.journey-line`, `.jd-dot`, `.jl-stem`, `.journey-stop-media`, `.journey-stop-media-inner`, `.journey-stop-copy`, `.journey-stop-card`, `.journey-mobile-stop`), renderizando o layout vertical limpo com todas as fotos e textos imediatamente visíveis (`opacity: 1`).
4. **Acessibilidade (`WCAG 2.1 AA`):**
   - Uso de `<section id="jornada" aria-labelledby="jornada-title">` e lista semântica `<ol>` / `<li>` para preservar a ordem cronológica real para leitores de tela (independentemente de a parada estar acima ou abaixo da linha no desktop).
   - Contrastes mínimos de `4.5:1` nos textos sobre `#0D0D0D` e `#141318`, e badges/elementos decorativos da timeline marcados com `aria-hidden="true"`.

---

## 5. Modelo de Dados TypeScript (`src/data/jornada.ts`)

```ts
export type JornadaCategory = "tech" | "curso" | "programa" | "empresa";

export interface JornadaCategoryMeta {
  id: JornadaCategory;
  label: string;
  accentColor: string;
}

export type JornadaMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "gallery";
      images: [
        { src: string; alt: string },
        { src: string; alt: string },
      ];
    }
  | {
      type: "none";
    };

export interface JornadaStop {
  id: string;
  year: string;
  monthLabel: string;
  category: JornadaCategory;
  title: string;
  organization: string;
  description: string;
  media: JornadaMedia;
}

export interface JornadaContent {
  eyebrow: string;
  periodLabel: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  scrollCue: string;
  categories: Record<JornadaCategory, JornadaCategoryMeta>;
  stops: JornadaStop[];
}
```

### Paradas Definidas (`src/data/jornada.ts` — Trajetória Real `2025 — 2026`)
As **5 paradas cronológicas** cobrem os quatro pilares (`curso`, `tech`, `programa`, `empresa`) com fotos reais em `public/jornada/`, galeria dupla e marcos textuais puros:
1. `2025 · Mai 25 – Mar 26` — **`curso`** — *Formação FullStack · Jovem Tech* (`INOVA-SE · MCTI`, `image`: `/jornada/jovemtech.webp`)
2. `2026 · Fev – Atual` — **`curso`** — *Análise e Desenvolvimento de Sistemas* (`UNIT-SE · Graduação Tecnológica`, `none`)
3. `2026 · Jul` — **`tech`** — *HackAI · Projeto Mapae* (`1º Hackathon · Descoberta Urbana`, `image`: `/jornada/hacktoon.webp`)
4. `2026 · Ago` — **`programa`** — *Embaixador Estudantil da Google* (`Google · Programa Estudantil`, `gallery`: `/jornada/google.webp` e `/jornada/google2.webp`)
5. `2026 · Set` — **`empresa`** — *Desenvolvedor FullStack · DelFinance* (`DelFinance · Fintech`, `none`)

---

## 6. Checklist de Verificação da Implementação

- [x] `<section id="jornada">` usa `overflow-x-clip` (não `overflow-hidden`), garantindo que o palco interno `sticky` funcione sem travar e integrando ao link `Jornada` do Header.
- [x] O palco `sticky` reserva padding superior suficiente para que as paradas superiores e a faixa de título nunca fiquem sob `#navbar`.
- [x] Suporte completo aos 3 modos de parada em `JornadaStopCard`: foto única (`image` 1:1), galeria dupla (`gallery` com 2 fotos lado a lado) e ponto puro sem foto (`none`), preservando `.journey-stop-media`, `.journey-stop-media-inner` e `.journey-stop-copy` para o `Timeline`.
- [x] A linha de progresso horizontal e o `x` do trilho calculam dinamicamente a largura total (`scrollWidth - clientWidth`), funcionando com qualquer número de paradas sem clipping no início ou fim.
- [x] As hastes e pontos conectam corretamente os cards alternados acima e abaixo da linha central via `containerAnimation`.
- [x] Em `< 900px` e sob `prefers-reduced-motion: reduce`, a timeline vira lista vertical editorial legível sem scroll horizontal preso.
- [ ] `npm run check` e `npm run build` passam com exit code `0`.
