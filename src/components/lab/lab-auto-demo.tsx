'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui-mui';
import { PlayCircle } from 'lucide-react';
import { trackLabDemo } from '@/lib/lab-telemetry';
import type { Translations } from '@/lib/types';

const STORAGE_KEY = 'lab-demo-seen';

interface LabAutoDemoProps {
  translations: Translations;
  /** Runs a command in the terminal as if typed by the user. */
  runCommand: (command: string) => void;
  /** Skip the demo entirely (e.g. when arriving via deep link). */
  disabled?: boolean;
}

const DEMO_SCRIPT: { delayMs: number; command: string }[] = [
  { delayMs: 2000, command: 'kubectl get pods' },
  { delayMs: 6500, command: 'deploy --strategy=canary --weight=20' },
];

/**
 * First-visit auto-demo: plays a short scripted sequence in the terminal so
 * the lab demonstrates itself. Any user interaction takes control back.
 */
export function LabAutoDemo({ translations, runCommand, disabled = false }: LabAutoDemoProps) {
  const t = translations.lab.demo;
  const [running, setRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runningRef = useRef(false);

  const stopDemo = useCallback((reason: 'interrupted' | 'finished') => {
    if (!runningRef.current) return;
    runningRef.current = false;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRunning(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    trackLabDemo(reason);
  }, []);

  useEffect(() => {
    // Deep links take precedence over the demo; read the URL directly because
    // the parent's `disabled` prop may update after this effect already ran.
    const params = new URLSearchParams(window.location.search);
    if (disabled || params.has('cmd') || params.has('mission')) return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    runningRef.current = true;
    setRunning(true);
    trackLabDemo('started');

    DEMO_SCRIPT.forEach(({ delayMs, command }) => {
      timersRef.current.push(
        setTimeout(() => {
          if (runningRef.current) runCommand(command);
        }, delayMs)
      );
    });
    // Let the deploy pipeline play out, then end the demo.
    timersRef.current.push(setTimeout(() => stopDemo('finished'), 22000));

    const interrupt = () => stopDemo('interrupted');
    // Defer listener registration so the click that loaded the page doesn't cancel it.
    const listenerTimer = setTimeout(() => {
      window.addEventListener('pointerdown', interrupt);
      window.addEventListener('keydown', interrupt);
    }, 500);

    return () => {
      clearTimeout(listenerTimer);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      runningRef.current = false;
      window.removeEventListener('pointerdown', interrupt);
      window.removeEventListener('keydown', interrupt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  if (!running) return null;

  return (
    <Box
      role="status"
      sx={{
        position: 'fixed',
        // Compact: top slot. The bottom already carries the snackbar and the
        // activity beacon, and all three landed on each other at 390px.
        bottom: { xs: 'auto', md: 24 },
        top: { xs: 64, md: 'auto' },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: '4px',
        bgcolor: 'var(--md-sys-color-surface-container-highest)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        boxShadow: 'none',
        maxWidth: 'calc(100vw - 32px)',
        // Shrink-to-fit left it 216px wide and 3 lines tall on a 390px screen.
        width: { xs: 'calc(100vw - 32px)', md: 'auto' },
      }}
    >
      <PlayCircle size={18} style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0 }} aria-hidden />
      <Typography variant="body2" sx={{ color: 'var(--md-sys-color-on-surface)' }}>
        {t.banner}
      </Typography>
      <Button size="sm" variant="outline" onClick={() => stopDemo('interrupted')}>
        {t.takeControl}
      </Button>
    </Box>
  );
}
