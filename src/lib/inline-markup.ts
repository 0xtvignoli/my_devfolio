/**
 * The two inline marks technical prose actually needs: links and code spans.
 * Deliberately not a markdown parser — article content is authored in
 * src/data/content/articles.ts, so this covers `code` and [text](href) and
 * leaves everything else as literal text.
 *
 * ponytail: if articles ever need emphasis, tables or footnotes, that's the
 * signal to move the content to MDX rather than grow this.
 */

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; value: string; href: string };

// [label](href) where href is absolute http(s) or root-relative — anything else
// (javascript:, data:, mailto with tricks) is left as plain text on purpose.
const INLINE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|`([^`\n]+)`/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index;
    if (start > cursor) tokens.push({ type: 'text', value: text.slice(cursor, start) });

    const [full, linkLabel, href, code] = match;
    if (code !== undefined) {
      tokens.push({ type: 'code', value: code });
    } else {
      tokens.push({ type: 'link', value: linkLabel, href });
    }
    cursor = start + full.length;
  }

  if (cursor < text.length) tokens.push({ type: 'text', value: text.slice(cursor) });
  return tokens;
}
