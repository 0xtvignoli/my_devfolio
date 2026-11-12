'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { formatDuration } from '@/lib/duration';
import type { Locale } from '@/lib/types';

export type GuessRow = { id: string; label: string; /** ms to first use; null while still waiting */ realMs: number | null; waitedMs: number };
export type GuessStrings = {
  title: string;
  intro: string;
  reveal: string;
  skip: string;
  you: string;
  real: string;
  waiting: string;
  summaryFaster: string;
  summarySlower: string;
  summaryClose: string;
  again: string;
};

const MONTH_MIN = 30 * 24 * 60;
const STORE = 'lab:canary-guess';
/** Slider 0–100 ↔ minutes, log scale 1 min → 30 days: a minute and a day are equally easy to pick. */
const toMs = (v: number) => Math.exp((v / 100) * Math.log(MONTH_MIN)) * 60_000;
const toPos = (ms: number) => Math.min(100, Math.max(0, (Math.log(Math.max(1, ms / 60_000)) / Math.log(MONTH_MIN)) * 100));

/**
 * Hides the answer (children) until the visitor has guessed. Guesses stay in this browser
 * (localStorage): a returning visitor sees the answer and their old guess. Without JS the
 * <noscript> rule shows the answer straight away.
 */
export function GuessGate({ rows, locale, t, children }: { rows: GuessRow[]; locale: Locale; t: GuessStrings; children: ReactNode }) {
  const [guess, setGuess] = useState<Record<string, number>>(() => Object.fromEntries(rows.map((r) => [r.id, 50])));
  const [phase, setPhase] = useState<'guess' | 'revealed' | 'skipped'>('guess');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null') as { guess?: Record<string, number>; phase?: string } | null;
      if (saved?.phase === 'revealed' && saved.guess) {
        // Hydrating from storage after mount: the server can't know what this browser kept.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGuess((g) => ({ ...g, ...saved.guess }));
        setPhase('revealed');
      } else if (saved?.phase === 'skipped') setPhase('skipped');
    } catch {
      // private window or blocked storage: the visitor just guesses again
    }
  }, []);

  const done = (next: 'revealed' | 'skipped') => {
    setPhase(next);
    try {
      localStorage.setItem(STORE, JSON.stringify({ phase: next, guess }));
    } catch {
      // nothing to keep
    }
  };
  const dur = (ms: number) => formatDuration(ms, locale);

  // The used key where the guess was furthest off, as a factor.
  const off = rows
    .filter((r) => r.realMs !== null)
    .map((r) => ({ r, mine: toMs(guess[r.id]), k: toMs(guess[r.id]) / Math.max(60_000, r.realMs!) }))
    .sort((a, b) => Math.abs(Math.log(b.k)) - Math.abs(Math.log(a.k)))[0];
  const summary =
    off &&
    (off.k >= 2 ? t.summaryFaster : off.k <= 0.5 ? t.summarySlower : t.summaryClose)
      .replace('{where}', off.r.label)
      .replace('{guess}', dur(off.mine))
      .replace('{real}', dur(off.r.realMs!))
      .replace('{k}', new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB').format(Math.round(off.k >= 1 ? off.k : 1 / off.k)));

  return (
    <>
      <noscript>
        <style>{'[data-guess-gate]{display:none!important}[data-guess-answer]{display:block!important}'}</style>
      </noscript>

      {phase === 'guess' && (
        <section data-guess-gate aria-labelledby="guess-heading" className="mt-12 border-t border-foreground pt-5">
          <h2 id="guess-heading" className="font-serif text-[26px] font-medium">{t.title}</h2>
          <p className="mt-2 max-w-[680px] text-muted-foreground">{t.intro}</p>
          <ul className="mt-6 max-w-[760px]">
            {rows.map((r) => (
              <li key={r.id} className="border-b border-border py-3">
                <label className="flex items-baseline justify-between gap-4 text-[15px]">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-mono text-[13px] text-muted-foreground">
                    {t.you}: {dur(toMs(guess[r.id]))}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={guess[r.id]}
                  aria-label={r.label}
                  aria-valuetext={dur(toMs(guess[r.id]))}
                  onChange={(e) => setGuess((g) => ({ ...g, [r.id]: Number(e.target.value) }))}
                  className="mt-3 h-6 w-full accent-foreground"
                />
              </li>
            ))}
          </ul>
          <div className="mt-1 flex max-w-[760px] justify-between font-mono text-[11px] text-muted-foreground" aria-hidden>
            <span>1 min</span>
            <span>1 h</span>
            <span>1 {locale === 'it' ? 'giorno' : 'day'}</span>
            <span>30 {locale === 'it' ? 'giorni' : 'days'}</span>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" onClick={() => done('revealed')} className="min-h-11 bg-foreground px-5 text-[15px] font-medium text-background hover:opacity-90">
              {t.reveal}
            </button>
            <button type="button" onClick={() => done('skipped')} className="min-h-11 text-[15px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {t.skip}
            </button>
          </p>
        </section>
      )}

      {phase === 'revealed' && (
        <section aria-live="polite" className="mt-12 border-t border-foreground pt-5">
          {summary && <p className="max-w-[760px] font-serif text-[24px] leading-snug sm:text-[28px]">{summary}</p>}
          <ul className="mt-5 max-w-[760px]">
            {rows.map((r) => {
              const me = toPos(toMs(guess[r.id]));
              const re = r.realMs === null ? null : toPos(r.realMs);
              return (
                <li key={r.id} className="border-b border-border py-2.5">
                  <div className="flex flex-wrap justify-between gap-x-4 text-[14px]">
                    <span>{r.label}</span>
                    <span className="font-mono text-[12px] text-muted-foreground">
                      {t.you} {dur(toMs(guess[r.id]))} · {t.real} {r.realMs === null ? t.waiting.replace('{d}', dur(r.waitedMs)) : dur(r.realMs)}
                    </span>
                  </div>
                  <div aria-hidden className="relative mt-2 h-3.5">
                    <span className="absolute inset-x-0 top-1.5 h-0.5 bg-border" />
                    {re !== null && <span className="absolute top-1.5 h-0.5 bg-link" style={{ left: `${Math.min(me, re)}%`, width: `${Math.abs(me - re)}%` }} />}
                    <span className="absolute top-0.5 -ml-1.5 size-3 rounded-full border-2 border-foreground bg-background" style={{ left: `${me}%` }} />
                    {re !== null && <span className="absolute top-0.5 -ml-1.5 size-3 rounded-full bg-link" style={{ left: `${re}%` }} />}
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setPhase('guess')} className="mt-3 min-h-11 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {t.again}
          </button>
        </section>
      )}

      <div data-guess-answer className={phase === 'guess' ? 'hidden' : undefined}>
        {children}
      </div>
    </>
  );
}
