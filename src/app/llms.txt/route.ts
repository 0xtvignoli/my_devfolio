import { getArticles } from '@/data/content/articles';
import { projects } from '@/data/content/projects';
import { localizedPath } from '@/lib/i18n/paths';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { AUTHOR_NAME, DEFAULT_DESCRIPTION, SITE_URL, SOCIAL_LINKS } from '@/lib/seo/constants';

// robots.txt allows AI *search* crawlers (training bots are blocked) — this is
// the curated map they get. Generated from the same data as the pages, so it
// can't drift.
export const dynamic = 'force-static';

const abs = (path: string) => `${SITE_URL}${path}`;

export function GET() {
  const locale = DEFAULT_LOCALE;
  const articles = getArticles(locale);

  const body = [
    `# ${AUTHOR_NAME}`,
    '',
    `> ${DEFAULT_DESCRIPTION}`,
    '',
    'Bilingual site (en/it): prefix any path with /en or /it.',
    '',
    '## Pages',
    '',
    `- [Home](${abs(localizedPath(locale))}): profile, skills, featured work.`,
    `- [Portfolio](${abs(localizedPath(locale, '/portfolio'))}): ${projects.length} engineering projects with outcome metrics.`,
    `- [Experience](${abs(localizedPath(locale, '/experience'))}): roles and timeline.`,
    `- [Articles](${abs(localizedPath(locale, '/articles'))}): ${articles.length} technical articles.`,
    `- [Lab](${abs(localizedPath(locale, '/lab'))}): security observatory — aggregated, daily-updated data on the probes and exploit attempts this site receives, and which defence stopped them; plus incident case studies.`,
    '',
    '## Feeds',
    '',
    `- [RSS (en)](${abs(localizedPath('en', '/feed.xml'))})`,
    `- [RSS (it)](${abs(localizedPath('it', '/feed.xml'))})`,
    '',
    '## Articles',
    '',
    ...articles.map(
      (a) => `- [${a.title}](${abs(localizedPath(locale, `/articles/${a.slug}`))}) — ${a.description}`
    ),
    '',
    '## Projects',
    '',
    ...projects.map((p) => `- ${p.title[locale]} [${p.tags.join(', ')}] — ${p.description[locale]}`),
    '',
    '## Contact',
    '',
    `- GitHub: ${SOCIAL_LINKS.github}`,
    `- LinkedIn: ${SOCIAL_LINKS.linkedin}`,
    '',
    '## Notes',
    '',
    '- The Observatory publishes aggregates only: no IP addresses, and request paths are reduced to fixed categories.',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
