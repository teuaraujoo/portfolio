# Especificação Técnica — Preloader (`#intro`)

## 1. Visão Geral e Objetivo

O Preloader atua como a primeira camada visual da aplicação ao carregar a página inicial (`/`). Inspirado na referência `victordeveloper.com` e adaptado ao Design System **Editorial-Tech** do portfólio de **Mateus Araujo**, ele estabelece ritmo, autoridade tipográfica e transição fluida para a dobra principal (`Hero`).

Durante sua execução:
- Ocupa `100svh` (`fixed inset-0`) acima de toda a interface (`z-[10000]`).
- Mantém o **Lenis** pausado e bloqueia eventos de rolagem (`wheel`, `touchmove` e teclas de scroll) **sem aplicar `overflow: hidden` no `<html>`**, combinando com `scrollbar-gutter: stable` e scrollbar discreta em `globals.css` para garantir **0px de deslocamento lateral** e evitar que a barra de rolagem suma e reapareça no Windows.
- Ao completar `100%`, o fundo se divide imediatamente em **duas cortinas verticais de meia viewport** que sobem de forma escalonada (`yPercent: -100`, curva `power4.inOut`, duração `1.25s`, metade esquerda em `0.00s` e metade direita em `0.22s` com stagger de `0.22s`), dispara a timeline de entrada da Home (`heroIn` via `onExitStart()` em `~0.20s`) por trás das cortinas em abertura, e só então eleva e desaparece com o conteúdo textual flutuante em `z-10` (`y: -28`, `autoAlpha: 0`, `duration: 0.48` em `0.42s`), eliminando qualquer pausa de tela preta vazia antes da revelação.

---

## 2. Arquitetura e Fronteiras de Componente

Seguindo os princípios de [ARCHITECTURE.md](../docs/ARCHITECTURE.md):

- **Arquivo do componente:** `src/components/portfolio/preloader.tsx`
  - Diretiva `"use client"` obrigatória (manipulação de DOM, `gsap.ticker`, `matchMedia` e ciclo de vida do Lenis).
- **Fonte de dados tipada:** `src/data/home.ts`
  - Todos os textos exibidos (`Mateus Araujo`, `Portfólio — 2026`, `Carregando`) devem ser consumidos do objeto tipado de dados (`PreloaderContent`), sem strings fixas espalhadas pelo JSX.
- **Isolamento do GSAP:**
  - Toda animação deve ficar dentro de `useGSAP(() => { ... }, { scope })` utilizando `gsap.matchMedia()` para garantir cleanup automático e respeito a `prefers-reduced-motion`.
- **Integração com Lenis, Estratégia Anti-Layout-Shift & Orquestração com a Home:**
  - `src/app/globals.css` define `scrollbar-gutter: stable;` e `background-color: var(--background);` no `html` (junto à scrollbar Editorial-Tech discreta de `8px` em `#0d0d0d` / `#262332` / hover `#793cff`) e não aplica `overflow: hidden` em `.lenis.lenis-stopped`.
  - Enquanto o Preloader estiver ativo:
    - Chama `stop()` do `useSmoothScroll()` (sem alterar `document.documentElement.style.overflow`, evitando o piscar e o deslocamento de ~15–17px da scrollbar no Windows).
    - Registra listeners temporários de `wheel` (`{ passive: false }`), `touchmove` (`{ passive: false }`) e `keydown` (`ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`, `Home`, `End`, `Space`, exceto em campos editáveis focados).
  - Quando a cortina esquerda iniciar a subida (`t = ~0.20s`), o Preloader aciona o callback `onExitStart()` (ou contexto/evento compartilhado) para iniciar a timeline `heroIn`.
  - No `onComplete` da saída:
    - Remove os listeners de bloqueio de scroll
    - Aciona `start()` do `useSmoothScroll()`
    - Chama `ScrollTrigger.refresh()`
    - Desmonta/remove o nó do DOM (`setIsVisible(false)` / retorna `null` após conclusão).
- **Fallback `<noscript>`:**
  - No `layout.tsx` ou `globals.css`, garantir que caso o JavaScript esteja desabilitado, o container `#intro` não bloqueie a visualização da página:
    ```html
    <noscript><style>#intro { display: none !important; }</style></noscript>
    ```

### Interface de Props sugerida

```ts
export interface PreloaderProps {
  content: PreloaderContent;
  /** Disparado em ~0.20s (logo após a cortina esquerda iniciar a subida) para sincronizar a entrada da Hero */
  onExitStart?: () => void;
  /** Disparado após as cortinas saírem completamente da viewport e liberarem o scroll */
  onComplete?: () => void;
}
```

---

## 3. Estrutura DOM e Hierarquia

Estrutura dividida em dois painéis de cortina (`intro-curtain-left` e `intro-curtain-right`) sob uma camada de conteúdo (`.intro-content`), dentro de um overlay fixo transparente acessível (`aria-hidden="true"` enquanto decorativo/transicional, garantindo que leitores de tela não fiquem presos no overlay):

```tsx
<div
  ref={scope}
  id="intro"
  aria-hidden="true"
  data-lenis-prevent
  className="fixed inset-0 z-[10000] h-svh overscroll-none bg-transparent text-foreground select-none"
>
  {/* Painéis da Cortina Dividida (Esquerda + Direita) */}
  <div
    ref={leftPanelRef}
    aria-hidden="true"
    className="intro-curtain-left pointer-events-none absolute inset-y-0 left-0 z-0 w-[calc(50%+1px)] bg-background will-change-transform"
  />
  <div
    ref={rightPanelRef}
    aria-hidden="true"
    className="intro-curtain-right pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 bg-background will-change-transform"
  />

  {/* Camada de Conteúdo sobre as Cortinas */}
  <div
    ref={contentRef}
    className="intro-content relative z-10 flex h-full w-full flex-col justify-between p-[clamp(20px,4vw,56px)]"
  >
    {/* Bloco Superior */}
    <div className="intro-top flex items-end justify-between font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      <span>{content.author}</span>
      <span>{content.yearLabel}</span>
    </div>

    {/* Bloco Inferior */}
    <div className="intro-bottom flex items-end justify-between">
      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {content.loadingLabel}
      </span>
      <span className="intro-count inline-flex items-baseline font-display text-[clamp(4.5rem,14vw,12.5rem)] font-medium leading-[0.8] tracking-[-0.05em] text-foreground tabular-nums">
        <span ref={countRef}>0</span>
        <span className="ml-[0.04em] text-[0.42em] tracking-normal text-brand-bright">
          %
        </span>
      </span>
    </div>

    {/* Barra de Progresso Inferior */}
    <div
      ref={barRef}
      className="intro-bar absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-brand-bright"
    />
  </div>
</div>
```

---

## 4. Dimensionamento, Tipografia e Tokens de Estilo

Todos os valores respeitam os tokens semânticos definidos em [src/app/globals.css](../src/app/globals.css) e as regras do [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md):

| Elemento | Propriedade | Valor / Token | Observações |
| --- | --- | --- | --- |
| **Container `#intro`** | Altura, Posição & Fundo | `fixed inset-0 h-svh z-[10000] bg-transparent` | Cobre toda a viewport inicial em desktop e mobile (`svh` evita saltos da barra de endereço mobile); fundo transparente para expor o split das cortinas. |
| **Cortina Esquerda `.intro-curtain-left`** | Dimensão & Fundo | `w-[calc(50%+1px)] inset-y-0 left-0 z-0 bg-background` | `#0D0D0D` (`var(--background)`), `will-change-transform`, sobreposição de `1px` no centro evitando fresta subpixel em escalas fracionárias do Windows. |
| **Cortina Direita `.intro-curtain-right`** | Dimensão & Fundo | `w-1/2 inset-y-0 right-0 z-0 bg-background` | `#0D0D0D` (`var(--background)`), `will-change-transform`, sobe `0.22s` após a cortina esquerda. |
| **Camada `.intro-content`** | Layout & Padding | `relative z-10 flex h-full w-full flex-col justify-between p-[clamp(20px,4vw,56px)]` | Alinhado com a margem lateral da Home (`--gutter`) para continuidade visual; fica acima das cortinas (`z-10`). |
| **Labels `.intro-top` e `Carregando`** | Tipografia | `Montserrat` (`font-sans`), `11px`, `500`, `uppercase`, `tracking-[0.08em]` | Cor `var(--muted-foreground)` (`#AAA4B8`). |
| **Contador `.intro-count`** | Tipografia & Sufixo `%` | `Space Grotesk` (`font-display`), `500`, `inline-flex items-baseline` | Número em `var(--foreground)` (`#F5F5F5`) com `ref={countRef}` isolado no `<span>` numérico (`0%` → `100%`); sufixo `%` em `0.42em`, `ml-[0.04em]`, `tracking-normal` e `var(--brand-bright)` (`#793CFF`) para preservar o sufixo durante mutações de `textContent`. |
| **Contador `.intro-count`** | Escala fluida | `clamp(4.5rem, 14vw, 12.5rem)` (`72px` a `200px`) | `line-height: 0.8`, `letter-spacing: -0.05em`, `font-variant-numeric: tabular-nums` (evita tremedeira horizontal durante a troca de dígitos). |
| **Barra `.intro-bar`** | Dimensões | `height: 2px`, `width: 100%`, `bottom: 0`, `left: 0` | `transform-origin: left`, escala controlada apenas por `scaleX` (GPU compositing, zero reflow), dentro de `.intro-content`. |
| **Barra `.intro-bar`** | Cor | `var(--brand-bright)` (`#793CFF`) | Barra fixa de `2px` em roxo claro (`bg-brand-bright`) reforçando a identidade visual sem excessos de brilho/gradiente. |

---

## 5. Coreografia de Animação (GSAP Timeline & Ticker)

### Fase 1: Contagem (`0%` → `100%`) via `gsap.ticker`

- **Duração mínima (`MIN_MS`):** `1600` milissegundos (garante que o ritmo editorial seja percebido mesmo em conexões rápidas).
- **Lógica de interpolação suave (Lerp):**
  - `elapsed = performance.now() - start`
  - `target = Math.min(elapsed / MIN_MS, 1)` (caso haja assets reais monitorados no futuro, usar `Math.min(elapsed / MIN_MS, loaded)` com `MAX_MS` de segurança como `8000ms`).
  - `shown += (target - shown) * 0.12`
  - Quando `target === 1 && shown > 0.995`, trava `shown = 1`.
- **Atualização de frame (sem causar layout shift):**
  - Atualiza texto: `countEl.textContent = String(Math.round(shown * 100))` (`countRef` aponta apenas para o `<span>` numérico, preservando o sufixo `%` irmão)
  - Atualiza barra: `gsap.set(barEl, { scaleX: shown })`

### Fase 2: Saída (Cortina Dividida em Duas Metades) + Hand-off para a Hero

Assim que `shown === 1`:
1. Remove o callback do `gsap.ticker` e define `gsap.set(introEl, { pointerEvents: "none" })`.
2. Executa a timeline de saída:
   ```ts
   const exitTl = gsap.timeline({
     onComplete: () => {
       unlockScrollEvents();
       start();
       ScrollTrigger.refresh();
       setIsVisible(false);
       onCompleteRef.current?.();
     },
   });

   exitTl
     .to(
       leftEl,
       {
         yPercent: -100,
         duration: 1.25,
         ease: "power4.inOut",
       },
       0,
     )
     .add(() => {
       onExitStartRef.current?.();
     }, 0.2)
     .to(
       rightEl,
       {
         yPercent: -100,
         duration: 1.25,
         ease: "power4.inOut",
       },
       0.22,
     )
     .to(
       contentEl,
       {
         y: -28,
         autoAlpha: 0,
         duration: 0.48,
         ease: "power2.inOut",
       },
       0.42,
     );
   ```

| Marco (`t`) | Alvo | Animação / Evento | Duração & Easing | Propósito |
| --- | --- | --- | --- | --- |
| `0.00s` | `.intro-curtain-left` | `yPercent: -100` | `1.25s`, `power4.inOut` | Primeira metade (esquerda) inicia a abertura imediatamente revelando o lado esquerdo da Hero enquanto `.intro-content` permanece flutuando em `z-10`. |
| `0.20s` | `onExitStart()` | Callback de hand-off | — | Dispara `heroIn` antecipadamente logo após a cortina esquerda iniciar o deslize, sincronizando a entrada da Hero por trás das cortinas. |
| `0.22s` | `.intro-curtain-right` | `yPercent: -100` | `1.25s`, `power4.inOut` | Segunda metade (direita) inicia com stagger de `0.22s` após a esquerda. |
| `0.42s` | `.intro-content` | `y: -28`, `autoAlpha: 0` | `0.48s`, `power2.inOut` | Eleva e desvanece contador, labels e barra flutuando em `z-10` após as cortinas já terem começado a revelar a Hero, evitando tela preta vazia. |
| `1.47s` | `exitTl.onComplete` | Desbloqueio e unmount | — | Libera listeners, chama `start()` no Lenis, executa `ScrollTrigger.refresh()` e desmonta `#intro`. |

- **Por que manter `.intro-content` flutuando em `z-10` e só desvanecer em `0.42s`?** Como `.intro-content` está posicionado acima das cortinas (`z-10` sobre `z-0`) dentro de `#intro` com `bg-transparent`, as duas metades da cortina deslizam por trás do HUD sem cortá-lo ao meio e sem criar uma pausa de fundo preto vazio antes da abertura. O lift/fade (`y: -28`, `autoAlpha: 0`, `0.48s`, `power2.inOut`) acontece quando a Hero já está sendo revelada.
- **Por que `onExitStart()` em `~0.20s`?** Em `0.20s`, a cortina esquerda já está em deslize há `0.20s` e a direita inicia logo em `0.22s`, preservando a detecção precoce de LCP enquanto `heroIn` começa o stagger das letras (`Mateus Araujo`) por trás da abertura suave.
- **Por que sem `overflow: hidden`?** Como `html` já reserva `scrollbar-gutter: stable` com scrollbar escura Editorial-Tech e o bloqueio é feito por `lenis.stop()` + `wheel`/`touchmove`/`keydown`, a barra nunca some nem reaparece ao fim do Preloader, mantendo `0px` de deslocamento horizontal no Windows.

---

## 6. Acessibilidade e Movimento Reduzido (`prefers-reduced-motion`)

Obrigatório conforme [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md) e [CONTRIBUTING.md](../docs/CONTRIBUTING.md):

- Dentro de `useGSAP`, verificar via `gsap.matchMedia()`:
  ```ts
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    start();
    onExitStart?.();
    onComplete?.();
  });
  ```
- Quando `prefers-reduced-motion: reduce` estiver ativo:
  - **Não exibe contagem** nem deslize de cortina.
  - Desmonta `#intro` imediatamente (`display: none` / retorna `null`).
  - A Home é exibida instantaneamente em seu estado final completo (`heroIn.progress(1)`), com scroll nativo normal (sem Lenis).

---

## 7. Decisões Fechadas (Preloader)

- ✅ **Frequência de exibição:** Roda em **todo carregamento/reload** da página inicial (sem bloqueio por `sessionStorage`).
- ✅ **Cor da barra inferior (`.intro-bar`):** `bg-brand-bright` (`#793CFF`).
- ✅ **Critério de conclusão:** Duração mínima coreografada (`MIN_MS = 1600ms`), respeitando `prefers-reduced-motion`.
- **Status:** Todas as decisões concluídas — pronto para implementação.
