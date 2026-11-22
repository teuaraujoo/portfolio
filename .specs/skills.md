# Especificação Técnica — Seção 5: Skills (`#skills`)

## 1. Análise do Prompt de Referência e Adaptação ao Projeto

O snippet de referência (**Hyperiux Vault `stack-spread.tsx` — Linear-to-Orbit Edition**) cria uma narrativa visual em duas etapas dentro de um palco `sticky`: os cards começam **empilhados em leque linear horizontal** ao centro da tela com a chamada *"Scroll to Expand"* e, conforme o usuário rola, **se espalham para posições orbitais** ao redor do centro da tela, revelando o título da seção no meio e ganhando **parallax espacial seguindo o cursor**.

Para integrar esse efeito à realidade do portfólio de **Mateus Araujo** (Next.js 16, React 19, Tailwind CSS v4, `@gsap/react` + `ScrollTrigger` + `Lenis`, estética **Editorial-Tech** escura `#0D0D0D`, `#141318`, `#4811ED` / `#793CFF`, `Space Grotesk` + `Montserrat`) e atender ao objetivo do usuário (**trocar fotos por ícones de linguagens e stacks que domina**), definimos as seguintes adaptações:

1. **Sem biblioteca duplicada (`motion` → `GSAP + ScrollTrigger`):**
   - **Original:** Depende de `motion/react` (`useScroll`, `useTransform`, `useSpring`), ausente no `package.json`.
   - **Adaptação:** Seguindo [CONTRIBUTING.md](../docs/CONTRIBUTING.md) e [ARCHITECTURE.md](../docs/ARCHITECTURE.md), todo o movimento de `Linear -> Orbit` e o parallax do cursor são executados com **`useGSAP` + `ScrollTrigger` (`scrub: 0.6`) + `gsap.quickTo`**, mantendo compatibilidade 100% com o `Lenis` e evitando carregar uma segunda engine de animação no bundle.
2. **De Fotografias para Cards-Insígnia de Linguagens & Stacks (SVGs vetoriais):**
   - **Original:** Exibia 8 imagens externas em retângulos de proporções extremas (`14vw × 30vh`), que funcionam para fotos com `object-cover`, mas deformariam ou deixariam ícones perdidos.
   - **Adaptação:** Cada card passa a ser uma **Insígnia Editorial-Tech (`SkillSpreadCard`)** de proporção equilibrada (`aspect-square` com tamanho fluido compacto para 15 cards: `clamp(86px,8.8vw,124px)`), com superfície escura `bg-card/90` (`#141318`) e `backdrop-blur-md`, borda sutil (`border-white/12`), **ícone SVG vetorial nítido da tecnologia** ao centro, **nome da linguagem/stack** + **categoria** discreta (`Linguagem`, `Frontend`, `FullStack`, `Backend`, `Dados`, `DevOps`, `Testes`, `CI/CD`) e halo luminoso suave com a cor característica da tecnologia (ou `#793CFF`).
3. **Zona Segura para Header Flutuante (`#navbar`) e Título Central:**
   - **Original:** Espalhava cards até `y: -40vh` e `scale` sem reserva de topo, o que no nosso layout invadiria o dock flutuante `#navbar` (`top-4`) ou cobriria o texto central em notebooks `1280×720`.
   - **Adaptação:** Os vetores orbitais `(x, y)` no desktop respeitam uma **coroa espacial ao redor do bloco central** (mantendo a zona do título livre em `720p` até `1920px`) e limitam o deslocamento superior dentro da área livre abaixo do header (`pt-20 md:pt-24`), calibrando o `scrollLength` para **`250vh`** (mais ágil que os `380vh` originais).
4. **Interatividade Útil ao Hover/Focus + Lista Complementar Opcional:**
   - No estágio orbital, passar o mouse ou focar via teclado em uma stack eleva o card (`scale` + glow de borda + `z-index` superior) e **atualiza dinamicamente o eyebrow/badge central** exibindo a categoria daquela tecnologia (`skill.category`, voltando a `"Stack principal"` ao sair do card; o campo `experienceNote` foi removido).
   - Logo abaixo do palco orbital, uma faixa limpa e discreta (**"Outras ferramentas & práticas"**) lista em pills secundárias bibliotecas e práticas complementares (*Git, GSAP, Lenis, REST APIs, WebSockets, Linux, Clean Architecture, Figma*) sem poluir os 15 cards principais da órbita.
5. **Mobile (`< 768px`) e `prefers-reduced-motion: reduce`:**
   - **Original:** Detectava apenas `(pointer: coarse)` e mantinha `380vh` de altura mesmo em mobile.
   - **Adaptação:** Abaixo de `768px` (ou quando `prefers-reduced-motion: reduce` estiver ativo), desativa o palco sticky de `250vh` e renderiza diretamente o cabeçalho `"05 — Skills"` + **grid 2 colunas limpo** com todas as insígnias visíveis imediatamente, mais a faixa de ferramentas complementares abaixo.

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/skills.ts`):**
  - Centraliza `eyebrow` (`"05 — Skills"`), título central (`"Stack para grandes projetos."`), subtítulo padrão, hint (`"Role para expandir"`), **array de 15 stacks principais** para a órbita (`SkillItem`: `id`, `name`, `category`, `iconKey`, `accentColor`, coordenadas `linearOffset`, `linearRotate`, `orbitTarget` — `experienceNote` foi removido), além da lista complementar (`secondaryTools: string[]`).
- **Catálogo de ícones SVG de programação (`src/components/portfolio/skill-icons.tsx`):**
  - Exporta `SkillIcon` com SVGs vetoriais limpos (`viewBox="0 0 24 24"`, `aria-hidden="true"`) das 15 linguagens/tecnologias principais (TypeScript, JavaScript, React, Next.js, Tailwind CSS, Node.js, NestJS, Express, Prisma ORM, TypeORM, PostgreSQL, Docker, Playwright, GitHub, GitHub Actions), evitando URLs externas sujeitas a falha de carregamento.
- **Primitive genérica reutilizável (`src/components/ui/stack-spread.tsx`):**
  - `"use client"` — componente de palco `Linear -> Orbit` movido por `useGSAP` + `ScrollTrigger` (`scrub`) + `gsap.quickTo` para parallax do ponteiro, aceitando itens genéricos e função `renderCard(item, { isSpread, isActive })`, com wrapper externo `overflow-x-clip` para preservar `position: sticky`.
- **Seção principal (`src/components/portfolio/skills.tsx`):**
  - `"use client"` — renderiza a barra de metadados `"05 — Skills"`, conecta os cards de linguagens ao `StackSpread` (gerenciando `hoveredSkillId` para feedback no centro), renderiza o grid mobile/reduced-motion e a faixa inferior de ferramentas complementares.
- **Integração:**
  - Renderizada em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx) logo abaixo de `<Jornada />`, recebendo `skillsContent` via props tipadas de [src/app/page.tsx](../src/app/page.tsx), com `id="skills"` sincronizado ao link `Skills` em [src/data/home.ts](../src/data/home.ts).

---

## 3. Estrutura Visual, Dimensionamento e Layout

### Regra Crítica de Scroll para `position: sticky`
- A `<section id="skills">` usa **`overflow-x-clip`** (nunca `overflow-hidden`) no container alto externo (`md:h-[250vh] motion-reduce:h-auto`), enquanto apenas o palco interno `sticky top-0 h-svh overflow-hidden` recorta excessos durante o espalhamento.

### A) Palco Desktop (`>= 768px` e `prefers-reduced-motion: no-preference`)
1. **Barra Superior de Contexto (fixa dentro do palco `sticky` abaixo de `#navbar`):**
   - `pt-20 md:pt-24` e faixa `mx-auto flex w-full max-w-[1600px] items-center justify-between border-b border-border px-[clamp(20px,4vw,56px)] pb-3`:
   - Esquerda: `"05 — Skills"` (`text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground`).
   - Direita: `"Stack principal · 15 tecnologias"` (contador dinâmico).
2. **Glow Ambiental Central (fundo discreto):**
   - Halo radial sutil centrado atrás do título (`rgba(72, 17, 237, 0.14)` + `rgba(121, 60, 255, 0.08)` com `blur-[110px]`), reforçando a atmosfera Editorial-Tech sem comprometer contraste.
3. **Bloco Editorial Central (`.skills-center-copy`, `z-[5] pointer-events-none`):**
   - Posicionado no centro vertical/horizontal livre entre os cards orbitais (`max-w-full px-2 text-center`, mantendo `max-w-[30ch] sm:max-w-[34ch]` apenas no eyebrow e no subtítulo), **mantido intacto do prompt de referência** com fade-in + escala logo após o início da dispersão (`textFadeStart`, de `0.28` → `0.68` no timeline do scroll).
   - **Eyebrow dinâmico (opcional no hover):** quando nenhuma stack está em foco, exibe indicador discreto `"Stack principal"`; ao passar o mouse/focar em um card de stack, exibe `"{skill.category}"` em `text-brand-bright`.
   - **Título (`<h2 id="skills-title">`):** `font-display text-[clamp(1.75rem,3.1vw,3.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground` — espelhando o contraste em dois tons do prompt de referência (`"Linear To Spatial."`) sempre em **exatas 2 linhas** (`whitespace-nowrap` + `<br />`): `titleLine1` (`"Stack"`) + `titleConnector` opcional (`"para"`, em `font-normal opacity-50`) na linha 1, e `titleLine2` (`"grandes projetos."`) na linha 2.
   - **Subtítulo (`defaultDescription`):** exibe `"Do problema à arquitetura fullstack escalável."` (`experienceNote` foi removido dos cards; hover/focus atualiza apenas o eyebrow de categoria central).
4. **15 Cards de Linguagens / Stacks (`.skill-spread-card`):**
   - **Estado Inicial (`progress = 0` — Alinhamento Linear):**
     - Dispostos horizontalmente ao centro em leque levemente inclinado (`linearOffsetX` de `-31.5vw` a `+31.5vw` em passos de `4.5vw`, `linearRotate` de `-7deg` a `+7deg` em passos de `1deg`, `scale: 0.78`), sobrepostos com `zIndex` progressivo (`2` a `16`).
   - **Estado Espalhado (`progress = 1` — Arquitetura Orbital ao redor do Centro):**
     - Cada card se move para coordenadas `(orbitXvw, orbitYvh)` calibradas em um perímetro de 15 cards ao redor do título central sem sobreposição (6 cards no arco superior entre `y: -22vh` e `-17vh`, 4 cards nas alas laterais entre `y: 2vh` e `5vh`, e 5 cards no arco inferior entre `y: 22vh` e `25vh`, mantendo o centro livre e distância segura abaixo de `#navbar`).
   - **Visual do Card-Insígnia (`size-[clamp(86px,8.8vw,124px)]`, cantos concêntricos `rounded-[18px]`):**
     - Casca externa: `relative flex size-full flex-col items-center justify-between overflow-hidden rounded-[18px] border border-white/12 bg-[#141318]/92 p-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[border-color,box-shadow] duration-300`.
     - Topo interno: micro-tag de categoria (`text-[9px] uppercase tracking-[0.1em] text-muted-foreground`) + ponto luminoso na `accentColor` da tecnologia.
     - Centro: `<SkillIcon iconKey={skill.iconKey} />` (`size-9 lg:size-11`) com glow radial suave atrás do ícone em `color-mix(in srgb, var(--skill-accent) 22%, transparent)`.
     - Base: nome da tecnologia (`font-display text-xs lg:text-sm font-semibold tracking-[-0.02em] text-foreground`).
     - **Hover / Focus-visible (quando `spread` ativo):** borda acende em `color-mix(in srgb, var(--skill-accent) 65%, white 15%)`, leve elevação (`scale: 1.08`, `y: -8`, `zIndex: 40`) e destaque da descrição central.
5. **Hint de Scroll Inferior (`.skills-scroll-hint`):**
   - Ancorado em `bottom-6` (`opacity: 1 -> 0` nos primeiros `15%` do scroll): texto `"Role para expandir"` + barra vertical animada em CSS (`@keyframes` ou pulso sutil, desativado em `reduced-motion`).

### B) Bloco Complementar & Fallback Mobile (`< 768px` ou `prefers-reduced-motion: reduce`)
- **Mobile / Reduced Motion:**
  - Oculta o palco `250vh` e exibe fluxo vertical direto (`px-[clamp(20px,4vw,56px)] py-20`):
    - Meta `"05 — Skills"`, título em **exatas 2 linhas** (`"Stack para"` / `"grandes projetos."` com `text-[clamp(1.65rem,6.5vw,2.75rem)]`, `whitespace-nowrap` + `<br />`), lead curto e **grid `grid-cols-2 sm:grid-cols-3 gap-3.5`** com todos os 15 cards-insígnia completos (ícone, nome e categoria; `experienceNote` removido).
- **Faixa Secundária Inferior (`"Outras ferramentas & práticas"`):**
  - Posicionada imediatamente abaixo do palco sticky (tanto no desktop após sair do spread quanto no mobile): container `mx-auto max-w-[1600px] px-[clamp(20px,4vw,56px)] pb-24 pt-10 border-t border-border/60`, listando chips discretos de ferramentas/conhecimentos extras (`Git`, `GSAP`, `Lenis`, `REST APIs`, `WebSockets`, `Linux`, `Clean Architecture`, `Figma`).

---

## 4. Coreografia GSAP + Lenis e Acessibilidade

Todo movimento GSAP fica em `useGSAP(() => { ... }, { scope: sectionRef })` dentro de `src/components/ui/stack-spread.tsx` utilizando `gsap.matchMedia()`:

1. **Desktop Orbital Spread (`(min-width: 768px) and (prefers-reduced-motion: no-preference)`):**
   - `masterTl` com `scrollTrigger: { trigger: wrapRef.current, start: "top top", end: "bottom bottom", scrub: 0.65, invalidateOnRefresh: true }`.
   - **Fade-out do hint inicial (`0` → `0.15`):** `.skills-scroll-hint` vai de `autoAlpha: 1` → `0`.
   - **Dispersão dos cards (`0.10` → `0.85`, ease `power2.inOut`):**
     - Cada card interpola de `{ xPercent: -50, yPercent: -50, x: () => linearXpx, y: () => linearYpx, rotation: linearRotate, scale: stackScale }` para `{ xPercent: -50, yPercent: -50, x: () => orbitXpx, y: () => orbitYpx, rotation: orbitRotate, scale: orbitScale }`.
     - *Por que calcular pixels dinamicamente com funções `() => ...` e `invalidateOnRefresh: true`?* Para recalcular `vw`/`vh` automaticamente em redimensionamentos de janela sem quebrar o centro.
   - **Entrada do Título Central (`0.28` → `0.68`):** `.skills-center-copy` anima de `{ autoAlpha: 0, scale: 0.9 }` para `{ autoAlpha: 1, scale: 1, ease: "power2.out" }`.
   - **Parallax Espacial do Ponteiro (quando `progress >= 0.92`):**
     - Usa `gsap.quickTo` em um sub-wrapper `.skill-parallax-layer` de cada card (`duration: 0.55, ease: "power3.out"`), aplicando um deslocamento sutil proporcional ao `depthFactor` (`±14px` a `±28px`), separado do wrapper de scroll para **nunca conflitar com os valores do `ScrollTrigger`**! Reset automático ao sair da seção ou quando o scroll volta para o estado linear.
2. **Mobile (`(max-width: 767px) and (prefers-reduced-motion: no-preference)`):**
   - Sem `sticky`: os cards no grid mobile entram com stagger suave (`y: 24, autoAlpha: 0 -> 0, 1`, `stagger: 0.05`, `once: true`, `clearProps: "transform"`).
3. **`prefers-reduced-motion: reduce`:**
   - Remove altura `250vh`, oculta o palco animado e mostra o grid estático completo com todos os cards e textos visíveis imediatamente.
4. **Acessibilidade (`WCAG 2.1 AA`):**
   - Cada card-insígnia no palco desktop usa `<button type="button">` acessível por teclado (`Tab`), com foco visível (`focus-visible:ring-2 focus-visible:ring-brand-bright`) disparando o mesmo destaque visual e descrição central no `onFocus`/`onBlur` que o `onMouseEnter`/`onMouseLeave`.
   - Ícones SVG decorativos com `aria-hidden="true"`, contraste mínimo `4.5:1` nos textos e nomes claros.

---

## 5. Modelo de Dados TypeScript (`src/data/skills.ts`)

```ts
export type SkillIconKey =
  | "typescript"
  | "javascript"
  | "react"
  | "nextjs"
  | "tailwind"
  | "nodejs"
  | "nestjs"
  | "express"
  | "prisma"
  | "typeorm"
  | "postgresql"
  | "docker"
  | "playwright"
  | "github"
  | "actions";

export type SkillCategory =
  | "Linguagem"
  | "Frontend"
  | "FullStack"
  | "Backend"
  | "Dados"
  | "DevOps"
  | "Testes"
  | "CI/CD";

export interface SkillOrbitPlacement {
  linearOffset: { xVw: number; yVh: number };
  linearRotate: number;
  orbitTarget: {
    xVw: number;
    yVh: number;
    rotate: number;
    scale: number;
  };
  zIndex: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  iconKey: SkillIconKey;
  accentColor: string;
  placement: SkillOrbitPlacement;
}

export interface SkillsContent {
  eyebrow: string;
  countSuffix: string;
  centerEyebrowDefault: string;
  titleLine1: string;
  titleConnector?: string;
  titleLine2: string;
  defaultDescription: string;
  scrollHint: string;
  secondaryTitle: string;
  items: SkillItem[];
  secondaryTools: string[];
}
```

### Stacks Iniciais (`src/data/skills.ts` — 15 Cards Orbitais + Chips Extras)
1. **TypeScript** (`Linguagem`, `#3178C6`)
2. **JavaScript** (`Linguagem`, `#F7DF1E`)
3. **React** (`Frontend`, `#61DAFB`)
4. **Next.js** (`FullStack`, `#F5F5F5`)
5. **Tailwind CSS** (`Frontend`, `#38BDF8`)
6. **Node.js** (`Backend`, `#5FA04E`)
7. **NestJS** (`Backend`, `#E0234E`)
8. **Express** (`Backend`, `#E5E5E5`)
9. **Prisma ORM** (`Dados`, `#7986CB`)
10. **TypeORM** (`Dados`, `#F26B3A`)
11. **PostgreSQL** (`Dados`, `#4169E1`)
12. **Docker** (`DevOps`, `#2496ED`)
13. **Playwright** (`Testes`, `#2EAD33`)
14. **GitHub** (`DevOps`, `#F5F5F5`)
15. **GitHub Actions** (`CI/CD`, `#2088FF`)

- **Observação de Dados:** O título central (`"Stack para"` / `"grandes projetos."` via `titleLine1`, `titleConnector` e `titleLine2`, sempre em 2 linhas) e o subtítulo padrão (`defaultDescription`: `"Do problema à arquitetura fullstack escalável."`) permanecem visíveis após o início do espalhamento (`textFadeStart`). O campo `experienceNote` foi removido de `SkillItem`, mantendo apenas a atualização dinâmica do eyebrow de categoria central no hover/focus.

---

## 6. Checklist de Verificação da Implementação

- [ ] `<section id="skills">` usa `overflow-x-clip`, integrando com o link `Skills` (`#skills`) do Header e sem quebrar o `position: sticky` do palco.
- [ ] Em `progress = 0`, os 15 cards aparecem em leque linear horizontal ao centro com hint `"Role para expandir"`; ao rolar, dispersam suavemente para a órbita ao redor de `"Stack para grandes projetos."`.
- [ ] Nenhum card na órbita invade a área superior do `#navbar` ou cobre o título central em `1280×720`, `1440×900` e `1920×1080`.
- [ ] O parallax do mouse (via wrapper `.skill-parallax-layer` separado com `gsap.quickTo`) só atua após a dispersão orbital sem conflitar com os transforms do `ScrollTrigger`.
- [ ] Hover e foco via `Tab` destacam o card-insígnia e atualizam dinamicamente o eyebrow de categoria central (`experienceNote` removido).
- [ ] Abaixo de `768px` e sob `prefers-reduced-motion: reduce`, exibe o grid estático limpo sem altura artificial `250vh`.
- [ ] `npm run check` e `npm run build` passam com exit code `0`.
