# Design system

## Direção

**Editorial-tech:** tipografia de escala grande, composição assimétrica, superfícies escuras e roxo concentrado em pontos de decisão. O objetivo é parecer autoral e preciso, não uma landing page genérica de SaaS.

## Paleta principal

| Token | Valor | Uso |
| --- | --- | --- |
| Brand | `#4811ED` | blocos de marca e estados fortes |
| Brand bright | `#793CFF` | foco, detalhes e acentos pequenos |
| Background | `#0D0D0D` | fundo principal |
| Foreground | `#F5F5F5` | texto principal |

Neutros secundários são levemente tingidos pelo roxo para manter coesão. O roxo não deve virar um gradiente decorativo recorrente; contraste e hierarquia vêm primeiro.

## Tipografia

- **Space Grotesk:** títulos, números grandes, navegação curta e momentos de identidade.
- **Montserrat:** parágrafos, labels e interface.
- Use `clamp()` para títulos fluidos e evite mais de três pesos na mesma seção.
- Parágrafos longos devem ficar entre 55 e 70 caracteres por linha.

## Espaçamento e composição

- Base de 4px, com ritmo preferencial em 8, 12, 16, 24, 32, 48, 64 e 96px.
- Seções principais usam bastante espaço negativo.
- Assimetria é bem-vinda quando melhora a hierarquia; no mobile, ela volta a uma coluna legível.
- Cards só existem quando comunicam agrupamento ou interação. Não usar cards como decoração automática.

## Movimento

- Curvas padrão: `expo.out` no GSAP ou `cubic-bezier(0.16, 1, 0.3, 1)` no CSS.
- Entradas entre 700–1100ms, com stagger discreto de 60–120ms.
- Microinterações entre 180–350ms.
- Sem bounce ou elastic por padrão.
- Toda experiência deve continuar compreensível com animações reduzidas.

## Acessibilidade

- Meta mínima: WCAG 2.1 AA.
- Foco deve ser visível e usar o token `ring`.
- Texto informativo nunca depende apenas de cor.
- Áreas interativas devem ter pelo menos 44×44px em dispositivos de toque.
- Componentes importados precisam manter semântica, teclado e leitor de tela.
