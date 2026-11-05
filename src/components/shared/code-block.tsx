import { CopyButton } from '@/components/shared/copy-button';
import { highlight } from '@/lib/highlight';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

/**
 * Server component: the code is highlighted at build time and arrives as
 * plain HTML. Only the copy button is a client island.
 */
export async function CodeBlock({ code, language, filename }: CodeBlockProps) {
  // Our own article data, escaped by Shiki: never user input.
  const html = await highlight(code, language);
  return (
    <figure className="code-block my-7 border border-border bg-muted">
      <figcaption className="flex items-center justify-between gap-4 border-b border-border bg-[hsl(var(--code-bar))] py-1 pl-5 pr-1 font-mono text-[13px] text-muted-foreground">
        <span className="min-w-0 truncate text-foreground">{filename}</span>
        <span className="flex items-center gap-1">
          <span className="text-xs uppercase tracking-[0.08em]">{language}</span>
          <CopyButton text={code} />
        </span>
      </figcaption>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
