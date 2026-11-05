import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

/**
 * Build-time syntax highlighting. The theme emits CSS variables instead of
 * colours, so the palette lives in globals.css next to the other tokens and
 * flips with the light/dark class like everything else. Runs only in server
 * components: no highlighter ships to the browser.
 */
const theme = createCssVariablesTheme({ name: 'site', variablePrefix: '--code-', fontStyle: true });

const LANGS = ['bash', 'go', 'hcl', 'http', 'javascript', 'json', 'python', 'typescript', 'yaml'] as const;
const ALIASES: Record<string, string> = { ts: 'typescript', js: 'javascript', sh: 'bash', yml: 'yaml', terraform: 'hcl' };

let highlighter: Promise<Highlighter> | undefined;

export async function highlight(code: string, language: string): Promise<string> {
  highlighter ??= createHighlighter({ themes: [theme], langs: [...LANGS] });
  const lang = ALIASES[language] ?? language;
  const h = await highlighter;
  return h.codeToHtml(code, {
    lang: h.getLoadedLanguages().includes(lang) ? lang : 'text',
    theme: 'site',
  });
}
