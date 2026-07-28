'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildPermalink } from '@/lib/lab-permalink';
import type { Translations } from '@/lib/types';

type PermalinkButtonProps = {
  translations: Translations;
  /** Reads the terminal's own command log at click time. */
  getCommands: () => string[];
  labPath: string;
};

/**
 * Copies a link that replays this session. Same mechanism as the existing
 * `?cmd=` deep link, just plural — so a shared link shows the recipient the
 * exact demo the visitor ran, not the default landing state.
 */
export function PermalinkButton({ translations, getCommands, labPath }: PermalinkButtonProps) {
  const t = translations.lab.permalink;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = buildPermalink(window.location.origin, labPath, getCommands());
    if (!url) {
      toast({ title: t.empty, duration: 4000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: t.copied, description: url, duration: 5000 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable: show the URL so it can be copied by hand.
      toast({ title: t.copy, description: url, duration: 10_000 });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={t.copy}
      aria-label={t.copy}
      className="inline-flex items-center gap-1 rounded-[8px] border border-[var(--md-sys-color-outline-variant)] px-2 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-primary)] hover:border-[var(--md-sys-color-primary)]"
    >
      {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
      <span className="hidden sm:inline">{copied ? t.copied : t.share}</span>
    </button>
  );
}
