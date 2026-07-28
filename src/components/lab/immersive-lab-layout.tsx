'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import { IncidentHistory } from '@/components/lab/incident-history';
import { PostmortemButton } from '@/components/lab/postmortem-button';
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
import type { Locale, Translations } from '@/lib/types';
import { translations as localeTable } from '@/data/locales';
import { AriaLiveRegion } from '@/components/shared/aria-live-region';
import { HelpModal } from '@/components/lab/help-modal';
import { GuidedTour, buildLabTourSteps } from '@/components/onboarding/guided-tour';
import { LabConfirmDialogs } from '@/components/lab/lab-confirm-dialogs';
import { LabCommandPalette } from '@/components/lab/lab-command-palette';
import { useLabActions } from '@/hooks/use-lab-actions';

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
  const [sidePanel, setSidePanel] = useState<SidePanel>('pipeline');
  const lab = useLabActions(translations);
  const {
    runtimeLogs,
    monitoringData,
    pipeline,
    cluster,
    isDeploying,
    pipelineStatus,
    incidents,
    canaryMetrics,
    terminalRef,
    latestCpu,
    latestLatency,
    currentMemoryUsagePercent,
    totalPods,
    activeChaosCount,
    handleQuickAction,
    startDeployment,
    promoteCanary,
    handleRollbackClick,
    handleChaosClick,
    onTerminalCommand,
  } = lab;

  const deployState = isDeploying ? 'running' : pipelineStatus === 'paused_canary' ? 'paused' : 'idle';

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
        {/* Right padding reserves space for the fixed layout selector (exit affordance). */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, pr: { xs: '110px', md: '120px' } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t.title}
            </Typography>
            <Chip size="small" label={t.live} sx={{ bgcolor: 'var(--md-sys-color-tertiary-container)', fontWeight: 600 }} />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" suppressHydrationWarning>CPU {latestCpu}%</Typography>
            <Typography variant="caption" suppressHydrationWarning>Mem {currentMemoryUsagePercent}%</Typography>
            <Typography variant="caption" color={latestLatency > 200 ? 'warning.main' : 'inherit'} suppressHydrationWarning>
              P95 {latestLatency}ms
            </Typography>
            <LabCommandPalette
              translations={translations}
              onRunCommand={lab.runTerminalCommand}
              onChaos={lab.handleChaosClick}
            />
            <HelpModal translations={translations} />
            <GuidedTour
              tourId="lab-tour"
              autoStart={false}
              steps={buildLabTourSteps(translations)}
              labels={t.tour}
            />
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: { lg: '1px solid var(--md-sys-color-outline-variant)' } }}>
          <Box id="cluster" sx={{ p: 2, borderBottom: '1px solid var(--md-sys-color-outline-variant)', bgcolor: 'var(--md-sys-color-surface-container-low)' }}>
            <Typography variant="overline" sx={{ color: 'var(--md-sys-color-on-surface-variant)', mb: 1, display: 'block' }}>
              {t.sections.cluster}
            </Typography>
            <Box sx={{ minHeight: 120, maxHeight: 180, overflow: 'auto' }}>
              <KubernetesClusterViz cluster={cluster} />
            </Box>
          </Box>
          <Box id="lab-terminal" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, p: 2 }}>
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
              <Stack id="pipeline" spacing={2}>
                <VisualDeployPipeline pipelineStages={pipeline} />
                {pipelineStatus === 'paused_canary' && canaryMetrics && <CanaryAnalysis metrics={canaryMetrics} />}
                {pipelineStatus === 'paused_canary' ? (
                  <Stack spacing={1}>
                    <Button fullWidth onClick={promoteCanary} startIcon={<Forward size={16} />}>
                      {t.actions.promote}
                    </Button>
                    <Button fullWidth variant="destructive" onClick={handleRollbackClick} disabled={isDeploying} startIcon={<Undo size={16} />}>
                      {isDeploying ? t.actions.rollingBack : t.actions.rollback}
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => startDeployment()}
                    disabled={isDeploying}
                    startIcon={isDeploying ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  >
                    {isDeploying ? t.actions.deploying : t.actions.deploy}
                  </Button>
                )}
              </Stack>
            )}
            {sidePanel === 'incidents' && (
              <Stack id="incident-history" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <PostmortemButton
                  translations={translations}
                  incidents={incidents}
                  logs={runtimeLogs}
                  successfulDeploys={lab.successfulDeploys}
                />
                <IncidentHistory incidents={incidents} translations={translations} />
              </Stack>
            )}
            {sidePanel === 'metrics' && (
              <Stack id="lab-metrics" spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="primary">{t.metrics.cpu} {latestCpu}%</Typography>
                  <Box sx={{ height: 80 }}><CpuUsageChart data={monitoringData.cpuData} compact /></Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2">{t.metrics.memory} {currentMemoryUsagePercent}%</Typography>
                  <Box sx={{ height: 80 }}><MemoryUsageChart data={monitoringData.memoryData} compact /></Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2">{t.metrics.latency} {latestLatency}ms</Typography>
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
        <Stack id="lab-quick-actions" direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
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
          <Typography variant="caption" color="text.secondary" suppressHydrationWarning>{totalPods} pods</Typography>
          <Typography variant="caption" color="text.secondary">{cluster.nodes.length} nodes</Typography>
          <Typography variant="caption" color="text.secondary">deploy: {deployState}</Typography>
          <Typography variant="caption" color={activeChaosCount > 0 ? 'warning.main' : 'text.secondary'}>
            chaos: {activeChaosCount} active
          </Typography>
        </Stack>
      </Paper>

      <AriaLiveRegion message={lab.pipelineAnnouncement} priority="polite" id="immersive-pipeline-announcement" />
      <AriaLiveRegion message={lab.incidentAnnouncement} priority="assertive" id="immersive-incident-announcement" />

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
