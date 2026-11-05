import { formatDate } from '@/lib/format-date';
import { biggestMover, type Trend } from '@/lib/observatory/trends';
import type { Locale, Translations } from '@/lib/types';

const W = 140;
const H = 32;

function points(series: number[]): string {
  const max = Math.max(...series, 1);
  const step = W / Math.max(series.length - 1, 1);
  return series.map((v, i) => `${(i * step).toFixed(1)},${(H - 2 - (v / max) * (H - 4)).toFixed(1)}`).join(' ');
}

/** ▲/▼/■ plus a sign: direction never rests on colour alone. */
function delta(change: number | null): string {
  if (change === null) return '—';
  const pct = Math.round(change * 100);
  if (pct === 0) return '■ 0%';
  return pct > 0 ? `▲ +${pct}%` : `▼ −${Math.abs(pct)}%`;
}

/** "tripled", "rose 4×", "fell 30%" — the sentence the build writes from the biggest mover. */
function headline(t: Trend, labels: Translations['lab']['trends'], locale: Locale): string {
  const ratio = t.change! + 1;
  const verb =
    ratio >= 3.5
      ? labels.verbTimes.replace('{n}', String(Math.round(ratio)))
      : ratio >= 2.5
        ? labels.verbTripled
        : ratio >= 1.8
          ? labels.verbDoubled
          : t.change! >= 0
            ? labels.verbRose.replace('{p}', String(Math.round(t.change! * 100)))
            : labels.verbFell.replace('{p}', String(Math.round(-t.change! * 100)));
  const peak = t.peak.share >= 0.5 ? labels.peak.replace('{date}', formatDate(t.peak.date, locale)) : '';
  return labels.sentence.replace('{what}', labels.subjects[t.category]).replace('{verb}', verb).replace('{peak}', peak);
}

export function Trends({ trends, locale, t }: { trends: Trend[]; locale: Locale; t: Translations['lab'] }) {
  if (!trends.length) return null;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const mover = biggestMover(trends);
  const shown = trends.filter((x) => x.total > 0);

  return (
    <>
      {mover && (
        <p className="mb-8 bg-muted px-5 py-4 font-serif text-xl leading-snug sm:px-6 sm:text-2xl">{headline(mover, t.trends, locale)}</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-x-16">
        {shown.map((trend) => {
          const label = t.categories[trend.category];
          return (
            <div key={trend.category} className="grid grid-cols-[minmax(0,1fr)_auto_76px] items-center gap-4 border-b border-border py-4">
              <div className="min-w-0">
                <p className="text-[15px]">{label}</p>
                <p className="font-mono text-[13px] text-muted-foreground">
                  {nf.format(trend.total)} {t.trends.inDays.replace('{n}', String(trend.series.length))}
                </p>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${label}: ${delta(trend.change)}`} className="hidden sm:block">
                <polyline points={points(trend.series)} fill="none" className="stroke-link" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <p className={`text-right font-mono text-sm ${trend.change !== null && trend.change > 0.005 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {delta(trend.change)}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{t.trends.note}</p>
    </>
  );
}
