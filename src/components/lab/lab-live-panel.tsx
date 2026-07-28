'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Loader2, ShieldCheck, Plug } from 'lucide-react';
import type { Translations } from '@/lib/types';

// Set to the mini-lab backend URL to enable live mode. When unset, the panel
// shows an offline state — the static site is never broken.
const MINILAB_URL = process.env.NEXT_PUBLIC_MINILAB_URL;

type LabLivePanelProps = {
  /** Narrow slice, not the whole Translations bundle: everything handed to a
      client component is serialised into the page payload. */
  labels: Translations['lab']['liveOps'];
  labHref: string;
};

export function LabLivePanel({ labels, labHref }: LabLivePanelProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const outRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!MINILAB_URL) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await fetch(`${MINILAB_URL}/session`, { method: 'POST' }).then((r) => r.json());
        const acts = await fetch(`${MINILAB_URL}/actions`).then((r) => r.json());
        if (cancelled) return;
        setAccountId(session.accountId);
        setActions(acts);
        setOutput(`# connected — your isolated (emulated) account: ${session.accountId}\n`);
      } catch {
        if (!cancelled) setError(labels.unreachable);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [labels.unreachable]);

  const runAction = useCallback(
    async (action: string) => {
      if (!accountId || runningAction) return;
      setRunningAction(action);
      try {
        const res = await fetch(`${MINILAB_URL}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, action }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        setOutput((prev) => `${prev}\n`);
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch {
        setOutput((prev) => `${prev}\n[connection error]\n`);
      } finally {
        setRunningAction(null);
      }
    },
    [accountId, runningAction]
  );

  useEffect(() => {
    outRef.current?.scrollTo(0, outRef.current.scrollHeight);
  }, [output]);

  // Offline state, written for a visitor. It used to tell them to set an
  // environment variable — internal configuration on a page reachable from the
  // home page.
  if (!MINILAB_URL) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[6px] border border-[#3a3636] bg-[#1a1717] p-8 text-center text-[#9a9898]">
        <Plug className="h-8 w-8 text-[#4da3ff]" aria-hidden />
        <p className="font-mono text-sm text-[#fdfcfc]">{labels.offlineTitle}</p>
        <p className="max-w-md text-xs leading-relaxed">{labels.offlineBody}</p>
        <Link
          href={labHref}
          className="mt-1 inline-flex min-h-[44px] items-center text-sm text-[#4da3ff] underline underline-offset-4 hover:text-[#fdfcfc]"
        >
          {labels.offlineCta} →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[#3a3636] bg-[#1a1717] font-mono text-[#fdfcfc]">
      <div className="flex items-center gap-2 border-b border-[#3a3636] bg-[#201d1d] px-3 py-2 text-xs">
        <ShieldCheck className="h-4 w-4 text-green-400" aria-hidden />
        <span className="text-[#c9c6c6]">Live ops — real commands vs emulated AWS (floci)</span>
        {accountId && (
          <span className="ml-auto text-[#9a9898]">account {accountId}</span>
        )}
      </div>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="max-w-md text-sm leading-relaxed text-[#c9c6c6]">{error}</p>
          <Link
            href={labHref}
            className="inline-flex min-h-[44px] items-center text-sm text-[#4da3ff] underline underline-offset-4 hover:text-[#fdfcfc]"
          >
            {labels.offlineCta} →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 border-b border-[#3a3636] p-2">
            {Object.entries(actions).map(([key, label]) => (
              <button
                key={key}
                onClick={() => runAction(key)}
                disabled={!accountId || runningAction !== null}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#3a3636] bg-[#201d1d] px-2.5 py-1 text-xs text-[#c9c6c6] transition-colors hover:border-[#4da3ff] hover:text-[#fdfcfc] disabled:opacity-50 focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
                title={label}
              >
                {runningAction === key ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                ) : (
                  <Play className="h-3 w-3 text-[#4da3ff]" aria-hidden />
                )}
                {label}
              </button>
            ))}
          </div>
          <pre
            ref={outRef}
            className="flex-1 overflow-auto whitespace-pre-wrap break-words bg-[#161313] p-3 text-xs leading-relaxed text-[#e8e6e6]"
            aria-label="Live command output"
            aria-live="polite"
          >
            {output || labels.connecting}
          </pre>
        </>
      )}
    </div>
  );
}
