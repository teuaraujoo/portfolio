# Portfolio

Reconstrução de um portfólio pessoal com foco em direção de arte, movimento e performance.

## Stack

- Next.js 16 com App Router, React 19 e TypeScript
- Tailwind CSS 4 para estilos e tokens
- shadcn/ui como base de componentes copiáveis
- GSAP + `@gsap/react` para animações coordenadas
- 21st.dev e referências do Layers como fontes curadas, não dependências globais
- Space Grotesk para display e Montserrat para texto

## Início rápido

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Scripts

```bash
npm run dev        # ambiente local com Turbopack
npm run build      # build de produção
npm run start      # serve o build de produção
npm run lint       # análise estática
npm run lint:fix   # corrige problemas seguros do ESLint
npm run typecheck  # valida os tipos sem emitir arquivos
npm run check      # lint + typecheck
```

## Estrutura

```text
src/
├── app/                 # rotas, layouts e estilos globais
├── components/
│   ├── portfolio/       # componentes autorais do projeto
│   └── ui/              # componentes shadcn/ui
├── hooks/               # hooks reutilizáveis e integrações client-side
└── lib/                 # utilitários e configuração compartilhada
docs/                    # decisões de arquitetura, design e contribuição
```

## Adicionando componentes

Para componentes oficiais do shadcn:

```bash
npx shadcn@latest add button
```

Componentes vindos de 21st.dev ou outras referências devem ser revisados antes de entrar no projeto: acessibilidade, responsividade, dependências, tokens e `prefers-reduced-motion`. Consulte [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Guia de contribuição](docs/CONTRIBUTING.md)
- [Roadmap inicial](docs/ROADMAP.md)
