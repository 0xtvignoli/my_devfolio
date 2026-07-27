'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
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
  Radio,
  Terminal,
} from 'lucide-react';
import { CpuUsageChart } from '@/components/lab/cpu-chart';
import { MemoryUsageChart } from '@/components/lab/memory-chart';
import { DeploymentStatusChart } from '@/components/lab/deployment-status-chart';
import { ApiResponseTimeChart } from '@/components/lab/api-response-chart';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import type { Locale, Translations } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import { IncidentHistory } from '@/components/lab/incident-history';
import { CanaryAnalysis } from '@/components/lab/canary-analysis';
import { AriaLiveRegion } from '@/components/shared/aria-live-region';
import { HelpModal } from '@/components/lab/help-modal';
import { GuidedTour, buildLabTourSteps } from '@/components/onboarding/guided-tour';
import { LabHeroHeader } from '@/components/lab/md3/lab-hero-header';
import { LabMetricCard } from '@/components/lab/md3/lab-metric-card';
import { LabMarginPanel } from '@/components/lab/lab-margin-panel';
import { LabSectionCard } from '@/components/lab/md3/lab-section-card';
import { LabConfirmDialogs } from '@/components/lab/lab-confirm-dialogs';
import { LabMissions, type MissionId } from '@/components/lab/lab-missions';
import { LabAutoDemo } from '@/components/lab/lab-auto-demo';
import { LabActivityBeacon } from '@/components/lab/lab-activity-beacon';
import { LabCommandPalette } from '@/components/lab/lab-command-palette';
import { useLabActions, parseDeployCommand } from '@/hooks/use-lab-actions';

interface LabClientPageProps {
  locale: Locale;
  translations: Translations;
}

const QUICK_COMMANDS = [
  'kubectl get pods',
  'kubectl describe pod api',
  'cat contact.txt',
] as const;

export function LabClientPage({ locale, translations }: LabClientPageProps) {
  const t = translations.lab;
  const lab = useLabActions(translations);
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
    toggleAutoChaos,
    terminalRef,
    latestCpu,
    latestLatency,
    currentMemoryUsagePercent,
    currentMemoryUsageGB,
    totalMemoryGB,
    successfulDeploys,
    handleQuickAction,
    runTerminalCommand,
    handleBackgroundAction,
    startDeployment,
    promoteCanary,
    handleRollbackClick,
    handleChaosClick,
    onTerminalCommand,
  } = lab;

  // --- Progressive disclosure: secondary sections start collapsed ---
  const [clusterExpanded, setClusterExpanded] = useState(false);
  const [incidentsExpanded, setIncidentsExpanded] = useState(false);
  const prevIncidentsRef = React.useRef(incidents.length);

  // Auto-expand incidents when a new one arrives (action → feedback).
  useEffect(() => {
    if (incidents.length > prevIncidentsRef.current) setIncidentsExpanded(true);
    prevIncidentsRef.current = incidents.length;
  }, [incidents.length]);

  // --- Deep links: /lab?cmd=<command> and /lab?mission=canary|chaos|bluegreen ---
  const [missionAutoStart, setMissionAutoStart] = useState<MissionId | null>(null);
  const [hasDeepLink, setHasDeepLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cmd = params.get('cmd');
    const mission = params.get('mission');
    if (!cmd && !mission) return;
    setHasDeepLink(true);
    if (mission === 'canary' || mission === 'chaos' || mission === 'bluegreen') {
      setMissionAutoStart(mission);
      document.getElementById('lab-mission')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (cmd) {
      // Small delay so the terminal is mounted and the session banner is shown.
      const timer = setTimeout(() => runTerminalCommand(cmd), 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Palette navigation: expand collapsed sections before scrolling to them.
  const handlePaletteNavigate = (sectionId: string) => {
    if (sectionId === 'cluster') setClusterExpanded(true);
    if (sectionId === 'incident-history') setIncidentsExpanded(true);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
      startDeployment(parseDeployCommand(trimmed) ?? undefined);
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

  return (
    <Box className="lab-md3-theme" sx={{ minHeight: '100%', pb: 6 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <LabHeroHeader
          title={t.title}
          subtitle={t.subtitle}
          liveLabel={t.live}
          actions={
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <LabCommandPalette
                translations={translations}
                onRunCommand={runTerminalCommand}
                onChaos={handleChaosClick}
                onNavigate={handlePaletteNavigate}
              />
              <HelpModal translations={translations} />
              <GuidedTour
                tourId="lab-tour"
                autoStart={false}
                steps={buildLabTourSteps(translations)}
                labels={t.tour}
              />
              <Link
                href={localizedPath(locale, '/live')}
                className="inline-flex items-center gap-1 rounded-[8px] border border-[var(--md-sys-color-outline-variant)] px-2 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-primary)] hover:border-[var(--md-sys-color-primary)]"
                title="Live Ops — real commands vs emulated AWS"
              >
                <Radio size={14} aria-hidden />
                <span className="hidden sm:inline">Live Ops</span>
              </Link>
              {/* Native <a>, not Next <Link>: /shell needs a full-document load so
                  its COOP/COEP isolation headers take effect (a soft SPA nav
                  leaves crossOriginIsolated=false and bash can't run). */}
              <a
                href={localizedPath(locale, '/shell')}
                className="inline-flex items-center gap-1 rounded-[8px] border border-[var(--md-sys-color-outline-variant)] px-2 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-primary)] hover:border-[var(--md-sys-color-primary)]"
                title="Real shell — bash running in your browser (WASM)"
              >
                <Terminal size={14} aria-hidden />
                <span className="hidden sm:inline">Shell</span>
              </a>
            </Stack>
          }
          stats={[
            { label: t.metrics.cpu, value: `${latestCpu}%`, accent: 'var(--md-sys-color-primary)' },
            { label: 'P95', value: `${latestLatency}ms`, accent: 'var(--md-sys-color-warning)' },
            { label: t.metrics.deploys, value: successfulDeploys, accent: 'var(--md-sys-color-tertiary)' },
          ]}
        />

        <LabMissions
          translations={translations}
          pipelineStatus={pipelineStatus}
          incidentsCount={incidents.length}
          onRunCommand={runTerminalCommand}
          autoStartMission={missionAutoStart}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: 3,
          }}
          aria-label="Terminal and Mission Control"
        >
          <LabSectionCard id="lab-terminal" title={t.terminal.title} subtitle={t.terminal.description}>
            <Stack spacing={2}>
              <Stack id="lab-quick-actions" direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {QUICK_COMMANDS.map((cmd) => (
                  <Chip
                    key={cmd}
                    label={cmd}
                    variant="outlined"
                    clickable
                    onClick={() => handleQuickAction(cmd)}
                    sx={{
                      fontFamily: 'var(--font-family-mono), monospace',
                      fontSize: '0.75rem',
                      height: { xs: 40, md: 32 }, // 24px default is far under a usable touch target
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
                  onCommand={onTerminalCommand}
                />
              </Box>
            </Stack>
          </LabSectionCard>

          <LabSectionCard id="mission-control" title={t.missionControl.title} subtitle={t.missionControl.description} collapseOnCompact>
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
                      variant="outline"
                      color={macro.destructive ? 'error' : undefined}
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
                    onClick={promoteCanary}
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
                  onClick={() => startDeployment()}
                  disabled={isDeploying}
                >
                  {isDeploying ? t.actions.deploying : t.actions.deploy}
                </Button>
              )}
            </Stack>
          </Stack>
        </LabSectionCard>

        <Box id="lab-metrics" aria-labelledby="metrics-heading">
          <Typography id="metrics-heading" variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t.metrics.title}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              // 2-up on compact: one card per row cost ~960px of scroll on a phone.
              gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
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

        <LabMarginPanel
          translations={translations}
          latencyMs={latestLatency}
          cpuPercent={latestCpu}
          incidents={incidents.length}
          isDeploying={isDeploying}
          autoChaos={isAutoChaosEnabled}
        />

        <LabSectionCard
          id="cluster"
          title={t.sections.cluster}
          noPadding
          collapsible
          expanded={clusterExpanded}
          onExpandedChange={setClusterExpanded}
        >
          <Box sx={{ p: 2, bgcolor: 'var(--md-sys-color-surface-container-lowest)' }}>
            <KubernetesClusterViz cluster={cluster} />
          </Box>
        </LabSectionCard>

        <LabSectionCard
          id="incident-history"
          title={t.sections.incidents}
          subtitle={t.sections.incidentsSubtitle}
          collapsible
          expanded={incidentsExpanded}
          onExpandedChange={setIncidentsExpanded}
        >
          <IncidentHistory incidents={incidents} translations={translations} />
        </LabSectionCard>
      </Container>

      <LabAutoDemo
        translations={translations}
        runCommand={runTerminalCommand}
        disabled={hasDeepLink}
      />
      <LabActivityBeacon
        translations={translations}
        isDeploying={isDeploying}
        incidentsCount={incidents.length}
      />

      <AriaLiveRegion message={lab.pipelineAnnouncement} priority="polite" id="lab-pipeline-announcement" />
      <AriaLiveRegion message={lab.incidentAnnouncement} priority="assertive" id="lab-incident-announcement" />
      <AriaLiveRegion message={lab.metricAnnouncement} priority="polite" id="lab-metric-announcement" />

      <LabConfirmDialogs
        translations={translations}
        showRollbackConfirm={lab.showRollbackConfirm}
        setShowRollbackConfirm={lab.setShowRollbackConfirm}
        onRollbackConfirm={lab.handleRollbackConfirm}
        showChaosConfirm={lab.showChaosConfirm}
        setShowChaosConfirm={lab.setShowChaosConfirm}
        pendingChaosScenario={lab.pendingChaosScenario}
        onChaosConfirm={lab.handleChaosConfirm}
        onChaosCancel={lab.handleChaosCancel}
      />
    </Box>
  );
}
