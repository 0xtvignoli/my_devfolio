import type { Article, Locale } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from './constants';

/** XML text escape — feed readers are strict, and article copy contains & and quotes. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildRssFeed(articles: Article[], locale: Locale): string {
  const feedPath = localizedPath(locale, '/feed.xml');
  const items = articles.map((article) => {
    const url = `${SITE_URL}${localizedPath(locale, `/articles/${article.slug}`)}`;
    return [
      '    <item>',
      `      <title>${escapeXml(article.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${new Date(article.date).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(article.description)}</description>`,
      `      <dc:creator>${escapeXml(article.author)}</dc:creator>`,
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${SITE_URL}${localizedPath(locale, '/articles')}</link>`,
    `    <description>${escapeXml(
      locale === 'it'
        ? `Articoli tecnici su DevOps, Kubernetes, cloud e SRE di ${AUTHOR_NAME}.`
        : `Technical articles on DevOps, Kubernetes, cloud and SRE by ${AUTHOR_NAME}.`
    )}</description>`,
    `    <language>${locale}</language>`,
    `    <atom:link href="${SITE_URL}${feedPath}" rel="self" type="application/rss+xml" />`,
    ...(articles[0] ? [`    <lastBuildDate>${new Date(articles[0].date).toUTCString()}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
