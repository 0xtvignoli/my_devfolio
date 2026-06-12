'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { useToast } from '@/hooks/use-toast';
import {
  trackLabChaos,
  trackLabCommand,
  trackLabDeploy,
  trackLabFirstInteraction,
} from '@/lib/lab-telemetry';
import type { DeployConfig, Translations } from '@/lib/types';

export interface TerminalHandle {
  setCommand: (command: string) => void;
  runCommand: (command: string) => void;
  setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void;
}

interface TerminalCommandResult {
  output: string[];
  contextHint?: string;
  suggestion?: string;
  streamingSteps?: string[];
}

const TOTAL_MEMORY_GB = 32;

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function parseDeployCommand(cmd: string): DeployConfig | null {
  const parts = cmd.split(' ');
  if (parts[0] !== 'deploy') return null;
  const config: DeployConfig = {
    strategy: 'canary',
    weight: 10,
    version: `v1.${Math.floor(Math.random() * 9) + 1}.0`,
  };
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] === '--strategy' && parts[i + 1]) config.strategy = parts[i + 1];
    if (parts[i] === '--weight' && parts[i + 1]) config.weight = parseInt(parts[i + 1], 10) || 10;
    if (parts[i] === '--version' && parts[i + 1]) config.version = parts[i + 1];
    if (parts[i]?.startsWith('--strategy=')) config.strategy = parts[i].split('=')[1];
    if (parts[i]?.startsWith('--weight=')) config.weight = parseInt(parts[i].split('=')[1], 10) || 10;
    if (parts[i]?.startsWith('--version=')) config.version = parts[i].split('=')[1];
  }
  return config;
}

/**
 * Shared state, handlers, and aria announcements for the Lab layouts
 * (standard mission console and immersive view). Keeps terminal wiring,
 * confirm dialogs, toasts, and telemetry in one place.
 */
export function useLabActions(translations: Translations) {
  const t = translations.lab;
  const sim = useLabSimulation();
  const {
    monitoringData,
    cluster,
    isDeploying,
    pipelineStatus,
    incidents,
    runChaos,
    runDeployment,
  } = sim;
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [pipelineAnnouncement, setPipelineAnnouncement] = useState('');
  const [incidentAnnouncement, setIncidentAnnouncement] = useState('');
  const [metricAnnouncement, setMetricAnnouncement] = useState('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showChaosConfirm, setShowChaosConfirm] = useState(false);
  const [pendingChaosScenario, setPendingChaosScenario] = useState<string | null>(null);

  const terminalRef = useRef<TerminalHandle>(null);
  const prevPipelineStatusRef = useRef(pipelineStatus);
  const prevIncidentsCountRef = useRef(incidents.length);
  const prevCpuRef = useRef(0);
  const prevLatencyRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Derived metrics (hydration-safe) ---
  const latestCpu = mounted ? Number(monitoringData.cpuData.at(-1)?.usage ?? 0) : 0;
  const latestLatency = mounted ? Number(monitoringData.apiResponseData.at(-1)?.p95 ?? 0) : 0;
  const currentMemoryUsagePercent = mounted
    ? Number(monitoringData.memoryData.at(-1)?.usage ?? 0)
    : 0;
  const currentMemoryUsageGB = mounted
    ? ((currentMemoryUsagePercent / 100) * TOTAL_MEMORY_GB).toFixed(1)
    : '0.0';
  const successfulDeploys = mounted
    ? monitoringData.deploymentData
        .filter((d) => d.status === 'success')
        .reduce((acc, d) => acc + d.count, 0)
    : 0;
  const totalPods = cluster.nodes.reduce((acc, n) => acc + (n.pods?.length ?? 0), 0);
  const activeChaosCount = incidents.filter((i) => i.status === 'Investigating').length;

  // --- Terminal helpers ---
  const handleQuickAction = useCallback((command: string) => {
    trackLabCommand(command);
    terminalRef.current?.setActiveTab('terminal');
    terminalRef.current?.setCommand(command);
  }, []);

  /** Executes a command in the terminal as if typed by the user. */
  const runTerminalCommand = useCallback((command: string) => {
    trackLabCommand(command);
    terminalRef.current?.runCommand(command);
  }, []);

  const handleBackgroundAction = useCallback((action: () => void) => {
    trackLabFirstInteraction('background_action');
    terminalRef.current?.setActiveTab('logs');
    action();
    window.dispatchEvent(
      new CustomEvent('lab_activity', { detail: { type: 'lab_interaction', data: {} } })
    );
  }, []);

  /** Domain events consumed by guided missions (and ignored by gamification). */
  const emitLabEvent = useCallback((type: string, data: Record<string, unknown> = {}) => {
    window.dispatchEvent(new CustomEvent('lab_activity', { detail: { type, data } }));
  }, []);

  // --- Deploy / rollback ---
  const startDeployment = useCallback(
    (config?: DeployConfig) => {
      trackLabDeploy('start', config?.strategy);
      emitLabEvent('deploy_started', { strategy: config?.strategy ?? 'canary' });
      handleBackgroundAction(() => runDeployment('start', config));
    },
    [handleBackgroundAction, runDeployment, emitLabEvent]
  );

  const promoteCanary = useCallback(() => {
    trackLabDeploy('promote');
    handleBackgroundAction(() => runDeployment('promote'));
  }, [handleBackgroundAction, runDeployment]);

  const handleRollbackClick = useCallback(() => setShowRollbackConfirm(true), []);

  const handleRollbackConfirm = useCallback(() => {
    setShowRollbackConfirm(false);
    trackLabDeploy('rollback');
    handleBackgroundAction(() => {
      runDeployment('rollback');
      toast({
        title: t.actions.rollback,
        description: t.toasts.rollbackStartedDescription,
        duration: 4000,
      });
    });
  }, [handleBackgroundAction, runDeployment, toast, t]);

  // --- Chaos (always behind confirm dialog) ---
  const handleChaosClick = useCallback((scenario: string) => {
    setPendingChaosScenario(scenario);
    setShowChaosConfirm(true);
  }, []);

  const handleChaosConfirm = useCallback(() => {
    if (!pendingChaosScenario) return;
    setShowChaosConfirm(false);
    trackLabChaos(pendingChaosScenario);
    emitLabEvent('chaos_started', { scenario: pendingChaosScenario });
    handleBackgroundAction(() => {
      runChaos(pendingChaosScenario);
      toast({
        title: t.dialogs.chaosTitle,
        description: interpolate(t.toasts.chaosInjectedDescription, {
          scenario: pendingChaosScenario,
        }),
        duration: 4000,
      });
    });
    setPendingChaosScenario(null);
  }, [pendingChaosScenario, handleBackgroundAction, runChaos, toast, t]);

  const handleChaosCancel = useCallback(() => setPendingChaosScenario(null), []);

  // --- Terminal command interception (deploy / chaos) ---
  const onTerminalCommand = useCallback(
    (cmd: string): TerminalCommandResult | null => {
      const trimmed = cmd.trim();
      const [command] = trimmed.split(' ');
      if (command !== 'deploy' && command !== 'chaos') return null;

      if (command === 'deploy') {
        const deployConfig = parseDeployCommand(trimmed);
        trackLabDeploy('start', deployConfig?.strategy);
        emitLabEvent('deploy_started', { strategy: deployConfig?.strategy ?? 'canary' });
        handleBackgroundAction(() => runDeployment('start', deployConfig ?? undefined));
        return {
          output: [
            'Dispatching CI/CD pipeline…',
            `strategy: ${deployConfig?.strategy ?? 'canary'}  weight: ${deployConfig?.weight ?? 10}%`,
          ],
          contextHint: 'Sandbox only — mirrors production workflows.',
          suggestion: 'Run `kubectl get pods` once stages turn green.',
          streamingSteps: ['[busy] queuing build jobs…', '[sync] applying manifests…'],
        };
      }

      const scenario = trimmed.split(' ')[1] ?? 'latency';
      trackLabChaos(scenario);
      emitLabEvent('chaos_started', { scenario });
      handleBackgroundAction(() => runChaos(scenario));
      return {
        output: [`Chaos scenario "${scenario}" injected.`],
        contextHint: 'Faults stay inside the simulated environment.',
        suggestion: 'Use `status` to confirm recovery.',
        streamingSteps: ['[busy] priming chaos controller…'],
      };
    },
    [handleBackgroundAction, runDeployment, runChaos, emitLabEvent]
  );

  // --- Aria announcements + localized toasts ---
  useEffect(() => {
    if (!mounted || prevPipelineStatusRef.current === pipelineStatus) return;
    if (pipelineStatus === 'paused_canary') {
      setPipelineAnnouncement(t.announcements.pipelinePaused);
      toast({
        title: t.toasts.pipelinePausedTitle,
        description: t.toasts.pipelinePausedDescription,
        duration: 5000,
      });
    } else if (pipelineStatus === 'completed') {
      setPipelineAnnouncement(t.announcements.pipelineCompleted);
      toast({
        title: t.toasts.deploySuccessTitle,
        description: t.toasts.deploySuccessDescription,
        duration: 5000,
      });
    } else if (pipelineStatus === 'failed') {
      setPipelineAnnouncement(t.announcements.pipelineFailed);
      toast({ title: t.toasts.deployFailedTitle, variant: 'destructive', duration: 5000 });
    }
    prevPipelineStatusRef.current = pipelineStatus;
  }, [pipelineStatus, mounted, toast, t]);

  useEffect(() => {
    if (!mounted || incidents.length <= prevIncidentsCountRef.current) {
      prevIncidentsCountRef.current = incidents.length;
      return;
    }
    const newIncident = incidents[0];
    setIncidentAnnouncement(
      interpolate(t.announcements.newIncident, {
        type: newIncident.type,
        status: newIncident.status,
      })
    );
    prevIncidentsCountRef.current = incidents.length;
  }, [incidents, mounted, t]);

  useEffect(() => {
    if (!mounted) return;
    if (Math.abs(latestCpu - prevCpuRef.current) > 10) {
      setMetricAnnouncement(interpolate(t.announcements.cpuChanged, { value: latestCpu }));
      prevCpuRef.current = latestCpu;
    }
    if (Math.abs(latestLatency - prevLatencyRef.current) > 50) {
      setMetricAnnouncement(interpolate(t.announcements.latencyChanged, { value: latestLatency }));
      prevLatencyRef.current = latestLatency;
    }
  }, [latestCpu, latestLatency, mounted, t]);

  return {
    ...sim,
    // state
    mounted,
    terminalRef,
    pipelineAnnouncement,
    incidentAnnouncement,
    metricAnnouncement,
    showRollbackConfirm,
    setShowRollbackConfirm,
    showChaosConfirm,
    setShowChaosConfirm,
    pendingChaosScenario,
    // derived metrics
    latestCpu,
    latestLatency,
    currentMemoryUsagePercent,
    currentMemoryUsageGB,
    totalMemoryGB: TOTAL_MEMORY_GB,
    successfulDeploys,
    totalPods,
    activeChaosCount,
    isDeploying,
    // handlers
    handleQuickAction,
    runTerminalCommand,
    handleBackgroundAction,
    startDeployment,
    promoteCanary,
    handleRollbackClick,
    handleRollbackConfirm,
    handleChaosClick,
    handleChaosConfirm,
    handleChaosCancel,
    onTerminalCommand,
  };
}

export type LabActions = ReturnType<typeof useLabActions>;
