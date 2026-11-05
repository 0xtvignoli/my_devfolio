'use client';

import { useState } from 'react';
import { Check, Clipboard } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Clipboard className="h-4 w-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
    </button>
  );
}
