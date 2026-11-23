# Especificação Técnica — Seção 7: Footer

## 1. Análise do Prompt de Referência e Adaptação ao Projeto

O snippet de referência (**21st.dev `kiln-wordmark-footer.tsx`**) entrega um rodapé editorial completo com estética cerâmica vermelha (`#a5080d` / `#c42b1c`), contendo fundo geométrico clicável (`TILES`), motto, chave lateral de retorno ao topo, 3 colunas de navegação/endereço/redes, barra legal inferior em pílula e um wordmark gigante com 3 interações físicas no texto.

Conforme definido pelo usuário, **não** utilizaremos o layout nem a paleta do footer de referência, e também **substituímos o alfabeto geométrico SVG procedural pela tipografia variável real da Home (`Space Grotesk` via `font-display`)**, preservando exatamente os 3 efeitos interativos do wordmark aplicados ao estilo da Home:

1. **O que é mantido e adaptado (efeito do Wordmark sobre `Space Grotesk`):**
   - **Tipografia idêntica à Home (`Space Grotesk`):** Renderiza texto real em `font-display font-medium leading-[0.88] tracking-[-0.055em] text-foreground`, preservando a capitalização exata **`"Mateus Araujo"`** e o recuo vertical (`pt-[0.06em] pb-[0.15em] overflow-hidden`) do [hero.tsx](../src/components/portfolio/hero.tsx) para que o descendente do `j` nunca seja cortado.
   - **Dimensionamento full-width sem overflow (`ResizeObserver` + `document.fonts.ready`):** Mede a largura disponível do container (`containerRef`) contra a linha de referência (`measureRef` a `100px`) dentro de `useLayoutEffect`, ajustando o `fontSize` exato em pixels para ocupar ~100% da largura do rodapé de `375px` a `1920px+`, com fallback SSR `text-[clamp(2.6rem,12.6vw,15.5rem)]` antes da hidratação para evitar salto de layout.
   - **Slots de avanço fixos (`inline-flex items-baseline justify-center`):** A largura natural de cada caractere em repouso (`wght 450`) é medida e travada no wrapper externo após cada ajuste de escala, garantindo que a variação de peso (`wght` `450` → `700`) e o pulso de escala nunca causem reflow horizontal ou quebra de linha.
   - **Três interações do texto preservadas:**
     1. **Entrada da linha de base:** Ao entrar na tela (`IntersectionObserver`, `threshold: 0.15`), cada caractere sobe em cascata de `translate-y-[118%]` → `translate-y-0` em `950ms cubic-bezier(0.16, 0.9, 0.18, 1)`.
     2. **Lente de peso gaussiana no cursor (`onPointerMove`, desktop não-touch):** Ao deslizar o mouse sobre o nome, uma curva gaussiana em `requestAnimationFrame` atualiza diretamente os nós DOM de cada caractere (zero re-renders React por frame), interpolando `fontVariationSettings` (`"wght"` `450` → `700`), escala sutil (`scale(1)` → `scale(1.07)`) e ênfase sutil de brilho/luminância. Ao sair do cursor (`onPointerLeave`), retorna suavemente ao peso base e encerra o `rAF` (`0%` custo ocioso).
     3. **Carimbo elástico ao clicar (`stamp`):** Clicar em qualquer letra dispara pico instantâneo de peso (`700`), squash-and-stretch elástico via Web Animations API (`scale(1, 1)` → `scale(1.06, 0.82)` → `scale(0.97, 1.05)` → `scale(1, 1)`) e breve flash de acento `--brand-bright` (`#793CFF`).
2. **O que é descartado do snippet original:**
   - Removidos integralmente: fundo vermelho/tijolo (`deep`, `surface`), `.kwf-tile` (disco e bloco atrás), `TILES`/`leanTile`/`turnTile`, motto (`.kwf-motto`), grid de 3 colunas (endereço, navegação, redes), barra legal inferior (`.kwf-bar`), a tag inline `<style>{CSS}</style>` e o alfabeto geométrico SVG procedural (`GLYPHS`).
3. **Adaptação à realidade da stack (`Editorial-Tech` + `Lenis` + Tailwind CSS v4):**
   - **Fundo e cores:** Continuidade direta sobre `--background` (`#0D0D0D`), wordmark em `--foreground` (`#F5F5F5`) e separador em `border-border` (`rgba(245, 245, 245, 0.12)`).
   - **Scroll to top integrado ao `Lenis`:** O botão **`"Voltar para topo"`** consome `useSmoothScroll().scrollTo(0)` de [smooth-scroll.tsx](../src/components/portfolio/smooth-scroll.tsx), respeitando suavização do Lenis e fallback nativo sob `prefers-reduced-motion`.

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Camada de dados tipada (`src/data/footer.ts`):**
  - Centraliza `wordmark` (`"Mateus Araujo"`), `copyright` (`"© 2026 Mateus Araujo. Todos os direitos reservados."`), `backToTopLabel` (`"Voltar para topo"`), `backToTopAriaLabel` (`"Voltar para o topo da página"`), `wordmarkWeight` (`450`) e `enableLens` (`true`).
- **Primitive isolada do efeito (`src/components/ui/kiln-wordmark.tsx`):**
  - `"use client"` — implementa `<KilnWordmark />` reutilizável em largura total (`w-full`) com `Space Grotesk` variável, auto-fit via `ResizeObserver` + `document.fonts.ready`, travamento de largura por slot de caractere, lente gaussiana em `rAF` e carimbo via Web Animations API.
- **Componente do Footer (`src/components/portfolio/footer.tsx`):**
  - `"use client"` — renderiza a tag semântica `<footer>` minimalista: nome gigante ocupando a largura da tela via `<KilnWordmark />`, separador horizontal e barra inferior com aviso de copyright à esquerda e botão **`Voltar para topo ↑`** à direita abaixo do separador.
- **Integração:**
  - Renderizado em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx) logo após `<main>` (fechando o documento fora de `<main>`), alimentado por `footerContent` passado de [src/app/page.tsx](../src/app/page.tsx).

---

## 3. Estrutura Visual, Dimensionamento e Layout

Estrutura estritamente minimalista conforme pedido do usuário (apenas 3 blocos visuais):

### Container Principal (`<footer>`)
- **Elemento:** `<footer className="relative w-full overflow-x-clip bg-background px-[clamp(20px,3vw,48px)] pt-6 pb-6 text-foreground md:pt-8 md:pb-8">`
- **Largura Total:** Ocupa toda a largura da viewport com apenas o respiro lateral fluido (`px-[clamp(20px,3vw,48px)]`), permitindo que o nome gigante se estenda visualmente de ponta a ponta da tela em qualquer resolução (`375px` a `1920px+`).

### 1. Nome Gigante em Largura Total (`<KilnWordmark />`)
- **Texto:** `"Mateus Araujo"` com capitalização exata da Home (`<span className="sr-only">{text}</span>` para leitores de tela; linha visual marcada com `aria-hidden="true"`).
- **Tipografia e Auto-Fit:**
  - `font-display font-medium leading-[0.88] tracking-[-0.055em] text-foreground` (`Space Grotesk` carregada em [layout.tsx](../src/app/layout.tsx)).
  - Fallback SSR `text-[clamp(2.6rem,12.6vw,15.5rem)]`, refinado imediatamente em `useLayoutEffect` medindo `containerRef.clientWidth / measureRef.width * 100` (com margem `0.996` e `px-[0.02em]` para acomodar o `scale(1.07)` nas extremidades sem clipping).
  - Máscara vertical `pt-[0.06em] pb-[0.15em] overflow-hidden` garante proteção integral ao descendente de `j` em `"Araujo"`.
- **Parâmetros calibrados para Editorial-Tech:**
  - `weight`: `450` (peso base variável da `Space Grotesk`, interpolando até `700` sob a lente/carimbo)
  - `lens`: `true` (curva gaussiana com `sigma = max(58px, lineWidth * 0.085)`)

### 2. Separador Horizontal
- Posicionado logo abaixo do nome gigante (`mt-2 md:mt-3`):
- `<div aria-hidden="true" className="h-px w-full bg-border" />`.

### 3. Barra Inferior (`Copyright` à esquerda + `Voltar para topo` à direita)
- Alinhamento responsivo abaixo do separador (`flex-col-reverse` no mobile com `gap-3`, e linha horizontal `sm:flex-row sm:items-center justify-between` em telas maiores):
- `<div className="mt-4 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center md:mt-5">`
- **Copyright à esquerda (`<p>`):**
  - Classes: `font-sans text-xs font-medium tracking-[0.04em] text-muted-foreground`
  - **Conteúdo:** `{content.copyright}` (`"© 2026 Mateus Araujo. Todos os direitos reservados."`).
- **Botão à direita (`<button type="button" onClick={() => scrollTo(0)}>`):**
  - Classes: `group inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 py-1 font-sans text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright`
  - **Conteúdo:** `"Voltar para topo"` + `ArrowUp` (`lucide-react`, `size-4`).
  - **Comportamento ao clicar:** chama `scrollTo(0)` do `useSmoothScroll()` (rolando suavemente via Lenis até o topo da Home).

*(Sem colunas de links e sem fundo colorido adicional, respeitando fielmente o escopo minimalista solicitado.)*

---

## 4. Coreografia, Performance e Acessibilidade

1. **Entrada do Wordmark (`IntersectionObserver`):**
   - Observa `containerRef` com `{ threshold: 0.15 }` (`disconnect()` após entrar uma única vez).
   - Cada caractere recebe `transitionDelay: ${120 + i * 55}ms` animando `translate-y-[118%]` → `translate-y-0` em `950ms cubic-bezier(0.16, 0.9, 0.18, 1)`.
2. **Loop `requestAnimationFrame` sob demanda (0% custo ocioso):**
   - O `rAF` só roda enquanto há interpolação pendente (`approach(...)`); assim que o ponteiro sai e todos os caracteres convergem ao repouso, o loop encerra (`a.raf = 0`).
   - Ignora ponteiros touch (`e.pointerType === "touch"`).
3. **`prefers-reduced-motion: reduce`:**
   - Monitora `matchMedia("(prefers-reduced-motion: reduce)")` via `useSyncExternalStore`.
   - Quando ativo: desativa a transição de subida inicial (`motion-reduce:translate-y-0 motion-reduce:transition-none`), mantém peso uniforme estático (`lens` desativado), desativa `stamp` e faz `scrollTo(0)` instantâneo.
4. **WCAG 2.1 AA & React 19 ESLint:**
   - Linha dividida de caracteres marcada com `aria-hidden="true"` e `<span className="sr-only">Mateus Araujo</span>` sempre presente; botão `"Voltar para topo"` com altura mínima `min-h-[44px]` e anel de foco visível.
   - Zero leituras ou escritas de `ref.current` durante o render (`react-hooks/refs` limpo).

---

## 5. Modelo de Dados TypeScript (`src/data/footer.ts`)

```ts
export interface FooterContent {
  wordmark: string;
  copyright: string;
  backToTopLabel: string;
  backToTopAriaLabel: string;
  wordmarkWeight?: number;
  enableLens?: boolean;
}

export const footerContent: FooterContent = {
  wordmark: "Mateus Araujo",
  copyright: "© 2026 Mateus Araujo. Todos os direitos reservados.",
  backToTopLabel: "Voltar para topo",
  backToTopAriaLabel: "Voltar para o topo da página",
  wordmarkWeight: 450,
  enableLens: true,
};
```

---

## 6. Checklist de Verificação da Implementação

- [x] `<footer>` contém **exclusivamente**: wordmark gigante ocupando a largura da tela (`"Mateus Araujo"` em `Space Grotesk`), separador horizontal abaixo dele e barra inferior com aviso de copyright à esquerda (`"© 2026 Mateus Araujo. Todos os direitos reservados."`) e `"Voltar para topo"` com seta à direita.
- [x] Estilo tipográfico alinhado ao Hero da Home (`font-display font-medium tracking-[-0.055em]`, `pb-[0.15em]`), sem recortes no descendente do `j` de `375px` a `1920px+`.
- [x] Passar o mouse sobre as letras em desktop engrossa suavemente os caracteres próximos ao cursor (`wght` + `scale`) via lente gaussiana sem causar reflow; clicar em uma letra executa o pulso elástico com flash `--brand-bright` (`stamp`); a entrada na viewport revela as letras da linha de base.
- [x] Clicar em `"Voltar para topo"` rola suavemente ao topo via `useSmoothScroll().scrollTo(0)` (Lenis).
- [x] `prefers-reduced-motion: reduce` e dispositivos touch (`pointerType === "touch"`) funcionam sem travamentos ou animações excessivas.
- [x] `npm run check` e `npm run build` passam com exit code `0`.
