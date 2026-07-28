'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContactEmail } from '@/hooks/use-contact-email';
import { cn } from '@/lib/utils';

type CopyEmailButtonProps = {
  label: string;
  copiedLabel: string;
};

/**
 * mailto: is a dead end on a phone with no mail client configured, so the address
 * needs to be copyable. It arrives from /api/contact rather than a prop — a prop
 * would be serialised into the page's RSC payload, which is precisely the leak
 * that made Cloudflare's email obfuscation pointless.
 */
export function CopyEmailButton({ label, copiedLabel }: CopyEmailButtonProps) {
  const email = useContactEmail();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast({ title: copiedLabel, duration: 3000 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard denied (insecure context, permission): show the address so it
      // can still be selected by hand.
      toast({ title: email, duration: 6000 });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!email}
      className={cn(
        'inline-flex items-center gap-2 px-5 py-2 font-medium leading-8 rounded-[4px]',
        'border border-border text-foreground',
        'transition-colors duration-150 hover:bg-muted/50 disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2'
      )}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
