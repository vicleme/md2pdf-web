# Contributing / Contribuindo

Thanks for your interest! / Obrigado pelo interesse!

## Setup

```bash
npm install
npm run dev
npm test
```

## Guidelines / Diretrizes

- Keep logic in `src/modules/` as small, pure functions with tests in `tests/`. / Mantenha a lógica em `src/modules/` como funções pequenas e puras, com testes em `tests/`.
- DOM code lives only in `src/ui/`. / Código de DOM fica apenas em `src/ui/`.
- New interface text must be added to **both** languages in `src/modules/i18n.js` (a test checks this). / Todo texto novo da interface deve ser adicionado nos **dois** idiomas em `src/modules/i18n.js` (um teste verifica isso).
- Run `npm test` and `npm run build` before opening a pull request. / Rode `npm test` e `npm run build` antes de abrir um pull request.
- Use clear commit messages. / Use mensagens de commit claras.

## Reporting bugs / Reportando bugs

Open an issue with the steps to reproduce, your browser and, if possible, a minimal `.md` file that shows the problem. / Abra uma issue com os passos para reproduzir, seu navegador e, se possível, um arquivo `.md` mínimo que mostre o problema.
