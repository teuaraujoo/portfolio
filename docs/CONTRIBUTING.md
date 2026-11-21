# Guia de contribuição

## Fluxo sugerido

1. Crie uma branch curta por mudança.
2. Implemente a menor unidade coerente.
3. Rode `npm run check`.
4. Rode `npm run build` antes de abrir um pull request.
5. Valide desktop, mobile, teclado e redução de movimento.

## Convenções

- Componentes e tipos: `PascalCase`.
- Funções, hooks e arquivos utilitários: `camelCase` ou `kebab-case` para nomes de arquivo.
- Prefira exports nomeados para componentes reutilizáveis.
- Evite barrel files até existir benefício real.
- Não adicione uma biblioteca para algo simples que o navegador ou o Tailwind já resolvem.

## Checklist para 21st.dev, Layers e snippets externos

- O componente reforça a direção editorial-tech?
- As cores e medidas foram convertidas para tokens locais?
- Funciona sem mouse e com leitor de tela?
- Responde bem abaixo de 768px?
- Respeita `prefers-reduced-motion`?
- Dependências e licença foram verificadas?
- O código foi simplificado e entendido antes de entrar?

## Commits

Use mensagens curtas e imperativas. Exemplos:

```text
feat: add project showcase section
fix: respect reduced motion in hero timeline
docs: document content model
```
