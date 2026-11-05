'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { Translations } from '@/lib/types';

/**
 * Square, ink-bordered: the only boxed control in the header, on purpose.
 * Both icons and both labels are in the markup and CSS picks by the `.dark`
 * class next-themes sets before paint, so there is no mounted-guard and
 * nothing changes on hydration.
 */
export function ThemeToggle({ labels }: { labels: Translations['theme'] }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-11 w-11 items-center justify-center border border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background"
    >
      {/* The label names the target theme: what a click switches to. */}
      <span className="sr-only dark:hidden">{labels.dark}</span>
      <span className="sr-only hidden dark:inline">{labels.light}</span>
      <Moon className="h-[18px] w-[18px] dark:hidden" strokeWidth={1.6} aria-hidden />
      <Sun className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.6} aria-hidden />
    </button>
  );
}
