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
    <div className="h-screen w-full bg-gradient-to-br from-black via-gray-950 to-gray-900 text-white overflow-hidden">
      {/* Header Bar */}
      <div className="h-14 border-b border-gray-800 bg-black/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <span className="font-mono text-sm font-bold text-emerald-400">dev.tvignoli.com</span>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
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
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Visualization */}
        <div className="w-96 border-r border-gray-800 bg-black/30 backdrop-blur-sm overflow-y-auto">
          <Tabs
            value={activeSidebar}
            onValueChange={(value) => {
              if (isSidebarTab(value)) {
                setActiveSidebar(value);
              }
            }}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 bg-black/50 rounded-none border-b border-gray-800">
              <TabsTrigger value="cluster" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
                <Layers className="h-4 w-4 mr-2" />
                Cluster
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400">
                <Activity className="h-4 w-4 mr-2" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400">
                <GaugeCircle className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cluster" className="p-4 mt-0">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Kubernetes Cluster</h3>
                <KubernetesClusterViz cluster={cluster} />
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="p-4 mt-0">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">CI/CD Pipeline</h3>
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

            <TabsContent value="metrics" className="p-4 mt-0">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">System Metrics</h3>
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
        <div className="flex-1 flex flex-col bg-black/20">
          {/* Quick Actions Bar */}
          <div className="h-12 border-b border-gray-800 bg-black/30 backdrop-blur-sm flex items-center px-4 gap-2 overflow-x-auto">
            <span className="text-xs text-gray-500 font-mono mr-2">QUICK:</span>
            <QuickAction onClick={() => handleQuickAction('kubectl get pods')} label="get pods" />
            <QuickAction onClick={() => handleQuickAction('helm list')} label="helm list" />
            <QuickAction onClick={() => handleQuickAction('deploy --weight=20')} label="deploy" variant="primary" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('pod_failure'))} label="chaos:pod" variant="danger" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('latency'))} label="chaos:latency" variant="danger" />
            <QuickAction onClick={() => handleBackgroundAction(() => runChaos('cpu_spike'))} label="chaos:cpu" variant="danger" />
          </div>

          {/* Terminal Area */}
          <div className="flex-1 overflow-hidden">
            <InteractiveTerminal
              ref={terminalRef}
              runtimeLogs={runtimeLogs}
              cluster={cluster}
              locale={locale}
              translations={translations}
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
            className="border-t border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden"
          >
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Incident History</h3>
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
        <div className="h-8 border-t border-gray-800 bg-black/40 backdrop-blur-sm flex items-center justify-center">
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
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className={cn(
        "text-sm font-mono font-semibold",
        status === 'ok' ? 'text-emerald-400' : 'text-orange-400'
      )}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={cn(
          "text-xs font-mono",
          isPositive ? 'text-emerald-400' : 'text-gray-500'
        )}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ onClick, label, variant = 'default' }: { onClick: () => void; label: string; variant?: 'default' | 'primary' | 'danger' }) {
  const variants = {
    default: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    primary: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors",
        variants[variant]
      )}
    >
      {label}
    </button>
  );
}
