import type { Category } from './classify';

/** Shape of src/data/observatory.json, written daily by scripts/observatory.ts. */
export interface Observatory {
  generatedAt: string;
  /** Inclusive UTC dates of the window. */
  from: string;
  to: string;
  totals: {
    requests: number;
    /** Probes and exploit attempts, whatever happened to them. */
    hostile: number;
    /** Stopped before the app: Cloudflare block/challenge or a 403 at the edge. */
    stopped: number;
    /** AI crawlers sent into Cloudflare's AI Labyrinth instead of the site. */
    maze: number;
  };
  daily: { date: string; requests: number; hostile: number }[];
  categories: { category: Category; count: number }[];
  targets: { target: string; category: Category; count: number }[];
  countries: { code: string; count: number }[];
  clients: { label: string; count: number }[];
  defenses: { layer: string; count: number }[];
}
