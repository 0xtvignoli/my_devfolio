'use client';

import React, { useRef } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Zap, ShieldAlert, FileTerminal, Power, AlertTriangle, History, CheckCircle, XCircle, Forward, Undo } from 'lucide-react';
import { CpuUsageChart } from '@/components/lab/cpu-chart';
import { MemoryUsageChart } from '@/components/lab/memory-chart';
import { DeploymentStatusChart } from '@/components/lab/deployment-status-chart';
import { ApiResponseTimeChart } from '@/components/lab/api-response-chart';
import { Code, GaugeCircle, GanttChartSquare } from 'lucide-react';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import type { DeployConfig } from '@/lib/types';
import { FancyButton } from '@/components/lab/fancy-button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IncidentHistory } from '@/components/lab/incident-history';
import { CanaryAnalysis } from '@/components/lab/canary-analysis';


export function LabClientPage() {
  const { t } = useLocale();
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

  const totalMemoryGB = 32;
  const currentMemoryUsagePercent = monitoringData.memoryData[monitoringData.memoryData.length - 1].usage as number;
  const currentMemoryUsageGB = (currentMemoryUsagePercent / 100 * totalMemoryGB).toFixed(1);
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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          {t.nav.lab}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
          Welcome to the interactive lab. This is a real-time demonstration of the infrastructure and observability of this very portfolio.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <GaugeCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{monitoringData.cpuData[monitoringData.cpuData.length - 1].usage}%</div>
                <p className="text-xs text-muted-foreground">across 2 nodes (8 vCPU)</p>
                <div className="h-[80px] w-full -ml-4">
                  <CpuUsageChart data={monitoringData.cpuData} />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{currentMemoryUsageGB} / {totalMemoryGB} GB</div>
                <p className="text-xs text-muted-foreground">{currentMemoryUsagePercent}% utilization</p>
                 <div className="h-[80px] w-full -ml-4">
                  <MemoryUsageChart data={monitoringData.memoryData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API P95 Latency</CardTitle>
                <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiResponseData[monitoringData.apiResponseData.length - 1].p95}ms</div>
                <p className="text-xs text-muted-foreground">real-time</p>
                 <div className="h-[80px] w-full -ml-4">
                  <ApiResponseTimeChart data={monitoringData.apiResponseData}/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{monitoringData.deploymentData.filter(d => d.status === 'success').reduce((acc, d) => acc + d.count, 0)} Successful</div>
                <p className="text-xs text-muted-foreground">in the last 7 days</p>
                 <div className="h-[80px] w-full -ml-4">
                  <DeploymentStatusChart data={monitoringData.deploymentData}/>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        
        <Card className="lg:col-span-2">
          <CardHeader>
              <CardTitle>Interactive Terminal</CardTitle>
              <CardDescription>An interactive terminal to explore and control the lab environment. Try a quick action or type `help`.</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('kubectl get pods')}>
                      <FileTerminal className="mr-2 h-3 w-3" /> kubectl get pods
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('deploy --weight=20')}>
                      <Zap className="mr-2 h-3 w-3" /> deploy canary (20%)
                  </Button>
                   <Button variant="outline" size="sm" onClick={() => handleBackgroundAction(() => runChaos('pod_failure'))}>
                      <ShieldAlert className="mr-2 h-3 w-3" /> chaos pod_failure
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
              <InteractiveTerminal 
                ref={terminalRef}
                runtimeLogs={runtimeLogs}
                cluster={cluster}
                onCommand={(cmd) => {
                    const [command] = cmd.trim().split(' ');
                    if (command === 'deploy' || command === 'chaos') {
                        handleBackgroundAction(() => {
                           if (command === 'deploy') {
                               const deployConfig = parseDeployCommand(cmd);
                               runDeployment('start', deployConfig || undefined);
                           } else {
                               const [, scenario = 'latency'] = cmd.trim().split(' ');
                               runChaos(scenario);
                           }
                        });
                        return '';
                    }
                    return null; // Let terminal handle built-in commands
                }}
              />
          </CardContent>
        </Card>

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

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Chaos Engineering Controls</CardTitle>
                <CardDescription>Manually trigger chaos experiments or enable the automated Chaos Monkey to test system resilience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>This is a Simulation</AlertTitle>
                    <AlertDescription>
                        Chaos experiments run in a sandboxed environment. They demonstrate resilience concepts without affecting any real infrastructure.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Switch id="auto-chaos-mode" checked={isAutoChaosEnabled} onCheckedChange={(checked) => handleBackgroundAction(() => toggleAutoChaos(checked))} disabled={isDeploying}/>
                    <Label htmlFor="auto-chaos-mode" className="flex flex-col">
                        <span className="font-semibold">Auto-Chaos Monkey</span>
                        <span className="text-xs text-muted-foreground">Periodically triggers random failures to test continuous resilience.</span>
                    </Label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FancyButton 
                        onClick={() => handleBackgroundAction(() => runChaos('pod_failure'))}
                        disabled={isDeploying || isAutoChaosEnabled}
                        Icon={ShieldAlert}
                        text="Simulate Pod Failure"
                        variant="destructive"
                    />
                     <FancyButton 
                        onClick={() => handleBackgroundAction(() => runChaos('latency'))}
                        disabled={isDeploying || isAutoChaosEnabled}
                        Icon={Zap}
                        text="Simulate API Latency"
                        variant="destructive"
                    />
                     <FancyButton 
                        onClick={() => handleBackgroundAction(() => runChaos('cpu_spike'))}
                        disabled={isDeploying || isAutoChaosEnabled}
                        Icon={GaugeCircle}
                        text="Simulate CPU Spike"
                        variant="destructive"
                    />
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
