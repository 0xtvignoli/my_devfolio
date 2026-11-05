'use client';

import { usePathname } from 'next/navigation';
import { useIsMac } from '@/components/command-palette';

/**
 * The path that wasn't found, as a shell would echo it. Truncated: anyone can
 * put text in a URL, and a 404 shouldn't print a stranger's long sentence on
 * this domain. React escapes it; the length cap is what keeps it a path.
 */
export function RequestedPath() {
  const path = usePathname() ?? '/';
  return <>{path.length > 40 ? `${path.slice(0, 39)}…` : path}</>;
}

/** ⌘K on Apple keyboards, Ctrl K elsewhere — same rule as the palette button. */
export function ShortcutLabel() {
  return <>{useIsMac() ? '⌘K' : 'Ctrl K'}</>;
}
