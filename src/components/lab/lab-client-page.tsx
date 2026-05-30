'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-mui';
import { Button } from '@/components/ui-mui';
import { Zap, ShieldAlert, FileTerminal, History, Forward, Undo, PlayCircle } from 'lucide-react';
import { CpuUsageChart } from '@/components/lab/cpu-chart';
import { MemoryUsageChart } from '@/components/lab/memory-chart';
import { DeploymentStatusChart } from '@/components/lab/deployment-status-chart';
import { ApiResponseTimeChart } from '@/components/lab/api-response-chart';
import { Code, GaugeCircle, GanttChartSquare } from 'lucide-react';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import type { DeployConfig, Locale, Translations } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Loader2 } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { cn } from '@/lib/utils';
import { HelpModal } from '@/components/lab/help-modal';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { GuidedTour } from '@/components/onboarding/guided-tour';


interface LabClientPageProps {
  locale: Locale;
  translations: Translations;
}

export function LabClientPage({ locale, translations }: LabClientPageProps) {
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
    toggleAutoChaos 
  } = useLabSimulation();

  const [mounted, setMounted] = useState(false);
  const [pipelineAnnouncement, setPipelineAnnouncement] = useState('');
  const [incidentAnnouncement, setIncidentAnnouncement] = useState('');
  const [metricAnnouncement, setMetricAnnouncement] = useState('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showChaosConfirm, setShowChaosConfirm] = useState(false);
  const [pendingChaosScenario, setPendingChaosScenario] = useState<string | null>(null);
  const { isTouchDevice, prefersReducedMotion, isMobile } = useDeviceDetection();
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
    ? (monitoringData.memoryData[monitoringData.memoryData.length - 1]?.usage as number ?? 0)
    : 0;
  const currentMemoryUsageGB = mounted 
    ? (currentMemoryUsagePercent / 100 * totalMemoryGB).toFixed(1)
    : '0.0';
  const terminalRef = useRef<{ setCommand: (command: string) => void, setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void }>(null);

  const handleQuickAction = (command: string) => {
      if (terminalRef.current) {
        terminalRef.current.setActiveTab('terminal');
        terminalRef.current.setCommand(command);
      }
  }

  const handleBackgroundAction = (action: () => void) => {
      if (terminalRef.current) {
        terminalRef.current.setActiveTab('logs');
      }
      action();
      
      // Trigger gamification events
      window.dispatchEvent(new CustomEvent('lab_activity', {
        detail: { type: 'lab_interaction', data: {} }
      }));
  }

  const handleRollbackClick = () => {
    setShowRollbackConfirm(true);
  };

  const handleRollbackConfirm = () => {
    setShowRollbackConfirm(false);
    handleBackgroundAction(() => {
      runDeployment('rollback');
      toast({
        title: 'Rollback Initiated',
        description: 'Rolling back to previous version. This may take a few moments.',
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
          title: 'Chaos Experiment Started',
          description: `Injecting ${pendingChaosScenario} fault. Monitor system recovery.`,
          duration: 4000,
        });
      });
      setPendingChaosScenario(null);
    }
  };

  const parseDeployCommand = (cmd: string): DeployConfig | null => {
      const parts = cmd.split(' ');
      if (parts[0] !== 'deploy') return null;

      const config: DeployConfig = { strategy: 'canary', weight: 10, version: `v1.${Math.floor(Math.random() * 9) + 1}.0` };
      
      for(let i=1; i < parts.length; i++) {
          if (parts[i] === '--strategy' && parts[i+1]) {
              config.strategy = parts[i+1];
          }
          if (parts[i] === '--weight' && parts[i+1]) {
              config.weight = parseInt(parts[i+1], 10) || 10;
          }
           if (parts[i] === '--version' && parts[i+1]) {
              config.version = parts[i+1];
          }
      }
      return config;
  }

  const successfulDeploys = mounted 
    ? monitoringData.deploymentData
        .filter((d) => d.status === 'success')
        .reduce((acc, d) => acc + d.count, 0)
    : 0;
  const latestCpu = mounted ? Number(monitoringData.cpuData.at(-1)?.usage ?? 0) : 0;
  const latestLatency = mounted ? Number(monitoringData.apiResponseData.at(-1)?.p95 ?? 0) : 0;

  // Announce pipeline status changes and show toast
  useEffect(() => {
    if (mounted && prevPipelineStatusRef.current !== pipelineStatus) {
      if (pipelineStatus === 'paused_canary') {
        setPipelineAnnouncement('Pipeline paused at canary stage. Review metrics to promote or rollback.');
        toast({
          title: 'Pipeline Paused at Canary',
          description: 'Review metrics in the Canary Analysis panel to decide whether to promote or rollback.',
          duration: 5000,
        });
      } else if (pipelineStatus === 'completed') {
        setPipelineAnnouncement('Pipeline deployment completed successfully.');
        toast({
          title: '✅ Deployment Successful',
          description: 'Your deployment has completed successfully. All pods are healthy.',
          duration: 5000,
        });
      } else if (pipelineStatus === 'failed') {
        setPipelineAnnouncement('Pipeline deployment failed.');
        toast({
          title: '❌ Deployment Failed',
          description: 'The deployment encountered an error. Check the pipeline for details.',
          variant: 'destructive',
          duration: 5000,
        });
      }
      prevPipelineStatusRef.current = pipelineStatus;
    }
  }, [pipelineStatus, mounted, toast]);

  // Announce new incidents and show toast
  useEffect(() => {
    if (mounted && incidents.length > prevIncidentsCountRef.current) {
      const newIncident = incidents[0];
      setIncidentAnnouncement(`New incident: ${newIncident.type}, Status: ${newIncident.status}`);
      toast({
        title: '🔥 Chaos Experiment Triggered',
        description: `${newIncident.type} injected. Monitor Incident History for recovery.`,
        duration: 5000,
      });
      prevIncidentsCountRef.current = incidents.length;
    }
  }, [incidents, mounted, toast]);

  // Announce significant metric changes
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
    {
      label: 'Cluster pulse',
      description: 'List pods and their rollout status.',
      command: 'kubectl get pods',
      icon: FileTerminal,
    },
    {
      label: 'Canary 20%',
      description: 'Ship the next build to 20% of traffic.',
      command: 'deploy --strategy=canary --weight=20',
      icon: Zap,
    },
    {
      label: 'Blue/Green',
      description: 'Spin up the green environment before cutover.',
      command: 'deploy --strategy=blue-green',
      icon: PlayCircle,
    },
    {
      label: 'Chaos · pods',
      description: 'Drop a pod to validate auto-healing.',
      command: 'chaos pod_failure',
      icon: ShieldAlert,
    },
    {
      label: 'Chaos · latency',
      description: 'Spike API latency for 60s.',
      command: 'chaos latency',
      icon: GaugeCircle,
    },
  ] as const;

  const panelSurface = "lab-tty-frame rounded border-[var(--lab-border)] bg-[var(--lab-surface)]";
  const blockSurface = "border border-[var(--lab-border)] bg-[var(--lab-bg)]";

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
    if (macroCommand.startsWith('chaos')) {
      return isAutoChaosEnabled || isDeploying;
    }
    if (macroCommand.startsWith('deploy')) {
      return isDeploying;
    }
    return false;
  };

  return (
    <div className="lab-terminal-theme min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8 max-w-[1400px]">
        {/* Hero: Live Control Room – single compact block */}
        <section className="space-y-3" aria-labelledby="lab-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--lab-text-muted)] font-mono" aria-hidden="true">
              <span className="text-[var(--lab-accent)]">$</span> lab --mode=control-room --live
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-[var(--lab-border)] text-[var(--lab-accent)] text-[0.65rem] uppercase tracking-widest font-mono rounded-[var(--lab-radius-pill)] min-h-[28px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lab-accent)] animate-pulse" aria-hidden />
                LIVE
              </span>
              <HelpModal />
              <GuidedTour tourId="lab-tour" autoStart={false} />
            </div>
          </div>
          <h1 id="lab-heading" className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--lab-text)]">
            Live Control Room
          </h1>
          <p className="text-sm text-[var(--lab-text-muted)] max-w-3xl font-mono">
            {translations.nav.lab}. This is your mission console. Every visualization and deployment is driven from the terminal.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--lab-text-muted)]" role="group" aria-label="Live metrics">
            <span className="px-3 py-1.5 border border-[var(--lab-border)] rounded-[var(--lab-radius)]" suppressHydrationWarning>CPU <span className="text-[var(--lab-accent)]">{latestCpu}%</span></span>
            <span className="px-3 py-1.5 border border-[var(--lab-border)] rounded-[var(--lab-radius)]" suppressHydrationWarning>P95 <span className="text-[var(--lab-accent-cyan)]">{latestLatency}ms</span></span>
            <span className="px-3 py-1.5 border border-[var(--lab-border)] rounded-[var(--lab-radius)]" suppressHydrationWarning><span className="text-[var(--lab-accent)]">{successfulDeploys}</span> deploys · 7d</span>
          </div>
        </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]" aria-label="Terminal and Mission Control">
        <Card className={panelSurface}>
          <h2 className="lab-tty-titlebar flex items-center gap-2 text-[var(--lab-text-muted)] font-mono text-xs font-medium">
            <span className="text-[var(--lab-accent)]" aria-hidden>&gt;</span>
            Command-first Interface
          </h2>
          <CardHeader className="border-b border-[var(--lab-border)] pb-4">
            <CardDescription className="text-[var(--lab-text-muted)] text-xs font-mono">
              Every interaction flows through the terminal. Trigger rollouts, interrogate Kubernetes, or chaos-test resilience.
            </CardDescription>
            <div className="flex flex-wrap gap-2 pt-2 quick-actions-bar">
              <button
                type="button"
                onClick={() => handleQuickAction('kubectl get pods')}
                aria-label="Execute command: kubectl get pods"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono border border-[var(--lab-border)] bg-[var(--lab-bg)] text-[var(--lab-text)] hover:bg-[var(--lab-surface)] hover:border-[var(--lab-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lab-accent)]"
              >
                <span className="text-[var(--lab-accent)]">$</span> kubectl get pods
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('kubectl describe pod api')}
                aria-label="Execute command: kubectl describe pod api"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono border border-[var(--lab-border)] bg-[var(--lab-bg)] text-[var(--lab-text)] hover:bg-[var(--lab-surface)] hover:border-[var(--lab-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lab-accent)]"
              >
                <span className="text-[var(--lab-accent)]">$</span> describe pod api
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('cat contact.txt')}
                aria-label="Execute command: cat contact.txt"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono border border-[var(--lab-border)] bg-[var(--lab-bg)] text-[var(--lab-text)] hover:bg-[var(--lab-surface)] hover:border-[var(--lab-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lab-accent)]"
              >
                <span className="text-[var(--lab-accent)]">$</span> cat contact.txt
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 terminal-container">
            <div 
              className={`flex items-center justify-between p-2.5 text-xs font-mono rounded-sm ${blockSurface}`}
              aria-label="Terminal status: Connected to dev-cluster, live"
            >
              <span className="text-[var(--lab-text-muted)]">[ CONNECTED ] dev-cluster</span>
              <span className="flex items-center gap-1 text-[var(--lab-accent)]" aria-label="Live connection">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lab-accent)] animate-pulse" aria-hidden />
                live
              </span>
            </div>
            <InteractiveTerminal 
              ref={terminalRef}
              runtimeLogs={runtimeLogs}
              cluster={cluster}
              locale={locale}
              translations={translations}
              onCommand={(cmd) => {
                  const [command] = cmd.trim().split(' ');
                  if (command === 'deploy' || command === 'chaos') {
                      const deployConfig = command === 'deploy' ? parseDeployCommand(cmd) : null;
                      const scenario = command === 'chaos' ? cmd.trim().split(' ')[1] ?? 'latency' : null;
                      handleBackgroundAction(() => {
                         if (command === 'deploy') {
                             runDeployment('start', deployConfig || undefined);
                         } else {
                             runChaos(scenario || 'latency');
                         }
                      });
                      if (command === 'deploy') {
                        return {
                          output: [
                            'Dispatching CI/CD pipeline via Mission Control...',
                            `strategy: ${deployConfig?.strategy ?? 'canary'}  weight: ${deployConfig?.weight ?? 10}%  version: ${deployConfig?.version ?? 'auto'}`,
                            'Follow the Visual Deploy Pipeline and Canary Analysis modules to watch each gate.',
                          ],
                          contextHint: 'All deployments here stay inside the sandbox but mirror production-grade workflows.',
                          suggestion: 'Run `kubectl get pods` or `status` once stages flip green.',
                          streamingSteps: [
                            '[busy] queuing build jobs on GitHub Actions...',
                            '[sync] generating manifests + signing artifacts...',
                            '[ready] waiting for pods to report Ready...',
                          ],
                        };
                      }
                      return {
                        output: [
                          `Chaos scenario "${scenario}" injected. Observability panes will spike accordingly.`,
                          'Monitor Incident History to confirm self-healing and auto-rollbacks.',
                        ],
                        contextHint: 'Faults are scoped to the simulated environment only.',
                        suggestion: 'Use `status` or `kubectl get pods` to confirm recovery.',
                        streamingSteps: [
                          '[busy] priming chaos controller...',
                          `[sync] applying ${scenario} disruption...`,
                        ],
                      };
                  }
                  return null; // Let terminal handle built-in commands
              }}
            />
          </CardContent>
        </Card>

        <Card className={panelSurface}>
          <h2 className="lab-tty-titlebar flex items-center gap-2 text-[var(--lab-text-muted)] font-mono text-xs font-medium">
            <span className="text-[var(--lab-accent)]" aria-hidden>&gt;</span>
            Mission Control
          </h2>
          <CardHeader className="border-b border-[var(--lab-border)] pb-4">
            <CardDescription className="text-[var(--lab-text-muted)] text-xs font-mono">
              Toggle automation and run curated macros without leaving the console.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-start gap-2 p-3 rounded-sm ${blockSurface} border-l-2 border-l-[var(--lab-accent-amber)]`}>
              <ShieldAlert className="h-4 w-4 text-[var(--lab-accent-amber)] shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs font-medium text-[var(--lab-text)]">Simulated Environment</p>
                <p className="font-mono text-[11px] text-[var(--lab-text-muted)] mt-0.5">Actions stay inside a sandbox. No prod touch.</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-sm ${blockSurface} chaos-controls`}>
              <Switch
                id="auto-chaos-mode"
                checked={isAutoChaosEnabled}
                onCheckedChange={(checked) => handleBackgroundAction(() => toggleAutoChaos(checked))}
                disabled={isDeploying}
              />
              <Label htmlFor="auto-chaos-mode" className="flex flex-col font-mono">
                <span className="text-xs font-medium text-[var(--lab-text)]">Auto-Chaos Monkey</span>
                <span className="text-[11px] text-[var(--lab-text-muted)]">Scheduled chaos validates self-healing.</span>
              </Label>
            </div>

            <div className="space-y-2">
              {missionPlaybook.map((macro) => (
                <div key={macro.command} className={`flex items-center justify-between gap-3 p-2.5 rounded-sm ${blockSurface}`}>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-[var(--lab-text)]">{macro.label}</p>
                    <p className="font-mono text-[11px] text-[var(--lab-text-muted)] truncate">{macro.description}</p>
                  </div>
                  <Button
                    variant={macro.command.startsWith('chaos') ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => executeMacro(macro.command)}
                    disabled={isMacroDisabled(macro.command)}
                    className="shrink-0 font-mono text-xs border-[var(--lab-border)]"
                    aria-label={`Execute macro: ${macro.label}`}
                  >
                    <macro.icon className="mr-1.5 h-3 w-3" aria-hidden />
                    run
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 metrics-dashboard" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="col-span-full lab-tty-titlebar text-[var(--lab-text-muted)] font-mono text-xs font-medium">## METRICS</h2>
        <Card className={panelSurface}>
            <div className="lab-tty-titlebar flex items-center justify-between">
              <span className="text-[var(--lab-accent)]">[</span>
              <span>CPU</span>
              <span className="text-[var(--lab-accent)]">]</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[var(--lab-text-muted)] cursor-help" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-xs max-w-xs">
                    <p>Percentage of CPU cores in use. Normal: 0-70%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardContent className="pt-3">
                <div className="font-mono text-2xl font-bold text-[var(--lab-accent)]" suppressHydrationWarning aria-label={`CPU Usage: ${latestCpu}%`}>{latestCpu}%</div>
                <p className="text-[11px] text-[var(--lab-text-muted)] font-mono">2 nodes · 8 vCPU</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="CPU usage chart">
                  <CpuUsageChart data={monitoringData.cpuData} />
                </div>
            </CardContent>
        </Card>
        <Card className={panelSurface}>
            <div className="lab-tty-titlebar flex items-center justify-between">
              <span className="text-[var(--lab-accent)]">[</span>
              <span>MEM</span>
              <span className="text-[var(--lab-accent)]">]</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[var(--lab-text-muted)] cursor-help" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-xs max-w-xs">
                    <p>Total memory usage across cluster nodes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardContent className="pt-3">
                <div className="font-mono text-2xl font-bold text-[var(--lab-accent-cyan)]" suppressHydrationWarning aria-label={`Memory: ${currentMemoryUsageGB} GB / ${totalMemoryGB} GB`}>{currentMemoryUsageGB} / {totalMemoryGB} GB</div>
                <p className="text-[11px] text-[var(--lab-text-muted)] font-mono" suppressHydrationWarning>{currentMemoryUsagePercent}% util</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="Memory usage chart">
                  <MemoryUsageChart data={monitoringData.memoryData}/>
                </div>
            </CardContent>
        </Card>
        <Card className={panelSurface}>
            <div className="lab-tty-titlebar flex items-center justify-between">
              <span className="text-[var(--lab-accent)]">[</span>
              <span>P95</span>
              <span className="text-[var(--lab-accent)]">]</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[var(--lab-text-muted)] cursor-help" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-xs max-w-xs">
                    <p>95th percentile API response time. Target &lt;200ms.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardContent className="pt-3">
                <div className="font-mono text-2xl font-bold text-[var(--lab-accent-amber)]" suppressHydrationWarning aria-label={`P95: ${latestLatency}ms`}>{latestLatency}ms</div>
                <p className="text-[11px] text-[var(--lab-text-muted)] font-mono">real-time</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="API response time chart">
                  <ApiResponseTimeChart data={monitoringData.apiResponseData}/>
                </div>
            </CardContent>
        </Card>
        <Card className={panelSurface}>
            <div className="lab-tty-titlebar flex items-center justify-between">
              <span className="text-[var(--lab-accent)]">[</span>
              <span>DEPLOYS</span>
              <span className="text-[var(--lab-accent)]">]</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[var(--lab-text-muted)] cursor-help" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-xs max-w-xs">
                    <p>Successful deploys in the last 7 days.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardContent className="pt-3">
                <div className="font-mono text-2xl font-bold text-[var(--lab-accent)]" suppressHydrationWarning aria-label={`Deployments: ${successfulDeploys} in 7d`}>{successfulDeploys}</div>
                <p className="text-[11px] text-[var(--lab-text-muted)] font-mono">successful · 7d</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="Deployment status chart">
                  <DeploymentStatusChart data={monitoringData.deploymentData}/>
                </div>
            </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" aria-labelledby="incident-history-heading">
        <Card className={`lg:col-span-2 ${panelSurface}`}>
            <h2 id="incident-history-heading" className="lab-tty-titlebar flex items-center gap-2 text-[var(--lab-text-muted)] font-mono text-xs font-medium">
              <span className="text-[var(--lab-accent)]" aria-hidden>&gt;</span>
              Incident History
              <span className="text-[11px] font-normal">— resilience tests &amp; system events</span>
            </h2>
            <CardContent className="pt-4">
                <IncidentHistory incidents={incidents} />
            </CardContent>
        </Card>

        <Card className={`lg:col-span-2 cluster-visualization ${panelSurface}`} aria-labelledby="cluster-heading">
          <h2 id="cluster-heading" className="lab-tty-titlebar flex items-center gap-2 text-[var(--lab-text-muted)] font-mono text-xs font-medium">
            <span className="text-[var(--lab-accent)]" aria-hidden>&gt;</span>
            Container Orchestration
          </h2>
          <CardContent className="p-4 bg-[var(--lab-bg)]">
            <KubernetesClusterViz cluster={cluster} />
          </CardContent>
        </Card>
      </section>
        
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" aria-labelledby="pipeline-heading">
         <Card className={`lg:col-span-2 deploy-pipeline ${panelSurface}`}>
            <h2 id="pipeline-heading" className="lab-tty-titlebar flex items-center gap-2 text-[var(--lab-text-muted)] font-mono text-xs font-medium">
              <span className="text-[var(--lab-accent)]" aria-hidden>&gt;</span>
              Visual Deploy Pipeline
              <span className="text-[11px] font-normal">— CI/CD · Canary</span>
            </h2>
            <CardContent className="flex flex-col items-center gap-6 pt-4">
                 <div className="w-full px-4 pt-4">
                    <VisualDeployPipeline pipelineStages={pipeline} />
                </div>
                 {pipelineStatus === 'paused_canary' && canaryMetrics && (
                    <CanaryAnalysis metrics={canaryMetrics} />
                 )}
                 <div className="flex justify-center items-center gap-4 flex-wrap">
                    {pipelineStatus === 'paused_canary' ? (
                        <>
                            <Button
                                variant="default"
                                startIcon={<Forward className="h-4 w-4" />}
                                onClick={() => handleBackgroundAction(() => runDeployment('promote'))}
                                aria-label="Promote canary deployment to production"
                            >
                                Promote Canary
                            </Button>
                            <Button
                                variant="destructive"
                                startIcon={isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo className="h-4 w-4" />}
                                onClick={handleRollbackClick}
                                disabled={isDeploying}
                                aria-label="Rollback deployment to previous version"
                            >
                                {isDeploying ? 'Rolling back...' : 'Rollback'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="default"
                            startIcon={isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                            onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                            disabled={isDeploying}
                            aria-label={isDeploying ? 'Deployment in progress' : 'Start new deployment'}
                        >
                            {isDeploying ? 'Deploying...' : 'Run Deployment'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
      </section>

      {/* Aria-live regions for screen reader announcements */}
      <AriaLiveRegion 
        message={pipelineAnnouncement} 
        priority="polite"
        id="lab-pipeline-announcement"
      />
      <AriaLiveRegion 
        message={incidentAnnouncement} 
        priority="assertive"
        id="lab-incident-announcement"
      />
      <AriaLiveRegion 
        message={metricAnnouncement} 
        priority="polite"
        id="lab-metric-announcement"
      />

      {/* Confirmation dialogs */}
      <AlertDialog open={showRollbackConfirm} onOpenChange={setShowRollbackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>
              This will rollback the deployment to the previous version. This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Chaos Experiment</AlertDialogTitle>
            <AlertDialogDescription>
              This will inject a {pendingChaosScenario} fault into the system. This is a destructive action that will simulate system failures. Are you sure you want to proceed?
            </AlertDialogDescription>
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
    </div>
  );
}
