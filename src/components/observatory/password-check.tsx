'use client';

import { useState } from 'react';
import type { PasswordHash } from '@/lib/decoys';
import type { Locale, Translations } from '@/lib/types';

type Result = { kind: 'tried'; n: number; rank: number } | { kind: 'not-tried' } | null;

async function shortHash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/**
 * Hashes the input in the browser and looks it up in the list the build already
 * put in the page. No request is made, nothing is stored or logged.
 */
export function PasswordCheck({ hashes, locale, t }: { hashes: PasswordHash[]; locale: Locale; t: Translations['passwords'] }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Result>(null);
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    const h = await shortHash(value);
    const i = hashes.findIndex((x) => x.h === h);
    setResult(i === -1 ? { kind: 'not-tried' } : { kind: 'tried', n: hashes[i].n, rank: i + 1 });
  };

  return (
    <div>
      <form onSubmit={check} className="flex flex-col gap-2.5 sm:flex-row sm:gap-0">
        <label htmlFor="pw" className="sr-only">
          {t.inputLabel}
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
          className="min-h-12 flex-1 border border-foreground bg-transparent px-4 font-mono text-base text-foreground"
        />
        <button type="submit" className="min-h-12 bg-foreground px-6 text-[15px] font-medium text-background hover:opacity-90">
          {t.check}
        </button>
      </form>
      <div aria-live="polite">
        {result && (
          <div className={`mt-4 border-l-[3px] bg-muted px-5 py-4 ${result.kind === 'tried' ? 'border-foreground' : 'border-border'}`}>
            <p className="font-serif text-[24px] leading-tight">
              {result.kind === 'tried'
                ? t.triedTitle.replace('{n}', nf.format(result.n))
                : t.notTriedTitle}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {result.kind === 'tried' ? t.triedDetail.replace('{rank}', String(result.rank)) : t.notTriedDetail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
