'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  text: string;
}

/**
 * Highlights the section being read. A heading counts as current once it has
 * crossed the top third of the viewport; the last one crossed wins.
 */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const update = () => {
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    // rAF-throttled: one measurement per frame at most.
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);
  return active;
}

function TocList({ items, active }: { items: TocItem[]; active: string | null }) {
  return (
    <ol className="border-l border-border">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? 'location' : undefined}
            className={cn(
              '-ml-px block border-l-2 py-1.5 pl-3.5 leading-snug',
              active === item.id
                ? 'border-link text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

const labelClass = 'mb-3 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground';

/** Desktop: sticky side column. */
export function ArticleToc({ items, label }: { items: TocItem[]; label: string }) {
  const active = useActiveHeading(items.map((i) => i.id));
  return (
    <nav aria-label={label} className="sticky top-8 text-sm">
      <p className={labelClass}>{label}</p>
      <TocList items={items} active={active} />
    </nav>
  );
}

/** Phone and tablet: a closed disclosure under the title. Native <details>, no JS needed. */
export function ArticleTocDisclosure({ items, label }: { items: TocItem[]; label: string }) {
  return (
    <details className="group mt-6 border-b border-border pb-1 text-[15px]">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[13px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
        <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
      </summary>
      <nav aria-label={label} className="pb-3">
        <TocList items={items} active={null} />
      </nav>
    </details>
  );
}

/**
 * Thin cobalt bar across the top of the window: how far through the article
 * body the reader is. Decorative, so hidden from assistive tech.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let frame = 0;
    const update = () => {
      const { top, height } = el.getBoundingClientRect();
      const span = height - window.innerHeight;
      setProgress(span <= 0 ? 1 : Math.min(1, Math.max(0, -top / span)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetId]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div className="h-full origin-left bg-link" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
