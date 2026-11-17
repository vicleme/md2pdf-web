export const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
];

export const DEFAULT_LOCALE = 'en';

export const messages = {
  en: {
    appTitle: 'MD2PDF',
    tagline: 'Markdown to PDF, right in your browser. Nothing is uploaded.',
    language: 'Language',
    editorLabel: 'Markdown',
    previewLabel: 'Preview',
    placeholder: 'Type or paste Markdown here, or drop a .md file...',
    dropHint: 'Drop your .md file here',
    openFile: 'Open file',
    loadExample: 'Load example',
    clear: 'Clear',
    optionsTitle: 'PDF options',
    pageSize: 'Page size',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margin: 'Margin (mm)',
    fontSize: 'Font size (pt)',
    theme: 'Style',
    themeClean: 'Clean (sans-serif)',
    themeAcademic: 'Academic (serif)',
    appearance: 'Appearance',
    appearanceSystem: 'System',
    appearanceLight: 'Light',
    appearanceDark: 'Dark',
    colors: 'Document colors',
    colorsLight: 'Light',
    colorsDark: 'Dark',
    darkHint: 'Dark documents use a lot of ink when printed on paper.',
    downloadPdf: 'Download PDF',
    printPdf: 'Print / Save as PDF',
    printHint: 'Uses the browser print dialog. Keeps text selectable and the file small.',
    generating: 'Generating PDF...',
    done: 'PDF ready!',
    error: 'Could not generate the PDF. Please try again.',
    emptyContent: 'Add some Markdown first.',
    invalidFile: 'Please choose a Markdown (.md) or text file.',
    fileLoaded: 'Loaded {name}',
    stats: '{words} words, {chars} characters',
  },
  'pt-BR': {
    appTitle: 'MD2PDF',
    tagline: 'Markdown para PDF direto no navegador. Nada é enviado para servidores.',
    language: 'Idioma',
    editorLabel: 'Markdown',
    previewLabel: 'Pré-visualização',
    placeholder: 'Digite ou cole o Markdown aqui, ou solte um arquivo .md...',
    dropHint: 'Solte seu arquivo .md aqui',
    openFile: 'Abrir arquivo',
    loadExample: 'Carregar exemplo',
    clear: 'Limpar',
    optionsTitle: 'Opções do PDF',
    pageSize: 'Tamanho da página',
    orientation: 'Orientação',
    portrait: 'Retrato',
    landscape: 'Paisagem',
    margin: 'Margem (mm)',
    fontSize: 'Tamanho da fonte (pt)',
    theme: 'Estilo',
    themeClean: 'Limpo (sem serifa)',
    themeAcademic: 'Acadêmico (com serifa)',
    appearance: 'Aparência',
    appearanceSystem: 'Sistema',
    appearanceLight: 'Claro',
    appearanceDark: 'Escuro',
    colors: 'Cores do documento',
    colorsLight: 'Claro',
    colorsDark: 'Escuro',
    darkHint: 'Documentos escuros gastam muita tinta quando impressos em papel.',
    downloadPdf: 'Baixar PDF',
    printPdf: 'Imprimir / Salvar como PDF',
    printHint: 'Usa a janela de impressão do navegador. Mantém o texto selecionável e o arquivo leve.',
    generating: 'Gerando PDF...',
    done: 'PDF pronto!',
    error: 'Não foi possível gerar o PDF. Tente novamente.',
    emptyContent: 'Adicione algum Markdown primeiro.',
    invalidFile: 'Escolha um arquivo Markdown (.md) ou de texto.',
    fileLoaded: '{name} carregado',
    stats: '{words} palavras, {chars} caracteres',
  },
};

/** Picks the best supported locale from a navigator-like object. */
export function detectLocale(nav = globalThis.navigator) {
  const candidates = [...(nav?.languages ?? []), nav?.language].filter(Boolean);
  for (const lang of candidates) {
    const lower = String(lang).toLowerCase();
    if (lower === 'pt-br' || lower.startsWith('pt')) return 'pt-BR';
    if (lower.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function isSupportedLocale(code) {
  return code in messages;
}

/**
 * Looks up a message and fills {placeholders}. Falls back to English, then to the key.
 * @param {string} locale
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(locale, key, vars = {}) {
  const template = messages[locale]?.[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}
