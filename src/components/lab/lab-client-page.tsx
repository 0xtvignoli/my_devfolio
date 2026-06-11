'use client';

import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { Button } from '@/components/ui-mui';
import {
  Zap,
  ShieldAlert,
  FileTerminal,
  PlayCircle,
  Forward,
  Undo,
  Loader2,
  GaugeCircle,
} from 'lucide-react';
import { CpuUsageChart } from '@/components/lab/cpu-chart';
import { MemoryUsageChart } from '@/components/lab/memory-chart';
import { DeploymentStatusChart } from '@/components/lab/deployment-status-chart';
import { ApiResponseTimeChart } from '@/components/lab/api-response-chart';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import type { DeployConfig, Locale, Translations } from '@/lib/types';
import { IncidentHistory } from '@/components/lab/incident-history';
import { CanaryAnalysis } from '@/components/lab/canary-analysis';
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
import { useToast } from '@/hooks/use-toast';
import { GuidedTour } from '@/components/onboarding/guided-tour';
import { LabHeroHeader } from '@/components/lab/md3/lab-hero-header';
import { LabMetricCard } from '@/components/lab/md3/lab-metric-card';
import { LabSectionCard } from '@/components/lab/md3/lab-section-card';

interface LabClientPageProps {
  locale: Locale;
  translations: Translations;
}

export function LabClientPage({ locale, translations }: LabClientPageProps) {
  const t = translations.lab;
  const {
    runtimeLogs,
    monitoringData,
    pipeline,
    cluster,
    isDeploying,
    pipelineStatus,
    isAutoChaosEnabled,
    incidents,
    canaryMetrics,
    runChaos,
    runDeployment,
    toggleAutoChaos,
  } = useLabSimulation();

  const [mounted, setMounted] = useState(false);
  const [pipelineAnnouncement, setPipelineAnnouncement] = useState('');
  const [incidentAnnouncement, setIncidentAnnouncement] = useState('');
  const [metricAnnouncement, setMetricAnnouncement] = useState('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showChaosConfirm, setShowChaosConfirm] = useState(false);
  const [pendingChaosScenario, setPendingChaosScenario] = useState<string | null>(null);
  const { toast } = useToast();
  const prevPipelineStatusRef = useRef(pipelineStatus);
  const prevIncidentsCountRef = useRef(incidents.length);
  const prevCpuRef = useRef(0);
  const prevLatencyRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalMemoryGB = 32;
  const currentMemoryUsagePercent = mounted
    ? ((monitoringData.memoryData[monitoringData.memoryData.length - 1]?.usage as number) ?? 0)
    : 0;
  const currentMemoryUsageGB = mounted
    ? ((currentMemoryUsagePercent / 100) * totalMemoryGB).toFixed(1)
    : '0.0';
  const terminalRef = useRef<{
    setCommand: (command: string) => void;
    setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void;
  }>(null);

  const handleQuickAction = (command: string) => {
    terminalRef.current?.setActiveTab('terminal');
    terminalRef.current?.setCommand(command);
  };

  const handleBackgroundAction = (action: () => void) => {
    terminalRef.current?.setActiveTab('logs');
    action();
    window.dispatchEvent(
      new CustomEvent('lab_activity', { detail: { type: 'lab_interaction', data: {} } })
    );
  };

  const handleRollbackClick = () => setShowRollbackConfirm(true);
  const handleRollbackConfirm = () => {
    setShowRollbackConfirm(false);
    handleBackgroundAction(() => {
      runDeployment('rollback');
      toast({
        title: t.actions.rollback,
        description: 'Rolling back to previous version.',
        duration: 4000,
      });
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
        toast({
          title: t.dialogs.chaosTitle,
          description: `Injecting ${pendingChaosScenario} fault.`,
          duration: 4000,
        });
      });
      setPendingChaosScenario(null);
    }
  };

  const parseDeployCommand = (cmd: string): DeployConfig | null => {
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
    }
    return config;
  };

  const successfulDeploys = mounted
    ? monitoringData.deploymentData
        .filter((d) => d.status === 'success')
        .reduce((acc, d) => acc + d.count, 0)
    : 0;
  const latestCpu = mounted ? Number(monitoringData.cpuData.at(-1)?.usage ?? 0) : 0;
  const latestLatency = mounted ? Number(monitoringData.apiResponseData.at(-1)?.p95 ?? 0) : 0;

  useEffect(() => {
    if (mounted && prevPipelineStatusRef.current !== pipelineStatus) {
      if (pipelineStatus === 'paused_canary') {
        setPipelineAnnouncement('Pipeline paused at canary stage.');
        toast({ title: 'Pipeline Paused', description: 'Review metrics to promote or rollback.', duration: 5000 });
      } else if (pipelineStatus === 'completed') {
        setPipelineAnnouncement('Pipeline deployment completed successfully.');
        toast({ title: 'Deployment Successful', description: 'All pods are healthy.', duration: 5000 });
      } else if (pipelineStatus === 'failed') {
        setPipelineAnnouncement('Pipeline deployment failed.');
        toast({ title: 'Deployment Failed', variant: 'destructive', duration: 5000 });
      }
      prevPipelineStatusRef.current = pipelineStatus;
    }
  }, [pipelineStatus, mounted, toast]);

  useEffect(() => {
    if (mounted && incidents.length > prevIncidentsCountRef.current) {
      const newIncident = incidents[0];
      setIncidentAnnouncement(`New incident: ${newIncident.type}, Status: ${newIncident.status}`);
      toast({
        title: 'Chaos Experiment',
        description: `${newIncident.type} injected.`,
        duration: 5000,
      });
      prevIncidentsCountRef.current = incidents.length;
    }
  }, [incidents, mounted, toast]);

  useEffect(() => {
    if (mounted) {
      const cpuChange = Math.abs(latestCpu - prevCpuRef.current);
      const latencyChange = Math.abs(latestLatency - prevLatencyRef.current);
      if (cpuChange > 10) {
        setMetricAnnouncement(`CPU usage changed to ${latestCpu}%`);
        prevCpuRef.current = latestCpu;
      }
      if (latencyChange > 50) {
        setMetricAnnouncement(`API latency changed to ${latestLatency}ms`);
        prevLatencyRef.current = latestLatency;
      }
    }
  }, [latestCpu, latestLatency, mounted]);

  const missionPlaybook = [
    { label: t.macros.clusterPulse.label, description: t.macros.clusterPulse.description, command: 'kubectl get pods', icon: FileTerminal, destructive: false },
    { label: t.macros.canary.label, description: t.macros.canary.description, command: 'deploy --strategy=canary --weight=20', icon: Zap, destructive: false },
    { label: t.macros.blueGreen.label, description: t.macros.blueGreen.description, command: 'deploy --strategy=blue-green', icon: PlayCircle, destructive: false },
    { label: t.macros.chaosPod.label, description: t.macros.chaosPod.description, command: 'chaos pod_failure', icon: ShieldAlert, destructive: true },
    { label: t.macros.chaosLatency.label, description: t.macros.chaosLatency.description, command: 'chaos latency', icon: GaugeCircle, destructive: true },
  ] as const;

  const executeMacro = (macroCommand: string) => {
    const trimmed = macroCommand.trim();
    const [command] = trimmed.split(' ');
    if (command === 'deploy') {
      const deployConfig = parseDeployCommand(trimmed);
      handleBackgroundAction(() => runDeployment('start', deployConfig || undefined));
      return;
    }
    if (command === 'chaos') {
      const [, scenario = 'latency'] = trimmed.split(' ');
      handleChaosClick(scenario);
      return;
    }
    handleQuickAction(trimmed);
  };

  const isMacroDisabled = (macroCommand: string) => {
    if (macroCommand.startsWith('chaos')) return isAutoChaosEnabled || isDeploying;
    if (macroCommand.startsWith('deploy')) return isDeploying;
    return false;
  };

  const quickCommands = [
    'kubectl get pods',
    'kubectl describe pod api',
    'cat contact.txt',
  ] as const;

  return (
    <Box className="lab-md3-theme" sx={{ minHeight: '100%', pb: 6 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <LabHeroHeader
          title={t.title}
          subtitle={t.subtitle}
          liveLabel={t.live}
          actions={
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <HelpModal />
              <GuidedTour tourId="lab-tour" autoStart={false} />
            </Stack>
          }
          stats={[
            { label: t.metrics.cpu, value: `${latestCpu}%`, accent: 'var(--md-sys-color-primary)' },
            { label: 'P95', value: `${latestLatency}ms`, accent: 'var(--md-sys-color-warning)' },
            { label: t.metrics.deploys, value: successfulDeploys, accent: 'var(--md-sys-color-tertiary)' },
          ]}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: 3,
          }}
          aria-label="Terminal and Mission Control"
        >
          <LabSectionCard title={t.terminal.title} subtitle={t.terminal.description}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {quickCommands.map((cmd) => (
                  <Chip
                    key={cmd}
                    label={cmd}
                    variant="outlined"
                    clickable
                    onClick={() => handleQuickAction(cmd)}
                    sx={{
                      fontFamily: 'var(--font-family-mono), monospace',
                      fontSize: '0.75rem',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                      '&:hover': { bgcolor: 'var(--md-sys-color-surface-container-high)' },
                    }}
                  />
                ))}
              </Stack>
              <Box
                className="lab-md3-surface-high"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {t.terminal.connected}
                </Typography>
                <Chip
                  size="small"
                  label={t.live}
                  sx={{
                    height: 24,
                    bgcolor: 'var(--md-sys-color-tertiary-container)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  borderRadius: 'var(--lab-radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                }}
              >
                <InteractiveTerminal
                  ref={terminalRef}
                  runtimeLogs={runtimeLogs}
                  cluster={cluster}
                  locale={locale}
                  translations={translations}
                  visualVariant="md3"
                  onCommand={(cmd) => {
                    const [command] = cmd.trim().split(' ');
                    if (command === 'deploy' || command === 'chaos') {
                      const deployConfig = command === 'deploy' ? parseDeployCommand(cmd) : null;
                      const scenario = command === 'chaos' ? (cmd.trim().split(' ')[1] ?? 'latency') : null;
                      handleBackgroundAction(() => {
                        if (command === 'deploy') runDeployment('start', deployConfig || undefined);
                        else runChaos(scenario || 'latency');
                      });
                      if (command === 'deploy') {
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
                      return {
                        output: [`Chaos scenario "${scenario}" injected.`],
                        contextHint: 'Faults stay inside the simulated environment.',
                        suggestion: 'Use `status` to confirm recovery.',
                        streamingSteps: ['[busy] priming chaos controller…'],
                      };
                    }
                    return null;
                  }}
                />
              </Box>
            </Stack>
          </LabSectionCard>

          <LabSectionCard title={t.missionControl.title} subtitle={t.missionControl.description}>
            <Stack spacing={2}>
              <Alert
                severity="warning"
                icon={<ShieldAlert size={18} />}
                sx={{
                  borderRadius: 'var(--lab-radius-md)',
                  bgcolor: 'var(--md-sys-color-warning-container)',
                  color: 'var(--md-sys-color-on-surface)',
                  '& .MuiAlert-icon': { color: 'var(--md-sys-color-warning)' },
                }}
              >
                <Typography variant="subtitle2">{t.missionControl.sandboxTitle}</Typography>
                <Typography variant="body2">{t.missionControl.sandboxDescription}</Typography>
              </Alert>

              <Box className="lab-md3-surface-high" sx={{ px: 2, py: 1.5, borderRadius: 'var(--lab-radius-md)' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAutoChaosEnabled}
                      onChange={(_, checked) => handleBackgroundAction(() => toggleAutoChaos(checked))}
                      disabled={isDeploying}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">{t.missionControl.autoChaos}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {t.missionControl.autoChaosDescription}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                />
              </Box>

              <Stack spacing={1}>
                {missionPlaybook.map((macro) => (
                  <Box
                    key={macro.command}
                    className="lab-md3-surface-high"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 'var(--lab-radius-md)',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2">{macro.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }} noWrap>
                        {macro.description}
                      </Typography>
                    </Box>
                    <Button
                      variant={macro.destructive ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => executeMacro(macro.command)}
                      disabled={isMacroDisabled(macro.command)}
                      aria-label={`${t.actions.run}: ${macro.label}`}
                    >
                      <macro.icon size={14} style={{ marginRight: 6 }} />
                      {t.actions.run}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </LabSectionCard>
        </Box>

        <Box aria-labelledby="metrics-heading">
          <Typography id="metrics-heading" variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t.metrics.title}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <LabMetricCard
              label={t.metrics.cpu}
              value={`${latestCpu}%`}
              subtitle="2 nodes · 8 vCPU"
              hint={t.metrics.cpuHint}
              aria-label={`${t.metrics.cpu}: ${latestCpu}%`}
              chart={
                <div className="w-full">
                  <CpuUsageChart data={monitoringData.cpuData} compact />
                </div>
              }
            />
            <LabMetricCard
              label={t.metrics.memory}
              value={`${currentMemoryUsageGB} / ${totalMemoryGB} GB`}
              subtitle={`${currentMemoryUsagePercent}% util`}
              hint={t.metrics.memoryHint}
              accentColor="var(--md-sys-color-primary)"
              aria-label={`${t.metrics.memory}: ${currentMemoryUsageGB} GB`}
              chart={
                <div className="w-full">
                  <MemoryUsageChart data={monitoringData.memoryData} compact />
                </div>
              }
            />
            <LabMetricCard
              label={t.metrics.latency}
              value={`${latestLatency}ms`}
              subtitle="P95 · real-time"
              hint={t.metrics.latencyHint}
              accentColor="var(--md-sys-color-warning)"
              aria-label={`${t.metrics.latency}: ${latestLatency}ms`}
              chart={
                <div className="w-full">
                  <ApiResponseTimeChart data={monitoringData.apiResponseData} compact />
                </div>
              }
            />
            <LabMetricCard
              label={t.metrics.deploys}
              value={successfulDeploys}
              subtitle="successful · 7d"
              hint={t.metrics.deploysHint}
              accentColor="var(--md-sys-color-tertiary)"
              aria-label={`${t.metrics.deploys}: ${successfulDeploys}`}
              chart={
                <div className="w-full">
                  <DeploymentStatusChart data={monitoringData.deploymentData} compact />
                </div>
              }
            />
          </Box>
        </Box>

        <LabSectionCard
          id="incident-history"
          title={t.sections.incidents}
          subtitle={t.sections.incidentsSubtitle}
        >
          <IncidentHistory incidents={incidents} />
        </LabSectionCard>

        <LabSectionCard id="cluster" title={t.sections.cluster} noPadding>
          <Box sx={{ p: 2, bgcolor: 'var(--md-sys-color-surface-container-lowest)' }}>
            <KubernetesClusterViz cluster={cluster} />
          </Box>
        </LabSectionCard>

        <LabSectionCard
          id="pipeline"
          title={t.sections.pipeline}
          subtitle={t.sections.pipelineSubtitle}
        >
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: '100%', px: { xs: 0, md: 2 } }}>
              <VisualDeployPipeline pipelineStages={pipeline} />
            </Box>
            {pipelineStatus === 'paused_canary' && canaryMetrics && <CanaryAnalysis metrics={canaryMetrics} />}
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {pipelineStatus === 'paused_canary' ? (
                <>
                  <Button
                    variant="default"
                    startIcon={<Forward size={16} />}
                    onClick={() => handleBackgroundAction(() => runDeployment('promote'))}
                  >
                    {t.actions.promote}
                  </Button>
                  <Button
                    variant="destructive"
                    startIcon={isDeploying ? <Loader2 size={16} className="animate-spin" /> : <Undo size={16} />}
                    onClick={handleRollbackClick}
                    disabled={isDeploying}
                  >
                    {isDeploying ? t.actions.rollingBack : t.actions.rollback}
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  startIcon={isDeploying ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                  disabled={isDeploying}
                >
                  {isDeploying ? t.actions.deploying : t.actions.deploy}
                </Button>
              )}
            </Stack>
          </Stack>
        </LabSectionCard>
      </Container>

      <AriaLiveRegion message={pipelineAnnouncement} priority="polite" id="lab-pipeline-announcement" />
      <AriaLiveRegion message={incidentAnnouncement} priority="assertive" id="lab-incident-announcement" />
      <AriaLiveRegion message={metricAnnouncement} priority="polite" id="lab-metric-announcement" />

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
            <AlertDialogDescription>
              {t.dialogs.chaosDescription.replace('{scenario}', pendingChaosScenario ?? '')}
            </AlertDialogDescription>
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
