# Resumo do projeto — Portfolio

Este documento reúne o objetivo, as decisões e o estado do projeto discutidos até agora.

## Objetivo

Reconstruir o portfólio pessoal usando outros repositórios como referências, começando por uma fundação técnica e documental organizada antes de desenvolver as páginas finais. O portfólio deve apresentar projetos e experiências digitais com identidade visual própria, boa performance e uso intencional de animação.

No início da conversa, a pasta local estava vazia e ainda não havia repositório remoto. O trabalho começou pelo setup da aplicação e não pela migração de um repositório de referência específico.

## Stack escolhida

- **Next.js 16**, com App Router e React 19.
- **TypeScript** para tipagem.
- **Tailwind CSS 4** para estilos e tokens.
- **shadcn/ui** como base de componentes copiáveis e customizáveis.
- **GSAP** e `@gsap/react` para sequências e interações que se beneficiem de timelines.
- **21st.dev** e **Layers** como fontes de componentes e referências visuais. Componentes externos devem ser avaliados e adaptados antes de serem incorporados; não são dependências obrigatórias da aplicação.
- **Space Grotesk** para títulos e elementos de destaque.
- **Montserrat** para texto e interface.

## Direção visual definida

A direção proposta é editorial-tech: tipografia de grande escala, bastante espaço negativo, composições assimétricas quando ajudarem a hierarquia, fundo escuro e roxo usado como acento.

| Cor | Valor | Uso definido |
| --- | --- | --- |
| Roxo principal | `#4811ED` | marca e destaques fortes |
| Roxo claro | `#793CFF` | foco, detalhes e acentos menores |
| Preto | `#0D0D0D` | fundo principal |
| Branco suave | `#F5F5F5` | texto principal |

Como sugestão de refinamento, neutros secundários podem receber um leve tom roxo para manter a paleta coesa. O roxo deve aparecer com intenção, preservando contraste e hierarquia, em vez de dominar a interface com gradientes e brilhos decorativos.

## Decisões de arquitetura

- A aplicação é **server-first**: páginas permanecem Server Components por padrão; componentes client-side são usados quando há animação ou APIs do navegador.
- O GSAP fica isolado em componentes client-side pequenos e usa `useGSAP` para escopo e limpeza.
- Cores, tipografia, raios e superfícies são centralizados nos tokens CSS e consumidos por nomes semânticos.
- Código de componentes externos deve ser compreendido, revisado e adaptado; atenção a acessibilidade, responsividade, licença, dependências e redução de movimento.
- A estrutura separa rotas, componentes próprios do portfólio, componentes de interface, hooks e utilitários.
- Tailwind está integrado por PostCSS. Essa integração substituiu o loader experimental que causava falhas no build do ambiente.
- O React Compiler experimental foi removido da configuração inicial por não ser necessário para a fundação.
- Não foi escolhido ainda um CMS ou formato de conteúdo. TypeScript local, MDX ou CMS serão avaliados quando o volume e a necessidade editorial forem conhecidos.
- Tema claro não faz parte do primeiro corte; os tokens semânticos deixam essa evolução possível.

## Acessibilidade e movimento

- Meta de acessibilidade: WCAG 2.1 AA.
- Manter foco visível, semântica, navegação por teclado e alvos adequados para toque.
- Respeitar `prefers-reduced-motion` em CSS e GSAP.
- Preferir animações de `transform` e `opacity`; usar CSS para interações simples e GSAP para sequências mais elaboradas.
- A experiência e o conteúdo precisam continuar compreensíveis com movimento reduzido.

## O que já foi implementado

- Scaffold Next.js com App Router, TypeScript, Tailwind e ESLint.
- Configuração do shadcn/ui em `components.json`.
- Instalação do GSAP, `@gsap/react` e utilitários de classes.
- Carregamento de Space Grotesk e Montserrat pelo `next/font`.
- Paleta e tokens semânticos em `src/app/globals.css`.
- Metadata inicial e idioma `pt-BR` no layout.
- Hero inicial responsivo com sequência de entrada em GSAP e respeito a movimento reduzido.
- Scripts para desenvolvimento, build, lint, correção de lint, verificação de tipos e checagem combinada.
- Documentação de arquitetura, design system, contribuição e roadmap em `docs/`.

## Estado e validação registrados

Na última validação realizada durante o setup:

- `npm run check` passou (ESLint e TypeScript).
- `npm run build` passou e a página inicial foi pré-renderizada como conteúdo estático.
- `npm audit --omit=dev --audit-level=moderate` encontrou zero vulnerabilidades nas dependências de produção.
- O audit completo havia reportado 16 vulnerabilidades moderadas em dependências de desenvolvimento; não foi executado `npm audit fix --force`.

Esses resultados descrevem as verificações feitas durante o setup; devem ser repetidos após mudanças relevantes nas dependências ou no código.

## Próximas etapas sugeridas

1. Definir o público, idioma e narrativa principal do portfólio.
2. Reunir projetos, responsabilidades, resultados e materiais visuais que poderão ser publicados.
3. Analisar referências de outros repositórios e registrar o que será aproveitado em cada uma.
4. Esboçar sitemap e wireframes.
5. Definir como os projetos serão armazenados e apresentados.
6. Implementar navegação, hero definitivo, lista de projetos, páginas de case, sobre, experiência e contato.
7. Completar metadata, Open Graph, sitemap e robots; revisar acessibilidade, performance e SEO.
8. Refinar animações, imagens, deploy e domínio.

## Documentos relacionados

- [README e comandos do projeto](../README.md)
- [Arquitetura](ARCHITECTURE.md)
- [Design system](DESIGN_SYSTEM.md)
- [Guia de contribuição](CONTRIBUTING.md)
- [Roadmap inicial](ROADMAP.md)
