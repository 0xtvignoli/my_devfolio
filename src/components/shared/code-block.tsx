'use client';

import { useState } from 'react';
import { Check, Clipboard } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group relative my-7">
      <pre className="overflow-x-auto bg-muted p-6 font-mono text-sm leading-[1.6]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      {/* Visible on hover and on keyboard focus; always visible on touch, which has no hover. */}
      <button
        type="button"
        onClick={copy}
        className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Clipboard className="h-4 w-4" aria-hidden />}
        <span className="sr-only">{copied ? 'Copied' : 'Copy code'}</span>
      </button>
    </div>
  );
}
