import Link from 'next/link';
import type { ReactNode } from 'react';
import { BarList } from '@/components/observatory/bar-list';
import { DECOY_OPENED } from '@/data/decoy-ports';
import { AI_CALLS, AI_KEYS, AI_MODELS, AI_SIZES } from '@/lib/decoys';
import { readDecoys } from '@/lib/decoys-data';
import { formatDuration } from '@/lib/duration';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// decoys.json is written at build (daily rebuild), so the page is too.
export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).aiDecoy;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab/decoys/ai', locale });
}

// What the decoy answers, from homelab decoys/configurations/services/http-11434.yaml (shortened).
const ANSWER = `GET /api/tags
{"models":[{"name":"llama3:8b"},
           {"name":"deepseek-r1:14b"},
           {"name":"qwen2.5:7b"}]}

POST /api/generate
503 {"error":"server busy, please try again.
     maximum pending requests exceeded"}`;

function H2({ children }: { children: ReactNode }) {
  return <h2 className="border-t border-foreground pt-5 font-serif text-[26px] font-medium">{children}</h2>;
}

export default async function AiDecoyPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  const c = t.aiDecoy;
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const pct = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', { style: 'percent', maximumFractionDigits: 0 });
  const ai = readDecoys()?.ai;
  const opened = DECOY_OPENED.ai;
  // eslint-disable-next-line react-hooks/purity -- build-time render
  const now = Date.now();
  const firstAfter = opened && ai?.firstAt ? Date.parse(ai.firstAt) - Date.parse(opened) : null;
  const sum = (o: Partial<Record<string, number>>) => Object.values(o).reduce<number>((s, n) => s + (n ?? 0), 0);
  const list = <K extends string>(vocab: readonly K[], counts: Partial<Record<K, number>>, label: (k: K) => string, mono = false) =>
    vocab.filter((k) => counts[k]).map((k) => ({ label: label(k), count: counts[k]!, mono })).sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{c.kicker}</p>
      <h1 className="max-w-[860px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{c.title}</h1>
      <p className="mt-6 max-w-[680px] text-[19px] text-muted-foreground">{c.intro}</p>

      {!opened || !ai?.requests ? (
        <p className="mt-12 max-w-[680px] bg-muted p-6 text-[17px]">
          {!opened ? c.notOpen : c.noVisits.replace('{d}', formatDuration(now - Date.parse(opened), locale))}
        </p>
      ) : (
        <>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 border-y border-y-border border-t-foreground sm:grid-cols-4">
            {[
              { label: c.stats.requests, value: nf.format(ai.requests) },
              { label: c.stats.first, value: firstAfter === null ? c.waiting : formatDuration(Math.max(0, firstAfter), locale) },
              { label: c.stats.generate, value: pct.format((ai.calls.generate ?? 0) / ai.requests) },
              { label: c.stats.keys, value: pct.format(sum(ai.keys) / ai.requests) },
            ].map((s) => (
              <div key={s.label} className="flex flex-col py-5">
                <dt className="order-2 mt-1 text-sm text-muted-foreground">{s.label}</dt>
                <dd className="order-1 font-serif text-[30px] leading-tight sm:text-[40px]">{s.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-14 grid gap-x-14 gap-y-12 sm:grid-cols-2">
            <div>
              <H2>{c.callsTitle}</H2>
              <div className="mt-5">
                <BarList items={list(AI_CALLS, ai.calls, (k) => c.calls[k])} locale={locale} />
              </div>
            </div>
            <div>
              <H2>{c.modelsTitle}</H2>
              <p className="mt-3 text-sm text-muted-foreground">{c.modelsNote}</p>
              <div className="mt-5">
                {sum(ai.models) ? (
                  <BarList items={list(AI_MODELS, ai.models, (k) => (k === 'other' ? c.calls.other : k), true)} locale={locale} showAll={t.lab.showAll} />
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </div>
            </div>
            <div>
              <H2>{c.sizesTitle}</H2>
              <div className="mt-5">
                {sum(ai.sizes) ? <BarList items={list(AI_SIZES, ai.sizes, (k) => c.sizes[k])} locale={locale} /> : <p className="text-muted-foreground">—</p>}
              </div>
            </div>
            <div>
              <H2>{c.keysTitle}</H2>
              <p className="mt-3 text-sm text-muted-foreground">{c.keysNote}</p>
              <div className="mt-5">
                {sum(ai.keys) ? <BarList items={list(AI_KEYS, ai.keys, (k) => c.keys[k])} locale={locale} /> : <p className="text-muted-foreground">—</p>}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="mt-16 grid gap-x-14 gap-y-12 sm:grid-cols-2">
        <div className="min-w-0">
          <H2>{c.answerTitle}</H2>
          <pre className="mt-5 overflow-x-auto bg-muted p-5 font-mono text-[13px] leading-relaxed">{ANSWER}</pre>
        </div>
        <div>
          <H2>{c.neverTitle}</H2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-muted-foreground">
            {c.never.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-12 max-w-[760px] bg-muted p-5 text-sm text-muted-foreground">{c.note}</p>

      <p className="mt-12">
        <Link className="text-link underline-offset-4 hover:underline" href={localizedPath(locale, '/lab')}>
          {c.back}
        </Link>
      </p>
    </div>
  );
}
