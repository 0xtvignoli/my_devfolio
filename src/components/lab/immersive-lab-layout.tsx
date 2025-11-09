'use client';

import React, { useState, useRef } from 'react';
import { useLabSimulation } from '@/contexts/lab-simulation-context';
import { InteractiveTerminal } from '@/components/lab/interactive-terminal';
import { KubernetesClusterViz } from '@/components/lab/kubernetes-cluster-viz';
import { VisualDeployPipeline } from '@/components/lab/visual-deploy-pipeline';
import { IncidentHistory } from '@/components/lab/incident-history';
import { CanaryAnalysis } from '@/components/lab/canary-analysis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Terminal, 
  Activity, 
  ShieldAlert, 
  PlayCircle,
  Forward,
  Undo,
  GaugeCircle,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DeployConfig, Locale, Translations } from '@/lib/types';
import { translations as localeTable } from '@/data/locales';

const sidebarTabs = ['cluster', 'pipeline', 'metrics'] as const;
type SidebarTab = typeof sidebarTabs[number];
const isSidebarTab = (value: string): value is SidebarTab =>
  sidebarTabs.includes(value as SidebarTab);

interface ImmersiveLabLayoutProps {
  locale?: Locale;
  translations?: Translations;
}

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

  const [activeSidebar, setActiveSidebar] = useState<SidebarTab>('cluster');
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const terminalRef = useRef<{ setCommand: (command: string) => void; setActiveTab: (tab: 'terminal' | 'logs') => void }>(null);

  const cpuUsage = Number(monitoringData.cpuData[monitoringData.cpuData.length - 1]?.usage || 0);
  const memoryUsage = Number(monitoringData.memoryData[monitoringData.memoryData.length - 1]?.usage || 0);
  const p95Latency = Number(monitoringData.apiResponseData[monitoringData.apiResponseData.length - 1]?.p95 || 0);
  const glassPanel = "supports-[backdrop-filter]:backdrop-blur-2xl border border-slate-200/70 bg-white/85 text-slate-900 shadow-[0_35px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-black/40 dark:text-white dark:shadow-[0_35px_120px_rgba(0,0,0,0.6)]";
  const quickBarSurface = "supports-[backdrop-filter]:backdrop-blur-xl border-b border-slate-200/70 bg-white/75 text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white";
  const bottomPanelSurface = "supports-[backdrop-filter]:backdrop-blur-xl border-t border-slate-200/70 bg-white/80 text-slate-900 dark:border-white/10 dark:bg-black/40 dark:text-white";

  const handleQuickAction = (command: string) => {
    if (terminalRef.current) {
      terminalRef.current.setActiveTab('terminal');
      terminalRef.current.setCommand(command);
    }
  };

  const handleBackgroundAction = (action: () => void) => {
    if (terminalRef.current) {
      terminalRef.current.setActiveTab('logs');
    }
    action();
    
    window.dispatchEvent(new CustomEvent('lab_activity', {
      detail: { type: 'lab_interaction', data: {} }
    }));
  };

  const parseDeployCommand = (cmd: string): DeployConfig | null => {
    const parts = cmd.split(' ');
    if (parts[0] !== 'deploy') return null;

    const config: DeployConfig = { 
      strategy: 'canary', 
      weight: 10, 
      version: `v1.${Math.floor(Math.random() * 9) + 1}.0` 
    };
    
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === '--strategy' && parts[i + 1]) {
        config.strategy = parts[i + 1];
      }
      if (parts[i] === '--weight' && parts[i + 1]) {
        config.weight = parseInt(parts[i + 1], 10) || 10;
      }
      if (parts[i] === '--version' && parts[i + 1]) {
        config.version = parts[i + 1];
      }
    }
    return config;
  };

  return (
    <div className="h-screen w-full overflow-hidden text-slate-900 dark:text-white bg-[radial-gradient(circle_at_top,_#f5fff8,_#e6f7ef_45%,_#d8f0ea_80%)] dark:bg-gradient-to-br dark:from-black dark:via-gray-950 dark:to-gray-900">
      {/* Header Bar */}
      <div className={cn("h-14 flex items-center justify-between px-6", quickBarSurface)}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">dev.tvignoli.com</span>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-xs dark:text-emerald-400">
            LIVE
          </Badge>
        </div>

        {/* Real-time Metrics */}
        <div className="flex items-center gap-6">
          <MetricBadge label="CPU" value={`${cpuUsage}%`} status={cpuUsage > 70 ? 'warning' : 'ok'} />
          <MetricBadge label="MEM" value={`${memoryUsage}%`} status={memoryUsage > 80 ? 'warning' : 'ok'} />
          <MetricBadge label="P95" value={`${p95Latency}ms`} status={p95Latency > 200 ? 'warning' : 'ok'} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-3.5rem)] gap-4 px-4 pb-4">
        {/* Left Sidebar - Visualization */}
        <div className={cn("w-96 overflow-y-auto rounded-3xl p-3", glassPanel)}>
          <Tabs
            value={activeSidebar}
            onValueChange={(value) => {
              if (isSidebarTab(value)) {
                setActiveSidebar(value);
              }
            }}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 rounded-2xl border border-slate-200/70 bg-white/60 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <TabsTrigger value="cluster" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500">
                <Layers className="h-4 w-4 mr-2" />
                Cluster
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                <Activity className="h-4 w-4 mr-2" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500">
                <GaugeCircle className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cluster" className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Kubernetes Cluster</h3>
                <KubernetesClusterViz cluster={cluster} />
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">CI/CD Pipeline</h3>
                <VisualDeployPipeline pipelineStages={pipeline} />
                
                {pipelineStatus === 'paused_canary' && canaryMetrics && (
                  <div className="mt-4">
                    <CanaryAnalysis metrics={canaryMetrics} />
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  {pipelineStatus === 'paused_canary' ? (
                    <>
                      <Button 
                        onClick={() => handleBackgroundAction(() => runDeployment('promote'))}
                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Forward className="mr-2 h-4 w-4" />
                        Promote Canary
                      </Button>
                      <Button 
                        onClick={() => handleBackgroundAction(() => runDeployment('rollback'))}
                        variant="destructive"
                        className="w-full"
                      >
                        <Undo className="mr-2 h-4 w-4" />
                        Rollback
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                      disabled={isDeploying}
                      className="w-full bg-blue-600 hover:bg-blue-500"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Run Deployment
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">System Metrics</h3>
                <MetricCard title="CPU Usage" value={`${cpuUsage}%`} trend="+2.3%" />
                <MetricCard title="Memory" value={`${memoryUsage}%`} trend="-1.1%" />
                <MetricCard title="API Latency (P95)" value={`${p95Latency}ms`} trend="+5ms" />
                <MetricCard 
                  title="Deployments (7d)" 
                  value={monitoringData.deploymentData.filter(d => d.status === 'success').reduce((acc, d) => acc + d.count, 0).toString()}
                  trend="+12"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Terminal (Main Focus) */}
        <div className={cn("flex-1 flex flex-col rounded-3xl overflow-hidden", glassPanel)}>
          {/* Quick Actions Bar */}
          <div className={cn("h-12 flex items-center px-4 gap-2 overflow-x-auto", quickBarSurface)}>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono mr-2 uppercase tracking-[0.25em]">Quick</span>
            <QuickAction onClick={() => handleQuickAction('kubectl get pods')} label="get pods" />
            <QuickAction onClick={() => handleQuickAction('helm list')} label="helm list" />
            <QuickAction onClick={() => handleQuickAction('deploy --weight=20')} label="deploy" variant="primary" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('pod_failure'))} label="chaos:pod" variant="danger" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('latency'))} label="chaos:latency" variant="danger" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('cpu_spike'))} label="chaos:cpu" variant="danger" />
          </div>

          {/* Terminal Area */}
          <div className="flex-1 overflow-hidden bg-black dark:bg-black">
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
                        'Pipeline request accepted. Synthesizing manifests...',
                        `strategy: ${deployConfig?.strategy ?? 'canary'}  weight: ${deployConfig?.weight ?? 10}%  version: ${deployConfig?.version ?? 'auto'}`,
                        'Track progress in the Pipeline + Canary panels hugging the terminal.',
                      ],
                      contextHint: 'Visual cues around the lab sync with this command.',
                      suggestion: 'Once stages flip, run `kubectl get pods` to verify workloads.',
                      streamingSteps: [
                        '[busy] acquiring build artifacts...',
                        '[sync] publishing image to registry...',
                        '[ready] applying rollout to cluster...',
                      ],
                    };
                  }
                  return {
                    output: [
                      `Chaos scenario "${scenario}" armed. Fault injection stays inside this lab cluster.`,
                      'Watch Incidents + Metrics tabs for blast-radius telemetry.',
                    ],
                    contextHint: 'Auto-chaos toggles remain unaffected.',
                    suggestion: 'Use `status` to confirm steady state after recovery.',
                    streamingSteps: [
                      '[busy] priming chaos controllers...',
                      `[sync] issuing ${scenario} disruption...`,
                    ],
                  };
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Panel - Incidents & Logs */}
      <AnimatePresence>
        {isBottomPanelExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '200px' }}
            exit={{ height: 0 }}
            className={cn("overflow-hidden rounded-3xl rounded-t-none", bottomPanelSurface)}
          >
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Incident History</h3>
                  <Badge variant="outline" className="text-xs">{incidents.length}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsBottomPanelExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <IncidentHistory incidents={incidents} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isBottomPanelExpanded && (
        <div className={cn("h-8 flex items-center justify-center rounded-3xl rounded-t-none", bottomPanelSurface)}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsBottomPanelExpanded(true)}
            className="h-6 text-xs"
          >
            <ChevronUp className="h-3 w-3 mr-1" />
            Show Incidents ({incidents.length})
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper Components
function MetricBadge({ label, value, status }: { label: string; value: string; status: 'ok' | 'warning' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-700 dark:text-gray-400 font-mono uppercase tracking-wide">{label}</span>
      <span className={cn(
        "text-sm font-mono font-semibold",
        status === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'
      )}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_15px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-gray-900/60">
      <div className="text-xs text-gray-700 dark:text-gray-400 mb-1 uppercase tracking-wide">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
        <div className={cn(
          "text-xs font-mono",
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
        )}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ onClick, label, variant = 'default' }: { onClick: () => void; label: string; variant?: 'default' | 'primary' | 'danger' }) {
  const variants = {
    default: 'bg-white/80 border border-slate-200/70 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:bg-white dark:bg-gray-800/60 dark:border-white/15 dark:text-white',
    primary: 'bg-emerald-500/15 border border-emerald-200 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-100',
    danger: 'bg-rose-500/10 border border-rose-200 text-rose-600 hover:bg-rose-500/20 dark:bg-red-600/20 dark:border-red-500/40 dark:text-red-100',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-colors",
        variants[variant]
      )}
    >
      {label}
    </button>
  );
}
