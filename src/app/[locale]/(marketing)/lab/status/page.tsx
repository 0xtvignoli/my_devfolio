import observatoryData from '@/data/observatory.json';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Observatory } from '@/lib/observatory/types';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Re-checked on the first visit after 15 minutes; the GitHub call is cached for as long.
export const dynamic = 'force-static';
export const revalidate = 900;

const REPO = '0xtvignoli/my_devfolio';
const STALE_MS = 36 * 3600_000;

type Props = { params: Promise<{ locale: string }> };
type Mark = 'ok' | 'warn' | 'unknown';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  return createPageMetadata({ title: t.status.title, description: t.status.intro, path: '/lab/status', locale });
}

/** Commits on main that production does not have yet; null when GitHub cannot say. */
async function commitsBehindMain(sha: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/compare/${sha}...main`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const { ahead_by } = (await res.json()) as { ahead_by?: unknown };
    return typeof ahead_by === 'number' ? ahead_by : null;
  } catch {
    return null;
  }
}

/** Older than the daily refresh allows: the scheduled rebuild did not run. */
function isStale(iso: string): boolean {
  return Date.now() - Date.parse(iso) > STALE_MS;
}

export default async function StatusPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).status;
  const when = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Rome',
  });
  const sha = process.env.COMMIT_SHA ?? '';
  const built = process.env.BUILD_TIME ?? new Date().toISOString();
  const { generatedAt } = observatoryData as Observatory;
  const behind = sha ? await commitsBehindMain(sha) : null;
  const short = sha.slice(0, 7);
  const stale = isStale(generatedAt);

  const rows: { mark: Mark; label: string; detail: React.ReactNode; at?: string }[] = [
    {
      mark: sha ? 'ok' : 'unknown',
      label: t.deploy,
      detail: sha ? (
        <a className="text-link underline-offset-4 hover:underline" href={`https://github.com/${REPO}/commit/${sha}`}>
          {t.deployDetail.replace('{sha}', short)}
        </a>
      ) : (
        t.localBuild
      ),
      at: built,
    },
    {
      mark: behind === null ? 'unknown' : behind === 0 ? 'ok' : 'warn',
      label: t.vsMain,
      detail: !sha ? t.localBuild : behind === null ? t.unreachable : behind === 0 ? t.upToDate : t.behind.replace('{n}', String(behind)),
    },
    {
      mark: stale ? 'warn' : 'ok',
      label: t.data,
      detail: stale ? t.dataStale : t.dataFresh,
      at: generatedAt,
    },
  ];
  const symbol: Record<Mark, string> = { ok: '✓', warn: '!', unknown: '?' };

  return (
    <section className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.kicker}</p>
      <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-normal leading-[1.05] tracking-[-0.025em]">{t.title}</h1>
      <p className="mt-7 max-w-[680px] text-[19px] text-muted-foreground">{t.intro}</p>

      <dl className="mt-12 border-t border-foreground">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[26px_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-border py-4 sm:grid-cols-[26px_240px_minmax(0,1fr)_200px] sm:items-baseline"
          >
            <span aria-hidden="true" className="font-mono">{symbol[r.mark]}</span>
            <dt className="font-medium">
              {r.label} <span className="font-mono text-xs text-muted-foreground">· {t[r.mark]}</span>
            </dt>
            <dd className="col-start-2 text-[15px] text-muted-foreground sm:col-start-auto">{r.detail}</dd>
            <dd className="col-start-2 font-mono text-[13px] text-muted-foreground sm:col-start-auto sm:text-right">
              {r.at && <time dateTime={r.at}>{when.format(new Date(r.at))}</time>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">{t.legend}</p>
    </section>
  );
}
