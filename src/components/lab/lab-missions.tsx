'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui-mui';
import { CheckCircle2, Circle, Compass, FlaskConical, Loader2, Repeat2, Rocket, Timer, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackLabMission } from '@/lib/lab-telemetry';
import type { Translations } from '@/lib/types';

const STORAGE_KEY = 'lab-missions-completed';
const LEGACY_CANARY_KEY = 'lab-mission-canary-done';

export type MissionId = 'canary' | 'chaos' | 'bluegreen';
type PipelineStatus = 'idle' | 'deploying' | 'paused_canary' | 'failed' | 'completed';

const MISSION_COMMANDS: Record<MissionId, string> = {
  canary: 'deploy --strategy=canary --weight=20',
  chaos: 'chaos pod_failure',
  bluegreen: 'deploy --strategy=blue-green',
};

const MISSION_ICONS: Record<MissionId, typeof Rocket> = {
  canary: Rocket,
  chaos: FlaskConical,
  bluegreen: Repeat2,
};

// Soft target per mission — turns the timer chip red past it. The point isn't to
// fail the user (missions still complete), it's the visible constraint that turns
// a passive walkthrough into an active "beat the clock" challenge.
const MISSION_TARGET_SECONDS: Record<MissionId, number> = {
  canary: 90,
  chaos: 60,
  bluegreen: 75,
};

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface MissionStepDef {
  key: string;
  title: string;
  description: string;
  /** When set, `{command}` in the description renders as inline code. */
  command?: string;
}

interface LabMissionsProps {
  translations: Translations;
  pipelineStatus: PipelineStatus;
  incidentsCount: number;
  /** Executes a command in the terminal as if typed by the user. */
  onRunCommand: (command: string) => void;
  /** Auto-start a mission (e.g. from a ?mission= deep link). */
  autoStartMission?: MissionId | null;
}

function renderDescription(template: string, command?: string) {
  if (!command || !template.includes('{command}')) return template;
  const [before, after] = template.split('{command}');
  return (
    <Fragment>
      {before}
      <Box
        component="code"
        sx={{
          px: 0.5,
          borderRadius: 0.5,
          fontFamily: 'var(--font-family-mono), monospace',
          fontSize: '0.75rem',
          bgcolor: 'var(--md-sys-color-surface-container-high)',
          color: 'var(--md-sys-color-primary)',
        }}
      >
        {command}
      </Box>
      {after}
    </Fragment>
  );
}

function loadCompleted(): Record<MissionId, boolean> {
  const base: Record<MissionId, boolean> = { canary: false, chaos: false, bluegreen: false };
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (localStorage.getItem(LEGACY_CANARY_KEY) === 'true') stored.canary = true;
    return { ...base, ...stored };
  } catch {
    return base;
  }
}

export function LabMissions({
  translations,
  pipelineStatus,
  incidentsCount,
  onRunCommand,
  autoStartMission = null,
}: LabMissionsProps) {
  const t = translations.lab.missions;
  const { toast } = useToast();

  const [completed, setCompleted] = useState<Record<MissionId, boolean>>({
    canary: false,
    chaos: false,
    bluegreen: false,
  });
  const [active, setActive] = useState<MissionId | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [elapsed, setElapsed] = useState(0);

  const activeRef = useRef(active);
  activeRef.current = active;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const prevStatusRef = useRef<PipelineStatus>(pipelineStatus);
  const prevIncidentsRef = useRef(incidentsCount);
  const autoStartedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  const markStep = useCallback((step: string) => {
    setProgress((prev) => (prev[step] ? prev : { ...prev, [step]: true }));
    if (activeRef.current) trackLabMission(activeRef.current, 'step_completed', step);
  }, []);

  const completeMission = useCallback(
    (mission: MissionId) => {
      setCompleted((prev) => {
        const next = { ...prev, [mission]: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      const secs = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0;
      startedAtRef.current = null;
      setActive(null);
      setProgress({});
      setElapsed(0);
      trackLabMission(mission, 'completed');
      window.dispatchEvent(
        new CustomEvent('lab_activity', { detail: { type: 'mission_completed', data: { mission } } })
      );
      toast({
        title: `${t.completedTitle} ${t.xpBadge} · ⏱ ${formatDuration(secs)}`,
        description: t.items[mission].completedDescription,
        duration: 6000,
      });
    },
    [toast, t]
  );

  const startMission = useCallback((mission: MissionId) => {
    setActive(mission);
    setProgress({});
    startedAtRef.current = Date.now();
    setElapsed(0);
    trackLabMission(mission, 'started');
  }, []);

  // Count-up challenge timer, live while a mission is active.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (startedAtRef.current) {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (autoStartMission && !autoStartedRef.current) {
      autoStartedRef.current = true;
      if (!completed[autoStartMission]) startMission(autoStartMission);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartMission, startMission]);

  // --- Step detection: pipeline state machine (canary + blue/green) ---
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = pipelineStatus;
    const mission = activeRef.current;
    if (!mission || prev === pipelineStatus) return;

    if (mission === 'canary') {
      if (pipelineStatus === 'paused_canary') {
        markStep('deploy');
        markStep('analyze');
        return;
      }
      // Decision = any transition out of the canary gate (promote or rollback).
      if (prev === 'paused_canary' && progressRef.current.analyze) {
        markStep('decide');
        completeMission('canary');
      }
      return;
    }

    if (mission === 'bluegreen') {
      if (pipelineStatus === 'completed' && progressRef.current.deploy) {
        markStep('cutover');
        completeMission('bluegreen');
      }
    }
  }, [pipelineStatus, markStep, completeMission]);

  // --- Step detection: domain events (deploy strategy, chaos injection) ---
  useEffect(() => {
    const handler = (event: Event) => {
      const { type, data } = (event as CustomEvent).detail ?? {};
      const mission = activeRef.current;
      if (!mission) return;

      if (type === 'deploy_started') {
        const strategy = String(data?.strategy ?? '');
        if (mission === 'canary' && strategy === 'canary') markStep('deploy');
        if (mission === 'bluegreen' && strategy.includes('blue')) markStep('deploy');
      }
      if (type === 'chaos_started' && mission === 'chaos') {
        markStep('inject');
      }
    };
    window.addEventListener('lab_activity', handler);
    return () => window.removeEventListener('lab_activity', handler);
  }, [markStep]);

  // --- Step detection: resolved incident closes the chaos mission ---
  useEffect(() => {
    const prev = prevIncidentsRef.current;
    prevIncidentsRef.current = incidentsCount;
    if (activeRef.current !== 'chaos') return;
    if (incidentsCount > prev && progressRef.current.inject) {
      markStep('observe');
      completeMission('chaos');
    }
  }, [incidentsCount, markStep, completeMission]);

  const buildSteps = (mission: MissionId): MissionStepDef[] => {
    const items = t.items[mission];
    if (mission === 'canary') {
      const s = items.steps as typeof t.items.canary.steps;
      return [
        { key: 'deploy', ...s.deploy, command: MISSION_COMMANDS.canary },
        { key: 'analyze', ...s.analyze },
        { key: 'decide', ...s.decide },
      ];
    }
    if (mission === 'chaos') {
      const s = items.steps as typeof t.items.chaos.steps;
      return [
        { key: 'inject', ...s.inject, command: MISSION_COMMANDS.chaos },
        { key: 'observe', ...s.observe },
      ];
    }
    const s = items.steps as typeof t.items.bluegreen.steps;
    return [
      { key: 'deploy', ...s.deploy, command: MISSION_COMMANDS.bluegreen },
      { key: 'cutover', ...s.cutover },
    ];
  };

  const allDone = Object.values(completed).every(Boolean);
  const missionIds: MissionId[] = ['canary', 'chaos', 'bluegreen'];

  return (
    <Box
      id="lab-mission"
      className="lab-md3-surface"
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        borderLeft: '3px solid var(--md-sys-color-primary)',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {allDone ? (
          <Trophy size={20} style={{ color: 'var(--md-sys-color-tertiary)' }} aria-hidden />
        ) : (
          <Compass size={20} style={{ color: 'var(--md-sys-color-primary)' }} aria-hidden />
        )}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t.cardTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {t.cardSubtitle}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1}>
        {missionIds.map((mission) => {
          const item = t.items[mission];
          const Icon = MISSION_ICONS[mission];
          const isDone = completed[mission];
          const isActive = active === mission;
          const steps = isActive ? buildSteps(mission) : [];
          const activeStepIndex = steps.findIndex((s) => !progress[s.key]);

          return (
            <Box
              key={mission}
              sx={{
                borderRadius: 'var(--lab-radius-md)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                bgcolor: isActive ? 'var(--md-sys-color-surface-container-low)' : 'transparent',
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', p: 1.5, flexWrap: 'wrap', rowGap: 1 }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isDone ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-primary)',
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {isDone ? item.completedDescription : item.description}
                  </Typography>
                </Box>
                {isDone ? (
                  <Chip
                    size="small"
                    icon={<CheckCircle2 size={14} />}
                    label={`${t.doneBadge} · ${t.xpBadge}`}
                    sx={{ bgcolor: 'var(--md-sys-color-tertiary-container)', fontWeight: 600 }}
                  />
                ) : !isActive ? (
                  <Button size="sm" variant="outline" onClick={() => startMission(mission)}>
                    {t.start}
                  </Button>
                ) : (
                  <Chip
                    size="small"
                    icon={<Timer size={14} />}
                    label={`${formatDuration(elapsed)} / ${formatDuration(MISSION_TARGET_SECONDS[mission])}`}
                    aria-label={`Elapsed ${formatDuration(elapsed)} of ${formatDuration(MISSION_TARGET_SECONDS[mission])} target`}
                    sx={{
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      bgcolor:
                        elapsed > MISSION_TARGET_SECONDS[mission]
                          ? 'var(--md-sys-color-error-container)'
                          : 'var(--md-sys-color-surface-container-high)',
                    }}
                  />
                )}
              </Stack>

              {isActive ? (
                <Stack
                  spacing={0.75}
                  component="ol"
                  sx={{ m: 0, px: 1.5, pb: 1.5, listStyle: 'none' }}
                >
                  {steps.map((step, index) => {
                    const stepDone = !!progress[step.key];
                    const stepActive = index === activeStepIndex;
                    return (
                      <Stack
                        key={step.key}
                        component="li"
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: 'flex-start',
                          p: 1.25,
                          borderRadius: 'var(--lab-radius-md)',
                          bgcolor: stepActive ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
                          opacity: stepDone || stepActive ? 1 : 0.55,
                        }}
                      >
                        {stepDone ? (
                          <CheckCircle2
                            size={18}
                            style={{ color: 'var(--md-sys-color-tertiary)', marginTop: 2 }}
                            aria-hidden
                          />
                        ) : stepActive && pipelineStatus === 'deploying' ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                            style={{ color: 'var(--md-sys-color-primary)', marginTop: 2 }}
                            aria-hidden
                          />
                        ) : (
                          <Circle
                            size={18}
                            style={{ color: 'var(--md-sys-color-outline)', marginTop: 2 }}
                            aria-hidden
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2">{step.title}</Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          >
                            {renderDescription(step.description, step.command)}
                          </Typography>
                        </Box>
                        {step.command && stepActive && pipelineStatus === 'idle' ? (
                          <Button size="sm" variant="outline" onClick={() => onRunCommand(step.command!)}>
                            {t.runForMe}
                          </Button>
                        ) : null}
                      </Stack>
                    );
                  })}
                </Stack>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
