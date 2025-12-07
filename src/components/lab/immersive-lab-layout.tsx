'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { getInteractiveClasses } from '@/lib/mobile-utils';
import type { DeployConfig, Locale, Translations } from '@/lib/types';
import { translations as localeTable } from '@/data/locales';
import { AriaLiveRegion } from '@/components/shared/aria-live-region';
import { useDeviceDetection } from '@/hooks/use-device-detection';
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
import { HelpModal } from '@/components/lab/help-modal';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { GuidedTour } from '@/components/onboarding/guided-tour';

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
  const [pipelineAnnouncement, setPipelineAnnouncement] = useState('');
  const [incidentAnnouncement, setIncidentAnnouncement] = useState('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showChaosConfirm, setShowChaosConfirm] = useState(false);
  const [pendingChaosScenario, setPendingChaosScenario] = useState<string | null>(null);
  const { isTouchDevice, prefersReducedMotion } = useDeviceDetection();
  const { toast } = useToast();
  const terminalRef = useRef<{ setCommand: (command: string) => void; setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void }>(null);
  const prevPipelineStatusRef = useRef(pipelineStatus);
  const prevIncidentsCountRef = useRef(incidents.length);

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

  // Announce pipeline status changes and show toast
  useEffect(() => {
    if (prevPipelineStatusRef.current !== pipelineStatus) {
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
  }, [pipelineStatus, toast]);

  // Announce new incidents and show toast
  useEffect(() => {
    if (incidents.length > prevIncidentsCountRef.current) {
      const newIncident = incidents[0];
      setIncidentAnnouncement(`New incident: ${newIncident.type}, Status: ${newIncident.status}`);
      toast({
        title: '🔥 Chaos Experiment Triggered',
        description: `${newIncident.type} injected. Monitor Incident History for recovery.`,
        duration: 5000,
      });
      prevIncidentsCountRef.current = incidents.length;
    }
  }, [incidents, toast]);

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
            <Terminal className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">dev.tvignoli.com</span>
          </div>
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 text-xs dark:text-cyan-400">
            LIVE
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Metrics */}
          <div className="flex items-center gap-6" aria-label="Real-time system metrics">
            <MetricBadge label="CPU" value={`${cpuUsage}%`} status={cpuUsage > 70 ? 'warning' : 'ok'} />
            <MetricBadge label="MEM" value={`${memoryUsage}%`} status={memoryUsage > 80 ? 'warning' : 'ok'} />
            <MetricBadge label="P95" value={`${p95Latency}ms`} status={p95Latency > 200 ? 'warning' : 'ok'} />
          </div>
          <div className="flex items-center gap-2">
            <HelpModal />
            <GuidedTour tourId="lab-tour-immersive" autoStart={false} />
          </div>
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
            <TabsList className="w-full grid grid-cols-3 rounded-2xl border-2 border-slate-300/70 dark:border-white/20 bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white shadow-lg">
              <TabsTrigger 
                value="cluster" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:font-semibold focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                aria-label="Cluster visualization tab"
              >
                <Layers className="h-4 w-4 mr-2" aria-hidden="true" />
                Cluster
              </TabsTrigger>
              <TabsTrigger 
                value="pipeline" 
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label="Pipeline visualization tab"
              >
                <Activity className="h-4 w-4 mr-2" aria-hidden="true" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:font-semibold focus-visible:ring-2 focus-visible:ring-purple-500/50"
                aria-label="Metrics visualization tab"
              >
                <GaugeCircle className="h-4 w-4 mr-2" aria-hidden="true" />
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
                        className="w-full bg-cyan-600 hover:bg-cyan-500"
                        aria-label="Promote canary deployment to production"
                      >
                        <Forward className="mr-2 h-4 w-4" aria-hidden="true" />
                        Promote Canary
                      </Button>
                      <Button 
                        onClick={handleRollbackClick}
                        variant="destructive"
                        className="w-full"
                        disabled={isDeploying}
                        aria-label="Rollback deployment to previous version"
                      >
                        {isDeploying ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Undo className="mr-2 h-4 w-4" aria-hidden="true" />
                        )}
                        {isDeploying ? "Rolling back..." : "Rollback"}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleBackgroundAction(() => runDeployment('start'))}
                      disabled={isDeploying}
                      className="w-full bg-blue-600 hover:bg-blue-500"
                      aria-label={isDeploying ? "Deployment in progress" : "Start new deployment"}
                    >
                      {isDeploying ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      {isDeploying ? "Deploying..." : "Run Deployment"}
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">System Metrics</h3>
                <TooltipProvider>
                  <MetricCard 
                    title="CPU Usage" 
                    value={`${cpuUsage}%`} 
                    trend="+2.3%" 
                    tooltip="Percentage of CPU cores in use across the cluster. Normal range: 0-70%. Values above 70% may indicate resource constraints."
                  />
                  <MetricCard 
                    title="Memory" 
                    value={`${memoryUsage}%`} 
                    trend="-1.1%" 
                    tooltip="Total memory usage across all cluster nodes. Includes container memory, system overhead, and buffers. Monitor for memory leaks or insufficient resources."
                  />
                  <MetricCard 
                    title="API Latency (P95)" 
                    value={`${p95Latency}ms`} 
                    trend="+5ms" 
                    tooltip="95th percentile response time for API requests. P95 means 95% of requests are faster than this value. Target: <200ms. Higher values may indicate performance issues."
                  />
                  <MetricCard 
                    title="Deployments (7d)" 
                    value={monitoringData.deploymentData.filter(d => d.status === 'success').reduce((acc, d) => acc + d.count, 0).toString()}
                    trend="+12"
                    tooltip="Number of successful deployments in the last 7 days. Includes canary, blue-green, and rolling updates. Failed deployments are tracked separately in Incident History."
                  />
                </TooltipProvider>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Terminal (Main Focus) */}
        <div className={cn("flex-1 flex flex-col rounded-3xl overflow-hidden", glassPanel)}>
          {/* Quick Actions Bar */}
          <div className={cn("h-12 flex items-center px-4 gap-2 overflow-x-auto", quickBarSurface)} aria-label="Quick action commands">
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono mr-2 uppercase tracking-[0.25em]">Quick</span>
            <QuickAction onClick={() => handleQuickAction('kubectl get pods')} label="get pods" aria-label="Execute command: kubectl get pods" />
            <QuickAction onClick={() => handleQuickAction('helm list')} label="helm list" aria-label="Execute command: helm list" />
            <QuickAction onClick={() => handleQuickAction('deploy --weight=20')} label="deploy" variant="primary" aria-label="Execute command: deploy --weight=20" />
            <QuickAction onClick={() => handleChaosClick('pod_failure')} label="chaos:pod" variant="danger" aria-label="Execute chaos experiment: pod failure" />
            <QuickAction onClick={() => handleChaosClick('latency')} label="chaos:latency" variant="danger" aria-label="Execute chaos experiment: latency" />
            <QuickAction onClick={() => handleChaosClick('cpu_spike')} label="chaos:cpu" variant="danger" aria-label="Execute chaos experiment: CPU spike" />
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
            initial={prefersReducedMotion ? { height: '200px' } : { height: 0 }}
            animate={{ height: '200px' }}
            exit={prefersReducedMotion ? { height: '200px' } : { height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
            className={cn("overflow-hidden rounded-3xl rounded-t-none", bottomPanelSurface)}
            style={prefersReducedMotion ? { height: '200px' } : undefined}
          >
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setIsBottomPanelExpanded(false)}
                  className={getInteractiveClasses(
                    "flex items-center gap-2 cursor-pointer group",
                    "hover:opacity-80",
                    "transition-opacity",
                    isTouchDevice,
                    prefersReducedMotion
                  )}
                  aria-label={`Collapse incident history panel. ${incidents.length} incidents`}
                >
                  <ShieldAlert className="h-4 w-4 text-orange-400" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Incident History</h3>
                  <Badge variant="outline" className="text-xs">{incidents.length}</Badge>
                  <ChevronDown 
                    className={getInteractiveClasses(
                      "h-4 w-4 text-gray-500 dark:text-gray-400",
                      "group-hover:text-gray-700 dark:group-hover:text-gray-200",
                      "transition-colors",
                      isTouchDevice,
                      prefersReducedMotion
                    )} 
                    aria-hidden="true" 
                  />
                </button>
              </div>
              <IncidentHistory incidents={incidents} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isBottomPanelExpanded && (
        <div className={getInteractiveClasses(
          cn("h-10 flex items-center justify-center rounded-3xl rounded-t-none cursor-pointer", bottomPanelSurface),
          "hover:opacity-90",
          "transition-opacity",
          isTouchDevice,
          prefersReducedMotion
        )}>
          <button
            onClick={() => setIsBottomPanelExpanded(true)}
            className={getInteractiveClasses(
              "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300",
              "hover:text-gray-900 dark:hover:text-white",
              "transition-colors",
              isTouchDevice,
              prefersReducedMotion
            )}
            aria-label={`Expand incident history panel. ${incidents.length} incidents`}
          >
            <ShieldAlert className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
            <span>Show Incidents</span>
            <Badge variant="outline" className="text-xs ml-1">{incidents.length}</Badge>
          </button>
        </div>
      )}

      {/* Aria-live regions for screen reader announcements */}
      <AriaLiveRegion 
        message={pipelineAnnouncement} 
        priority="polite"
        id="immersive-pipeline-announcement"
      />
      <AriaLiveRegion 
        message={incidentAnnouncement} 
        priority="assertive"
        id="immersive-incident-announcement"
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

// Helper Components
function MetricBadge({ label, value, status }: { label: string; value: string; status: 'ok' | 'warning' }) {
  const ariaLabel = `${label}: ${value}, Status: ${status === 'ok' ? 'normal' : 'warning'}`;
  return (
    <div className="flex items-center gap-2" aria-label={ariaLabel}>
      <span className="text-xs text-gray-700 dark:text-gray-400 font-mono uppercase tracking-wide">{label}</span>
      <span className={cn(
        "text-sm font-mono font-semibold",
        status === 'ok' ? 'text-cyan-600 dark:text-cyan-400' : 'text-orange-500 dark:text-orange-400'
      )}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ title, value, trend, tooltip }: { title: string; value: string; trend: string; tooltip?: string }) {
  const isPositive = trend.startsWith('+');
  const ariaLabel = `${title}: ${value}, Trend: ${trend}`;
  
  const cardContent = (
    <div 
      className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_15px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-gray-900/60"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className="text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wide">{title}</div>
        {tooltip && (
          <Info className="h-3 w-3 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
        <div className={cn(
          "text-xs font-mono",
          isPositive ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-500 dark:text-rose-400'
        )}>
          {trend}
        </div>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {cardContent}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}

interface QuickActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  label: string;
  variant?: 'default' | 'primary' | 'danger';
}

function QuickAction({ onClick, label, variant = 'default', 'aria-label': ariaLabel, ...props }: QuickActionProps) {
  const { isTouchDevice, prefersReducedMotion } = useDeviceDetection();
  
  const baseVariants = {
    default: 'bg-white/80 border border-slate-200/70 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:bg-gray-800/60 dark:border-white/15 dark:text-white',
    primary: 'bg-cyan-500/15 border border-cyan-200 text-cyan-700 dark:bg-cyan-500/20 dark:border-cyan-400/40 dark:text-cyan-100',
    danger: 'bg-rose-500/10 border border-rose-200 text-rose-600 dark:bg-red-600/20 dark:border-red-500/40 dark:text-red-100',
  };

  const hoverVariants = {
    default: 'hover:bg-white',
    primary: 'hover:bg-cyan-500/25',
    danger: 'hover:bg-rose-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={getInteractiveClasses(
        cn(
          "px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          baseVariants[variant]
        ),
        hoverVariants[variant],
        "transition-colors",
        isTouchDevice,
        prefersReducedMotion
      )}
      aria-label={ariaLabel || `Execute command: ${label}`}
      {...props}
    >
      {label}
    </button>
  );
}
