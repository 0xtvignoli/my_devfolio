import Link from 'next/link';
import observatoryData from '@/data/observatory.json';
import { readDecoys } from '@/lib/decoys-data';
import { formatDate } from '@/lib/format-date';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { compare } from '@/lib/observatory/compare';
import type { Observatory } from '@/lib/observatory/types';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Both files are written at build (daily rebuild), so the page is too.
export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).compare;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab/compare', locale });
}

/** One side of a row: the bar is scaled to the row's larger number, so each row shows its own ratio. */
function Bar({ n, max, side, nf }: { n: number; max: number; side: 'site' | 'decoy'; nf: Intl.NumberFormat }) {
  const width = max ? Math.max(n ? 2 : 0, (n / max) * 100) : 0;
  return (
    <span className={side === 'site' ? 'flex flex-row-reverse items-center justify-end gap-2 sm:flex-row' : 'flex items-center gap-2'}>
      {side === 'site' && <span className="font-mono text-[13px] text-muted-foreground">{nf.format(n)}</span>}
      <span className={side === 'site' ? 'flex h-2 w-full max-w-[160px] sm:justify-end' : 'flex h-2 w-full max-w-[160px]'}>
        <span className={side === 'site' ? 'h-2 bg-foreground' : 'h-2 bg-link'} style={{ width: `${width}%` }} />
      </span>
      {side === 'decoy' && <span className="font-mono text-[13px] text-muted-foreground">{nf.format(n)}</span>}
    </span>
  );
}

export default async function ComparePage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  const c = t.compare;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const data = compare(observatoryData as Observatory, readDecoys());
  const total = (side: 'site' | 'decoy') => (data ? data.rows.reduce((s, r) => s + r[side], 0) : 0);
  const secrets = data?.rows.find((r) => r.category === 'secrets');

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{c.kicker}</p>
      <h1 className="max-w-[860px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{c.title}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{c.intro}</p>

      {!data ? (
        <p className="mt-12 max-w-[680px] bg-muted p-6 text-[17px]">{c.empty}</p>
      ) : (
        <>
          <div className="mt-12 bg-muted p-6 sm:p-8">
            <p className="max-w-[820px] font-serif text-[22px] leading-snug sm:text-[26px]">
              {c.headline
                .replace('{d}', String(data.days))
                .replace('{decoy}', nf.format(total('decoy')))
                .replace('{ssh}', nf.format(data.ssh))
                .replace('{site}', nf.format(total('site')))}
            </p>
            {secrets && (
              <p className="mt-3 text-muted-foreground">
                {c.secretsLine.replace('{site}', nf.format(secrets.site)).replace('{decoy}', nf.format(secrets.decoy))}
              </p>
            )}
          </div>

          <section aria-label={c.title} className="mt-12">
            {/* A list, not a table: on a phone the two sides stack under the category instead of scrolling off. */}
            <p className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-2"><span aria-hidden className="h-2 w-4 bg-foreground" />{c.colSite}</span>
              <span className="flex items-center gap-2"><span aria-hidden className="h-2 w-4 bg-link" />{c.colDecoy}</span>
            </p>
            <dl className="mt-4 border-t border-foreground">
              {[...data.rows.map((r) => ({ key: r.category, label: t.lab.categories[r.category], site: r.site as number | null, decoy: r.decoy })), { key: 'ssh', label: c.ssh, site: null, decoy: data.ssh }].map((r) => (
                <div key={r.key} className="grid gap-x-4 gap-y-1.5 border-b border-border py-3 sm:grid-cols-[minmax(0,1fr)_36%_36%] sm:items-center">
                  <dt>{r.label}</dt>
                  <dd className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 sm:block">
                    <span className="text-[13px] text-muted-foreground sm:sr-only">{c.siteShort}</span>
                    {r.site === null ? (
                      <span className="font-mono text-[13px] text-muted-foreground sm:block sm:text-right">{c.sshClosed}</span>
                    ) : (
                      <Bar n={r.site} max={Math.max(r.site, r.decoy)} side="site" nf={nf} />
                    )}
                  </dd>
                  <dd className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 sm:block">
                    <span className="text-[13px] text-muted-foreground sm:sr-only">{c.decoyShort}</span>
                    <Bar n={r.decoy} max={Math.max(r.site ?? 0, r.decoy)} side="decoy" nf={nf} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 max-w-[760px] text-sm text-muted-foreground">
              {c.window.replace('{from}', formatDate(data.from, locale)).replace('{to}', formatDate(data.to, locale))}
            </p>
          </section>
        </>
      )}

      <section className="mt-16 grid gap-x-14 gap-y-10 sm:grid-cols-2">
        {[
          { title: c.whyTitle, items: c.why },
          { title: c.howTitle, items: c.how },
        ].map((block) => (
          <div key={block.title}>
            <h2 className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{block.title}</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">
              {block.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-12">
        <Link className="text-link underline-offset-4 hover:underline" href={localizedPath(locale, '/lab')}>
          {c.back}
        </Link>
      </p>
    </div>
  );
}
