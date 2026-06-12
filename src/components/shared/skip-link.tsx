'use client';

interface SkipLinkProps {
  label: string;
}

/**
 * Skip link per accessibilità: primo elemento focusabile, salta al main.
 * Nascosto visivamente (sr-only), visibile solo a focus.
 */
export function SkipLink({ label }: SkipLinkProps) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:inline-block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:border-2 focus:border-primary focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:[clip:auto] focus:[margin:0]"
    >
      {label}
    </a>
  );
}
