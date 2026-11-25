# Especificação Técnica — Performance v2, Otimização de Hidratação e Core Web Vitals

## 1. Visão Geral e Evolução do Baseline (`v1` → `v2`)

Esta especificação técnica define a **Fase 2 de otimização de Performance, Acessibilidade e Core Web Vitals** para o portfólio de **Mateus Araujo** (`https://www.teuaraujo.dev/`), construída estritamente a partir dos novos relatórios do **PageSpeed Insights** salvos em [docs/PageSpeed Insights.html](../docs/PageSpeed%20Insights.html) (Mobile) e [docs/PageSpeed Insights- desktop.html](../docs/PageSpeed%20Insights-%20desktop.html) (Desktop), ambos capturados em **`24/11/2026 22:34 GMT-3`** (`Lighthouse 13.6.0`), e da inspeção direta dos módulos em `src/` e `next.config.ts`.

A primeira rodada de engenharia ([.specs/performance.md](./performance.md)) eliminou o gargalo crítico de WebGL em software rasterizer (`SwiftShader`), o payload externo `devicon@latest` (`-791.7 KiB`), o atraso artificial do LCP e todas as 9 animações não-compositor. Os novos relatórios confirmam um salto estrutural expressivo e revelam a nova fronteira de gargalos — agora concentrada em **hidratação síncrona de seções abaixo da dobra**, **forced reflows**, **Speed Index bloqueado pelo `#intro`**, **CSS/JS não crítico**, **entrega da foto de perfil** e **1 falha pontual de contraste no Desktop**.

### Comparativo Baseline v1 (`24/11 20:43 GMT-3`) → Baseline v2 (`24/11 22:34 GMT-3`)

| Categoria / Métrica | Mobile v1 | Mobile v2 (Atual) | Desktop v1 | Desktop v2 (Atual) | Evolução / Status |
| --- | --- | --- | --- | --- | --- |
| **Performance** | `33` | **`79`** (`+46`) | `DEADLINE_EXCEEDED` | **`66`** | Timeout eliminado; nota limitada por TBT e Speed Index |
| **Accessibility** | `100` | **`100`** | — | **`96`** | Regressão pontual no Desktop (`color-contrast` em `text-white/18`) |
| **Best Practices** | `100` | **`100`** | — | **`100`** | Pontuação máxima mantida em ambos os perfis |
| **SEO** | `100` | **`100`** | — | **`100`** | Pontuação máxima mantida em ambos os perfis |
| **Agentic Browsing** | `3/3` *(aviso de lentidão)* | **`3/3`** *(sem avisos)* | — | **`3/3`** *(sem avisos)* | Aviso de carregamento lento eliminado |
| **FCP (First Contentful Paint)** | `2.4 s` | **`1.1 s`** (`+10`) | — | **`0.3 s`** (`347 ms`, `+10`) | Excelente (peso máximo na pontuação) |
| **LCP (Largest Contentful Paint)** | `7.7 s` | **`1.1 s`** (`1,097 ms`, `+25`) | — | **`0.3 s`** (`347 ms`, `+25`) | Excelente (`TTFB 20 ms`, `Element render delay 420–590 ms`) |
| **TBT (Total Blocking Time)** | `24,330 ms` | **`650 ms`** (`+14`) | — | **`830 ms`** (`835 ms`, `+3`) | **Principal gargalo atual** (`-97.3%` vs v1, mas ainda acima de `150 ms`) |
| **Speed Index (SI)** | `21.9 s` | **`5.4 s`** (`+6`) | — | **`2.7 s`** (`2,665 ms`, `+4`) | **Segundo maior gargalo** (cobertura visual pelo `#intro`) |
| **CLS (Cumulative Layout Shift)** | `0.003` | **`0.002`** (`+25`) | — | **`0.001`** (`+25`) | Praticamente zerado; alvos residuais isolados em `#hero` |
| **Peso Total Transferido** | `1,194 KiB` | **`438 KiB`** (`-63.3%`) | — | **`435 KiB`** | Zero requisições a terceiros (`0` 3rd-party resources) |
| **Non-composited Animations** | `9` | **`0`** | — | **`0`** | Auditoria 100% aprovada |

---

## 2. Diagnóstico das Causas Raiz (Fase v2)

### 2.1 Desktop Accessibility `96` (`color-contrast`)
- **Achado verificado:** O relatório Desktop aponta falha única em `Background and foreground colors do not have a sufficient contrast ratio` nos 4 índices numéricos (`01` a `04`) dos cards em destaque na seção `#projetos`.
- **Origem exata no código:** [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx#L383-L388) renderiza `<span aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-white/18 tabular-nums">` sobre o cartão `#141318` (`bg-card`). Mesmo com `aria-hidden="true"`, o scanner Axe (`4.14.0`) avalia contraste de texto visível no DOM Desktop.
- **Cálculo de contraste:** `white/18` sobre `#141318` resulta em contraste ~`1.8:1` (abaixo do mínimo `3:1` para texto grande `text-3xl` / `30px` bold). Elevar para `text-white/45` sobre `#141318` atinge contraste superior a `4.5:1` mantendo a hierarquia discreta editorial.

### 2.2 `TBT` (`650 ms` Mobile / `830 ms` Desktop), Long Tasks e Forced Reflow
Embora o trabalho de main thread tenha caído de `39.8 s` para **`3.2 s`** no Mobile (`Other: 1,819 ms`, `Script Evaluation: 845 ms`, `Style & Layout: 337 ms`) e **`3.1 s`** no Desktop (`Other: 1,773 ms`, `Script Evaluation: 749 ms`, `Style & Layout: 400 ms`), três tarefas longas continuam bloqueando a thread principal logo após o carregamento:

| Auditoria | Mobile (Observado) | Desktop (Observado) | Chunks / Pontos Críticos |
| --- | --- | --- | --- |
| **Long Tasks** | **`888 ms`** (3 tarefas) | **`1,001 ms`** (3 tarefas) | `chunks/2l3y8_7oquw4y.js`: **`669 ms`** (Mobile, `3,060 ms`) / **`744 ms`** (Desktop, `869 ms`); `chunks/3bu7zqinyzs45.js`: **`149 ms`** / **`191 ms`**; `chunks/3mn59f30h56ue.js`: **`70 ms`** / **`66 ms`** |
| **JavaScript CPU Time** | **`3,069 ms`** | **`2,947 ms`** | `chunks/2l3y8_7oquw4y.js`: **`1,853 ms`** (Mobile) / **`1,796 ms`** (Desktop); `chunks/3bu7zqinyzs45.js`: **`617 ms`** / **`692 ms`**; `chunks/06e5ccbqrk4de.js`: **`340 ms`** |
| **Forced Reflow** | `chunks/3bu7zqinyzs45.js:2:226316` **`139 ms`** + `2l3y8_7oquw4y.js` (`87 ms` + `42 ms`) | `chunks/3bu7zqinyzs45.js:2:226316` **`196 ms`** + `2l3y8_7oquw4y.js:1:54004` **`139 ms`** + `[unattributed] 48 ms` | Leitura geométrica síncrona intercalada com mutação de estilos no boot |

**Causa raiz verificada no código:**
1. **Hidratação e registro síncrono de todas as seções abaixo da dobra:** [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx#L13-L22) importa e hidrata eagerly `Sobre`, `Projetos`, `Jornada`, `Skills`, `Contato` e `Footer`. Na montagem inicial, cada seção registra imediatamente suas timelines e instâncias `ScrollTrigger` via `useGSAP`:
   - `Sobre` ([src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx#L120-L237)): 5 triggers + animações de contagem.
   - `Projetos` ([src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx#L98-L281)): triggers de sticky stacking/escala/sombra por card + meta + archive rows.
   - `Timeline` (`Jornada`, [src/components/ui/timeline.tsx](../src/components/ui/timeline.tsx#L68-L342)): mede `track.scrollWidth` e `stage.clientWidth` em `updateHeight()`, escreve `section.style.height`, anexa `ResizeObserver` que dispara `ScrollTrigger.refresh()` imediato (linhas 132–145), além de criar timelines individuais por stop (`containerAnimation`).
   - `StackSpread` (`Skills`, [src/components/ui/stack-spread.tsx](../src/components/ui/stack-spread.tsx#L99-L347)): `masterTl` orbital + `quickTo` por card.
   - `Contato` ([src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx#L317-L396)): 4 triggers de entrada.
   - `KilnWordmark` (`Footer`, [src/components/ui/kiln-wordmark.tsx](../src/components/ui/kiln-wordmark.tsx#L185-L265)): `useLayoutEffect` executa `fitAndLockSlots()` com medições `getBoundingClientRect()` no boot para o rodapé ao final da página.
2. **Cascata síncrona de `ScrollTrigger.refresh()` no `onComplete` do Preloader:** [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx#L148) executa `ScrollTrigger.refresh()` global em cima de dezenas de triggers já montados simultaneamente, gerando o pico de `669–744 ms` e o forced reflow de `139–196 ms`.
3. **Disputa inicial do morph 3D em `ContributionSkyline`:** [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx#L1501-L1505) inicia o loop `requestAnimationFrame` (`startMorph(1)`) assim que `active` vira `true` (na saída do Preloader em `0.20s`), executando projeção 3D e `drawFrame()` por barra durante a janela crítica de abertura da Hero.

### 2.3 `Speed Index` (`5.4 s` Mobile / `2.7 s` Desktop) vs `LCP` (`1.1 s` / `0.3 s`)
- O `LCP` (`p.hero-bio`) já foi otimizado para **`1.1 s`** no Mobile (`420 ms` *Element render delay*) e **`0.3 s` (`347 ms`)** no Desktop (`590 ms` *Element render delay*), garantindo **`+25`** (pontuação máxima) nesse subcritério.
- Contudo, o Speed Index mede a progressão visual da viewport ao longo do tempo. Em [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx#L14-L185), o `#intro` cobre `100svh` com `#0D0D0D` por `MIN_MS = 800 ms` + `0.22 s` de stagger + `1.25 s` de subida das cortinas (`~2.27 s` de cobertura efetiva sobre o conteúdo real da Hero), mantendo `SI` em `5.4 s` (`+6/10` pontos no Mobile) e `2.7 s` (`+4/10` pontos no Desktop). É esse fator isolado que hoje impede que a nota de Performance ultrapasse a faixa de `88–92` mesmo após zerar o TBT.

### 2.4 CSS Render-Blocking (`20.0 KiB`) e JavaScript Não Utilizado (`~69–70 KiB`)
- **Render-blocking CSS:** dois arquivos bloqueiam a renderização no `<head>`, somando **`20.0 KiB`** com economia estimada de **`560 ms`** no Mobile e **`100 ms`** no Desktop:
  - Chunk principal (`18.1 KiB`, `160 ms` Mobile) compilado de [src/app/globals.css](../src/app/globals.css) (inclui `@import "tw-animate-css";` na linha 2 — verificado por busca em `src/` que nenhuma classe `animate-in`, `animate-out`, `fade-in`, `zoom-in` ou `slide-in-*` é utilizada).
  - Chunk secundário (`1.9 KiB`, `150 ms` Mobile).
- **Nota técnica sobre Next.js `16.4.4`:** Apesar de `inlineCss?: boolean` existir em `ExperimentalConfig` ([node_modules/next/dist/server/config-shared.d.ts](../node_modules/next/dist/server/config-shared.d.ts#L1220)), trata-se de opção *experimental* restrita a builds de produção do App Router e sujeita a efeitos colaterais em payload HTML, streaming/CSP e `cacheComponents: true`. A via padrão suportada e segura é **enxugar o CSS não crítico** (removendo `tw-animate-css` ocioso) e **dividir estilos/scripts por chunks dinâmicos**.
- **Unused JavaScript:** **`69.9 KiB`** no Mobile / **`69.1 KiB`** no Desktop sobre `180.0 KiB` transferidos em 3 chunks principais:
  - `chunks/3bu7zqinyzs45.js`: `71.5 KiB` (`25.0–25.1 KiB` não usados)
  - `chunks/3epumxf345xsq.js`: `48.0 KiB` (`22.9 KiB` não usados)
  - `chunks/2l3y8_7oquw4y.js`: `60.6 KiB` (`21.9 KiB` não usados)

### 2.5 Imagem Mobile (`-13.7 KiB`) & `CLS` Residual (`0.002` / `0.001`)
- **Mobile `image-delivery-insight`:** [src/data/sobre.ts](../src/data/sobre.ts#L74) ainda aponta para [public/foto_rosto.jpg](../public/foto_rosto.jpg) (`923,714` bytes / `~924 KB`), e [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx#L289-L295) declara `sizes="(min-width: 1024px) 400px, 92vw"`. No Mobile, o Next Image entrega `/_next/image?url=%2Ffoto_rosto.jpg&w=750&q=75` (`20.0 KiB`, `750×864`) para uma área exibida em `370×555` (economia estimada de **`13.7 KiB`**).
- **CLS Residual:**
  - **Mobile (`0.002`):** `main > section#hero > div.pointer-events-none > div.absolute` ([src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx#L166)), causado por microajuste de altura da `<section id="hero">` (`min-h-svh`) durante a montagem de `ContributionSkyline` e carregamento da fonte `Space Grotesk` (`swap`).
  - **Desktop (`0.001`):** `.hero-parallax-map` ([src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx#L243)). Em [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx#L766-L785) e [linha 841](../src/components/ui/contribution-skyline.tsx#L841), `width` inicia em `400` no SSR (`h3 = 200px` pela regra `safeWidth < 500`), mas em telas `xl` (`1350×940` do Desktop) o container possui `xl:max-w-[440px]`; quando o `ResizeObserver` atualiza `width` para `440`, `canvasHeight` salta de `200px` para `220px` (`+20px`), gerando exatamente o shift `0.001`.

---

## 3. Fases de Implementação (`Fase A` a `Fase E`)

> [!IMPORTANT]
> **Status da Implementação (`v2`):** Fases **A, B, C e D (Híbrida)** implementadas em `src/` e `public/` e validadas localmente via `npm run check` (`eslint .` + `tsc --noEmit`), `npm run build` (`next build`) e smoke test SSR com `next start`. Todas as fases preservam integralmente o visual **Editorial-Tech** ([DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)), o SSR textual para SEO/GEO e o suporte a `prefers-reduced-motion`.

### Fase A (Quick Win — P0): Accessibility Desktop `96 → 100` & `CLS 0.000` — `Implementado`

**Arquivos alvo:** [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx), [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx), [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx).

#### A.1 Correção de Contraste nos Índices `01`–`04` (`96 → 100`)
- Em [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx#L383-L388), alterar a classe do índice numérico do card de `text-white/18` para **`text-white/45`**:
  ```tsx
  <span
    aria-hidden="true"
    className="font-display text-3xl font-semibold leading-none text-white/45 tabular-nums"
  >
    {String(index + 1).padStart(2, "0")}
  </span>
  ```
- **Resultado esperado:** Razão de contraste acima de `4.5:1` sobre `#141318`, eliminando a única falha da auditoria `color-contrast` no Desktop e restaurando **`100`** em Acessibilidade tanto no Mobile quanto no Desktop.

#### A.2 Eliminação do `CLS` Residual (`0.002` Mobile / `0.001` Desktop → `0.000`)
1. **Estabilização da altura inicial de `ContributionSkyline` / `.hero-parallax-map`:**
   - Em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx#L243), aplicar contenção de layout e reserva mínima compatível no container `.hero-parallax-map` (`min-h-[258px] lg:min-h-[278px]` ou reserva exata conforme `canvasHeight` + header do widget) e `[contain:layout]` no wrapper de `#hero` ([linha 156](../src/components/portfolio/hero.tsx#L156)).
   - Em [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx#L841), alinhar o estado inicial de `width` / `canvasHeight` entre SSR e hidratação via CSS container (`aspect-ratio` / `min-height` responsiva por media query ou `max-w-[400px]` uniforme) para eliminar o salto de `200px → 220px` quando `ResizeObserver` mede `440px` em `xl`.
2. **Prevenção de shift no overlay inferior da `#hero`:**
   - Garantir que o wrapper absoluto em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx#L158-L167) permaneça com `[contain:layout_paint]` e que `section#hero` mantenha altura estável após o carregamento de `Space Grotesk` (`display: "swap"`), zerando o `0.002` reportado em `section#hero > div.pointer-events-none > div.absolute`.

---

### Fase B (Crítica — P0): Redução de `TBT` (`650–830 ms → < 150 ms`) & `Forced Reflow ~0 ms` — `Implementado`

**Arquivos alvo:** [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx), [src/components/ui/timeline.tsx](../src/components/ui/timeline.tsx), [src/components/ui/stack-spread.tsx](../src/components/ui/stack-spread.tsx), [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx), [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx), [src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx), [src/components/ui/kiln-wordmark.tsx](../src/components/ui/kiln-wordmark.tsx), [src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx).

#### B.1 Code-Splitting com SSR Preservado (`next/dynamic(..., { ssr: true })`)
- Em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx#L13-L22), converter os imports estáticos das 6 seções abaixo da dobra para `next/dynamic` com **`ssr: true`** (mantendo todo o HTML semântico e JSON-LD no payload SSR inicial para SEO/GEO, mas fatiando o JavaScript de hidratação por chunk):
  - `Sobre` (`./sobre`)
  - `Projetos` (`./projetos`)
  - `Jornada` (`./jornada`)
  - `Skills` (`./skills`)
  - `Contato` (`./contato`)
  - `Footer` (`./footer`)
- **Impacto:** Redução imediata de *Unused JavaScript* (`~69–70 KiB`) no bundle de boot da Hero e quebra de execução em tarefas menores e isoladas.

#### B.2 Inicialização GSAP/ScrollTrigger Adiada por Proximidade (`IntersectionObserver`) ou Idle Time-Sliced
- Em vez de registrar dezenas de `ScrollTrigger` e animações complexas simultaneamente no boot (durante o `#intro` / janela de TBT):
  1. Criar um hook compartilhado leve (ex.: `useNearViewport(ref, { rootMargin: "600px 0px" })` com fallback para `requestIdleCallback` / `prefers-reduced-motion`) para **adiar a criação de timelines `ScrollTrigger` abaixo da dobra** em:
     - [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx)
     - [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx)
     - [src/components/ui/timeline.tsx](../src/components/ui/timeline.tsx)
     - [src/components/ui/stack-spread.tsx](../src/components/ui/stack-spread.tsx)
     - [src/components/portfolio/contato.tsx](../src/components/portfolio/contato.tsx)
  2. Em [src/components/ui/kiln-wordmark.tsx](../src/components/ui/kiln-wordmark.tsx#L185-L265), adiar a execução inicial de `fitAndLockSlots()` e `ResizeObserver` até o rodapé se aproximar da viewport (`rootMargin: "600px 0px"`) ou em frame idle pós-Preloader, evitando leituras de `getBoundingClientRect()` em massa no boot enquanto o usuário ainda está na `#hero`.
  3. Em [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx#L148), substituir o `ScrollTrigger.refresh()` síncrono no `onComplete` por agendamento em `requestAnimationFrame` (ou `requestIdleCallback` com timeout curto) somente para triggers já ativos, evitando bloquear o frame final da saída da cortina.

#### B.3 Coalescência de Layout e `ResizeObserver` em `Timeline` ([src/components/ui/timeline.tsx](../src/components/ui/timeline.tsx#L120-L145))
- Atualmente `Timeline` executa `updateHeight()` síncrono no mount e dentro do `ResizeObserver` chama `updateHeight()` + `ScrollTrigger.refresh()` diretamente sempre que `Math.abs(nextDistance - lastDistance) > 1`.
- **Mudança especificada:**
  1. Ignorar disparos de `ResizeObserver` durante o boot inicial enquanto a seção estiver fora da janela de proximidade/inicialização ou durante o Preloader.
  2. Coalescer leituras/escritas do `ResizeObserver` em um único `requestAnimationFrame` (cancelado no cleanup), separando leitura (`scrollWidth`, `clientWidth`) de escrita (`section.style.height`) e aplicando tolerância mínima maior (ex.: `> 2px`) para não re-disparar `ScrollTrigger.refresh()` por subpixels.
  3. Reagendar `ScrollTrigger.refresh()` de forma *debounced/coalesced* via `requestAnimationFrame` após a atualização da altura.

#### B.4 Desacoplamento de CPU Inicial em `ContributionSkyline` ([src/components/ui/contribution-skyline.tsx](../src/components/ui/contribution-skyline.tsx#L1501-L1505))
- Durante a abertura da Hero, o morph inicial (`startMorph(1)`) dispara `requestAnimationFrame(stepAnimation)` iterando sobre ~365 células com projeção 3D e ordenação `sort` por frame, competindo com a entrada da Hero e o término do Preloader (`long task` de `669–744 ms` em `chunks/2l3y8_7oquw4y.js`).
- **Mudança especificada:**
  1. Desenhar apenas um **frame inicial leve** no mount (ou manter a grade 2D / primeiro frame estático com custo mínimo) enquanto `animate === false`.
  2. Quando `animate` passar para `true` e o elemento estiver visível, aguardar a conclusão da janela de abertura da Hero (ou próximo *idle frame* após `onExitStart` / ~`350 ms`) antes de iniciar o morph contínuo 2D → 3D, evitando sobreposição de CPU com a timeline de entrada da Hero e o `ScrollTrigger.refresh()`.
  3. Pré-alocar os arrays auxiliares usados em `drawFrame()` (`depths`, `sortedIndices`, `hitList` quando estático) em refs reutilizáveis para reduzir alocações por frame e pressão de *Garbage Collection*.

---

### Fase C (Otimização de Imagem & CSS — P1): `foto_rosto` (`-13.7 KiB`) & Redução de CSS Render-Blocking — `Implementado`

**Arquivos alvo:** `public/foto_rosto.webp` (novo, substituindo [public/foto_rosto.jpg](../public/foto_rosto.jpg)), [src/data/sobre.ts](../src/data/sobre.ts), [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx), [src/app/globals.css](../src/app/globals.css), [package.json](../package.json).

#### C.1 Conversão e Dimensionamento da Foto de Perfil (`-13.7 KiB` Mobile)
1. Converter [public/foto_rosto.jpg](../public/foto_rosto.jpg) (`923,714` bytes) para **`public/foto_rosto.webp`** pré-dimensionado e otimizado (ex.: largura máxima `800–960 px` compatível com Retina `2×` do container `400 px`, mantendo qualidade visual nítida e peso fonte reduzido).
2. Atualizar `sobreData.photo.src` em [src/data/sobre.ts](../src/data/sobre.ts#L74) de `"/foto_rosto.jpg"` para **`"/foto_rosto.webp"`** (verificando que `src/lib/seo.ts` consome automaticamente `sobreData.photo.src` para o `Person` JSON-LD!).
3. Remover o arquivo legado `public/foto_rosto.jpg` após confirmar zero referências no repositório.
4. Em [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx#L289-L295), ajustar `sizes` de `"(min-width: 1024px) 400px, 92vw"` para refletir o teto real `max-w-[400px]` do `<figure>` (linha 276):
   ```tsx
   <Image
     src={content.photo.src}
     alt={content.photo.alt}
     fill
     quality={75}
     sizes="(min-width: 1024px) 400px, (min-width: 440px) 400px, calc(100vw - 40px)"
     className="object-cover object-[50%_25%]"
   />
   ```
   *(Avaliar também `images.deviceSizes` em `next.config.ts` caso seja necessário incluir `400`/`512` em `imageSizes` ou evitar que viewports `370px × 2 = 740px` solicitem `w=750` desnecessariamente superdimensionado.)*

#### C.2 Enxugamento do CSS Render-Blocking (`18.1 KiB + 1.9 KiB`)
1. **Remoção de `tw-animate-css` ocioso:** Em [src/app/globals.css](../src/app/globals.css#L2), `@import "tw-animate-css";` é importado globalmente, porém a busca em toda a pasta `src/` confirmou **zero referências** a classes utilitárias do pacote (`animate-in`, `animate-out`, `fade-in`, `zoom-in`, `slide-in-*`). Remover o `@import "tw-animate-css";` (e desinstalar `tw-animate-css` de [package.json](../package.json) se não houver uso residual) reduz diretamente o chunk CSS bloqueante no `<head>`.
2. **Auditoria de CSS por seção:** Separar eventual estilização específica apenas de modais dinâmicos (`ProjectDialog`, `SobreDialog`) ou componentes carregados sob demanda via `next/dynamic`, encolhendo o CSS crítico acima da dobra sem depender de flags experimentais.

---

### Fase D (Decisão Estratégica de `Speed Index` — P1): Preloader Híbrido Editorial + Bypass em Sessão — `Implementado`

> [!NOTE]
> **Estratégia híbrida implementada em [src/components/portfolio/preloader.tsx](../src/components/portfolio/preloader.tsx):** Em vez de escolher apenas entre `2.27 s` rígidos ou remoção total das cortinas, foi adotado um **Preloader Editorial Híbrido** que preserva a coreografia das duas cortinas na primeira visita com tempos comprimidos (`~1.29 s` totais até o fim da saída) e realiza **bypass imediato via `sessionStorage`** (`teuaraujo:preloader-seen`) em recargas/navegações na mesma sessão:
> - **Contador inicial:** `MIN_MS = 450 ms`, `LERP_FACTOR = 0.34`, `COMPLETE_SNAP_THRESHOLD = 0.992`.
> - **Coreografia de saída (`exitTl`):** cortina esquerda (`yPercent: -100`, `0.72 s`, `power3.inOut` em `t = 0`), `onExitStart` disparado em `t = 0.06 s`, cortina direita (`yPercent: -100`, `0.72 s`, `power3.inOut` em `t = 0.12 s`, encerrando em `0.84 s`), conteúdo central (`y: -36`, `opacity: 0`, `0.28 s`, `power2.in` em `t = 0.20 s`).
> - **Pós-saída sem bloqueio:** `ScrollTrigger.refresh()` agendado via `requestIdleCallback(..., { timeout: 300 })` (com fallback `setTimeout(..., 0)`).

| Critério | Opção 1 — Preservar Preloader Editorial (Atual em 1ª visita) | Opção 2 — Preloader Ultra-Ágil / Bypass no First-Paint (`95–99+`) |
| --- | --- | --- |
| **Comportamento Visual** | Mantém `MIN_MS = 800 ms` + stagger `0.22 s` + cortinas `1.25 s` (`~2.27 s`) na primeira visita; adiciona bypass via `sessionStorage` para pular o `#intro` em recargas/navegações na mesma sessão. | Reduz cobertura opaca total para **`~400–600 ms`** (ex.: contagem rápida ou overlay translúcido/gradiente revelador imediato que não oculta integralmente a Hero atrás das cortinas, ou saída simultânea rápida em `~0.45 s`). |
| **Impacto no Speed Index** | Baixo no cold load do Lighthouse (cada execução PageSpeed usa sessão limpa sem `sessionStorage`, mantendo SI próximo a `4.0–5.0 s` Mobile / `2.3–2.7 s` Desktop). | **Alto:** derruba Speed Index para **`< 2.5 s` Mobile** e **`< 1.3 s` Desktop**, desbloqueando a faixa de **`+9` a `+10`** de contribuição no SI. |
| **Nota Alvo Estimada** | **`~85–92`** (após Fases A–C zerarem TBT e CLS). | **`95–99+`** em Mobile e Desktop. |
| **Trade-off** | Preserva integralmente a coreografia dramática das cortinas na entrada inicial, limitando o teto da nota Lighthouse. | Reduz o tempo de apreciação da cortina `0% → 100%` no primeiro acesso em troca de pontuação máxima nos Core Web Vitals sintéticos. |

---

### Fase E (Notas Técnicas e Limitações de Plataforma)

1. **JavaScript Legado (`14.0 KiB` em `chunks/3bu7zqinyzs45.js`):**
   - A auditoria *Legacy JavaScript* reporta `Array.prototype.at`, `Array.prototype.flat`, `Array.prototype.flatMap`, `Object.fromEntries`, `Object.hasOwn`, `String.prototype.trimStart` e `String.prototype.trimEnd` (`14.0 KiB`).
   - Embora [package.json](../package.json#L42-L48) já defina `browserslist` moderno (`last 2 Chrome/Firefox/Safari/Edge versions`, `not dead`), esses polyfills permanecem porque o Next.js `16.4.4` injeta internamente [node_modules/next/dist/build/polyfills/polyfill-module.js](../node_modules/next/dist/build/polyfills/polyfill-module.js) no chunk de runtime do cliente. Não há configuração nativa segura para suprimir esse arquivo sem customizações arriscadas de bundler (`Turbopack`/`webpack` alias), e o impacto em CPU/execução é residual frente ao ganho das Fases A–D.
2. **Configuração CSS no Next.js `16.4.4` (`experimental.inlineCss`):**
   - Em [node_modules/next/dist/server/config-shared.d.ts](../node_modules/next/dist/server/config-shared.d.ts#L1220), `inlineCss?: boolean` consta em `ExperimentalConfig` exclusivamente como recurso experimental para produção App Router (e ausente como API estável). Mantemos como estratégia principal e suportada a remoção de CSS não utilizado (`tw-animate-css`) e code-splitting dinâmico; o uso de `experimental.inlineCss` fica restrito a experimento isolado caso o CSS crítico residual continue penalizando o FCP Mobile após a Fase C.
3. **Content Security Policy (`'unsafe-inline'` em `next.config.ts`) e Best Practices `100`:**
   - [next.config.ts](../next.config.ts#L12-L26) já entrega `CSP`, `HSTS` (`max-age=63072000; includeSubDomains; preload`) e `Cross-Origin-Opener-Policy: same-origin` em produção, obtendo **`100`** em Best Practices tanto no Mobile quanto no Desktop.
   - O alerta puramente informativo de `'unsafe-inline'` em `script-src` permanece intencional para preservar `cacheComponents: true`, `partialPrefetching: true` e o cache estático/PPR da home (`"use cache"` em [src/app/page.tsx](../src/app/page.tsx#L14)). A adoção de `nonce` dinâmico por requisição exigiria interceptação via `proxy.ts`/Middleware em todas as páginas, desabilitando o cache estático/PPR sem ganho adicional na pontuação de Best Practices (`100`).

---

## 4. Critérios de Aceitação & Metas Alvo (`v2`)

### 4.1 Validação Local (`npm run check` & `npm run build`)
- [x] `npm run check` (`eslint .` + `tsc --noEmit`) finaliza com exit code `0`.
- [x] `npm run build` compila todas as rotas e chunks com `cacheComponents: true` e `partialPrefetching: true` sem erros ou regressões de hidratação.
- [x] Índices `01`–`04` em [src/components/portfolio/projetos.tsx](../src/components/portfolio/projetos.tsx#L387-L392) atualizados para `text-white/45` com contraste aprovado pela auditoria Axe.
- [x] [public/foto_rosto.jpg](../public/foto_rosto.jpg) removido e substituído por [public/foto_rosto.webp](../public/foto_rosto.webp) (`40,402` bytes), referenciado em [src/data/sobre.ts](../src/data/sobre.ts#L74) e servido com `sizes` preciso em [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx#L298).
- [x] `@import "tw-animate-css";` removido de [src/app/globals.css](../src/app/globals.css#L1-L2) e classes órfãs `animate-in fade-in duration-200` removidas de `#mobile-menu` em [src/components/portfolio/header.tsx](../src/components/portfolio/header.tsx#L420) sem regressão visual nos diálogos e animações.
- [x] Seções abaixo da dobra (`Sobre`, `Projetos`, `Jornada`, `Skills`, `Contato`, `Footer`) carregadas via `next/dynamic(..., { ssr: true })` em [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx), mantendo o HTML completo no SSR para SEO/GEO.
- [ ] Em gravação de trace no Chrome DevTools (*Performance*), ausência de *forced reflow* síncrono durante o boot e nenhuma *long task* superior a `150 ms` no carregamento inicial *(pendente de verificação em produção pós-deploy)*.

### 4.2 Metas no PageSpeed Insights em Produção (`https://www.teuaraujo.dev/`)

| Indicador | Baseline v1 (`24/11 20:43`) | Baseline v2 (`24/11 22:34`) | Meta Alvo Pós-v2 |
| --- | --- | --- | --- |
| **Mobile Performance** | `33` | `79` | **`>= 90`** *(ou `95+` com Fase D Opção 2)* |
| **Desktop Performance** | `DEADLINE_EXCEEDED` | `66` | **`>= 90`** *(ou `95–99+` com Fase D Opção 2)* |
| **Mobile Accessibility** | `100` | `100` | **`100`** |
| **Desktop Accessibility** | — | `96` | **`100`** |
| **Best Practices / SEO** | `100` / `100` | `100` / `100` | **`100`** / **`100`** |
| **Agentic Browsing** | `3/3` *(com aviso)* | `3/3` *(sem avisos)* | **`3/3`** *(sem avisos)* |
| **TBT (Mobile / Desktop)** | `24,330 ms` / — | `650 ms` / `830 ms` | **`< 150 ms`** em ambos |
| **LCP (Mobile / Desktop)** | `7.7 s` / — | `1.1 s` / `0.3 s` | **`<= 1.2 s`** Mobile / **`<= 0.5 s`** Desktop |
| **Speed Index (Mobile / Desktop)** | `21.9 s` / — | `5.4 s` / `2.7 s` | **`<= 4.5 s` / `<= 2.2 s`** *(Opção 1)* ou **`< 2.5 s` / `< 1.3 s`** *(Opção 2)* |
| **CLS (Mobile / Desktop)** | `0.003` / — | `0.002` / `0.001` | **`0.000`** em ambos |
| **Forced Reflow / Long Tasks** | `83 ms` / `20` tasks | `139–196 ms` / `3` tasks (`669–744 ms`) | **Zero forced reflows críticos**; sem tasks `> 150 ms` |
| **Image Delivery (`foto_rosto`)** | — | `-13.7 KiB` sugeridos (`jpg`) | **Audit aprovado** (`foto_rosto.webp`, zero economia pendente) |
