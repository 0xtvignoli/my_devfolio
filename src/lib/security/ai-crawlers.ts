/**
 * AI crawler user-agents referenced by robots.txt and Cloudflare Block AI Bots.
 * Training/scraping bots are disallowed; search/retrieval bots stay allowed so the
 * portfolio can still surface in AI-assisted search (Cloudflare best practice).
 *
 * @see https://developers.cloudflare.com/bots/concepts/bot/
 * @see https://developers.cloudflare.com/bots/additional-configurations/ai-labyrinth/
 */

/** Bots that scrape content for model training — block at edge and in robots.txt. */
export const AI_TRAINING_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'CCBot',
  'anthropic-ai',
  'ClaudeBot',
  'Bytespider',
  'Amazonbot',
  'FacebookBot',
  'cohere-ai',
  'Diffbot',
  'Omgilibot',
  'ImagesiftBot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'PerplexityBot',
  'YouBot',
  'Timpibot',
] as const;

/**
 * Bots that fetch pages for AI search answers — keep allowed for discoverability.
 * Cloudflare Block AI Bots targets training crawlers; these are listed explicitly
 * so a managed robots.txt prepend does not accidentally block them.
 */
export const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot',
  'Claude-SearchBot',
  'Perplexity-User',
] as const;
