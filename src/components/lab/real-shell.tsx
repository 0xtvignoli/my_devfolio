'use client';

import { useEffect, useRef, useState } from 'react';

type Phase = 'booting' | 'ready' | 'no-isolation' | 'error';

// Minimal structural view of a running @wasmer/sdk instance. Kept local so the
// component doesn't hard-depend on the exact v0.10 type surface (unverified here).
interface WasmerInstanceLike {
  stdin?: WritableStream<Uint8Array> | null;
  stdout: ReadableStream<Uint8Array>;
  stderr: ReadableStream<Uint8Array>;
}

const STATUS_LABEL: Record<Phase, string> = {
  booting: 'booting…',
  ready: 'bash • live',
  'no-isolation': 'isolation off',
  error: 'error',
};

/**
 * Experimental: a genuinely executing bash shell rendered in xterm.js.
 * bash is a WASIX build loaded client-side from the Wasmer registry — no backend.
 * Requires cross-origin isolation (COOP/COEP, set for /shell in proxy.ts).
 *
 * NOTE: the WASM execution + isolation path can only be validated in a real
 * browser; if isolation is unavailable it degrades to a clear message instead
 * of crashing.
 */
export function RealShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import('@xterm/xterm').Terminal>(null);
  const [phase, setPhase] = useState<Phase>('booting');

  useEffect(() => {
    let disposed = false;
    let term: import('@xterm/xterm').Terminal | undefined;

    (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
        import('@xterm/xterm/css/xterm.css'),
      ]);
      if (disposed || !containerRef.current) return;

      term = new Terminal({
        convertEol: true,
        cursorBlink: true,
        fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
        fontSize: 13,
        theme: { background: '#1a1717', foreground: '#fdfcfc', cursor: '#4da3ff' },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      termRef.current = term;
      fit.fit();
      const onResize = () => fit.fit();
      window.addEventListener('resize', onResize);

      term.writeln('\x1b[36mDevOps Folio — real shell (experimental)\x1b[0m');

      if (!window.crossOriginIsolated) {
        term.writeln('');
        term.writeln('\x1b[33mCross-origin isolation is OFF.\x1b[0m Real bash needs COOP/COEP headers.');
        term.writeln('This route requests them; a CDN/proxy in front may strip them.');
        setPhase('no-isolation');
        return () => window.removeEventListener('resize', onResize);
      }

      term.writeln('Loading bash (WASIX) from the Wasmer registry…');
      try {
        // Load @wasmer/sdk from a CDN, UNBUNDLED. Next's bundler rewrites the
        // SDK's web-worker module URL to a /_next/static path the worker can't
        // resolve, which silently breaks bash execution. A native dynamic import
        // of the CDN ESM keeps the SDK's own worker/wasm URLs intact.
        const wasmerUrl = 'https://esm.sh/@wasmer/sdk@0.10.0';
        const { init, Wasmer } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ wasmerUrl);
        await init();
        const pkg = await Wasmer.fromRegistry('sharrattj/bash');
        const instance = (await pkg.entrypoint!.run()) as unknown as WasmerInstanceLike;
        if (disposed) return;

        const encoder = new TextEncoder();
        const stdin = instance.stdin?.getWriter();
        term.onData((data) => {
          void stdin?.write(encoder.encode(data));
        });
        const sink = (t: import('@xterm/xterm').Terminal) =>
          new WritableStream<Uint8Array>({ write: (chunk) => t.write(chunk) });
        void instance.stdout.pipeTo(sink(term));
        void instance.stderr.pipeTo(sink(term));
        setPhase('ready');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`\x1b[31mFailed to start bash:\x1b[0m ${msg}`);
        setPhase('error');
      }
    })();

    return () => {
      disposed = true;
      termRef.current = null;
      term?.dispose();
    };
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[#3a3636] bg-[#1a1717]">
      <div className="flex items-center gap-2 border-b border-[#3a3636] bg-[#201d1d] px-3 py-2 text-xs text-[#c9c6c6]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" aria-hidden />
        <span className="ml-2 font-mono">bash — dev.tvignoli.com</span>
        <span className="ml-auto font-mono text-[#9a9898]">{STATUS_LABEL[phase]}</span>
      </div>
      {/* Focus has to happen synchronously inside the tap handler: mobile
          browsers only open the soft keyboard for a focus caused by a real user
          gesture, and xterm's helper textarea is never tapped directly.
          ponytail: 13px mono still only fits ~30 columns at 390px — if bash on a
          phone matters beyond a demo, the next step is a soft key row (Tab, Ctrl,
          arrows), not a smaller font. */}
      <div
        ref={containerRef}
        onPointerDown={() => termRef.current?.focus()}
        className="min-h-0 flex-1 p-2"
        aria-label="Interactive shell"
      />
    </div>
  );
}
