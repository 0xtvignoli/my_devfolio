'use client';

import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info } from 'lucide-react';
import { LabSectionCard } from '@/components/lab/md3/lab-section-card';
import type { Translations } from '@/lib/types';

type Endpoint = {
  id: string;
  price: number; // x402 revenue per request (USDC)
  cost: number; // infra cost per request (USDC)
  weight: number; // share of traffic
  cache?: boolean;
};

// Deterministic model of the inference gateway's monetized endpoints.
const ENDPOINTS: Endpoint[] = [
  { id: 'chat:large', price: 0.012, cost: 0.0052, weight: 0.18 },
  { id: 'chat:std', price: 0.004, cost: 0.0015, weight: 0.46 },
  { id: 'chat:cache', price: 0.0006, cost: 0.00006, weight: 0.24, cache: true },
  { id: 'mcp:lint', price: 0.005, cost: 0.0011, weight: 0.12 },
];

const BASE_RPS = 42;
const HISTORY = 40;

// Live signals from the Lab that modulate the economics.
type Signals = {
  latencyMs: number;
  cpuPercent: number;
  incidents: number;
  isDeploying: boolean;
  autoChaos: boolean;
};

const BASELINE: Signals = { latencyMs: 120, cpuPercent: 40, incidents: 0, isDeploying: false, autoChaos: false };

type EndpointStat = {
  id: string;
  cache: boolean;
  rps: number;
  revenue: number;
  cost: number;
  margin: number;
};

type Snapshot = {
  endpoints: EndpointStat[];
  totalRps: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPerReq: number;
  grossMarginPct: number;
  errorRate: number;
};

function computeSnapshot(rps: number, jitter: () => number, sig: Signals): Snapshot {
  // Latency and CPU above baseline raise the compute cost per request.
  const costMult = 1 + Math.max(0, (sig.latencyMs - 120) / 240) + Math.max(0, (sig.cpuPercent - 60) / 120);
  // Incidents, chaos, and extreme latency cause failed (unpaid) requests.
  const errorRate = Math.min(0.45, 0.01 + sig.incidents * 0.015 + (sig.autoChaos ? 0.06 : 0) + Math.max(0, (sig.latencyMs - 250) / 2000));
  // Deploys and high latency reduce throughput.
  const rpsMult = (sig.isDeploying ? 0.7 : 1) * (1 - Math.min(0.4, Math.max(0, (sig.latencyMs - 150) / 600)));
  const effRps = rps * rpsMult;

  const endpoints: EndpointStat[] = ENDPOINTS.map((e) => {
    const eRps = effRps * e.weight * jitter();
    const successRps = eRps * (1 - errorRate); // only settled requests earn revenue
    const revenue = successRps * e.price;
    const cost = eRps * e.cost * costMult; // every request costs infra, even failed ones
    return { id: e.id, cache: !!e.cache, rps: eRps, revenue, cost, margin: revenue - cost };
  });
  const totalRps = endpoints.reduce((s, e) => s + e.rps, 0);
  const revenue = endpoints.reduce((s, e) => s + e.revenue, 0);
  const cost = endpoints.reduce((s, e) => s + e.cost, 0);
  const margin = revenue - cost;
  return {
    endpoints,
    totalRps,
    revenue,
    cost,
    margin,
    marginPerReq: totalRps > 0 ? margin / totalRps : 0,
    grossMarginPct: revenue > 0 ? (margin / revenue) * 100 : 0,
    errorRate,
  };
}

// Deterministic initial snapshot (no randomness, baseline signals) → identical on server and client.
const INITIAL = computeSnapshot(BASE_RPS, () => 1, BASELINE);

const money = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(4)}`;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 132;
  const h = 34;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden focusable="false">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
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
        sx={{ color: accent, fontWeight: 700, lineHeight: 1.2, fontFamily: 'var(--font-family-mono), monospace', transition: 'color 0.3s ease' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

type LabMarginPanelProps = {
  translations: Translations;
  latencyMs: number;
  cpuPercent: number;
  incidents: number;
  isDeploying: boolean;
  autoChaos: boolean;
};

export function LabMarginPanel({ translations, latencyMs, cpuPercent, incidents, isDeploying, autoChaos }: LabMarginPanelProps) {
  const t = translations.lab.margin;
  const [snap, setSnap] = useState<Snapshot>(INITIAL);
  const [history, setHistory] = useState<number[]>(() => Array(HISTORY).fill(INITIAL.marginPerReq));
  const [live, setLive] = useState(false);

  // Keep the latest signals available to the streaming interval's closure.
  const signalsRef = useRef<Signals>(BASELINE);
  useEffect(() => {
    signalsRef.current = { latencyMs, cpuPercent, incidents, isDeploying, autoChaos };
  });

  const reducedRef = useRef(false);

  // Continuous stream (normal motion) reads fresh signals each tick.
  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedRef.current) {
      setSnap(computeSnapshot(BASE_RPS, () => 1, signalsRef.current));
      return;
    }
    setLive(true);
    const iv = setInterval(() => {
      const rps = BASE_RPS * (0.85 + Math.random() * 0.3);
      const s = computeSnapshot(rps, () => 0.8 + Math.random() * 0.4, signalsRef.current);
      setSnap(s);
      setHistory((h) => [...h.slice(1), s.marginPerReq]);
    }, 1600);
    return () => clearInterval(iv);
  }, []);

  // Under reduced motion, reflect discrete Lab signal changes (deploy / chaos / metrics).
  useEffect(() => {
    if (!reducedRef.current) return;
    const s = computeSnapshot(BASE_RPS, () => 1, { latencyMs, cpuPercent, incidents, isDeploying, autoChaos });
    setSnap(s);
    setHistory((h) => [...h.slice(1), s.marginPerReq]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latencyMs, cpuPercent, incidents, isDeploying, autoChaos]);

  const maxRevenue = Math.max(...snap.endpoints.map((e) => e.revenue), 0.0001);
  const marginAccent = snap.marginPerReq < 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)';
  const grossAccent = snap.grossMarginPct < 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-tertiary)';

  return (
    <LabSectionCard
      id="margin"
      title={t.title}
      subtitle={t.subtitle}
      action={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {t.simulated}
          </Typography>
          {live ? (
            <Chip
              size="small"
              label={translations.lab.live}
              sx={{ height: 22, bgcolor: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-surface)', fontWeight: 600 }}
            />
          ) : null}
          <Tooltip title={t.hint} arrow placement="top">
            <IconButton size="small" aria-label={t.title} sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* Aggregate stat tiles + margin sparkline */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <StatTile label={t.marginPerReq} value={money(snap.marginPerReq)} accent={marginAccent} />
          <StatTile label={t.throughput} value={snap.totalRps.toFixed(0)} accent="var(--md-sys-color-on-surface)" />
          <StatTile label={t.grossMargin} value={`${snap.grossMarginPct.toFixed(0)}%`} accent={grossAccent} />
          <Box className="lab-md3-surface-high" sx={{ p: 1.5, borderRadius: 'var(--lab-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography
              variant="caption"
              sx={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {t.marginPerReq}
            </Typography>
            <Box sx={{ flex: 1, minHeight: 34, display: 'flex', alignItems: 'flex-end' }}>
              <Sparkline data={history} color={marginAccent} />
            </Box>
          </Box>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'var(--md-sys-color-error)' }} />
            <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{t.cost}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'var(--md-sys-color-tertiary)' }} />
            <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{t.margin}</Typography>
          </Stack>
        </Stack>

        {/* Per-endpoint revenue = cost + margin breakdown */}
        <Stack spacing={1}>
          {snap.endpoints.map((e) => {
            const fillPct = (e.revenue / maxRevenue) * 100;
            const costPct = e.revenue > 0 ? Math.min(100, (e.cost / e.revenue) * 100) : 100;
            const marginPct = 100 - costPct;
            return (
              <Box
                key={e.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '92px 1fr 68px', sm: '110px 1fr 84px 60px' },
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography sx={{ fontFamily: 'var(--font-family-mono), monospace', fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface)' }}>
                  {e.id}
                </Typography>
                <Box aria-hidden sx={{ height: 18, borderRadius: '3px', bgcolor: 'var(--md-sys-color-surface-container-lowest)', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${fillPct}%`, display: 'flex', transition: 'width 0.6s ease' }}>
                    <Box sx={{ width: `${costPct}%`, bgcolor: 'var(--md-sys-color-error)', transition: 'width 0.6s ease' }} />
                    <Box sx={{ width: `${marginPct}%`, bgcolor: 'var(--md-sys-color-tertiary)', transition: 'width 0.6s ease' }} />
                  </Box>
                </Box>
                <Typography
                  suppressHydrationWarning
                  sx={{ fontFamily: 'var(--font-family-mono), monospace', fontSize: '0.8rem', color: e.margin < 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-tertiary)', fontWeight: 700, textAlign: 'right' }}
                >
                  {money(e.margin)}
                </Typography>
                <Typography
                  suppressHydrationWarning
                  sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'var(--font-family-mono), monospace', fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'right' }}
                >
                  {e.rps.toFixed(0)}/s
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </LabSectionCard>
  );
}
