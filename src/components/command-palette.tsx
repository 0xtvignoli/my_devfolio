'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { Translations } from '@/lib/types';

export interface PaletteEntry {
  group: 'pages' | 'articles' | 'projects';
  title: string;
  href: string;
}

type Item =
  | (PaletteEntry & { kind: 'link' })
  | { kind: 'action'; group: 'commands'; title: string; hint: string; run: () => void };

const normalize = (query: string) => query.toLowerCase().replace(/^cd\s+/, '').trim();

/** Subsequence match: "fkc" finds "FinOps for Kubernetes: Cutting…". */
export function fuzzyMatch(query: string, text: string): boolean {
  const q = normalize(query).replace(/\s+/g, '');
  const t = text.toLowerCase();
  let i = 0;
  for (const ch of t) if (ch === q[i]) i++;
  return i === q.length;
}

/**
 * Plain substring matches when there are any; the loose subsequence match
 * only as a fallback, or "finops" would also list "…with GitOps".
 */
export function search<T extends { title: string }>(query: string, items: T[]): T[] {
  const q = normalize(query);
  if (!q) return items;
  const exact = items.filter((item) => item.title.toLowerCase().includes(q));
  return exact.length ? exact : items.filter((item) => fuzzyMatch(q, item.title));
}

/**
 * ⌘K / Ctrl+K / "/" opens a native <dialog>: jump to any page, article or
 * project, plus a few commands. The contact command goes to the contact
 * section instead of carrying the address — the address stays in server HTML
 * only, where Cloudflare's obfuscation reaches it.
 */
export function CommandPalette({ entries, t, otherLocaleHref }: { entries: PaletteEntry[]; t: Translations['palette']; otherLocaleHref: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const router = useRouter();
  const { setTheme } = useTheme();
  const listId = useId();

  const open = useCallback(() => {
    setQuery('');
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
  }, []);
  const close = () => dialog.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const commands: Item[] = [
      { kind: 'action', group: 'commands', title: 'theme dark', hint: t.themeHint, run: () => setTheme('dark') },
      { kind: 'action', group: 'commands', title: 'theme light', hint: t.themeHint, run: () => setTheme('light') },
      { kind: 'action', group: 'commands', title: 'theme system', hint: t.themeHint, run: () => setTheme('system') },
      { kind: 'action', group: 'commands', title: 'lang', hint: t.langHint, run: () => router.push(otherLocaleHref) },
      { kind: 'action', group: 'commands', title: 'mail', hint: t.mailHint, run: () => router.push(entries[0]?.href ? `${entries[0].href}#contact` : '#contact') },
    ];
    const all: Item[] = [...entries.map((e) => ({ ...e, kind: 'link' as const })), ...commands];
    return search(query, all);
  }, [entries, query, t, setTheme, router, otherLocaleHref]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    close();
    if (item.kind === 'link') router.push(item.href);
    else item.run();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (items.length ? (a + step + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(items[active]);
    }
  };

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t.open}
        className="hidden min-h-11 items-center border border-border px-2 font-mono text-xs text-muted-foreground hover:border-foreground hover:text-foreground sm:inline-flex"
      >
        ⌘K
      </button>
      <dialog
        ref={dialog}
        aria-label={t.label}
        onClick={(e) => e.target === dialog.current && close()}
        className="m-0 mx-auto mt-[12vh] w-[min(640px,calc(100vw-32px))] border border-foreground bg-background p-0 font-mono text-foreground backdrop:bg-[rgb(17_17_17/0.35)]"
      >
        <label className="flex items-center gap-2.5 border-b border-border px-5 py-4 text-base">
          <span aria-hidden className="text-link">~/</span>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder={t.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[active] ? optionId(active) : undefined}
            aria-label={t.label}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <kbd className="border border-border px-1.5 py-0.5 text-xs text-muted-foreground">esc</kbd>
        </label>
        <ul id={listId} role="listbox" aria-label={t.label} className="max-h-[50vh] overflow-y-auto py-2 text-sm">
          {items.length === 0 && <li className="px-5 py-3 text-muted-foreground">{t.empty}</li>}
          {items.map((item, i) => {
            const heading = i === 0 || items[i - 1].group !== item.group;
            return (
              <li key={`${item.group}-${item.title}`} role="presentation">
                {heading && (
                  <p aria-hidden className="px-5 pb-1.5 pt-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {t.groups[item.group]}
                  </p>
                )}
                <div
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(item)}
                  className={`flex cursor-pointer justify-between gap-4 border-l-2 px-5 py-2.5 ${i === active ? 'border-link bg-muted' : 'border-transparent'}`}
                >
                  <span className="min-w-0 truncate">
                    {item.kind === 'link' && <span className="text-link">cd </span>}
                    {item.title}
                    {item.kind === 'action' && <span className="text-muted-foreground"> · {item.hint}</span>}
                  </span>
                  {i === active && <span aria-hidden className="text-muted-foreground">↵</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="flex gap-5 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
          <span>↑↓ {t.move}</span>
          <span>↵ {t.openHint}</span>
          <span>⌘K · /</span>
        </p>
      </dialog>
    </>
  );
}
