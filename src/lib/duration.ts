import type { Locale } from '@/lib/types';

const UNITS = {
  en: { min: 'min', h: 'h', day: 'day', days: 'days' },
  it: { min: 'min', h: 'h', day: 'giorno', days: 'giorni' },
} as const;

/** 7 min · 3 h 12 min · 19 h 5 min · 4 days. Minutes up to two days, so a live wait visibly moves. */
export function formatDuration(ms: number, locale: Locale): string {
  const u = UNITS[locale];
  const min = Math.max(1, Math.round(ms / 60_000));
  if (min < 60) return `${min} ${u.min}`;
  const h = Math.floor(min / 60);
  if (h < 48) return min % 60 ? `${h} ${u.h} ${min % 60} ${u.min}` : `${h} ${u.h}`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? u.day : u.days}`;
}
