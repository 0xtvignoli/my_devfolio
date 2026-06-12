'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ArrowDown, Route, ShieldAlert } from 'lucide-react';
import type { Translations } from '@/lib/types';

interface LabActivityBeaconProps {
  translations: Translations;
  /** The pipeline is currently running a deployment. */
  isDeploying: boolean;
  /** Incidents count — a new incident pulses the beacon. */
  incidentsCount: number;
}

type BeaconTarget = { id: string; label: string; icon: typeof Route } | null;

/**
 * Floating chip shown when an activity happens in a section that is outside
 * the viewport (pipeline deploy, new incident). Clicking scrolls to it.
 */
export function LabActivityBeacon({ translations, isDeploying, incidentsCount }: LabActivityBeaconProps) {
  const t = translations.lab.beacon;
  const [target, setTarget] = useState<BeaconTarget>(null);
  const [pipelineVisible, setPipelineVisible] = useState(true);
  const [incidentsVisible, setIncidentsVisible] = useState(true);
  const [lastSeenIncidents, setLastSeenIncidents] = useState(incidentsCount);

  // Observe section visibility.
  useEffect(() => {
    const pipeline = document.getElementById('pipeline');
    const incidents = document.getElementById('incident-history');
    if (!pipeline && !incidents) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id === 'pipeline') setPipelineVisible(entry.isIntersecting);
          if (entry.target.id === 'incident-history') setIncidentsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.15 }
    );
    if (pipeline) observer.observe(pipeline);
    if (incidents) observer.observe(incidents);
    return () => observer.disconnect();
  }, []);

  // Decide what to point at: deploy in progress wins over incidents.
  useEffect(() => {
    if (isDeploying && !pipelineVisible) {
      setTarget({ id: 'pipeline', label: t.pipelineRunning, icon: Route });
      return;
    }
    if (incidentsCount > lastSeenIncidents && !incidentsVisible) {
      setTarget({ id: 'incident-history', label: t.newIncident, icon: ShieldAlert });
      return;
    }
    setTarget(null);
  }, [isDeploying, pipelineVisible, incidentsCount, lastSeenIncidents, incidentsVisible, t]);

  const handleClick = () => {
    if (!target) return;
    document.getElementById(target.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target.id === 'incident-history') setLastSeenIncidents(incidentsCount);
    setTarget(null);
  };

  if (!target) return null;
  const Icon = target.icon;

  return (
    <Box
      component="button"
      type="button"
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        borderRadius: 999,
        border: '1px solid var(--md-sys-color-outline-variant)',
        bgcolor: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
        fontWeight: 600,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        boxShadow: 'var(--lab-elevation-2)',
        animation: 'pulse 2s ease-in-out infinite',
        '&:hover': { filter: 'brightness(1.05)' },
      }}
      aria-label={target.label}
    >
      <Icon size={16} aria-hidden />
      {target.label}
      <ArrowDown size={14} aria-hidden />
    </Box>
  );
}
