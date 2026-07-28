/**
 * Session permalinks: replay what a visitor actually did in the lab.
 * The URL carries repeated `cmd` params, which the lab page reads with
 * getAll('cmd') and runs in order.
 */

/** URLs get proxied, pasted into chats and truncated — keep the tail, not everything. */
export const MAX_PERMALINK_COMMANDS = 8;

/** Commands that replay as noise (or reset the very session being shared). */
const NOT_REPLAYABLE = new Set(['clear', 'history', 'help']);

export function replayableCommands(commands: string[]): string[] {
  return commands
    .map((command) => command.trim())
    .filter((command) => command !== '' && !NOT_REPLAYABLE.has(command.split(' ')[0]))
    .slice(-MAX_PERMALINK_COMMANDS);
}

/** `basePath` is the locale-prefixed lab path, e.g. /en/lab. Returns null when there's nothing to share. */
export function buildPermalink(origin: string, basePath: string, commands: string[]): string | null {
  const replayable = replayableCommands(commands);
  if (replayable.length === 0) return null;

  const params = new URLSearchParams();
  for (const command of replayable) params.append('cmd', command);
  return `${origin}${basePath}?${params.toString()}`;
}
