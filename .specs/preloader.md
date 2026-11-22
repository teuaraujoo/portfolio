# Especificação Técnica — Preloader (`#intro`)

## 1. Visão Geral e Objetivo

O Preloader atua como a primeira camada visual da aplicação ao carregar a página inicial (`/`). Inspirado na referência `victordeveloper.com` e adaptado ao Design System **Editorial-Tech** do portfólio de **Mateus Araujo**, ele estabelece ritmo, autoridade tipográfica e transição fluida para a dobra principal (`Hero`).

Durante sua execução:
- Ocupa `100svh` (`fixed inset-0`) acima de toda a interface (`z-[10000]`).
- Mantém o **Lenis** pausado e bloqueia eventos de rolagem (`wheel`, `touchmove` e teclas de scroll) **sem aplicar `overflow: hidden` no `<html>`**, combinando com `scrollbar-gutter: stable` e scrollbar discreta em `globals.css` para garantir **0px de deslocamento lateral** e evitar que a barra de rolagem suma e reapareça no Windows.
- Ao completar `100`, o container sobe como uma cortina (`yPercent: -100`, curva `expo.inOut`) enquanto dispara a timeline de entrada da Home (`heroIn`) de forma sobreposta, revelando a página sem cortes secos.

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
  - Quando a animação de cortina iniciar (`"<0.35"`), o Preloader aciona o callback `onExitStart()` (ou contexto/evento compartilhado) para iniciar a timeline `heroIn`.
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
  /** Disparado ~0.35s após o início da subida da cortina para sincronizar a entrada da Hero */
  onExitStart?: () => void;
  /** Disparado após a cortina sair completamente da viewport e liberar o scroll */
  onComplete?: () => void;
}
```

---

## 3. Estrutura DOM e Hierarquia

Estrutura enxuta com 3 blocos principais dentro de um overlay fixo acessível (`aria-hidden="true"` enquanto decorativo/transicional, garantindo que leitores de tela não fiquem presos no overlay):

```tsx
<div
  ref={scope}
  id="intro"
  aria-hidden="true"
  className="fixed inset-0 z-[10000] flex h-svh flex-col justify-between bg-background p-[clamp(20px,4vw,56px)] text-foreground select-none"
>
  {/* Bloco Superior */}
  <div className="intro-top flex items-end justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
    <span>{content.author}</span>
    <span>{content.yearLabel}</span>
  </div>

  {/* Bloco Inferior */}
  <div className="intro-bottom flex items-end justify-between">
    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {content.loadingLabel}
    </span>
    <span
      ref={countRef}
      className="intro-count font-display text-[clamp(4.5rem,14vw,12.5rem)] font-medium leading-[0.8] tracking-[-0.05em] text-foreground tabular-nums"
    >
      0
    </span>
  </div>

  {/* Barra de Progresso Inferior */}
  <div
    ref={barRef}
    className="intro-bar absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-brand-bright"
  />
</div>
```

---

## 4. Dimensionamento, Tipografia e Tokens de Estilo

Todos os valores respeitam os tokens semânticos definidos em [src/app/globals.css](../src/app/globals.css) e as regras do [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md):

| Elemento | Propriedade | Valor / Token | Observações |
| --- | --- | --- | --- |
| **Container `#intro`** | Altura & Posição | `fixed inset-0 h-svh z-[10000]` | Cobre toda a viewport inicial em desktop e mobile (`svh` evita saltos da barra de endereço mobile). |
| **Espaçamento (`--gutter`)** | Padding | `clamp(20px, 4vw, 56px)` | Alinhado com a margem lateral da Home para continuidade visual. |
| **Fundo `#intro`** | Background | `var(--background)` (`#0D0D0D`) | Mesma superfície da Home para transição orgânica. |
| **Labels `.intro-top` e `Carregando`** | Tipografia | `Montserrat` (`font-sans`), `11px`, `500`, `uppercase`, `tracking-[0.08em]` | Cor `var(--muted-foreground)` (`#AAA4B8`). |
| **Contador `.intro-count`** | Tipografia | `Space Grotesk` (`font-display`), `500` | Cor `var(--foreground)` (`#F5F5F5`). |
| **Contador `.intro-count`** | Escala fluida | `clamp(4.5rem, 14vw, 12.5rem)` (`72px` a `200px`) | `line-height: 0.8`, `letter-spacing: -0.05em`, `font-variant-numeric: tabular-nums` (evita tremedeira horizontal durante a troca de dígitos). |
| **Barra `.intro-bar`** | Dimensões | `height: 2px`, `width: 100%`, `bottom: 0`, `left: 0` | `transform-origin: left`, escala controlada apenas por `scaleX` (GPU compositing, zero reflow). |
| **Barra `.intro-bar`** | Cor | `var(--brand-bright)` (`#793CFF`) | Barra fixa de `2px` em roxo claro (`bg-brand-bright`) reforçando a identidade visual sem excessos de brilho/gradiente. |

---

## 5. Coreografia de Animação (GSAP Timeline & Ticker)

### Fase 1: Contagem (`0` → `100`) via `gsap.ticker`

- **Duração mínima (`MIN_MS`):** `1600` milissegundos (garante que o ritmo editorial seja percebido mesmo em conexões rápidas).
- **Lógica de interpolação suave (Lerp):**
  - `elapsed = performance.now() - start`
  - `target = Math.min(elapsed / MIN_MS, 1)` (caso haja assets reais monitorados no futuro, usar `Math.min(elapsed / MIN_MS, loaded)` com `MAX_MS` de segurança como `8000ms`).
  - `shown += (target - shown) * 0.12`
  - Quando `target === 1 && shown > 0.995`, trava `shown = 1`.
- **Atualização de frame (sem causar layout shift):**
  - Atualiza texto: `countEl.textContent = String(Math.round(shown * 100))`
  - Atualiza barra: `gsap.set(barEl, { scaleX: shown })`

### Fase 2: Saída (Cortina) + Hand-off para a Hero

Assim que `shown === 1`:
1. Remove o callback do `gsap.ticker`.
2. Executa a timeline de saída:
   ```ts
   const exitTl = gsap.timeline({
     onComplete: () => {
       unlockScrollEvents();
       start();
       ScrollTrigger.refresh();
       setIsVisible(false);
       onComplete?.();
     },
   });

   exitTl
     .to(scope.current, {
       yPercent: -100,
       duration: 1.1,
       ease: "expo.inOut",
     }, 0.15)
     .add(() => {
       onExitStart?.();
     }, "<0.35");
   ```
- **Por que `<0.35`?** A cortina `#intro` começa a subir em `t = 0.15s`; após `0.35s` de subida (`t = 0.50s`), a Hero por baixo já começa a aparecer e inicia o stagger das letras (`Mateus Araujo`), evitando que a animação da Hero termine antes da cortina sair da frente ou comece tarde demais.
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
