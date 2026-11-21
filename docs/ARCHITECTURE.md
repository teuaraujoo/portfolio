# Arquitetura

## Princípios

1. **Server-first:** páginas e seções são Server Components por padrão. Use `"use client"` somente onde houver estado, APIs do navegador ou animação.
2. **Movimento isolado:** componentes GSAP ficam em folhas client-side pequenas. Cada animação deve usar `useGSAP`, escopo local e cleanup automático.
3. **Tokens antes de valores:** cores, fontes, raios e superfícies vivem em `globals.css`; componentes consomem nomes semânticos.
4. **Conteúdo separado da apresentação:** quando o portfólio crescer, projetos e experiência devem vir de dados tipados ou MDX, sem duplicar markup.
5. **Dependências conscientes:** componentes externos são código incorporado ao projeto, não caixas-pretas. Tudo deve ser revisável e removível.

## Fronteiras

- `src/app`: composição de rotas, metadata, layouts e carregamento de dados.
- `src/components/portfolio`: linguagem visual exclusiva do portfólio.
- `src/components/ui`: primitives genéricas do shadcn, sem regra de negócio.
- `src/hooks`: comportamento client-side reutilizável.
- `src/lib`: funções puras, configuração e tipos compartilhados.

## Estratégia de animação

- Use GSAP para sequências, scroll storytelling e interações que precisam de timeline.
- Prefira CSS para estados simples de hover/focus.
- Anime `transform` e `opacity`; evite propriedades que forçam layout.
- Respeite sempre `prefers-reduced-motion`.
- Registre plugins GSAP apenas no módulo client-side que os utiliza.

## Decisões futuras

- A fonte dos dados de projetos será escolhida quando o volume de conteúdo estiver claro: TypeScript local para poucos cases, MDX para narrativas longas ou CMS apenas se houver necessidade editorial real.
- Tema claro não faz parte do primeiro corte, mas os tokens semânticos permitem adicioná-lo sem reescrever componentes.
