'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ShieldAlert,
  PlayCircle,
  Forward,
  Undo,
  Loader2,
  Keyboard,
  GanttChartSquare,
  History,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

const IMMERSIVE_BG = 'bg-[#0d1117]';
const IMMERSIVE_TEXT = 'text-[#c9d1d9]';
const IMMERSIVE_TEXT_MUTED = 'text-[#8b949e]';
const IMMERSIVE_ACCENT_OK = 'text-[#3fb950]';
const IMMERSIVE_ACCENT_WARN = 'text-[#d29922]';

export function ImmersiveLabLayout({
  locale = 'en',
  translations = localeTable.en,
}: ImmersiveLabLayoutProps = {}) {
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
  const [rightPanelTab, setRightPanelTab] = useState<'pipeline' | 'incidents' | 'metrics'>('pipeline');
  const { toast } = useToast();
  const terminalRef = useRef<{ setCommand: (c: string) => void; setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void }>(null);
  const prevPipelineStatusRef = useRef(pipelineStatus);
  const prevIncidentsCountRef = useRef(incidents.length);

  const cpuUsage = Number(monitoringData.cpuData[monitoringData.cpuData.length - 1]?.usage || 0);
  const memoryUsage = Number(monitoringData.memoryData[monitoringData.memoryData.length - 1]?.usage || 0);
  const p95Latency = Number(monitoringData.apiResponseData[monitoringData.apiResponseData.length - 1]?.p95 || 0);
  const totalPods = cluster.nodes.reduce((acc, n) => acc + (n.pods?.length ?? 0), 0);
  const chaosActive = incidents.filter((i) => i.status === 'Investigating').length;
  const deployState = isDeploying ? 'running' : pipelineStatus === 'paused_canary' ? 'paused_canary' : 'idle';

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
      toast({ title: 'Rollback Initiated', description: 'Rolling back to previous version.', duration: 4000 });
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
        toast({ title: 'Chaos Experiment Started', description: `Injecting ${pendingChaosScenario} fault.`, duration: 4000 });
      });
      setPendingChaosScenario(null);
    }
  };

  useEffect(() => {
    if (prevPipelineStatusRef.current !== pipelineStatus) {
      if (pipelineStatus === 'paused_canary') {
        setPipelineAnnouncement('Pipeline paused at canary stage.');
        toast({ title: 'Pipeline Paused at Canary', description: 'Review metrics to promote or rollback.', duration: 5000 });
      } else if (pipelineStatus === 'completed') {
        setPipelineAnnouncement('Pipeline deployment completed successfully.');
        toast({ title: '✅ Deployment Successful', description: 'All pods are healthy.', duration: 5000 });
      } else if (pipelineStatus === 'failed') {
        setPipelineAnnouncement('Pipeline deployment failed.');
        toast({ title: '❌ Deployment Failed', variant: 'destructive', duration: 5000 });
      }
      prevPipelineStatusRef.current = pipelineStatus;
    }
  }, [pipelineStatus, toast]);

  useEffect(() => {
    if (incidents.length > prevIncidentsCountRef.current) {
      const newIncident = incidents[0];
      setIncidentAnnouncement(`New incident: ${newIncident.type}, Status: ${newIncident.status}`);
      toast({ title: '🔥 Chaos Experiment Triggered', description: `${newIncident.type} injected.`, duration: 5000 });
      prevIncidentsCountRef.current = incidents.length;
    }
  }, [incidents, toast]);

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
      const scenario = command === 'chaos' ? cmd.trim().split(' ')[1] ?? 'latency' : null;
      handleBackgroundAction(() => {
        if (command === 'deploy') runDeployment('start', deployConfig ?? undefined);
        else runChaos(scenario ?? 'latency');
      });
      if (command === 'deploy') {
        return {
          output: [`strategy: ${deployConfig?.strategy ?? 'canary'}  weight: ${deployConfig?.weight ?? 10}%`, 'Track progress in the Pipeline panel.'],
          contextHint: 'Visual cues sync with this command.',
          suggestion: 'Run `kubectl get pods` to verify.',
          streamingSteps: ['[busy] queuing build...', '[sync] applying rollout...', '[ready] waiting for pods...'],
        };
      }
      return {
        output: [`Chaos scenario "${scenario}" armed.`],
        contextHint: 'Faults stay inside this lab.',
        suggestion: 'Use `status` to confirm recovery.',
        streamingSteps: ['[busy] priming chaos...', `[sync] issuing ${scenario}...`],
      };
    }
    return null;
  };

  return (
    <div className={cn('h-screen w-full overflow-hidden font-mono text-sm', IMMERSIVE_BG, IMMERSIVE_TEXT)}>
      <header
        className={cn('flex items-center justify-between h-14 min-h-[56px] px-4 border-b border-[#30363d] text-xs', IMMERSIVE_TEXT_MUTED)}
        aria-label="Lab status bar"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden>╭─</span>
          <span className={IMMERSIVE_ACCENT_OK}>&gt;</span>
          <span>dev.tvignoli.com</span>
          <span className={cn('border border-[#3fb950] px-2 py-1 text-[#3fb950]')}>LIVE</span>
          <span aria-hidden>─</span>
        </div>
        <div className="flex items-center gap-4">
          <span suppressHydrationWarning aria-label={`CPU ${cpuUsage}%`}>cpu:{cpuUsage}%</span>
          <span suppressHydrationWarning aria-label={`Memory ${memoryUsage}%`}>mem:{memoryUsage}%</span>
          <span className={p95Latency > 200 ? IMMERSIVE_ACCENT_WARN : undefined} suppressHydrationWarning aria-label={`P95 ${p95Latency}ms`}>p95:{p95Latency}ms</span>
          <span className="hidden sm:inline" suppressHydrationWarning>{new Date().toISOString().slice(11, 19)} UTC</span>
          <div className="flex items-center gap-1 min-h-[44px]">
            <HelpModal />
            <GuidedTour tourId="lab-tour" autoStart={false} />
          </div>
          <span className="hidden sm:inline flex items-center gap-1 min-h-[44px] items-center" title="Command palette (shortcut)">
            <Keyboard className="h-3 w-3" aria-hidden /> ⌘K
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
        <div className={cn('flex flex-col flex-1 min-w-0 border-r border-[#30363d]')}>
          <section className={cn('border-b border-[#30363d] p-2', IMMERSIVE_TEXT_MUTED)} aria-label="Cluster">
            <div className="mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
              <span aria-hidden>├─</span> cluster
            </div>
            <div className="min-h-[120px] overflow-auto">
              <KubernetesClusterViz cluster={cluster} />
            </div>
          </section>
          <section className="flex-1 flex flex-col min-h-0 border-t border-[#30363d]" aria-label="Terminal">
            <div className="flex items-center justify-between border-b border-[#30363d] px-2 py-1 text-xs text-[#8b949e]">
              <span><span className="text-[#3fb950]" aria-hidden>$</span> kubectl get pods</span>
              <span className={cn('flex items-center gap-1', IMMERSIVE_ACCENT_OK)}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse" aria-hidden /> live
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-black">
              <InteractiveTerminal
                ref={terminalRef}
                runtimeLogs={runtimeLogs}
                cluster={cluster}
                locale={locale}
                translations={translations}
                onCommand={onCommand}
              />
            </div>
          </section>
        </div>

        <div className={cn('flex flex-col lg:w-[380px] xl:w-[420px] min-w-0 border-l border-[#30363d]')}>
          <div role="tablist" aria-label="Sidebar panels" className="flex border-b border-[#30363d]">
            {[
              { id: 'pipeline' as const, label: 'Pipeline', icon: GanttChartSquare },
              { id: 'incidents' as const, label: 'Incidents', icon: History },
              { id: 'metrics' as const, label: 'Metrics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={rightPanelTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                onClick={() => setRightPanelTab(id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-xs uppercase tracking-wider min-h-[44px] border-b-2 -mb-px transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#3fb950]',
                  rightPanelTab === id
                    ? 'border-[#3fb950] text-[#c9d1d9]'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                )}
              >
                <Icon className="h-3 w-3" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <section
              id="panel-pipeline"
              role="tabpanel"
              aria-labelledby="tab-pipeline"
              hidden={rightPanelTab !== 'pipeline'}
              className={cn('p-2', IMMERSIVE_TEXT_MUTED, rightPanelTab !== 'pipeline' && 'hidden')}
            >
              <div className="mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                <span aria-hidden>├─</span> pipeline
              </div>
              <VisualDeployPipeline pipelineStages={pipeline} />
              {pipelineStatus === 'paused_canary' && canaryMetrics && (
                <div className="mt-2">
                  <CanaryAnalysis metrics={canaryMetrics} />
                </div>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {pipelineStatus === 'paused_canary' ? (
                  <>
                    <Button size="sm" onClick={() => handleBackgroundAction(() => runDeployment('promote'))} className="w-full font-mono bg-[#238636] hover:bg-[#2ea043] text-white border-0 min-h-[44px]">
                      <Forward className="mr-2 h-3 w-3" /> Promote Canary
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleRollbackClick} disabled={isDeploying} className="w-full font-mono min-h-[44px]">
                      {isDeploying ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Undo className="mr-2 h-3 w-3" />}
                      {isDeploying ? 'Rolling back...' : 'Rollback'}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                    disabled={isDeploying}
                    className="w-full font-mono bg-[#238636] hover:bg-[#2ea043] text-white border-0 min-h-[44px]"
                  >
                    {isDeploying ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <PlayCircle className="mr-2 h-3 w-3" />}
                    {isDeploying ? 'Deploying...' : 'Run Deployment'}
                  </Button>
                )}
              </div>
            </section>
            <section
              id="panel-incidents"
              role="tabpanel"
              aria-labelledby="tab-incidents"
              hidden={rightPanelTab !== 'incidents'}
              className={cn('p-2', IMMERSIVE_TEXT_MUTED, rightPanelTab !== 'incidents' && 'hidden')}
            >
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                <span aria-hidden>├─</span>
                <ShieldAlert className="h-3 w-3" aria-hidden /> incidents
              </div>
              <IncidentHistory incidents={incidents} />
            </section>
            <section
              id="panel-metrics"
              role="tabpanel"
              aria-labelledby="tab-metrics"
              hidden={rightPanelTab !== 'metrics'}
              className={cn('p-2', IMMERSIVE_TEXT_MUTED, rightPanelTab !== 'metrics' && 'hidden')}
            >
              <div className="mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                <span aria-hidden>├─</span> metrics
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[#3fb950] font-medium">CPU {cpuUsage}%</p>
                  <div className="h-20 -ml-2">
                    <CpuUsageChart data={monitoringData.cpuData} />
                  </div>
                </div>
                <div>
                  <p className="text-[#58a6ff] font-medium">Mem {memoryUsage}%</p>
                  <div className="h-20 -ml-2">
                    <MemoryUsageChart data={monitoringData.memoryData} />
                  </div>
                </div>
                <div>
                  <p className={cn('font-medium', p95Latency > 200 ? 'text-[#d29922]' : 'text-[#c9d1d9]')}>P95 {p95Latency}ms</p>
                  <div className="h-20 -ml-2">
                    <ApiResponseTimeChart data={monitoringData.apiResponseData} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div
        className={cn('flex items-center gap-2 px-3 py-2 border-t border-[#30363d] text-xs', IMMERSIVE_TEXT_MUTED)}
        aria-label="Quick action commands"
      >
        <span aria-hidden>├─</span>
        <button type="button" onClick={() => handleQuickAction('kubectl get pods')} className="min-h-[44px] min-w-[44px] sm:min-w-0 px-2 hover:text-[#c9d1d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fb950] rounded">
          get pods
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => handleQuickAction('helm list')} className="min-h-[44px] min-w-[44px] sm:min-w-0 px-2 hover:text-[#c9d1d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fb950] rounded">
          helm list
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => handleQuickAction('deploy --weight=20')} className={cn('min-h-[44px] min-w-[44px] sm:min-w-0 px-2 text-[#3fb950] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fb950] rounded')}>
          deploy
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => handleChaosClick('pod_failure')} className={cn('min-h-[44px] min-w-[44px] sm:min-w-0 px-2 text-[#f85149] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f85149] rounded')}>
          chaos:pod
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => handleChaosClick('latency')} className={cn('min-h-[44px] min-w-[44px] sm:min-w-0 px-2 text-[#f85149] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f85149] rounded')}>
          chaos:latency
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => handleChaosClick('cpu_spike')} className={cn('min-h-[44px] min-w-[44px] sm:min-w-0 px-2 text-[#f85149] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f85149] rounded')}>
          chaos:cpu
        </button>
      </div>

      <footer
        className={cn('flex items-center gap-3 px-3 py-1 border-t border-[#30363d] text-xs', IMMERSIVE_TEXT_MUTED)}
        aria-label="Status"
      >
        <span aria-hidden>╰─</span>
        <span># dev-cluster</span>
        <span aria-hidden>|</span>
        <span>{totalPods} pods</span>
        <span aria-hidden>|</span>
        <span>{cluster.nodes.length} nodes</span>
        <span aria-hidden>|</span>
        <span>deploy: {deployState}</span>
        <span aria-hidden>|</span>
        <span className={chaosActive > 0 ? IMMERSIVE_ACCENT_WARN : undefined}>chaos: {chaosActive} active</span>
      </footer>

      <AriaLiveRegion message={pipelineAnnouncement} priority="polite" id="immersive-pipeline-announcement" />
      <AriaLiveRegion message={incidentAnnouncement} priority="assertive" id="immersive-incident-announcement" />

      <AlertDialog open={showRollbackConfirm} onOpenChange={setShowRollbackConfirm}>
        <AlertDialogContent className="font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>Rollback to previous version. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollbackConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showChaosConfirm} onOpenChange={setShowChaosConfirm}>
        <AlertDialogContent className="font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Chaos Experiment</AlertDialogTitle>
            <AlertDialogDescription>Inject {pendingChaosScenario} fault. Simulated failures will occur.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingChaosScenario(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChaosConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Run Chaos Experiment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
