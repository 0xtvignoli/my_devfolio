'use client';

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/duration';
import type { Locale } from '@/lib/types';

export type ExposedItem = {
  id: string;
  label: string;
  /** ms from opening to the first contact; null while nobody has come */
  ms: number | null;
  /** how long it has been open so far, for the ones still waiting */
  waitedMs: number;
  what: string;
  fix: string;
};
export type ExposedStrings = {
  pick: string;
  none: string;
  headline: string;
  allFound: string;
  someWaiting: string;
  oneWaiting: string;
  headlineOne: string;
  allWaiting: string;
  after: string;
  waitingAfter: string;
  fixesTitle: string;
};

/**
 * Pick what you would leave open; the timeline is what happened to my decoys, each from its own
 * opening, lined up at zero. The choice lives in the URL (?open=a,b) so a shared link tells the
 * same story; nothing leaves the page.
 */
export function ExposedSim({ items, initial, locale, t }: { items: ExposedItem[]; initial: string[]; locale: Locale; t: ExposedStrings }) {
  const [open, setOpen] = useState<string[]>(initial);
  const dur = (ms: number) => formatDuration(ms, locale);

  useEffect(() => {
    const ids = new URLSearchParams(location.search).get('open')?.split(',').filter((id) => items.some((i) => i.id === id));
    // The URL is only readable after mount; the server renders the default pick.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ids) setOpen(ids);
  }, [items]);

  const toggle = (id: string) => {
    const next = open.includes(id) ? open.filter((x) => x !== id) : [...open, id];
    setOpen(next);
    // Commas left as they are: ?open=github,port-redis reads better in a shared link than %2C.
    history.replaceState(null, '', `${location.pathname}?open=${next.join(',')}`);
  };

  const chosen = items.filter((i) => open.includes(i.id));
  const found = chosen.filter((i) => i.ms !== null).sort((a, b) => a.ms! - b.ms!);
  const waiting = chosen.filter((i) => i.ms === null);

  let headline = t.none;
  if (chosen.length === 1 && found.length) {
    headline = t.headlineOne.replace('{first}', dur(found[0].ms!));
  } else if (found.length) {
    headline = t.headline.replace('{n}', String(chosen.length)).replace('{first}', dur(found[0].ms!));
    headline +=
      ' ' +
      (waiting.length === 1
        ? t.oneWaiting
        : waiting.length
          ? t.someWaiting.replace('{k}', String(waiting.length))
          : t.allFound.replace('{last}', dur(found.at(-1)!.ms!)));
  } else if (waiting.length) {
    headline = t.allWaiting.replace('{d}', dur(Math.min(...waiting.map((w) => w.waitedMs))));
  }

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
      <fieldset>
        <legend className="mb-2 text-[13px] text-muted-foreground">{t.pick}</legend>
        {items.map((i) => (
          <label key={i.id} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-border py-2.5 text-[15px]">
            <input type="checkbox" checked={open.includes(i.id)} onChange={() => toggle(i.id)} className="size-4 shrink-0 accent-foreground" />
            <span>{i.label}</span>
          </label>
        ))}
      </fieldset>

      <div aria-live="polite">
        <p className="font-serif text-[26px] leading-snug sm:text-[30px]">{headline}</p>
        {chosen.length > 0 && (
          <ol className="relative mt-8 border-l border-border pl-6">
            {[...found, ...waiting].map((i) => (
              <li key={i.id} className="relative pb-6">
                <span aria-hidden className={i.ms === null ? 'absolute -left-[31px] top-1.5 size-2.5 rounded-full border border-dashed border-muted-foreground bg-background' : 'absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-link ring-4 ring-background'} />
                <p className="font-mono text-[13px] text-link">
                  {i.ms === null ? t.waitingAfter.replace('{d}', dur(i.waitedMs)) : t.after.replace('{d}', dur(i.ms))}
                </p>
                <p className="mt-0.5 font-medium">{i.label}</p>
                {i.ms !== null && <p className="mt-0.5 text-[15px] text-muted-foreground">{i.what}</p>}
              </li>
            ))}
          </ol>
        )}
        {chosen.length > 0 && (
          <div className="mt-2 bg-muted p-5">
            <p className="font-medium">{t.fixesTitle}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
              {chosen.map((i) => (
                <li key={i.id}>{i.fix}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
