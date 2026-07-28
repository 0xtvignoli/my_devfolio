import Link from 'next/link';
import { parseInline } from '@/lib/inline-markup';

/**
 * Renders article prose with inline code spans and links. Server component —
 * article content is static, so this never ships JS.
 */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        if (token.type === 'text') return token.value;
        if (token.type === 'code') {
          return (
            <code key={index} className="rounded-[3px] border border-border px-1 py-0.5 text-[0.9em]">
              {token.value}
            </code>
          );
        }
        // Root-relative links stay in-app; external ones open in a new tab.
        return token.href.startsWith('/') ? (
          <Link key={index} href={token.href}>
            {token.value}
          </Link>
        ) : (
          <a key={index} href={token.href} target="_blank" rel="noopener noreferrer">
            {token.value}
          </a>
        );
      })}
    </>
  );
}
