'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info } from 'lucide-react';
import { LabSectionCard } from '@/components/lab/md3/lab-section-card';
import { computeErrorBudget, DEFAULT_SLO, type ErrorBudget } from '@/lib/error-budget';
import type { Incident, Translations } from '@/lib/types';

const TICK_MS = 5_000;

const STATUS_COLOR: Record<ErrorBudget['status'], string> = {
  healthy: 'var(--md-sys-color-tertiary)',
  warning: 'var(--md-sys-color-warning)',
  exhausted: 'var(--md-sys-color-error)',
};

function Tile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Box className="lab-md3-surface-high" sx={{ p: 1.5, borderRadius: 'var(--lab-radius-md)' }}>
      <Typography
        variant="caption"
        sx={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <Typography
        variant="h5"
        component="div"
        suppressHydrationWarning
        sx={{
          color: accent ?? 'var(--md-sys-color-on-surface)',
          fontWeight: 700,
          lineHeight: 1.2,
          fontFamily: 'var(--font-family-mono), monospace',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

type LabSloPanelProps = {
  translations: Translations;
  incidents: Incident[];
  latencyMs: number;
};

/**
 * The SLO view of the same signals the metrics cards show: an availability
 * budget, what the incidents ate, and the burn rate. Simulated, like the rest of
 * the lab — but the arithmetic is the real one.
 */
export function LabSloPanel({ translations, incidents, latencyMs }: LabSloPanelProps) {
  const t = translations.lab.slo;
  // Session start is the burn-rate denominator; only meaningful client-side.
  const startedAt = useRef<number>(0);
  const [budget, setBudget] = useState<ErrorBudget>(() =>
    computeErrorBudget({ incidents: [], latencyMs, observedMinutes: 0, now: 0 })
  );

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Recompute on a tick as well as on signal changes: an unresolved incident
  // keeps consuming budget even when nothing else moves.
  useEffect(() => {
    const recompute = () => {
      const now = Date.now();
      setBudget(
        computeErrorBudget({
          incidents,
          latencyMs,
          observedMinutes: startedAt.current > 0 ? (now - startedAt.current) / 60_000 : 0,
          now,
        })
      );
    };
    recompute();
    const interval = setInterval(recompute, TICK_MS);
    return () => clearInterval(interval);
  }, [incidents, latencyMs]);

  const accent = STATUS_COLOR[budget.status];
  const consumedPct = Math.min(100, 100 - budget.remainingPct);

  return (
    <LabSectionCard
      id="slo"
      title={t.title}
      subtitle={t.subtitle}
      collapseOnCompact
      action={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label={t[budget.status]}
            suppressHydrationWarning
            sx={{ height: 22, bgcolor: accent, color: 'var(--md-sys-color-on-primary)', fontWeight: 700 }}
          />
          <Tooltip title={t.hint} arrow placement="top">
            <IconButton size="small" aria-label={t.title} sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <Tile label={t.budgetRemaining} value={`${budget.remainingPct.toFixed(1)}%`} accent={accent} />
          <Tile
            label={t.burnRate}
            value={`${budget.burnRate.toFixed(1)}×`}
            accent={budget.burnRate > 1 ? 'var(--md-sys-color-warning)' : undefined}
          />
          <Tile label={t.consumed} value={`${budget.consumedMinutes.toFixed(1)} min`} />
          <Tile
            label={t.latencyObjective}
            value={budget.latencyCompliant ? t.met : t.missed}
            accent={budget.latencyCompliant ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-error)'}
          />
        </Box>

        <Box>
          <Box
            aria-hidden
            sx={{
              height: 10,
              borderRadius: '3px',
              overflow: 'hidden',
              bgcolor: 'var(--md-sys-color-surface-container-lowest)',
            }}
          >
            <Box sx={{ height: '100%', width: `${consumedPct}%`, bgcolor: accent, transition: 'width 0.6s ease' }} />
          </Box>
          <Typography
            variant="caption"
            suppressHydrationWarning
            sx={{ display: 'block', mt: 1, color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            {t.objective
              .replace('{availability}', String(DEFAULT_SLO.availabilityTarget))
              .replace('{days}', String(DEFAULT_SLO.windowDays))
              .replace('{latency}', String(DEFAULT_SLO.latencyTargetMs))
              .replace('{budget}', budget.budgetMinutes.toFixed(1))}
          </Typography>
          {budget.exhaustsInHours !== null && budget.status !== 'exhausted' && (
            <Typography
              variant="caption"
              suppressHydrationWarning
              sx={{ display: 'block', mt: 0.5, color: 'var(--md-sys-color-warning)' }}
            >
              {t.exhaustsIn.replace('{hours}', budget.exhaustsInHours.toFixed(1))}
            </Typography>
          )}
        </Box>
      </Stack>
    </LabSectionCard>
  );
}
