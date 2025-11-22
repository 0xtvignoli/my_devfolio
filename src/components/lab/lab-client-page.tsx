'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { FancyButton } from '@/components/lab/fancy-button';
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
  const terminalRef = useRef<{ setCommand: (command: string) => void, setActiveTab: (tab: 'terminal' | 'logs') => void }>(null);

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
  const latestCpu = mounted ? (monitoringData.cpuData.at(-1)?.usage ?? 0) : 0;
  const latestLatency = mounted ? (monitoringData.apiResponseData.at(-1)?.p95 ?? 0) : 0;

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

  const glassPanel = "supports-[backdrop-filter]:backdrop-blur-xl border border-slate-200/70 bg-white/95 shadow-[0_35px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-card/80 dark:shadow-[0_35px_120px_rgba(0,0,0,0.55)]";
  const blockSurface = "border border-slate-200/70 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-card/70 dark:shadow-none";
  const chipSurface = "rounded-full border border-slate-200/80 bg-white/90 text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground";

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
    <div className="container mx-auto px-4 py-16 space-y-12">
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1 text-[0.65rem] uppercase tracking-[0.25em] ${chipSurface}`}>
            Live Control Room
          </div>
          <HelpModal />
          <GuidedTour tourId="lab-tour" autoStart={false} />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          {translations.nav.lab}
        </h1>
        <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-3xl mx-auto">
          This is your mission console. Every visualization, chaos experiment, and deployment is driven from the terminal so you can reason like an operator.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-muted-foreground dark:text-muted-foreground">
          <span className={`${chipSurface} px-3 py-1`} suppressHydrationWarning>CPU {latestCpu}%</span>
          <span className={`${chipSurface} px-3 py-1`} suppressHydrationWarning>P95 {latestLatency}ms</span>
          <span className={`${chipSurface} px-3 py-1`} suppressHydrationWarning>{successfulDeploys} deploys · 7d</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className={glassPanel}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileTerminal className="h-5 w-5 text-primary" />
              Command-first Interface
            </CardTitle>
            <CardDescription>
              Every interaction flows through the terminal. Trigger rollouts, interrogate Kubernetes, or chaos-test resilience.
            </CardDescription>
            <div className="flex flex-wrap gap-2 pt-2 quick-actions-bar">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction('kubectl get pods')}
                aria-label="Execute command: kubectl get pods"
                className="focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                <FileTerminal className="mr-2 h-3 w-3" aria-hidden="true" /> kubectl get pods
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction('kubectl describe pod api')}
                aria-label="Execute command: kubectl describe pod api"
                className="focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                <FileTerminal className="mr-2 h-3 w-3" aria-hidden="true" /> describe pod api
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAction('cat contact.txt')}
                aria-label="Execute command: cat contact.txt"
                className="focus-visible:ring-4 focus-visible:ring-primary/50"
              >
                <FileTerminal className="mr-2 h-3 w-3" aria-hidden="true" /> cat contact.txt
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 terminal-container">
            <div 
              className={`flex items-center justify-between rounded-2xl p-3 text-xs font-mono text-muted-foreground dark:text-muted-foreground ${blockSurface}`}
              aria-label="Terminal status: Connected to dev-cluster, live"
            >
              <span>Connected · dev-cluster</span>
              <span className="flex items-center gap-1 text-emerald-400" aria-label="Live connection">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
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

        <Card className={glassPanel}>
          <CardHeader>
            <CardTitle>Mission Control</CardTitle>
            <CardDescription>Toggle automation and run curated macros without leaving the console.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className={`${blockSurface} rounded-2xl`}>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Simulated Environment</AlertTitle>
              <AlertDescription>
                Actions stay inside a sandbox. Use them to demonstrate operating procedures without touching prod.
              </AlertDescription>
            </Alert>

            <div className={`flex items-center space-x-2 rounded-2xl px-4 py-3 ${blockSurface} chaos-controls`}>
              <Switch
                id="auto-chaos-mode"
                checked={isAutoChaosEnabled}
                onCheckedChange={(checked) => handleBackgroundAction(() => toggleAutoChaos(checked))}
                disabled={isDeploying}
              />
              <Label htmlFor="auto-chaos-mode" className="flex flex-col">
                <span className="font-semibold">Auto-Chaos Monkey</span>
                <span className="text-xs text-muted-foreground dark:text-muted-foreground">Let scheduled chaos jobs validate self-healing.</span>
              </Label>
            </div>

            <div className="space-y-4">
              {missionPlaybook.map((macro) => (
                <div key={macro.command} className={`flex items-start justify-between gap-3 px-3 py-2 ${blockSurface} rounded-2xl`}>
                  <div>
                    <p className="font-medium text-sm">{macro.label}</p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">{macro.description}</p>
                  </div>
                  <Button
                    variant={macro.command.startsWith('chaos') ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => executeMacro(macro.command)}
                    disabled={isMacroDisabled(macro.command)}
                    className="whitespace-nowrap focus-visible:ring-4 focus-visible:ring-primary/50"
                    aria-label={`Execute macro: ${macro.label} - ${macro.description}`}
                  >
                    <macro.icon className="mr-2 h-3 w-3" aria-hidden="true" />
                    run
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 metrics-dashboard">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Percentage of CPU cores in use across the cluster. Normal range: 0-70%. Values above 70% may indicate resource constraints.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <GaugeCircle className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning aria-label={`CPU Usage: ${latestCpu}%`}>{latestCpu}%</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">across 2 nodes (8 vCPU)</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="CPU usage chart">
                  <CpuUsageChart data={monitoringData.cpuData} />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <CardTitle className="text-sm font-medium">Memory</CardTitle>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total memory usage across all cluster nodes. Includes container memory, system overhead, and buffers. Monitor for memory leaks or insufficient resources.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning aria-label={`Memory Usage: ${currentMemoryUsageGB} GB out of ${totalMemoryGB} GB, ${currentMemoryUsagePercent}% utilization`}>{currentMemoryUsageGB} / {totalMemoryGB} GB</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground" suppressHydrationWarning>{currentMemoryUsagePercent}% utilization</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="Memory usage chart">
                  <MemoryUsageChart data={monitoringData.memoryData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <CardTitle className="text-sm font-medium">API P95 Latency</CardTitle>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">95th percentile response time for API requests. P95 means 95% of requests are faster than this value. Target: &lt;200ms. Higher values may indicate performance issues.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning aria-label={`API P95 Latency: ${latestLatency} milliseconds, real-time`}>{latestLatency}ms</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">real-time</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="API response time chart">
                  <ApiResponseTimeChart data={monitoringData.apiResponseData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Number of successful deployments in the last 7 days. Includes canary, blue-green, and rolling updates. Failed deployments are tracked separately in Incident History.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Code className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning aria-label={`Deployments: ${successfulDeploys} successful in the last 7 days`}>{successfulDeploys} Successful</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">in the last 7 days</p>
                 <div className={cn(
                  "w-full -ml-4",
                  isMobile ? "h-[100px]" : "h-[80px]"
                )} aria-label="Deployment status chart">
                  <DeploymentStatusChart data={monitoringData.deploymentData}/>
                </div>
            </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Incident History
                </CardTitle>
                <CardDescription>A log of the most recent resilience tests and simulated system events.</CardDescription>
            </CardHeader>
            <CardContent>
                <IncidentHistory incidents={incidents} />
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 cluster-visualization">
          <CardHeader>
            <CardTitle>Container Orchestration</CardTitle>
            <CardDescription>Visualize the Kubernetes cluster running this portfolio. Click on a pod for more details.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 rounded-lg bg-card/50">
            <KubernetesClusterViz cluster={cluster} />
          </CardContent>
        </Card>
      </section>
        
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="lg:col-span-2 deploy-pipeline">
            <CardHeader>
                <CardTitle>Visual Deploy Pipeline</CardTitle>
                <CardDescription>See the CI/CD pipeline that builds and deploys this application. A Canary stage is included for safe rollouts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                 <div className="w-full px-4 pt-4">
                    <VisualDeployPipeline pipelineStages={pipeline} />
                </div>
                 {pipelineStatus === 'paused_canary' && canaryMetrics && (
                    <CanaryAnalysis metrics={canaryMetrics} />
                 )}
                 <div className="flex justify-center items-center gap-4 flex-wrap">
                    {pipelineStatus === 'paused_canary' ? (
                        <>
                            <FancyButton 
                                onClick={() => handleBackgroundAction(() => runDeployment('promote'))} 
                                Icon={Forward}
                                text="Promote Canary"
                                variant="primary"
                                aria-label="Promote canary deployment to production"
                            />
                            <FancyButton 
                                onClick={handleRollbackClick}
                                Icon={isDeploying ? Loader2 : Undo}
                                text={isDeploying ? "Rolling back..." : "Rollback"}
                                variant="destructive"
                                disabled={isDeploying}
                                aria-label="Rollback deployment to previous version"
                            />
                        </>
                    ) : (
                        <FancyButton 
                            onClick={() => handleBackgroundAction(() => runDeployment('start'))} 
                            disabled={isDeploying}
                            Icon={isDeploying ? Loader2 : PlayCircle}
                            text={isDeploying ? "Deploying..." : "Run Deployment"}
                            variant="primary"
                            aria-label={isDeploying ? "Deployment in progress" : "Start new deployment"}
                        />
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
  );
}
