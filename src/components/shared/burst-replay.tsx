'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Strings = { play: string; stop: string; speed: string; counter: string };

/**
 * ▶ over a server-rendered dot chart: dots carry data-at (seconds from the run's start) and
 * data-n (calls in that dot); playing dims the ones still to come and lights them at the real
 * pace, or 10× faster. No button with reduced motion: the still chart says the same.
 */
export function BurstReplay({ seconds, total, t, children }: { seconds: number; total: number; t: Strings; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [motion, setMotion] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(seconds > 60 ? 10 : 1);
  const [shown, setShown] = useState(total);
  const [at, setAt] = useState(seconds);

  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);

  const paint = (now: number) => {
    let n = 0;
    box.current?.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => {
      const on = Number(el.dataset.at) <= now;
      el.style.opacity = on ? '1' : '0.12';
      if (on) n += Number(el.dataset.n ?? 1);
    });
    setShown(n);
    setAt(Math.min(now, seconds));
  };

  const stop = () => {
    cancelAnimationFrame(frame.current);
    setPlaying(false);
    paint(Infinity);
  };

  const play = () => {
    const start = performance.now();
    setPlaying(true);
    const tick = (ts: number) => {
      const now = ((ts - start) / 1000) * speed;
      paint(now);
      if (now < seconds) frame.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div ref={box}>
      {motion && (
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={playing ? stop : play}
            aria-label={playing ? t.stop : t.play}
            className="inline-flex size-11 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"
          >
            <span aria-hidden>{playing ? '■' : '▶'}</span>
          </button>
          <span className="font-mono text-[13px] text-muted-foreground" aria-live="off">
            {clock(at)} / {clock(seconds)} · {t.counter.replace('{n}', String(shown)).replace('{total}', String(total))}
          </span>
          <span className="flex gap-1 font-mono text-[13px]" role="group" aria-label={t.speed}>
            {[1, 10].map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={speed === s}
                disabled={playing}
                onClick={() => setSpeed(s)}
                className={speed === s ? 'min-h-11 px-2 text-foreground underline underline-offset-4' : 'min-h-11 px-2 text-muted-foreground hover:text-foreground'}
              >
                {s}×
              </button>
            ))}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
