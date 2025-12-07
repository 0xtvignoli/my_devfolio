"use client";

import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import type { TimeSeriesData, PipelineStage, KubernetesCluster, MonitoringData, Incident, Pod, CanaryMetrics, DeployConfig } from '@/lib/types';
import { getInitialMonitoringData, getInitialPipeline, getInitialClusterData } from '@/data/content/monitoring';
import { useToast } from '@/hooks/use-toast';

// --- SIMULATION LOGIC ---
const generateIp = () => `10.1.2.${Math.floor(Math.random() * 254) + 1}`;
type PipelineStatus = 'idle' | 'deploying' | 'paused_canary' | 'failed' | 'completed';

interface LabSimulationContextType {
    runtimeLogs: string[];
    monitoringData: MonitoringData;
    pipeline: PipelineStage[];
    cluster: KubernetesCluster;
    isDeploying: boolean;
    pipelineStatus: PipelineStatus;
    isAutoChaosEnabled: boolean;
    incidents: Incident[];
    canaryMetrics: CanaryMetrics | null;
    runChaos: (scenario: string) => void;
    runDeployment: (action: 'start' | 'promote' | 'rollback', config?: DeployConfig) => void;
    addRuntimeLog: (message: string) => void;
    toggleAutoChaos: (enabled: boolean) => void;
}

const LabSimulationContext = createContext<LabSimulationContextType | undefined>(undefined);

export const LabSimulationProvider = ({ children }: { children: React.ReactNode }) => {
    const { toast } = useToast();
    const [runtimeLogs, setRuntimeLogs] = useState<string[]>(['Welcome to the Lab Runtime! Deployments and chaos experiments will be logged here.']);
    const [monitoringData, setMonitoringData] = useState<MonitoringData>(getInitialMonitoringData());
    const [pipeline, setPipeline] = useState<PipelineStage[]>(getInitialPipeline());
    const [cluster, setCluster] = useState<KubernetesCluster>(getInitialClusterData());
    const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
    const [isAutoChaosEnabled, setIsAutoChaosEnabled] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [canaryMetrics, setCanaryMetrics] = useState<CanaryMetrics | null>(null);
    
    const simulationEffects = useRef({ latencyInjection: 0, cpuSpike: 0 });
    const autoChaosTimer = useRef<NodeJS.Timeout | null>(null);
    const pipelinePromiseChain = useRef<Promise<void>>(Promise.resolve());

    const addRuntimeLog = useCallback((message: string) => {
        setRuntimeLogs(prev => {
            const newLog = `${new Date().toLocaleTimeString()}: ${message}`;
            // Prevent duplicate consecutive logs
            if (prev[prev.length - 1] === newLog) {
                return prev;
            }
            return [...prev.slice(-100), newLog];
        });
    }, []);
    
    const addIncident = useCallback((incident: Omit<Incident, 'id' | 'timestamp'>) => {
        const newIncident: Incident = {
            id: `inc-${Date.now()}`,
            timestamp: new Date(),
            ...incident
        };
        setIncidents(prev => [newIncident, ...prev.slice(0, 4)]);
    }, []);

    const updateMonitoring = useCallback(() => {
        setMonitoringData(prev => {
            const baseCpu = pipelineStatus === 'deploying' ? 40 : 10;
            const baseMemory = pipelineStatus === 'deploying' ? 55 : 40;
            let baseLatency = 80;

            if (pipelineStatus === 'paused_canary' && canaryMetrics) {
                 baseLatency = canaryMetrics.canary.latency;
            }

            const newCpuUsage = Math.min(100, baseCpu + Math.floor(Math.random() * 10) + simulationEffects.current.cpuSpike);
            const newMemoryUsage = Math.min(100, baseMemory + Math.floor(Math.random() * 5));
            const newApiLatency = baseLatency + Math.floor(Math.random() * 15) + simulationEffects.current.latencyInjection;

            // Optimize array operations - only create new arrays if values actually changed
            const lastCpu = prev.cpuData[prev.cpuData.length - 1]?.usage;
            const lastMemory = prev.memoryData[prev.memoryData.length - 1]?.usage;
            const lastLatency = prev.apiResponseData[prev.apiResponseData.length - 1]?.p95;

            if (lastCpu === newCpuUsage && lastMemory === newMemoryUsage && lastLatency === newApiLatency) {
                return prev; // No changes, return same reference to prevent re-renders
            }

            const newCpuData: TimeSeriesData[] = [...prev.cpuData.slice(1), { time: 'now', usage: newCpuUsage }];
            const newMemoryData: TimeSeriesData[] = [...prev.memoryData.slice(1), { time: 'now', usage: newMemoryUsage }];
            const newApiData: TimeSeriesData[] = [...prev.apiResponseData.slice(1), { time: 'now', p95: newApiLatency }];
            
            return { ...prev, cpuData: newCpuData, memoryData: newMemoryData, apiResponseData: newApiData };
        });
    }, [pipelineStatus, canaryMetrics]);

    useEffect(() => {
        const interval = setInterval(updateMonitoring, 1500);
        return () => clearInterval(interval);
    }, [updateMonitoring]);

    // Cleanup all timers on unmount
    useEffect(() => {
        return () => {
            if (autoChaosTimer.current) {
                clearInterval(autoChaosTimer.current);
                autoChaosTimer.current = null;
            }
        };
    }, []);


    const runChaos = useCallback((scenario: string) => {
        try {
            addRuntimeLog(`💥 Initiating chaos experiment: ${scenario}`);
            const startTime = Date.now();
        
        if (scenario === 'latency') {
            const description = "Injecting 300ms latency into 'api-gateway'.";
            addRuntimeLog(description);
            toast({ variant: 'destructive', title: '🚨 ALERT: High API Latency Detected', description });
            simulationEffects.current.latencyInjection = 300;
             setTimeout(() => {
                const recoveryMsg = "Chaos experiment 'latency' finished. Latency returning to normal.";
                addRuntimeLog(`✅ ${recoveryMsg}`);
                toast({ variant: 'default', title: '✅ RESOLVED: API Latency Normalized', description: 'The API gateway has recovered.' });
                simulationEffects.current.latencyInjection = 0;
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                addIncident({ type: 'API Latency', duration: `${duration}s`, status: 'Resolved' });
                
                // Trigger gamification event for chaos experiment
                window.dispatchEvent(new CustomEvent('lab_activity', {
                    detail: { type: 'chaos_experiment', data: { scenario: 'latency', duration } }
                }));
            }, 8000);

        } else if(scenario === 'pod_failure') {
            const allPods = cluster.nodes.flatMap(n => n.pods);
            if (allPods.length === 0) {
                 addRuntimeLog("No pods available to target for chaos experiment.");
                 return;
            }
            const targetPod = allPods[Math.floor(Math.random() * allPods.length)];
            const targetPodName = targetPod.name;

            const description = `Terminating pod '${targetPodName}'...`;
            addRuntimeLog(description);
            toast({ variant: 'destructive', title: `🚨 ALERT: Pod Unhealthy`, description: `Pod ${targetPodName} is not responding.` });

            setCluster(prev => {
                const newNodes = prev.nodes.map(node => ({
                    ...node,
                    pods: node.pods.map(pod => 
                        pod.name === targetPodName ? { ...pod, status: 'Error' as const } : pod
                    )
                }));
                return { ...prev, nodes: newNodes };
            });

            addRuntimeLog("Kubernetes is restarting the pod...");
            setTimeout(() => {
                setCluster(prev => {
                     const newNodes = prev.nodes.map(node => ({
                        ...node,
                        pods: node.pods.map(pod => 
                            pod.name === targetPodName ? { ...pod, status: 'Pending' as const } : pod
                        )
                    }));
                    return { ...prev, nodes: newNodes };
                });
            }, 2000);
            setTimeout(() => {
                const recoveryMsg = `Pod '${targetPodName}' has recovered with a new IP.`;
                addRuntimeLog(`✅ ${recoveryMsg}`);
                toast({ variant: 'default', title: '✅ RESOLVED: Pod Recovered', description: recoveryMsg });
                setCluster(prev => {
                     const newNodes = prev.nodes.map(node => ({
                        ...node,
                        pods: node.pods.map(pod => 
                            pod.name === targetPodName ? { ...pod, status: 'Running' as const, ip: generateIp(), isCanary: false } : pod
                        )
                    }));
                    return { ...prev, nodes: newNodes };
                });
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                addIncident({ type: 'Pod Failure', duration: `${duration}s`, status: 'Resolved' });
            }, 6000);

        } else if (scenario === 'cpu_spike') {
             const description = "Simulating CPU spike on 'monitoring-dash'...";
            addRuntimeLog(description);
            toast({ variant: 'destructive', title: '🚨 ALERT: High CPU Usage Detected', description });
            simulationEffects.current.cpuSpike = 80;
             setTimeout(() => {
                const recoveryMsg = "Chaos experiment 'cpu_spike' finished. CPU usage returning to normal.";
                addRuntimeLog(`✅ ${recoveryMsg}`);
                toast({ variant: 'default', title: '✅ RESOLVED: CPU Usage Normalized', description: 'The monitoring service has stabilized.' });
                simulationEffects.current.cpuSpike = 0;
                 const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                addIncident({ type: 'CPU Spike', duration: `${duration}s`, status: 'Resolved' });
            }, 8000);
        } else {
             addRuntimeLog(`Unknown chaos scenario: ${scenario}. Available: latency, pod_failure, cpu_spike`);
        }
        } catch (error) {
            console.error('Error in chaos experiment:', error);
            addRuntimeLog(`❌ Error during chaos experiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            toast({ 
                variant: 'destructive', 
                title: 'Chaos Experiment Failed', 
                description: 'An error occurred during the chaos experiment. Check logs for details.' 
            });
        }
    }, [addRuntimeLog, toast, cluster, addIncident]);

    const runStage = (stage: PipelineStage, commandOutput: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                const duration = stage.baseDuration + Math.random() * 500;
                setPipeline(prev => prev.map(s => s.name === stage.name ? { ...s, status: 'In Progress' } : s));
                addRuntimeLog(`[Pipeline] > Stage '${stage.name}' started.`);
                addRuntimeLog(`$ ${stage.details}`);
                
                const timer = setTimeout(() => {
                    try {
                        addRuntimeLog(commandOutput);
                        setPipeline(prev => prev.map(s => s.name === stage.name ? { ...s, status: 'Success', duration: `${(duration/1000).toFixed(2)}s` } : s));
                        addRuntimeLog(`[Pipeline] > Stage '${stage.name}' finished successfully.`);
                        resolve();
                    } catch (error) {
                        console.error(`Error in pipeline stage ${stage.name}:`, error);
                        setPipeline(prev => prev.map(s => s.name === stage.name ? { ...s, status: 'Failed' } : s));
                        addRuntimeLog(`❌ [Pipeline] > Stage '${stage.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        reject(error);
                    }
                }, duration);

                // Store timer reference for cleanup if needed
                return () => clearTimeout(timer);
            } catch (error) {
                console.error(`Error starting pipeline stage ${stage.name}:`, error);
                setPipeline(prev => prev.map(s => s.name === stage.name ? { ...s, status: 'Failed' } : s));
                addRuntimeLog(`❌ [Pipeline] > Failed to start stage '${stage.name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
                reject(error);
            }
        });
    }

    const runDeployment = useCallback((action: 'start' | 'promote' | 'rollback', config?: DeployConfig) => {
        const deployConfig = config || { strategy: 'canary', weight: 10, version: `v1.${Math.floor(Math.random() * 9) + 1}.0` };

        if (pipelineStatus === 'deploying' && action !== 'start') {
            // Actions from paused state
        } else if (pipelineStatus !== 'idle' && action === 'start') {
            addRuntimeLog("A deployment is already in progress.");
            return;
        }

        if (action === 'rollback') {
            addRuntimeLog("🛑 Rollback initiated. Reverting to previous version...");
            setPipeline(prev => prev.map(s => s.name === 'Deploy Canary' ? {...s, status: 'Failed'} : s));
            setPipelineStatus('idle');
            setCanaryMetrics(null);
            setCluster(prev => {
                const newNodes = prev.nodes.map(n => ({...n, pods: n.pods.filter(p => !p.isCanary)}));
                newNodes.forEach(node => {
                    node.pods.forEach(pod => {
                        if (pod.service === 'Homepage') pod.traffic = 100 / newNodes.flatMap(n => n.pods).filter(p => p.service === 'Homepage').length;
                    });
                });
                return { ...prev, nodes: newNodes };
            });
            addRuntimeLog("✅ Rollback complete.");
            return;
        }
        
        const initialPipeline = getInitialPipeline(deployConfig);
        const commandOutputs = [
            `From github.com/DevOps-Folio/portfolio\n * branch            main       -> FETCH_HEAD\nAlready up to date.`,
            `Sending build context to Docker daemon... 128kB\nStep 1/5 : FROM node:18-alpine\n ---> a1b2c3d4e5f6\nStep 2/5 : WORKDIR /app\n ---> Using cache\n ---> g7h8i9j0k1l2\nStep 3/5 : COPY package*.json ./\n ---> Using cache\n ---> m3n4o5p6q7r8\nStep 4/5 : RUN npm install\n ---> Running in 9s0t1u2v3w4x\nSuccessfully built a1b2c3d4`,
            `\nPASS  ./__tests__/components/Header.test.tsx\nPASS  ./__tests__/utils/helpers.test.ts\n\nTest Suites: 2 passed, 2 total\nTests:       12 passed, 12 total\nSnapshots:   0 total\nTime:        2.345s`,
            `Release "devops-folio-staging" has been upgraded. Happy Helming!\nNAME: devops-folio-staging\nLAST DEPLOYED: ${new Date().toUTCString()}\nNAMESPACE: staging\nSTATUS: deployed\nREVISION: 5\nTEST SUITE: None`,
            `Release "devops-folio-canary" has been deployed. Traffic is being split ${deployConfig.weight}% to canary.\nNAME: devops-folio-canary\nLAST DEPLOYED: ${new Date().toUTCString()}\nNAMESPACE: production\nSTATUS: deployed\nREVISION: 9`,
            `Release "devops-folio-prod" has been upgraded. Happy Helming!\nNAME: devops-folio-prod\nLAST DEPLOYED: ${new Date().toUTCString()}\nNAMESPACE: production\nSTATUS: deployed\nREVISION: 8\nTEST SUITE: Run "helm test devops-folio-prod --namespace production"`,
        ];

        const executeDeployment = (start: 'start' | 'promote') => {
            if (start === 'start') {
                pipelinePromiseChain.current = runStage(initialPipeline[0], commandOutputs[0])
                    .then(() => runStage(initialPipeline[1], commandOutputs[1]))
                    .then(() => runStage(initialPipeline[2], commandOutputs[2]))
                    .then(() => runStage(initialPipeline[3], commandOutputs[3]))
                    .then(() => runStage(initialPipeline[4], commandOutputs[4]))
                    .then(() => {
                        addRuntimeLog("✅ Canary pod deployed. Pausing for validation.");
                        setPipelineStatus('paused_canary');
                        
                        const canaryPod: Pod = { name: `frontend-webapp-c9-${deployConfig.version}`, service: 'Homepage', status: 'Running', cpu: '250m', memory: '512Mi', ip: generateIp(), isCanary: true, traffic: deployConfig.weight };
                        setCluster(prev => {
                            const homepagePods = prev.nodes.flatMap(n => n.pods).filter(p => p.service === 'Homepage' && !p.isCanary);
                            const stableTraffic = homepagePods.length > 0 ? (100 - deployConfig.weight) / homepagePods.length : 0;
                            
                            const newNodes = prev.nodes.map(node => ({
                                ...node,
                                pods: node.pods.map(pod => 
                                    pod.service === 'Homepage' && !pod.isCanary 
                                        ? {...pod, traffic: stableTraffic } 
                                        : pod
                                )
                            }));
                            
                            // Add canary pod to first node with available space
                            const targetNodeIndex = newNodes.findIndex(n => n.pods.length < 4) || 0;
                            newNodes[targetNodeIndex] = {
                                ...newNodes[targetNodeIndex],
                                pods: [...newNodes[targetNodeIndex].pods, canaryPod]
                            };
                            
                            return { ...prev, nodes: newNodes };
                        });

                        const baselineLatency = 85 + Math.random() * 10;
                        const canaryIsWorse = Math.random() > 0.6; // 40% chance
                        setCanaryMetrics({
                            baseline: { latency: baselineLatency, errorRate: 0.1, cpu: 22 },
                            canary: { 
                                latency: baselineLatency + (canaryIsWorse ? Math.random() * 15 + 5 : Math.random() * 5 - 2),
                                errorRate: 0.1 + (canaryIsWorse ? Math.random() * 0.2 : Math.random() * 0.05),
                                cpu: 22 + (canaryIsWorse ? Math.random() * 8 + 2 : Math.random() * 4 - 1),
                            },
                        });
                    });
            } else if (start === 'promote') {
                 pipelinePromiseChain.current = pipelinePromiseChain.current
                    .then(() => runStage(initialPipeline[5], commandOutputs[5]))
                    .then(() => {
                        addRuntimeLog("✅ Deployment successful!");
                        toast({
                            variant: "default",
                            title: "Deployment Complete",
                            description: `Version ${deployConfig.version} has been successfully rolled out.`,
                        });

                        // Trigger gamification event for successful deployment
                        window.dispatchEvent(new CustomEvent('lab_activity', {
                            detail: { 
                                type: 'deployment_completed', 
                                data: { 
                                    strategy: deployConfig.strategy, 
                                    version: deployConfig.version,
                                    weight: deployConfig.weight
                                } 
                            }
                        }));

                        setCluster(prev => {
                            const newProdPod: Omit<Pod, 'ip' | 'name'> = { service: 'Homepage', status: 'Running', cpu: '250m', memory: '512Mi', isCanary: false };
                            
                            const newNodes = prev.nodes.map(node => ({
                                ...node,
                                pods: node.pods.filter(p => p.service !== 'Homepage')
                            }));

                            const totalProdPods = prev.nodes.flatMap(n => n.pods).filter(p => p.service === 'Homepage' && !p.isCanary).length;

                            for(let i=0; i<totalProdPods; i++) {
                                const targetNodeIndex = i % newNodes.length;
                                newNodes[targetNodeIndex].pods.push({
                                    ...newProdPod,
                                    name: `frontend-webapp-${deployConfig.version}-${i}`,
                                    ip: generateIp(),
                                    traffic: 100 / totalProdPods,
                                });
                            }
                            
                            return { ...prev, nodes: newNodes };
                        });

                        setMonitoringData(prev => {
                            const newDeploymentData = prev.deploymentData.map(d => ({ ...d }));
                            const today = new Date().toISOString().split('T')[0];
                            const todayIndex = newDeploymentData.findIndex(d => d.date === today && d.status === 'success');
                            if (todayIndex !== -1) {
                                newDeploymentData[todayIndex] = { ...newDeploymentData[todayIndex], count: newDeploymentData[todayIndex].count + 1 };
                            } else {
                                newDeploymentData.push({ date: today, status: 'success' as const, count: 1 });
                            }
                            return {...prev, deploymentData: newDeploymentData.filter(d => d.status === 'success' || d.count > 0) };
                        });
                        
                        setPipelineStatus('completed');
                        setCanaryMetrics(null);
                        setTimeout(() => {
                            setPipelineStatus('idle');
                        }, 0);
                    });
            }
        };

        if (action === 'start') {
            setPipelineStatus('deploying');
            addRuntimeLog(`🚀 Starting new deployment with strategy '${deployConfig.strategy}'...`);
            setPipeline(initialPipeline);
            executeDeployment('start');
        }

        if (action === 'promote') {
            addRuntimeLog("✅ Canary validated. Promoting to production...");
            setPipelineStatus('deploying');
            setCanaryMetrics(null);
            executeDeployment('promote');
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pipelineStatus, addRuntimeLog, toast, addIncident]);

    const toggleAutoChaos = (enabled: boolean) => {
        setIsAutoChaosEnabled(enabled);
        if (enabled) {
            addRuntimeLog("🤖 Auto-Chaos Mode Enabled. Experiments will run periodically.");
            autoChaosTimer.current = setInterval(() => {
                const scenarios = ['pod_failure', 'cpu_spike', 'latency'];
                const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
                addRuntimeLog(`🤖 Auto-Chaos Monkey is triggering '${randomScenario}'...`);
                runChaos(randomScenario);
            }, 20000);
        } else {
            addRuntimeLog("🤖 Auto-Chaos Mode Disabled.");
            if (autoChaosTimer.current) {
                clearInterval(autoChaosTimer.current);
            }
        }
    };
    
    const isDeploying = pipelineStatus === 'deploying' || pipelineStatus === 'paused_canary';


    const value = {
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
        addRuntimeLog,
        toggleAutoChaos
    };

    return (
        <LabSimulationContext.Provider value={value}>
            {children}
        </LabSimulationContext.Provider>
    );
};

export const useLabSimulation = (): LabSimulationContextType => {
    const context = useContext(LabSimulationContext);
    if (context === undefined) {
        throw new Error('useLabSimulation must be used within a LabSimulationProvider');
    }
    return context;
};
