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
      handleBackgroundAction(() => runChaos(scenario));
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
        <div className={`inline-flex items-center gap-2 px-4 py-1 text-[0.65rem] uppercase tracking-[0.25em] ${chipSurface}`}>
          Live Control Room
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
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickAction('kubectl get pods')}>
                <FileTerminal className="mr-2 h-3 w-3" /> kubectl get pods
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickAction('kubectl describe pod api')}>
                <FileTerminal className="mr-2 h-3 w-3" /> describe pod api
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickAction('cat contact.txt')}>
                <FileTerminal className="mr-2 h-3 w-3" /> cat contact.txt
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between rounded-2xl p-3 text-xs font-mono text-muted-foreground dark:text-muted-foreground ${blockSurface}`}>
              <span>Connected · dev-cluster</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
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

            <div className={`flex items-center space-x-2 rounded-2xl px-4 py-3 ${blockSurface}`}>
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
                    className="whitespace-nowrap"
                  >
                    <macro.icon className="mr-2 h-3 w-3" />
                    run
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <GaugeCircle className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning>{latestCpu}%</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">across 2 nodes (8 vCPU)</p>
                 <div className="h-[80px] w-full -ml-4">
                  <CpuUsageChart data={monitoringData.cpuData} />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning>{currentMemoryUsageGB} / {totalMemoryGB} GB</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground" suppressHydrationWarning>{currentMemoryUsagePercent}% utilization</p>
                 <div className="h-[80px] w-full -ml-4">
                  <MemoryUsageChart data={monitoringData.memoryData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API P95 Latency</CardTitle>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning>{latestLatency}ms</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">real-time</p>
                 <div className="h-[80px] w-full -ml-4">
                  <ApiResponseTimeChart data={monitoringData.apiResponseData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" suppressHydrationWarning>{successfulDeploys} Successful</div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">in the last 7 days</p>
                 <div className="h-[80px] w-full -ml-4">
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

        <Card className="lg:col-span-2">
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
         <Card className="lg:col-span-2">
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
                            />
                            <FancyButton 
                                onClick={() => handleBackgroundAction(() => runDeployment('rollback'))}
                                Icon={Undo}
                                text="Rollback"
                                variant="destructive"
                            />
                        </>
                    ) : (
                        <FancyButton 
                            onClick={() => handleBackgroundAction(() => runDeployment('start'))} 
                            disabled={isDeploying}
                            Icon={PlayCircle}
                            text="Run Deployment"
                            variant="primary"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
