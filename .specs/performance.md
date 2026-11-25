# Especificação Técnica — Performance, Core Web Vitals e Segurança HTTP

## 1. Visão Geral e Diagnóstico do Estado Atual

Esta especificação define o plano de otimização de **Performance**, **Core Web Vitals (CWV)** e **Trust & Safety HTTP** para o portfólio de **Mateus Araujo** (`https://www.teuaraujo.dev/`), tendo como linha de base o relatório oficial do **PageSpeed Insights** salvo em [docs/PageSpeed Insights.html](../docs/PageSpeed%20Insights.html) (capturado em `24/11/2026 20:43 GMT-3`) e a inspeção direta dos módulos em `src/`.

### Baseline Observado (PageSpeed Insights — `24/11/2026 20:43 GMT-3`)

| Categoria / Métrica | Mobile (Observado) | Desktop (Observado) | Diagnóstico Principal |
| --- | --- | --- | --- |
| **Performance** | **`33`** | **`DEADLINE_EXCEEDED`** (timeout) | Saturação de GPU/CPU pelo shader WebGL durante e após o Preloader + atraso de renderização do LCP. |
| **Accessibility** | **`100`** | — | Sem regressões; manter integralmente durante as refatorações visuais. |
| **Best Practices** | **`100`** | — | Pontuação máxima atingida; há 4 itens informativos de *Trust & Safety* (CSP, COOP, HSTS, Trusted Types). |
| **SEO** | **`100`** | — | Metadados, JSON-LD e rotas de rastreamento já validados. |
| **Agentic Browsing** | **`3/3`** | — | Aprovado, porém com aviso: *"The page loaded too slowly to finish within the time limit. Results may be incomplete."* |
| **FCP (First Contentful Paint)** | **`2.4 s`** | — | Impactado por compilação/renderização WebGL síncrona no mount e CSS inicial (`19.3 KiB`). |
| **LCP (Largest Contentful Paint)** | **`7.7 s`** (`p.hero-bio`) | — | TTFB de **`20 ms`**, porém **`12,010 ms`** de *Element render delay* causado por Preloader (`1600 ms`) + `autoAlpha: 0` (`visibility: hidden`) + contenção da thread principal. |
| **TBT (Total Blocking Time)** | **`24,330 ms`** | — | Trabalho na main thread de **`39.8 s`** (`Other`: **`38,778 ms`**, 20 *long tasks* de `213–625 ms`). |
| **CLS (Cumulative Layout Shift)** | **`0.003`** | — | Soma residual do container de gradiente da `#hero` (`0.002`) e do contador `.intro-count` (`0.001–0.002`). |
| **Speed Index** | **`21.9 s`** | — | Viewport inicial bloqueada pelo `#intro` somado à saturação de frame do `SilkShaderBackground`. |

### Diagnósticos de Rede, Renderização e Segurança Verificados

| Auditoria / Achado | Valor Observado | Origem Verificada no Repositório |
| --- | --- | --- |
| **Peso total transferido** | **`1,194 KiB`** | — |
| **Payload externo `jsDelivr`** | **`791.7 KiB`** (`devicon.ttf` `774.1 KiB` + `devicon.min.css` `17.6 KiB`; `16.2 KiB` CSS não utilizado; TTL `7d`; `100 ms` `font-display`) | [src/components/portfolio/devicon-stylesheet.tsx](../src/components/portfolio/devicon-stylesheet.tsx), [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx) e [src/app/layout.tsx](../src/app/layout.tsx) (linhas 29 e 35) |
| **CSS 1st-party render-blocking** | **`19.3 KiB`** (economia estimada `400 ms`) | CSS compilado via [src/app/globals.css](../src/app/globals.css) no `<head>` |
| **JavaScript não utilizado** | **`80.5 KiB`** | Bundles de diálogos (`ProjectDialog`, `SobreDialog`) e scripts de interação carregados eagerly no bundle inicial |
| **JavaScript legado (polyfills)** | **`13.9 KiB`** (`Array.prototype.at/flat/flatMap`, `Object.fromEntries/hasOwn`, `String.prototype.trimStart/trimEnd`) | Ausência de alvo `browserslist` moderno em [package.json](../package.json) |
| **Forced Reflow** | **`83 ms`** (`14dk-0yvc969p.js` + `1uj82nj8rh-rc.js`) | Leitura/escrita intercalada de layout (`KilnWordmark`, `Header.updateIndicator`) e múltiplos `ScrollTrigger` sem batch único pós-Preloader |
| **9 animações não-compositor** | `box-shadow`, `visibility`, `height` | `hero-pulse` em [src/app/globals.css](../src/app/globals.css) (linhas 126–136); `transition-all` + `opacity`/`autoAlpha` em [src/components/ui/interactive-hover-links.tsx](../src/components/ui/interactive-hover-links.tsx) (linha 199) e [src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx) (linha 662); `transition: height` em [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx) (linhas 1890–1895) |
| **Trust & Safety (Informativo)** | Sem `CSP` (`csp-xss`), sem `COOP` (`origin-isolation`), `HSTS` sem `includeSubDomains`/`preload`, sem `Trusted Types` | `headers()` em [next.config.ts](../next.config.ts) (linhas 9–33) |

---

## 2. Arquitetura da Otimização (Causas Raiz e Princípios)

A análise conjunta do relatório e do código-fonte comprova que o gargalo extremo de `TBT` (`24,330 ms`), `Speed Index` (`21.9 s`) e `DEADLINE_EXCEEDED` no Desktop **não** decorre de HTML ou servidor (o `TTFB` é de apenas `20 ms`), mas de três fatores no cliente atuando em cascata:

1. **Contenção de GPU/CPU por WebGL em Software Rasterizer:** [src/components/ui/silk-shader-background.tsx](../src/components/ui/silk-shader-background.tsx) compila shaders sincronamente no mount, renderiza em `dpr` até `2.0` (até 4× pixels por fragmento) e dispara `requestAnimationFrame` sem limite de FPS desde o segundo `0` — mesmo enquanto o Preloader `#intro` cobre `100svh` e mesmo em ambientes headless/CI com rasterização em CPU (`SwiftShader`/`llvmpipe`). Isso explica os `38,778 ms` na categoria `Other` da main thread no Mobile e o timeout completo no Desktop.
2. **Atraso Artificial + `visibility: hidden` no Elemento LCP (`p.hero-bio`):** [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx) segura a viewport por `MIN_MS = 1600 ms`, chama `onExitStart` apenas em `0.30s` da timeline de saída, e [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) inicializa `[data-hero-fade]` (incluindo `p.hero-bio`) com `autoAlpha: 0` (`visibility: hidden`), adiando a detecção e pintura do LCP para além da abertura da cortina (`12,010 ms` de *Element render delay*).
3. **Payload Externo Evitável (`devicon@latest`):** [src/components/portfolio/devicon-stylesheet.tsx](../src/components/portfolio/devicon-stylesheet.tsx) injeta uma folha de estilos de `17.6 KiB` que aciona o download da fonte `devicon.ttf` de `774.1 KiB` para exibir apenas 15 ícones estáticos em [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx), respondendo por **`66.3%`** (`791.7 KiB` de `1,194 KiB`) de todo o peso da página.

> [!IMPORTANT]
> Esta especificação define exclusivamente o plano técnico de engenharia. Nenhum arquivo de `src/` ou `next.config.ts` deve ser alterado fora da execução planejada das fases abaixo, preservando o visual **Editorial-Tech** ([DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)) e o comportamento de acessibilidade (`prefers-reduced-motion`).

---

## 3. Fases de Implementação Priorizadas

### Fase 1 (Crítica — P0): Desbloqueio de GPU/CPU no `SilkShaderBackground` (`TBT` & `DEADLINE_EXCEEDED`)

**Arquivos alvo:** [src/components/ui/silk-shader-background.tsx](../src/components/ui/silk-shader-background.tsx), [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx), [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx).

#### 1.1 Controle explícito via prop `active?: boolean`
- Adicionar `active?: boolean` (default `true` para compatibilidade isolada, recebendo `active={active}` em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) linha 156 a partir de `heroActive` em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx)) em `SilkShaderBackgroundProps`.
- Enquanto `active === false` (durante a cobertura do Preloader `#intro`):
  - Não executar o loop contínuo de `requestAnimationFrame`.
  - Caso o contexto já esteja inicializado, desenhar apenas o frame estático inicial `renderFrame(0)`.
- Quando `active` transicionar para `true` (na saída do Preloader), liberar `syncLoop()` respeitando `isInView`, `!document.hidden`, `!prefersReducedMotion` e o critério de hardware abaixo.

#### 1.2 Inicialização adiada (`requestIdleCallback` com fallback `setTimeout`)
- Adiar a criação do contexto WebGL, compilação de `VERTEX_SHADER_SOURCE` / `FRAGMENT_SHADER_SOURCE`, link do programa e upload de buffers (atualmente síncronos no `useEffect`, linhas 323–412) para dentro de `requestIdleCallback(..., { timeout: 300 })` (com fallback `window.setTimeout(..., 120)` quando `requestIdleCallback` não estiver disponível).
- Garantir cancelamento limpo (`cancelIdleCallback` / `clearTimeout`) no cleanup do `useEffect` para evitar leaks em unmount ou StrictMode.
- Resultado: o FCP (`2.4 s`) não disputa main thread com `compileShader` / `linkProgram` na hidratação inicial.

#### 1.3 Redução de resolução interna (`resolutionScale`) e teto de DPR
- Atualmente `syncSize()` ([src/components/ui/silk-shader-background.tsx](../src/components/ui/silk-shader-background.tsx) linhas 497–506) usa `dpr = Math.min(window.devicePixelRatio || 1, 2)`, gerando até 4× mais fragmentos em telas Retina/HiDPI para um gradiente de seda orgânico suave.
- Passar a calcular o buffer interno com escala reduzida:
  - `effectiveDpr = Math.min(window.devicePixelRatio || 1, 1.0)`
  - `resolutionScale = 0.6` (faixa alvo `0.55–0.65`)
  - `targetWidth = Math.max(1, Math.round(cssWidth * effectiveDpr * resolutionScale))`
  - `targetHeight = Math.max(1, Math.round(cssHeight * effectiveDpr * resolutionScale))`
- O CSS `size-full` já aplicado no `<canvas>` realiza o upscaling bilinear nativo pela GPU sem custo de fragment shader, reduzindo em **~4× a ~9×** a quantidade de pixels sombreados por frame sem perda perceptual na suavidade das faixas de seda.

#### 1.4 Limite de taxa de quadros (`~30 fps`)
- Substituir o disparo irrestrito de `requestAnimationFrame(tick)` (60–120 Hz) por throttle temporal explícito:
  - `const TARGET_FPS = 30;`
  - `const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;` (`~33.33 ms`)
  - Em `tick(now)`: acumular `lastRenderTime`; se `now - lastRenderTime < FRAME_INTERVAL_MS`, reagendar `requestAnimationFrame(tick)` sem invocar `gl.drawArrays(...)` nem atualizar uniformes, preservando o passo de tempo contínuo (`elapsedSeconds`) quando o frame for desenhado.

#### 1.5 Detecção de rasterizador por software / CPU e dispositivos restritos
- Antes de iniciar o loop animado contínuo, avaliar se o ambiente está rodando renderização em CPU ou sob restrição severa de recursos:
  1. Consultar `gl.getExtension("WEBGL_debug_renderer_info")` (`UNMASKED_RENDERER_WEBGL` e `UNMASKED_VENDOR_WEBGL`) e testar contra:
     ```ts
     const SOFTWARE_RENDERER_RE =
       /SwiftShader|llvmpipe|Software Rasterizer|Microsoft Basic Render/i;
     ```
  2. Verificar `navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2` ou `(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true`.
- Quando qualquer uma dessas condições for verdadeira:
  - Renderizar **apenas um único frame estático nítido** (`renderFrame(0)`) após `syncSize()` e manter o loop `rAF` permanentemente desabilitado (`isStaticFallback = true`).
  - Isso elimina por completo o travamento de CPU em ambientes headless/Lighthouse (`SwiftShader`), resolvendo diretamente o `DEADLINE_EXCEEDED` no Desktop e os `38,778 ms` de trabalho `Other` no Mobile.

---

### Fase 2 (Crítica — P0): Redução do `Element Render Delay` do LCP (`Preloader` + `Hero`)

**Arquivos alvo:** [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx), [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx).

#### 2.1 Ajuste de ritmo do Preloader (`MIN_MS = 800`)
- Em [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx) (linhas 14–16):
  - Reduzir `MIN_MS` de `1600` para **`800`** ms (economia direta de `800 ms` antes da abertura das cortinas, preservando a leitura editorial `0% → 100%`).
  - Ajustar `LERP_FACTOR` (de `0.12` para faixa **`0.22–0.26`** com `COMPLETE_SNAP_THRESHOLD = 0.992`) para que a interpolação acompanhe o intervalo de `800 ms` com fluidez sem travar nos `98–99%`.
- Na timeline de saída `exitTl` (linhas 154–185):
  - Iniciar `leftEl` (`yPercent: -100`, `duration: 1.25`, `ease: "power4.inOut"`) em **`0.00s`**.
  - Iniciar `onExitStartRef.current?.()` em **`0.20s`** (antecipando em `100 ms` o disparo de `heroActive = true` em relação aos `0.30s` do baseline).
  - Iniciar `rightEl` (`yPercent: -100`, `duration: 1.25`, `ease: "power4.inOut"`) em **`0.22s`** (`0.22s` de stagger).
  - Iniciar `contentEl` (`y: -28`, `autoAlpha: 0`, `duration: 0.48`, `ease: "power2.inOut"`) em **`0.42s`**.

#### 2.2 Otimização da revelação da Hero sem bloqueio de LCP por `visibility: hidden`
- Em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) (linhas 74–85):
  - Atualmente `.from("[data-hero-fade]", { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 0.5)` aplica `visibility: hidden` (`autoAlpha: 0`) em `p.hero-bio` (o elemento LCP identificado pelo PageSpeed Insights) e só começa a revelá-lo `0.5s` após a timeline iniciar (`~0.8s` após o fim da contagem).
  - Alterar a coreografia da timeline `heroIn`:
    - Manter `.hero-name .char` em `0.05s` com `duration: 1.0`, `stagger: 0.03`.
    - Antecipar `[data-hero-fade]` para **`0.15s`** com `duration: 0.75`, `stagger: 0.05`.
    - Substituir `autoAlpha: 0` por **`opacity: 0`** (compositor-only) com `clearProps: "transform"` ao final — ou manter `p.hero-bio` com `opacity: 0.01` inicial animando para `opacity: 1` e `y: 12 → 0` — evitando `visibility: hidden` que impede o navegador de considerar o texto pintado/visível para o cálculo precoce de LCP.

> [!NOTE]
> Ao trocar `autoAlpha: 0` por `opacity` em `[data-hero-fade]`, nenhum elemento dentro da área de texto da Hero possui foco interativo oculto antes da entrada, exceto o link `scrollHint` em `.hero-foot`, que já fica visível ao término da curta janela de `0.75s`. Caso seja necessário evitar foco durante o preloader, o próprio `#intro` (`z-[10000]`) bloqueia interação até o unmount.

#### 2.3 Estabilização de `CLS` para `0.000`
- **Contador `.intro-count` (`0.001–0.002` no baseline):** em [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx) (linha 243), envolver ou estilizar `<span ref={countRef}>0</span>` com largura reservada fixa:
  ```tsx
  <span ref={countRef} className="inline-block min-w-[3ch] text-right tabular-nums">
    0
  </span>
  ```
  Isso impede qualquer mudança horizontal de caixa entre `1`, `2` e `3` dígitos (`0` → `10` → `100`) mantendo o sufixo `%` imóvel.
- **Container de gradiente da `#hero` (`0.002` no baseline):** em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) (linhas 152–161), garantir dimensões explicitamente contidas (`contain: layout paint` no wrapper `pointer-events-none absolute inset-0 z-0 overflow-hidden`) e evitar qualquer recálculo de altura do `<section id="hero">` entre SSR e hidratação (`min-h-svh lg:h-svh` constante).

---

### Fase 3 (Alta — P1): Eliminação do Payload Devicon (`-792 KiB`, `-66%` do peso da página)

**Arquivos alvo:** [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx), [src/components/portfolio/devicon-stylesheet.tsx](../src/components/portfolio/devicon-stylesheet.tsx), [src/app/layout.tsx](../src/app/layout.tsx).

#### 3.1 Substituição das 15 classes de fonte por SVGs locais inline
- Em [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx), substituir o mapeamento `DEVICON_CLASS_MAP` e a tag `<i className={...} />` por componentes `<svg aria-hidden="true" viewBox="..." ...>` locais/inline (ou mapa de paths/elementos JSX) correspondentes às **15 chaves** de `SkillIconKey`:
  1. `typescript`
  2. `javascript`
  3. `react`
  4. `nextjs`
  5. `tailwind`
  6. `nodejs`
  7. `nestjs`
  8. `express`
  9. `prisma`
  10. `typeorm`
  11. `postgresql`
  12. `docker`
  13. `playwright`
  14. `github`
  15. `actions`
- Manter exatamente a mesma assinatura pública (`SkillIconProps`, `SkillIconKey`, `SkillIcon`) e as dimensões/contraste sobre a superfície `#141318` (preservando `text-foreground` para ícones monocromáticos `nextjs`, `express`, `prisma`, `github`, `#F26B3A` para `typeorm` e cores oficiais da marca nos demais).

#### 3.2 Remoção integral de `DeviconStylesheet` e `dns-prefetch`
- Remover a importação e renderização de `<DeviconStylesheet />` em [src/app/layout.tsx](../src/app/layout.tsx) (linhas 4 e 35).
- Remover `<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />` do `<head>` de [src/app/layout.tsx](../src/app/layout.tsx) (linhas 28–30).
- Excluir [src/components/portfolio/devicon-stylesheet.tsx](../src/components/portfolio/devicon-stylesheet.tsx) após confirmar zero referências no repositório.
- **Impacto direto:**
  - `-774.1 KiB` (`devicon.ttf`) + `-17.6 KiB` (`devicon.min.css`) = **`-791.7 KiB`** (`-66%` do peso total transferido).
  - Zero requisições de terceiros para `cdn.jsdelivr.net`.
  - Eliminação total dos alertas de CSS não utilizado (`16.2 KiB`), TTL curto (`7d`) e `font-display` (`100 ms`).

---

### Fase 4 (Média — P2): Animações 100% Compositor, Reflow Zero & JavaScript Moderno

**Arquivos alvo:** [src/app/globals.css](../src/app/globals.css), [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx), [src/components/ui/interactive-hover-links.tsx](../src/components/ui/interactive-hover-links.tsx), [src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx), [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx), [src/components/ui/kiln-wordmark.tsx](../src/components/ui/kiln-wordmark.tsx), [src/components/portfolio/header.tsx](../src/components/portfolio/header.tsx), [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx), [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx), [package.json](../package.json).

#### 4.1 Correção das 9 animações não-compositor (`non-composited-animations`)

| Ocorrência Atual | Propriedade Não-Compositor | Solução 100% GPU Compositor |
| --- | --- | --- |
| `@keyframes hero-pulse` ([src/app/globals.css](../src/app/globals.css) linhas 126–136; dot em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) linha 193) | `box-shadow` | Transformar o indicador em container `relative inline-flex size-2` com um `<span>` concêntrico `absolute inset-0 rounded-full bg-brand-bright/55 animate-hero-pulse` animando exclusivamente **`transform: scale(1 → 2.6)`** + **`opacity: 0.75 → 0`**. |
| `ArrowUpRight` em [src/components/ui/interactive-hover-links.tsx](../src/components/ui/interactive-hover-links.tsx) (linha 199) | `transition-all` (inclui `visibility` sob `autoAlpha`) | Substituir `transition-all` por **`transition-[transform,opacity]`** (`duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`) e evitar `autoAlpha` nas linhas `.project-row` (usar `opacity` + `transform`). |
| `.contact-social-item a` em [src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx) (linha 662) | `transition-all` (conflita com `autoAlpha` no reveal GSAP gerando animação de `visibility`) | Substituir `transition-all` por **`transition-[transform,border-color,color]`** (e no reveal GSAP de `.contact-social-item` usar `opacity` + `y` em vez de `autoAlpha`). |
| Wrapper `#stage` em [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx) (linhas 1890–1895) | `transition: "height 320ms cubic-bezier(0.16, 1, 0.3, 1)"` ativa já no mount | Habilitar a transição de `height` **somente** durante alternância explícita do usuário entre os modos `2D` / `3D` (ex.: flag `isModeSwitching`), mantendo `transition: undefined` no mount e em redimensionamentos iniciais. |

#### 4.2 Redução do *Forced Reflow* (`83 ms` → próximo de `0 ms`)
- **`KilnWordmark` ([src/components/ui/kiln-wordmark.tsx](../src/components/ui/kiln-wordmark.tsx) linhas 194–234):**
  - Em `fitAndLockSlots()`, separar estritamente as fases de escrita e leitura em lotes (*read-then-write*): limpar estilos em um passe, aguardar/realizar todas as leituras (`getBoundingClientRect()`) em um único bloco antes de gravar `slot.style.width` e `applyCharVisual(...)`, e executar recálculos pós-`ResizeObserver` via `requestAnimationFrame` único.
- **`Header.updateIndicator()` ([src/components/portfolio/header.tsx](../src/components/portfolio/header.tsx) linha 62):**
  - Remover o forced reflow síncrono `void indicator.offsetWidth;` na primeira posição, substituindo por reativação da transição em `requestAnimationFrame` (mesmo padrão já usado em `dockEl` nas linhas 79–85).
- **Batched `ScrollTrigger.refresh()`:**
  - Garantir que todas as seções deleguem a recalibração inicial de `ScrollTrigger` para uma única chamada consolidada no `onComplete` de [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx) (linha 148), evitando refreshes redundantes durante a abertura.

#### 4.3 Eliminação do JS Legado (`13.9 KiB`) e Redução de JS Não Utilizado (`80.5 KiB`)
- **Modern `browserslist` em [package.json](../package.json):**
  - Adicionar alvo compatível com Baseline ES2022+ (suporte nativo a `Array.prototype.at/flat/flatMap`, `Object.fromEntries/hasOwn`, `String.prototype.trimStart/trimEnd`):
    ```json
    "browserslist": [
      "last 2 Chrome versions",
      "last 2 Firefox versions",
      "last 2 Safari versions",
      "last 2 Edge versions",
      "not dead"
    ]
    ```
  - Isso instrui SWC/Next.js a suprimir os *polyfills* de `13.9 KiB` detectados na auditoria *Legacy JavaScript*.
- **Code-splitting de diálogos fora da dobra com `next/dynamic`:**
  - Em [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx) (linha 15 e 351) e [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx) (linha 22 e 473), carregar `SobreDialog` e `ProjectDialog` sob demanda via `dynamic(..., { ssr: false })` e montar condicionalmente somente após a abertura (`modalOpen` / `selectedProject !== null`), reduzindo o JavaScript parseado/executado na carga inicial (`80.5 KiB` reportados) sem afetar o HTML SSR textual das seções.

---

### Fase 5 (Polimento — P3): Segurança Best Practices (`Trust & Safety`) & Headers HTTP

**Arquivo alvo:** [next.config.ts](../next.config.ts).

Reforçar a configuração `async headers()` aplicada em `source: "/(.*)"` mantendo compatibilidade com Next.js App Router, `next/font`, WebGL e JSON-LD inline:

| Header | Valor Alvo | Lacuna Resolvida (PageSpeed *Trust & Safety*) |
| --- | --- | --- |
| **`Strict-Transport-Security`** | `max-age=63072000; includeSubDomains; preload` | Garante HSTS com validade de 2 anos, cobertura de subdomínios e elegibilidade ao preload list. |
| **`Cross-Origin-Opener-Policy`** | `same-origin` | Ativa isolamento de origem (*Origin Isolation*) contra ataques cross-origin (`Spectre` / `window.opener`). |
| **`Content-Security-Policy`** | Ver diretiva completa abaixo | Mitiga XSS (`csp-xss`) sem quebrar scripts de hidratação e JSON-LD do Next.js. |
| **Headers já presentes** | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Preservados integralmente. |

#### Diretiva `Content-Security-Policy` recomendada (sem dependências CDN externas após a Fase 3)

```text
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

> [!NOTE]
> **Por que `'unsafe-inline'` em `script-src` inicialmente e nota sobre Trusted Types:** o App Router do Next.js injeta scripts inline de hidratação (`self.__next_f.push(...)`) e o portfólio injeta JSON-LD inline (`<script type="application/ld+json">`) em páginas estáticas/cacheadas com `cacheComponents: true`. O uso de `nonce` estrito (`'strict-dynamic'`) e `require-trusted-types-for 'script'` exige geração dinâmica de `nonce` por requisição em `proxy.ts` / Middleware, o que desabilitaria o cache estático/PPR da home. Portanto, adota-se a CSP balanceada acima nesta etapa; caso política estrita de `CSP` + `Trusted Types` passe a ser mandatória no futuro, migrar via `nonce` por requisição em Middleware dedicado (com suporte explícito ao runtime GSAP/Next.js).
>
> **Diferenciação Dev vs. Produção em `next.config.ts`:** quando `NODE_ENV !== "production"` (`next dev`), `next.config.ts` acrescenta condicionalmente `'unsafe-eval'` em `script-src` e `ws: wss:` em `connect-src` para suportar reconstrução de callstack do React 19 e HMR/Turbopack, além de omitir `Strict-Transport-Security` e `upgrade-insecure-requests` em `http://localhost`. Em produção (`next build` / `next start`), `'unsafe-eval'` e `ws: wss:` permanecem removidos e `Strict-Transport-Security` + `upgrade-insecure-requests` são estritamente aplicados.

---

## 4. Critérios de Aceitação & Metas Alvo (Pós-Implementação)

### 4.1 Validação Local (`npm run check` & `npm run build`)
- [ ] `npm run check` (`eslint .` + `tsc --noEmit`) finaliza com exit code `0`.
- [ ] `npm run build` compila todas as rotas e chunks com `cacheComponents: true` e `partialPrefetching: true` sem erros ou regressões.
- [ ] Zero requisições para `cdn.jsdelivr.net` no painel *Network* do Chrome DevTools; [src/components/portfolio/devicon-stylesheet.tsx](../src/components/portfolio/devicon-stylesheet.tsx) removido.
- [ ] Peso total transferido no carregamento inicial `< 450 KiB` (queda de `1,194 KiB` após remoção dos `791.7 KiB` do Devicon e code-splitting dos diálogos).
- [ ] Zero animações não-compositor reportadas na aba *Performance* / *Animations* do Chrome DevTools e Lighthouse.
- [ ] Em simulação de CPU throttled / software WebGL (`--use-gl=angle --use-angle=swiftshader` ou `hardwareConcurrency <= 2`), `SilkShaderBackground` renderiza `renderFrame(0)` estático sem saturar a main thread.

### 4.2 Metas no PageSpeed Insights em Produção (`https://www.teuaraujo.dev/`)

| Indicador | Baseline (`24/11/2026`) | Meta Pós-Implementação |
| --- | --- | --- |
| **Desktop (Execução)** | `DEADLINE_EXCEEDED` | **Execução completa sem timeout**; Performance **`>= 90`** |
| **Mobile Performance** | `33` | **`>= 85–90+`** |
| **Mobile TBT** | `24,330 ms` | **`< 200 ms`** |
| **Mobile LCP** | `7.7 s` (`12,010 ms` render delay) | **`< 2.5 s`** |
| **Mobile CLS** | `0.003` | **`<= 0.002`** (alvo `0.000`) |
| **Accessibility / Best Practices / SEO** | `100` / `100` / `100` | **`100`** / **`100`** / **`100`** |
| **Agentic Browsing** | `3/3` (com aviso de lentidão) | **`3/3`** sem aviso de carregamento lento |
| **Trust & Safety (HTTP Headers)** | Sem `CSP`, `COOP`, `HSTS preload` | `CSP`, `COOP: same-origin` e `HSTS` (`max-age=63072000; includeSubDomains; preload`) ativos nas respostas HTTP |
