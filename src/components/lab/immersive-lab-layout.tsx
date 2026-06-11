'use client';

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import { IncidentHistory } from '@/components/lab/incident-history';
import { CanaryAnalysis } from '@/components/lab/canary-analysis';
import { CpuUsageChart } from '@/components/lab/cpu-chart';
import { MemoryUsageChart } from '@/components/lab/memory-chart';
import { ApiResponseTimeChart } from '@/components/lab/api-response-chart';
import { Button } from '@/components/ui-mui';
import {
  PlayCircle,
  Forward,
  Undo,
  Loader2,
  History,
  BarChart3,
  Route,
} from 'lucide-react';
import type { DeployConfig, Locale, Translations } from '@/lib/types';
import { translations as localeTable } from '@/data/locales';
import { AriaLiveRegion } from '@/components/shared/aria-live-region';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HelpModal } from '@/components/lab/help-modal';
import { GuidedTour } from '@/components/onboarding/guided-tour';
import { useToast } from '@/hooks/use-toast';

interface ImmersiveLabLayoutProps {
  locale?: Locale;
  translations?: Translations;
}

type SidePanel = 'pipeline' | 'incidents' | 'metrics';

export function ImmersiveLabLayout({
  locale = 'en',
  translations = localeTable.en,
}: ImmersiveLabLayoutProps = {}) {
  const t = translations.lab;
  const {
    runtimeLogs,
    monitoringData,
    pipeline,
    cluster,
    isDeploying,
    pipelineStatus,
    incidents,
    canaryMetrics,
    runChaos,
    runDeployment,
  } = useLabSimulation();

  const [pipelineAnnouncement, setPipelineAnnouncement] = useState('');
  const [incidentAnnouncement, setIncidentAnnouncement] = useState('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showChaosConfirm, setShowChaosConfirm] = useState(false);
  const [pendingChaosScenario, setPendingChaosScenario] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>('pipeline');
  const { toast } = useToast();
  const terminalRef = useRef<{
    setCommand: (c: string) => void;
    setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void;
  }>(null);
  const prevPipelineStatusRef = useRef(pipelineStatus);
  const prevIncidentsCountRef = useRef(incidents.length);

  const cpuUsage = Number(monitoringData.cpuData[monitoringData.cpuData.length - 1]?.usage || 0);
  const memoryUsage = Number(monitoringData.memoryData[monitoringData.memoryData.length - 1]?.usage || 0);
  const p95Latency = Number(monitoringData.apiResponseData[monitoringData.apiResponseData.length - 1]?.p95 || 0);
  const totalPods = cluster.nodes.reduce((acc, n) => acc + (n.pods?.length ?? 0), 0);
  const chaosActive = incidents.filter((i) => i.status === 'Investigating').length;
  const deployState = isDeploying ? 'running' : pipelineStatus === 'paused_canary' ? 'paused' : 'idle';

  const handleQuickAction = (command: string) => {
    terminalRef.current?.setActiveTab('terminal');
    terminalRef.current?.setCommand(command);
  };

  const handleBackgroundAction = (action: () => void) => {
    terminalRef.current?.setActiveTab('logs');
    action();
    window.dispatchEvent(new CustomEvent('lab_activity', { detail: { type: 'lab_interaction', data: {} } }));
  };

  const handleRollbackClick = () => setShowRollbackConfirm(true);
  const handleRollbackConfirm = () => {
    setShowRollbackConfirm(false);
    handleBackgroundAction(() => {
      runDeployment('rollback');
      toast({ title: t.actions.rollback, duration: 4000 });
    });
  };

  const handleChaosClick = (scenario: string) => {
    setPendingChaosScenario(scenario);
    setShowChaosConfirm(true);
  };
  const handleChaosConfirm = () => {
    if (pendingChaosScenario) {
      setShowChaosConfirm(false);
      handleBackgroundAction(() => {
        runChaos(pendingChaosScenario);
        toast({ title: t.dialogs.chaosTitle, duration: 4000 });
      });
      setPendingChaosScenario(null);
    }
  };

  useEffect(() => {
    if (prevPipelineStatusRef.current !== pipelineStatus) {
      if (pipelineStatus === 'paused_canary') setPipelineAnnouncement('Pipeline paused at canary.');
      else if (pipelineStatus === 'completed') setPipelineAnnouncement('Deployment completed.');
      else if (pipelineStatus === 'failed') setPipelineAnnouncement('Deployment failed.');
      prevPipelineStatusRef.current = pipelineStatus;
    }
  }, [pipelineStatus]);

  useEffect(() => {
    if (incidents.length > prevIncidentsCountRef.current) {
      const newIncident = incidents[0];
      setIncidentAnnouncement(`New incident: ${newIncident.type}`);
      prevIncidentsCountRef.current = incidents.length;
    }
  }, [incidents]);

  const parseDeployCommand = (cmd: string): DeployConfig | null => {
    const parts = cmd.split(' ');
    if (parts[0] !== 'deploy') return null;
    const config: DeployConfig = { strategy: 'canary', weight: 10, version: `v1.${Math.floor(Math.random() * 9) + 1}.0` };
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === '--strategy' && parts[i + 1]) config.strategy = parts[i + 1];
      if (parts[i] === '--weight' && parts[i + 1]) config.weight = parseInt(parts[i + 1], 10) || 10;
      if (parts[i] === '--version' && parts[i + 1]) config.version = parts[i + 1];
    }
    return config;
  };

  const onCommand = (cmd: string) => {
    const [command] = cmd.trim().split(' ');
    if (command === 'deploy' || command === 'chaos') {
      const deployConfig = command === 'deploy' ? parseDeployCommand(cmd) : null;
      const scenario = command === 'chaos' ? (cmd.trim().split(' ')[1] ?? 'latency') : null;
      handleBackgroundAction(() => {
        if (command === 'deploy') runDeployment('start', deployConfig ?? undefined);
        else runChaos(scenario ?? 'latency');
      });
      if (command === 'deploy') {
        return {
          output: [`strategy: ${deployConfig?.strategy ?? 'canary'}  weight: ${deployConfig?.weight ?? 10}%`],
          contextHint: 'Track progress in the Pipeline panel.',
          suggestion: 'Run `kubectl get pods` to verify.',
          streamingSteps: ['[busy] queuing build…', '[sync] applying rollout…'],
        };
      }
      return {
        output: [`Chaos scenario "${scenario}" armed.`],
        contextHint: 'Faults stay inside this lab.',
        suggestion: 'Use `status` to confirm recovery.',
        streamingSteps: ['[busy] priming chaos…'],
      };
    }
    return null;
  };

  const quickActions = [
    { label: 'get pods', cmd: 'kubectl get pods' },
    { label: 'helm list', cmd: 'helm list' },
    { label: 'deploy', cmd: 'deploy --weight=20', color: 'primary' as const },
    { label: 'chaos:pod', cmd: 'chaos pod_failure', color: 'error' as const },
    { label: 'chaos:latency', cmd: 'chaos latency', color: 'error' as const },
  ];

  return (
    <Box className="lab-md3-theme" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Paper
        elevation={0}
        component="header"
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 0,
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          bgcolor: 'var(--md-sys-color-surface-container)',
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t.title}
            </Typography>
            <Chip size="small" label={t.live} sx={{ bgcolor: 'var(--md-sys-color-tertiary-container)', fontWeight: 600 }} />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" suppressHydrationWarning>CPU {cpuUsage}%</Typography>
            <Typography variant="caption" suppressHydrationWarning>Mem {memoryUsage}%</Typography>
            <Typography variant="caption" color={p95Latency > 200 ? 'warning.main' : 'inherit'} suppressHydrationWarning>
              P95 {p95Latency}ms
            </Typography>
            <HelpModal />
            <GuidedTour tourId="lab-tour" autoStart={false} />
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: { lg: '1px solid var(--md-sys-color-outline-variant)' } }}>
          <Box sx={{ p: 2, borderBottom: '1px solid var(--md-sys-color-outline-variant)', bgcolor: 'var(--md-sys-color-surface-container-low)' }}>
            <Typography variant="overline" sx={{ color: 'var(--md-sys-color-on-surface-variant)', mb: 1, display: 'block' }}>
              {t.sections.cluster}
            </Typography>
            <Box sx={{ minHeight: 120, maxHeight: 180, overflow: 'auto' }}>
              <KubernetesClusterViz cluster={cluster} />
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, p: 2 }}>
            <InteractiveTerminal
              ref={terminalRef}
              runtimeLogs={runtimeLogs}
              cluster={cluster}
              locale={locale}
              translations={translations}
              visualVariant="md3"
              onCommand={onCommand}
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: '100%', lg: 400 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            bgcolor: 'var(--md-sys-color-surface-container-low)',
          }}
        >
          <Tabs
            value={sidePanel}
            onChange={(_, v) => setSidePanel(v)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              minHeight: 48,
              '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 },
            }}
          >
            <Tab value="pipeline" label={t.sections.pipeline} icon={<Route size={16} />} iconPosition="start" />
            <Tab value="incidents" label={t.sections.incidents} icon={<History size={16} />} iconPosition="start" />
            <Tab value="metrics" label={t.metrics.title} icon={<BarChart3 size={16} />} iconPosition="start" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {sidePanel === 'pipeline' && (
              <Stack spacing={2}>
                <VisualDeployPipeline pipelineStages={pipeline} />
                {pipelineStatus === 'paused_canary' && canaryMetrics && <CanaryAnalysis metrics={canaryMetrics} />}
                {pipelineStatus === 'paused_canary' ? (
                  <Stack spacing={1}>
                    <Button fullWidth onClick={() => handleBackgroundAction(() => runDeployment('promote'))} startIcon={<Forward size={16} />}>
                      {t.actions.promote}
                    </Button>
                    <Button fullWidth variant="destructive" onClick={handleRollbackClick} disabled={isDeploying} startIcon={<Undo size={16} />}>
                      {isDeploying ? t.actions.rollingBack : t.actions.rollback}
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                    disabled={isDeploying}
                    startIcon={isDeploying ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  >
                    {isDeploying ? t.actions.deploying : t.actions.deploy}
                  </Button>
                )}
              </Stack>
            )}
            {sidePanel === 'incidents' && <IncidentHistory incidents={incidents} />}
            {sidePanel === 'metrics' && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="primary">{t.metrics.cpu} {cpuUsage}%</Typography>
                  <Box sx={{ height: 80 }}><CpuUsageChart data={monitoringData.cpuData} compact /></Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2">{t.metrics.memory} {memoryUsage}%</Typography>
                  <Box sx={{ height: 80 }}><MemoryUsageChart data={monitoringData.memoryData} compact /></Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2">{t.metrics.latency} {p95Latency}ms</Typography>
                  <Box sx={{ height: 80 }}><ApiResponseTimeChart data={monitoringData.apiResponseData} compact /></Box>
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        component="footer"
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          bgcolor: 'var(--md-sys-color-surface-container)',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          {quickActions.map((action) => (
            <Chip
              key={action.cmd}
              label={action.label}
              size="small"
              clickable
              onClick={() => (action.cmd.startsWith('chaos') ? handleChaosClick(action.cmd.split(' ')[1]) : handleQuickAction(action.cmd))}
              sx={{
                fontWeight: 600,
                ...(action.color === 'error'
                  ? { color: 'var(--md-sys-color-error)', borderColor: 'var(--md-sys-color-error)' }
                  : {}),
              }}
              variant="outlined"
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">dev-cluster</Typography>
          <Typography variant="caption" color="text.secondary">{totalPods} pods</Typography>
          <Typography variant="caption" color="text.secondary">{cluster.nodes.length} nodes</Typography>
          <Typography variant="caption" color="text.secondary">deploy: {deployState}</Typography>
          <Typography variant="caption" color={chaosActive > 0 ? 'warning.main' : 'text.secondary'}>
            chaos: {chaosActive} active
          </Typography>
        </Stack>
      </Paper>

      <AriaLiveRegion message={pipelineAnnouncement} priority="polite" id="immersive-pipeline-announcement" />
      <AriaLiveRegion message={incidentAnnouncement} priority="assertive" id="immersive-incident-announcement" />

      <AlertDialog open={showRollbackConfirm} onOpenChange={setShowRollbackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.rollbackTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogs.rollbackDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.dialogs.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollbackConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.actions.rollback}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showChaosConfirm} onOpenChange={setShowChaosConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.chaosTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogs.chaosDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingChaosScenario(null)}>{t.dialogs.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleChaosConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.dialogs.chaosTitle}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
