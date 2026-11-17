# MD2PDF

[English](README.md) | **Português (Brasil)**

Converta arquivos Markdown (`.md`) em PDF direto no navegador. Privado, rápido e sem uploads: seus documentos nunca saem do seu computador.

[![CI](https://github.com/vicleme/md2pdf-web/actions/workflows/ci.yml/badge.svg)](https://github.com/vicleme/md2pdf-web/actions/workflows/ci.yml)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)](LICENSE)

## Funcionalidades

- Abra um arquivo `.md` (botão ou arrastar e soltar) ou apenas digite/cole o Markdown
- Pré-visualização em tempo real, idêntica ao PDF
- GitHub Flavored Markdown: tabelas, listas de tarefas, tachado, blocos de código
- Front matter YAML opcional é ignorado
- Opções do PDF: tamanho da página (A4, Carta, Ofício), orientação, margens, tamanho da fonte e estilo (limpo ou acadêmico)
- Dois modos de exportação:
  - **Baixar PDF**: gera o arquivo diretamente (o texto vira imagem)
  - **Imprimir / Salvar como PDF**: usa a janela de impressão do navegador (texto selecionável, arquivos menores)
- Interface em inglês e português do Brasil, detectada automaticamente e lembrada
- Interface clara, escura ou do sistema (a escolha fica salva), layout responsivo
- **Cores do documento** claras ou escuras, independentes do tema da interface. Funciona na pré-visualização, em **Baixar PDF** e em **Imprimir / Salvar como PDF**
- 100% no navegador. Sem servidor, sem rastreamento, sem uploads
- O HTML gerado a partir do Markdown é sanitizado (DOMPurify) antes de chegar à página ou ao PDF

## Como começar

Requisitos: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
git clone https://github.com/vicleme/md2pdf-web.git
cd md2pdf-web
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).

### Scripts

| Comando           | O que faz                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Inicia o servidor de desenvolvimento       |
| `npm run build`   | Gera a versão de produção em `dist/`       |
| `npm run preview` | Serve a versão de produção localmente      |
| `npm test`        | Roda os testes unitários (Node test runner) |

## Estrutura do projeto

```text
md2pdf-web/
├── index.html              # Estrutura da página
├── public/favicon.svg
├── src/
│   ├── main.js             # Ponto de entrada
│   ├── ui/
│   │   └── app.js          # Ligação com o DOM (eventos, estado, renderização)
│   ├── modules/            # Lógica pura e testável
│   │   ├── markdown.js     # Markdown -> HTML (marked) + front matter
│   │   ├── sanitize.js     # Sanitização do HTML (DOMPurify)
│   │   ├── theme.js        # Aparência da interface (sistema / claro / escuro)
│   │   ├── options.js      # Opções do PDF, validação e config do html2pdf
│   │   ├── pdf.js          # Exportação HTML -> PDF (html2pdf.js, carga sob demanda)
│   │   ├── files.js        # Validação de arquivos, nome do PDF, extração do título
│   │   ├── i18n.js         # Mensagens en / pt-BR e detecção de idioma
│   │   ├── storage.js      # Wrapper seguro do localStorage
│   │   └── utils.js        # debounce, countWords
│   ├── samples/            # Documentos de exemplo (en, pt-BR)
│   └── styles/
│       ├── main.css        # Interface do app
│       └── document.css    # Documento renderizado (preview e PDF)
├── tests/                  # node --test
└── .github/workflows/      # CI e deploy no GitHub Pages
```

## Publicando no GitHub Pages

1. Envie o repositório para o GitHub.
2. Vá em **Settings > Pages** e defina **Source** como **GitHub Actions**.
3. Faça push na `main`. O workflow em `.github/workflows/deploy.yml` gera o build e publica o site.

O build usa caminhos relativos, então também funciona na Netlify, Vercel, Cloudflare Pages ou qualquer hospedagem estática.

## Bom saber

- **Baixar PDF** captura a página renderizada como imagens, por isso o texto não é selecionável e os arquivos podem ser maiores. Para texto selecionável, use **Imprimir / Salvar como PDF** e escolha "Salvar como PDF" como destino.
- Imagens remotas no Markdown precisam permitir requisições entre origens (CORS) para aparecer no PDF baixado.
- Documentos escuros ficam ótimos na tela, mas gastam muita tinta no papel. Por isso o padrão é claro.
- Ao imprimir um documento escuro pela janela do navegador, ative **Gráficos de plano de fundo** se o navegador pedir.
- Documentos muito longos podem levar alguns segundos para serem gerados.

## Contribuindo

Issues e pull requests são bem-vindos. Veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

Distribuído sob a [Licença MIT](LICENSE).
