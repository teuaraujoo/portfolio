# Especificação Técnica — SEO Técnico, GEO e Dados Estruturados

## 1. Visão Geral e Diagnóstico do Estado Atual

Esta especificação define a arquitetura de **SEO Técnico** (*Search Engine Optimization*) e **GEO** (*Generative Engine Optimization*) para o portfólio de **Mateus Araujo** (`pt-BR`), garantindo indexação limpa por buscadores tradicionais, extração fiel por motores de resposta/LLMs, pré-visualização rica em redes sociais e higiene de performance/ativos.

### O que já está em conformidade no repositório
- **Idioma e documento raiz:** `<html lang="pt-BR">` declarado em [src/app/layout.tsx](../src/app/layout.tsx) e refletido em `homeData.locale` ([src/data/home.ts](../src/data/home.ts)).
- **Renderização Server-First com cache:** [src/app/page.tsx](../src/app/page.tsx) executa como Server Component com `"use cache"` e `cacheLife("hours")`, entregando o HTML completo das seções sem depender de hidratação tardia para o conteúdo textual.
- **Landmarks e hierarquia de títulos:** `<header>`, `<nav>`, `<main>`, `<section>` e `<footer>` estruturados via [src/components/portfolio/home-shell.tsx](../src/components/portfolio/home-shell.tsx), com único `<h1>` na Hero e `<h2>` nas demais seções e diálogos.
- **Tipografia com `swap`:** `Space_Grotesk` e `Montserrat` carregadas via `next/font/google` com `display: "swap"` em [src/app/layout.tsx](../src/app/layout.tsx).
- **Metadados mínimos iniciais:** `title` (`default` e `template`), `description` curta e `icons` (`/icon.svg` e `/icon.png`) já configurados em [src/app/layout.tsx](../src/app/layout.tsx).

### Lacunas verificadas no estado atual
1. **Metadados incompletos em [src/app/layout.tsx](../src/app/layout.tsx):** ausência de `metadataBase`, `alternates.canonical`, `keywords`, `authors`, `creator`, `openGraph`, `twitter` e `robots`, além de `description` subdimensionada para SERPs (70 caracteres atuais vs. faixa recomendada de 140–155 caracteres).
2. **Ausência de rotas nativas de indexação e descoberta:** não existem `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts` nem `src/app/opengraph-image.tsx`.
3. **Ausência de endpoints GEO (`llms.txt`):** não existem `src/app/llms.txt/route.ts` (`/llms.txt`) nem `src/app/llms-full.txt/route.ts` (`/llms-full.txt`) para leitura estruturada por agentes e modelos de linguagem.
4. **Ausência de Schema.org (JSON-LD):** [src/app/page.tsx](../src/app/page.tsx) não injeta grafo semântico (`Person`, `WebSite`, `ProfilePage`, `ItemList`).
5. **`<h1>` sem texto acessível completo em [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) (linhas 165–185):** todos os `<span>` visuais internos utilizam `aria-hidden="true"` (efeito tipográfico por caractere), e o `aria-label` do `<h1>` traz apenas `"Mateus Araujo"`, sem o complemento de cargo e localização para leitores de tela e extratores semânticos.
6. **Dois trechos residuais de *Lorem ipsum*:**
   - [src/data/sobre.ts](../src/data/sobre.ts) (linhas 86–88): os 3 parágrafos de `sobreData.modal.paragraphs`.
   - [src/data/contato.ts](../src/data/contato.ts) (linha 83): texto interno em `contatoContent.form.successDescription`.
7. **CSS externo bloqueante e não versionado:** `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />` no `<head>` de [src/app/layout.tsx](../src/app/layout.tsx) (linhas 41–47), consumido pelas classes de [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx).
8. **Imagens sem otimização `next/image` (parcialmente convertidas para WebP):** Jornada (`public/jornada/*.webp`) e projetos em destaque (`anatolab`, `cmf`, `civix`, `bahia` em `.webp`) já foram convertidos para WebP (com os `.png` de backup removidos) e referenciados em WebP; apenas [public/foto_rosto.jpg](../public/foto_rosto.jpg) (~924 KB) e as 3 capas de arquivo (`calculadora`, `lista-tarefas`, `lampada` em `capa.png`) permanecem em formato não-WebP servidos via tags `<img>` diretas aguardando adoção de `next/image`.
9. **6 arquivos não referenciados em `public/`:** `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` e `logo.png` permanecem sem uso no código-fonte (`public/log.svg` foi renomeado para `public/logo.svg` e passou a ser utilizado no Footer).

---

## 2. Arquitetura e Fonte Única de Dados (`src/lib/seo.ts`)

Seguindo o padrão de isolamento de dados do projeto, toda a configuração de URL canônica, metadados, JSON-LD e textos GEO deve residir em um módulo servidor único: **`src/lib/seo.ts`**.

### Resolução de URL Canônica (`getSiteUrl()`)
`getSiteUrl(): string` resolve a origem absoluta em tempo de build/execução com a seguinte ordem de prioridade, sempre removendo barra final (`replace(/\/+$/, "")`):

1. `process.env.NEXT_PUBLIC_SITE_URL` (origem explícita configurada pelo ambiente/produção).
2. `process.env.VERCEL_PROJECT_PRODUCTION_URL` (normalizado com prefixo `https://`).
3. `process.env.VERCEL_URL` (normalizado com prefixo `https://` para ambientes de preview).
4. Fallback seguro: **`"https://mateusaraujo.dev"`** *(documentado como domínio placeholder até a confirmação do domínio definitivo em produção)*.

```ts
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "https://mateusaraujo.dev";

  return raw.replace(/\/+$/, "");
}
```

### Builders Centralizados (Zero Duplicação de Copy/Links)
`src/lib/seo.ts` deve importar diretamente as fontes tipadas em `src/data/*.ts`, evitando qualquer duplicação manual de biografia, projetos, links sociais ou stack:

| Fonte em `src/data/` | Dados consumidos por `src/lib/seo.ts` |
| --- | --- |
| [src/data/home.ts](../src/data/home.ts) (`homeData`) | `locale`, `hero.firstName`, `hero.lastName`, `hero.role`, `hero.location`, `hero.leadSegments`, `hero.bioSegments`, `hero.gitMap.username` |
| [src/data/sobre.ts](../src/data/sobre.ts) (`sobreData`) | `quoteAriaLabel`, `photo.src`, `modal.paragraphs`, `stats` |
| [src/data/projetos.ts](../src/data/projetos.ts) (`projetosContent`) | `items` (`slug`, `title`, `subtitle`, `category`, `year`, `summary`, `visibility`, `status`, `techs`, `liveUrl`, `repoUrl`, `details`) |
| [src/data/jornada.ts](../src/data/jornada.ts) (`jornadaContent`) | `periodLabel`, `intro`, `categories`, `stops` (`year`, `monthLabel`, `category`, `title`, `organization`, `description`) |
| [src/data/skills.ts](../src/data/skills.ts) (`skillsContent`) | `defaultDescription`, `items` (`name`, `category`), `secondaryTools` |
| [src/data/contato.ts](../src/data/contato.ts) (`contatoContent`) | `lead`, `socials` (`platform`, `label`, `handle`, `href`) |

### Funções Exportadas Previstas em `src/lib/seo.ts`
- `getSiteUrl(): string`
- `getSiteMetadata(): Metadata` — monta o objeto completo consumido por [src/app/layout.tsx](../src/app/layout.tsx).
- `getPersonJsonLd(): Record<string, unknown>` — monta o grafo Schema.org (`@context` + `@graph`) consumido por [src/app/page.tsx](../src/app/page.tsx).
- `buildLlmsTxt(): string` — gera o índice resumido no padrão `llmstxt.org`.
- `buildLlmsFullTxt(): string` — gera o dossiê completo em Markdown estruturado.

### Compatibilidade com `cacheComponents: true` e `partialPrefetching: true`
[next.config.ts](../next.config.ts) ativa `cacheComponents: true` e `partialPrefetching: true`. Ao implementar as rotas da Fase 1 e Fase 2, observar as regras abaixo:

1. **Sem leitura de APIs dinâmicas por requisição:** `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`, `llms.txt/route.ts` e `llms-full.txt/route.ts` **não** devem chamar `headers()`, `cookies()` ou acessar `request.url`/`searchParams`. Todas leem apenas `getSiteUrl()` e os módulos estáticos de `src/data/*.ts`.
2. **Evitar `export const dynamic` incompatível com `cacheComponents`:** com `cacheComponents: true` no Next.js 16, Route Handlers e componentes cacheados devem ser determinísticos ou usar `"use cache"` + `cacheLife("days")` (quando houver computação cacheada), em vez de flags legadas conflitantes.
3. **Respostas `GET` puras para `llms.txt` e `llms-full.txt`:** como `buildLlmsTxt()` e `buildLlmsFullTxt()` são funções síncronas e puras sobre `src/data/*.ts`, os Route Handlers retornam `new Response(content, { headers })` diretamente (ou via helper com `"use cache"` + `cacheLife("days")`), permitindo pré-renderização/cache seguro sem bloquear PPR em [src/app/page.tsx](../src/app/page.tsx).

---

## 3. Especificação Técnica por Entregável (Fases Priorizadas)

### Fase 1 — Metadados & Canônica (`layout.tsx`, `opengraph-image.tsx`, `manifest.ts`)

#### 1.1 Metadados Globais (`src/app/layout.tsx`)
Substituir o objeto `metadata` estático mínimo por `export const metadata: Metadata = getSiteMetadata();` (definido em `src/lib/seo.ts`), contemplando todos os campos obrigatórios:

- **`metadataBase`:** `new URL(siteUrl)`
- **`title`:**
  - `default`: `"Mateus Araujo — Desenvolvedor FullStack em Aracaju, SE"`
  - `template`: `"%s | Mateus Araujo"`
- **`description`:** texto entre **140 e 155 caracteres** derivado do posicionamento real em `homeData` (ex.: `"Portfólio de Mateus Araujo, Desenvolvedor FullStack em Aracaju, SE. Projetos com Next.js, TypeScript, React, Node.js e arquitetura web escalável."` — 145 caracteres).
- **`keywords`:** derivadas dinamicamente de `skillsContent.items` + termos principais (`"Mateus Araujo"`, `"Desenvolvedor FullStack"`, `"Aracaju"`, `"Portfólio"`, `"Next.js"`, `"TypeScript"`, `"React"`, `"Node.js"`, `"NestJS"`, `"PostgreSQL"`).
- **`authors` / `creator` / `publisher`:** `[{ name: "Mateus Araujo", url: siteUrl }]` / `"Mateus Araujo"`.
- **`alternates`:** `{ canonical: "/" }` (resolvido contra `metadataBase`).
- **`openGraph`:**
  - `type`: `"website"`
  - `locale`: `"pt_BR"`
  - `url`: `"/"`
  - `siteName`: `"Mateus Araujo — Portfólio"`
  - `title`: `"Mateus Araujo — Desenvolvedor FullStack"`
  - `description`: mesma descrição otimizada de 140–155 caracteres.
  - *(A imagem OG será vinculada automaticamente pela convenção `src/app/opengraph-image.tsx`, podendo também referenciar `"/opengraph-image"` com `width: 1200, height: 630, alt` se explicitada.)*
- **`twitter`:**
  - `card`: `"summary_large_image"`
  - `title`: `"Mateus Araujo — Desenvolvedor FullStack"`
  - `description`: mesma descrição otimizada.
- **`robots`:**
  - `index: true`, `follow: true`
  - `googleBot`: `{ index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }`
- **`icons`:** preservar integralmente a configuração já validada em [src/app/layout.tsx](../src/app/layout.tsx) (`/icon.svg`, `/icon.png`, `shortcut`, `apple`).

#### 1.2 Imagem Open Graph Dinâmica (`src/app/opengraph-image.tsx`)
- **Dimensões e MIME:** `export const size = { width: 1200, height: 630 };` e `export const contentType = "image/png";` + `export const alt = "Mateus Araujo — Desenvolvedor FullStack em Aracaju, SE";`.
- **Runtime:** padrão Node.js (`ImageResponse` de `next/og`), compatível com `cacheComponents: true` e leitura direta de `homeData` / `skillsContent`.
- **Direção Visual Editorial-Tech ([src/app/globals.css](../src/app/globals.css)):**
  - Fundo base `#0D0D0D` com brilho radial sutil de `#4811ED` e `#793CFF`.
  - Tipografia clara em `#F5F5F5` (e secundária `#AAA4B8`), exibindo:
    - Pílula superior: `${homeData.hero.role} · ${homeData.hero.location}` com ponto indicador `#793CFF`.
    - Título principal em destaque: `"Mateus Araujo"`.
    - Subtítulo conciso derivado de `homeData.hero.leadSegments`.
    - Rodapé do card com domínio limpo (`new URL(getSiteUrl()).hostname`) e principais tags da stack (`TypeScript`, `Next.js`, `React`, `Node.js`, `PostgreSQL`).

#### 1.3 Web App Manifest (`src/app/manifest.ts`)
Retorna `MetadataRoute.Manifest`:
- `name`: `"Mateus Araujo — Desenvolvedor FullStack"`
- `short_name`: `"Mateus Araujo"`
- `description`: descrição do portfólio em `pt-BR`
- `start_url`: `"/"`
- `display`: `"standalone"`
- `background_color`: `"#0D0D0D"`
- `theme_color`: `"#0D0D0D"`
- `lang`: `"pt-BR"`
- `icons`: `[{ src: "/icon.png", sizes: "any", type: "image/png" }, { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]`

---

### Fase 2 — Crawlers e LLMs (`robots.ts`, `sitemap.ts`, `llms.txt`, `llms-full.txt`)

#### 2.1 `src/app/robots.ts`
Retorna `MetadataRoute.Robots`:
- `rules`: `[{ userAgent: "*", allow: "/", disallow: ["/api/"] }]` (protegendo `/api/contact` e futuras rotas de API contra rastreamento indevido).
- `sitemap`: `` `${getSiteUrl()}/sitemap.xml` ``
- `host`: `getSiteUrl()`

#### 2.2 `src/app/sitemap.ts`
Retorna `MetadataRoute.Sitemap` contendo a URL canônica única do portfólio:
- `url`: `getSiteUrl()` (ou `` `${getSiteUrl()}/` `` consistente com `canonical`).
- `lastModified`: `new Date()` (ou data fixa/constante de release para estabilidade de cache).
- `changeFrequency`: `"monthly"`
- `priority`: `1`

> [!NOTE]
> Fragmentos de âncora (`/#sobre`, `/#projetos`, `/#jornada`, `/#skills`, `/#contato`) **não** devem ser listados no `sitemap.xml`: pelo protocolo Sitemaps, identificadores `#fragment` são removidos/ignorados por crawlers e podem gerar avisos no Google Search Console. Se no futuro surgirem rotas dedicadas (ex.: `/projetos/[slug]`), elas passam a compor o array retornado por `sitemap.ts`.

#### 2.3 `src/app/llms.txt/route.ts` (`GET /llms.txt`)
Segue o formato oficial **`llmstxt.org`** com `Content-Type: text/plain; charset=utf-8` e `Cache-Control: public, max-age=3600, s-maxage=86400`:
- `# Mateus Araujo` (H1)
- `> Blockquote` resumindo cargo (`Desenvolvedor FullStack`), localização (`Aracaju, SE`) e proposta de valor de `homeData`.
- Seções H2 com links em Markdown para o dossiê completo (`/llms-full.txt`), seções da página (`/#sobre`, `/#projetos`, `/#jornada`, `/#skills`, `/#contato`) e perfis externos (`contatoContent.socials` + GitHub).
- Lista resumida dos projetos públicos/em destaque (`projetosContent.items`) e stack principal (`skillsContent.items`).

#### 2.4 `src/app/llms-full.txt/route.ts` (`GET /llms-full.txt`)
Retorna dossiê completo em Markdown estruturado (`Content-Type: text/plain; charset=utf-8`), gerado dinamicamente via `buildLlmsFullTxt()` a partir de `src/data/*.ts`:
1. **Identidade & Resumo Profissional:** dados de `homeData.hero` (`role`, `location`, `leadSegments`, `bioSegments`) e `sobreData` (`quoteAriaLabel`, `modal.paragraphs`, `stats`).
2. **Projetos (`projetosContent.items`):** título, subtítulo, categoria, ano, status (`PROJECT_STATUS_META[item.status].label`), tecnologias, `summary`, `details.overview`, `challenge`, `solution`, `highlights` e `liveUrl`.
   - **Regra obrigatória de privacidade:** expor `repoUrl` **apenas** quando `item.visibility === "public" && item.repoUrl`. Projetos com `visibility === "private"` não devem vazar URLs privadas de repositório, sendo identificados como repositório privado.
3. **Jornada (`jornadaContent.stops`):** linha do tempo cronológica com `monthLabel`, categoria, `title`, `organization` e `description`.
4. **Skills & Ferramentas (`skillsContent`):** tecnologias principais agrupadas ou listadas com `category`, mais `secondaryTools`.
5. **Contato & Redes (`contatoContent`):** `lead` e canais de `contatoContent.socials`.

---

### Fase 3 — Dados Estruturados JSON-LD (`src/app/page.tsx`)

Injetar uma única tag `<script type="application/ld+json">` server-rendered em [src/app/page.tsx](../src/app/page.tsx) (dentro do JSX retornado, antes ou junto a `<HomeShell />`) contendo um grafo **`@graph`** gerado por `getPersonJsonLd()` em `src/lib/seo.ts`:

1. **`Person` (`@id: "${siteUrl}/#person"`):**
   - `name`: `"Mateus Araujo"`
   - `url`: `siteUrl`
   - `image`: `` `${siteUrl}${sobreData.photo.src}` ``
   - `jobTitle`: `homeData.hero.role` (`"Desenvolvedor FullStack"`)
   - `description`: resumo derivado de `homeData.hero.bioSegments` / `sobreData.quoteAriaLabel`
   - `address`: `{ "@type": "PostalAddress", addressLocality: "Aracaju", addressRegion: "SE", addressCountry: "BR" }`
   - `sameAs`: URLs externas públicas de `contatoContent.socials` (ex.: LinkedIn, GitHub, Linktree — evitando expor `wa.me` se não desejar número direto no `sameAs`, ou mantendo apenas perfis sociais/código).
   - `knowsAbout`: nomes de `skillsContent.items` + `skillsContent.secondaryTools`.
2. **`WebSite` (`@id: "${siteUrl}/#website"`):**
   - `url`: `siteUrl`
   - `name`: `"Mateus Araujo — Portfólio"`
   - `inLanguage`: `"pt-BR"`
   - `publisher`: `{ "@id": "${siteUrl}/#person" }`
3. **`ProfilePage` (`@id: "${siteUrl}/#profilepage"`):**
   - `url`: `siteUrl`
   - `name`: `"Mateus Araujo — Desenvolvedor FullStack"`
   - `inLanguage`: `"pt-BR"`
   - `isPartOf`: `{ "@id": "${siteUrl}/#website" }`
   - `mainEntity`: `{ "@id": "${siteUrl}/#person" }`
   - `hasPart`: `{ "@id": "${siteUrl}/#projects" }`
4. **`ItemList` (`@id: "${siteUrl}/#projects"`):**
   - `name`: `"Projetos de Mateus Araujo"`
   - `numberOfItems`: `projetosContent.items.length`
   - `itemListElement`: mapeamento `1..N` de `projetosContent.items` como `ListItem` contendo `item` do tipo `SoftwareSourceCode` (quando público com repositório) ou `CreativeWork` / `SoftwareApplication`:
     - `name`: `project.title`
     - `description`: `project.summary`
     - `dateCreated`: `project.year`
     - `applicationCategory`: `project.category`
     - `programmingLanguage` / `keywords`: `project.techs`
     - `url`: `project.liveUrl ?? `${siteUrl}/#projetos``
     - **`codeRepository`:** incluído **somente** quando `project.visibility === "public" && project.repoUrl`.

#### Serialização Segura contra XSS
Ao serializar o JSON-LD dentro de `dangerouslySetInnerHTML`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

A substituição `.replace(/</g, "\\u003c")` impede fechamento prematuro de `</script>` caso qualquer texto futuro venha de fonte externa.

---

### Fase 4 — Semântica HTML & Higiene de Conteúdo

1. **Texto acessível no `<h1>` de [src/components/portfolio/hero.tsx](../src/components/portfolio/hero.tsx) (linhas 165–185):**
   - Preservar integralmente os dois `<span aria-hidden="true">` visuais que executam a animação por caractere (`splitChars`).
   - Adicionar imediatamente dentro do `<h1>`:
     ```tsx
     <span className="sr-only">
       {`${content.firstName} ${content.lastName} — ${content.role} em ${content.location}`}
     </span>
     ```
   - Atualizar o `aria-label` (ou removê-lo em favor do `<span className="sr-only">` interno para evitar leitura duplicada em alguns leitores de tela), garantindo que o nó textual do `<h1>` contenha `"Mateus Araujo — Desenvolvedor FullStack em Aracaju, SE"` no HTML SSR.

2. **Remoção dos 2 trechos restantes de *Lorem ipsum*:**
   - [src/data/sobre.ts](../src/data/sobre.ts) (linhas 86–88): substituir os 3 parágrafos placeholder de `sobreData.modal.paragraphs` pela história real em `pt-BR` (trajetória autodidata, atuação fullstack, Embaixador da Google / comunidade, estudo em ADS e foco em entregas completas).
   - [src/data/contato.ts](../src/data/contato.ts) (linha 83): substituir `contatoContent.form.successDescription` por mensagem real em `pt-BR` (ex.: `"Obrigado pelo contato. Sua mensagem foi encaminhada e retornarei o mais breve possível."`).

---

### Fase 5 — Core Web Vitals, Headers Técnicos e Limpeza de Assets

#### 5.1 Configuração e Headers HTTP ([next.config.ts](../next.config.ts))
- Habilitar formatos modernos para otimização de imagens:
  ```ts
  images: {
    formats: ["image/avif", "image/webp"],
  },
  ```
- Adicionar `async headers()` aplicando os headers de segurança e privacidade de referência para todas as rotas (`source: "/(.*)"`):
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

#### 5.2 Eliminação do CSS Externo Bloqueante (`devicon@latest`)
Em [src/app/layout.tsx](../src/app/layout.tsx) (linhas 41–47), o `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />` bloqueia a renderização inicial (`render-blocking`) e depende de tag mutável `@latest` de CDN externo.
- **Estratégia recomendada:** substituir os ícones de fonte em [src/components/portfolio/skill-icons.tsx](../src/components/portfolio/skill-icons.tsx) por **SVGs locais/inline** das 15 tecnologias listadas em `SkillIconKey` (ou pacote local), removendo totalmente o `<link>` externo do `<head>` de `layout.tsx`.
- **Alternativa transitória (caso mantido Devicon CSS):** fixar versão imutável (ex.: `devicon@2.16.0`) com carregamento não-bloqueante (`preload` + `onload` ou CSS assíncrono) e `preconnect` — mantendo a migração para SVG inline como meta preferencial por eliminar uma requisição crítica externa e o download completo da fonte de ícones.

#### 5.3 Otimização de Imagens Pesadas (`next/image` / WebP)
Ativos acima de ~200 KB identificados em `public/` devem ser comprimidos (WebP/AVIF com redimensionamento adequado ao viewport) e/ou migrados de `<img>` para `next/image` (`<Image />`) com `sizes` explícitos e `priority` apenas no que estiver acima da dobra:
- **Já convertidos para WebP (pendentes de `next/image`; `.png` de backup removidos):** `public/jornada/*.webp` (`google.webp`, `google2.webp`, `hacktoon.webp`, `jovemtech.webp`, consumidos em [src/components/portfolio/jornada.tsx](../src/components/portfolio/jornada.tsx)) e galerias dos projetos em destaque (`anatolab`, `cmf`, `civix`, `bahia` em `.webp`, consumidos em [src/components/portfolio/project-media.tsx](../src/components/portfolio/project-media.tsx) e [src/components/portfolio/project-dialog.tsx](../src/components/portfolio/project-dialog.tsx)).
- **Únicos ativos restantes em formato não-WebP (pendentes de conversão para WebP/AVIF e `next/image`):** [public/foto_rosto.jpg](../public/foto_rosto.jpg) (~924 KB, consumido em [src/components/portfolio/sobre.tsx](../src/components/portfolio/sobre.tsx), linha 281) e os 3 `capa.png` do arquivo (`calculadora`, `lista-tarefas`, `lampada`).

#### 5.4 Limpeza de Arquivos Não Utilizados em `public/`
Remover os 6 arquivos de template/legado sem referência no código:
- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`
- `public/logo.png`

*(Manter `public/icon.svg`, `public/icon.png` — usados pelo header e pelos ícones do documento — e `public/logo.svg`, ativo na barra inferior do Footer.)*

---

## 4. Critérios de Aceitação & Verificação (Local e Pós-Deploy)

### 4.1 Validação de Código e Build Local
Executar após a conclusão das alterações:
1. `npm run check` (`eslint .` + `tsc --noEmit`) — exit code `0`, sem warnings/erros de tipagem ou lint.
2. `npm run build` — geração bem-sucedida de todas as rotas estáticas/cacheadas e rotas de metadados com `cacheComponents: true` ativo.

### 4.2 Verificação das Rotas Servidas (`npm run start`)
Confirmar status `HTTP 200` e conteúdo válido em:
- `GET /robots.txt` — permite `/`, bloqueia `/api/` e aponta para `Sitemap: <siteUrl>/sitemap.xml`.
- `GET /sitemap.xml` — XML válido contendo apenas a URL canônica raiz (sem âncoras `#`).
- `GET /llms.txt` — `text/plain; charset=utf-8` válido no formato `llmstxt.org`.
- `GET /llms-full.txt` — `text/plain; charset=utf-8` com biografia, projetos (sem vazar `repoUrl` de itens `visibility === "private"`), jornada, skills e contato.
- `GET /manifest.webmanifest` — JSON válido com nome, cores `#0D0D0D`, `lang: "pt-BR"` e ícones.
- `GET /opengraph-image` — retorna PNG `1200×630` com contraste e tipografia Editorial-Tech legíveis.

### 4.3 Checklist de Inspeção do HTML Renderizado (`curl` / View Source)
- [ ] `<html lang="pt-BR">` presente e único `<link rel="canonical" href="<siteUrl>">` no `<head>`.
- [ ] `<title>`, `<meta name="description">` (140–155 caracteres), tags `og:*`, `twitter:*` e `robots` presentes no HTML inicial.
- [ ] Tag `<script type="application/ld+json">` presente no HTML SSR contendo `@graph` (`Person`, `WebSite`, `ProfilePage`, `ItemList`) sem `<` não escapado e sem `codeRepository` para projetos privados.
- [ ] `<h1>` da Hero contém `<span className="sr-only">Mateus Araujo — Desenvolvedor FullStack em Aracaju, SE</span>` visível no HTML textual.
- [ ] Zero ocorrências de `"Lorem ipsum"` em `src/` e no HTML final.
- [ ] Zero `<link>` bloqueante para `devicon@latest` no `<head>`.
- [ ] Headers `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy` presentes nas respostas HTTP.
- [ ] Os 6 arquivos legados removidos de `public/` sem quebrar referências existentes.

### 4.4 Verificação Pós-Deploy em Produção
Após publicar no domínio definitivo (`NEXT_PUBLIC_SITE_URL`):
- **Google Search Console:** validar propriedade do domínio, submeter `/sitemap.xml` e usar *Inspeção de URL* na home.
- **Bing Webmaster Tools:** verificar propriedade e submeter `/sitemap.xml` (alimenta também índices usados por buscadores e assistentes como ChatGPT Search).
- **Google Rich Results Test:** validar a URL de produção confirmando leitura limpa dos nós do `@graph` sem erros ou avisos críticos.
- **PageSpeed Insights (Mobile & Desktop):** confirmar LCP, CLS (`~0`), eliminação de recursos render-blocking e aproveitamento de formatos AVIF/WebP.
- **OpenGraph.xyz (ou Debugger do LinkedIn/X):** validar renderização do card `1200×630` de `/opengraph-image`, título e descrição em compartilhamentos.
