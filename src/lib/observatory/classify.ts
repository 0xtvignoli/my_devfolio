/**
 * Turns attacker-controlled request data into labels from a fixed vocabulary.
 *
 * [SEC] Paths and user agents are written by whoever sends the request. None of
 * them reaches the page: the published JSON holds only the labels defined here,
 * so a crafted path can't inject markup, links or text into the site.
 */

export const CATEGORIES = [
  'secrets',
  'cms',
  'admin',
  'traversal',
  'app-exploit',
  'other',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** First match wins. `target` is the label published for the most-probed list. */
const PROBES: { category: Category; target: string; re: RegExp }[] = [
  { category: 'traversal', target: '../ traversal', re: /\.\.\/|\.\.\\|%2e%2e|\/etc\/passwd/ },
  { category: 'secrets', target: '.env', re: /\.env(\.|$|\/)/ },
  { category: 'secrets', target: '.git', re: /\/\.git(\/|$)/ },
  { category: 'secrets', target: 'cloud credentials', re: /\.aws\b|aws\.json|credentials|\.boto|gcloud|\.kube\/config/ },
  { category: 'secrets', target: 'SSH keys', re: /\.ssh\/|id_rsa|id_ed25519/ },
  { category: 'secrets', target: 'backups & dumps', re: /\.(bak|old|orig|swp|sql|sqlite|tar|tgz|gz|zip|7z)$|backup|dump/ },
  { category: 'secrets', target: 'config files', re: /config\.(json|ya?ml|js|php|inc)|settings\.py|\.npmrc|\.dockercfg|docker-compose\.ya?ml|appsettings\.json|web\.config|\.ds_store/ },
  { category: 'cms', target: 'WordPress', re: /wp-|wordpress|xmlrpc\.php/ },
  { category: 'cms', target: 'PHP scripts', re: /\.php\d?$|\.php\d?\// },
  { category: 'admin', target: 'Spring actuator', re: /\/actuator(\/|$)/ },
  { category: 'admin', target: 'phpMyAdmin', re: /phpmyadmin|\/pma(\/|$)|\/myadmin/ },
  { category: 'admin', target: 'admin panels', re: /\/(admin|administrator|manager|console|dashboard\/login|login\.action|jenkins|solr|server-status|cgi-bin)(\/|$|\.)/ },
];

/**
 * POST/PUT to a page, not an API route: how Server Action and RSC exploits
 * (React2Shell, CVE-2025-55182) arrive. The site has no such endpoint any more,
 * so every one of these is hostile.
 */
function isAppExploit(method: string, path: string): boolean {
  return method !== 'GET' && method !== 'HEAD' && !path.startsWith('/api/') && !path.startsWith('/cdn-cgi/');
}

function decode(path: string): string {
  let p = path.toLowerCase();
  // Scanners double-encode (%252e) to slip past naive filters: undo it twice.
  for (let i = 0; i < 2; i++) {
    try {
      p = decodeURIComponent(p);
    } catch {
      break;
    }
  }
  return p;
}

export function classifyRequest(method: string, rawPath: string): { category: Category; target: string } {
  const path = decode(rawPath);
  for (const probe of PROBES) {
    if (probe.re.test(path)) return { category: probe.category, target: probe.target };
  }
  if (isAppExploit(method.toUpperCase(), path)) return { category: 'app-exploit', target: 'POST to a page' };
  return { category: 'other', target: 'other' };
}

const CLIENTS: { label: string; re: RegExp }[] = [
  { label: 'empty user agent', re: /^-?$/ },
  { label: 'Nuclei', re: /nuclei/i },
  { label: 'zgrab', re: /zgrab/i },
  { label: 'Masscan', re: /masscan/i },
  { label: 'curl', re: /^curl\//i },
  { label: 'Wget', re: /^wget\//i },
  { label: 'Python', re: /python|aiohttp|httpx|scrapy/i },
  { label: 'Go', re: /go-http-client|^go\b/i },
  { label: 'Java', re: /java\/|okhttp|apache-httpclient/i },
  { label: 'Node.js', re: /node-fetch|axios|undici|got\b/i },
  { label: 'headless browser', re: /headless|phantomjs|puppeteer|playwright/i },
  { label: 'search & AI crawlers', re: /bot|crawler|spider|gptbot|claudebot|bytespider/i },
  { label: 'browser-like', re: /^mozilla\//i },
];

export function classifyClient(userAgent: string): string {
  const ua = userAgent.trim();
  return CLIENTS.find((c) => c.re.test(ua))?.label ?? 'other';
}

/** ISO 3166 alpha-2 only; Cloudflare uses XX/T1 for unknown and Tor. */
export function countryCode(value: string): string | null {
  return /^[A-Z]{2}$/.test(value) && value !== 'XX' ? value : value === 'T1' ? 'T1' : null;
}
