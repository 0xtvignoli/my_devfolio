
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  useState,
} from "react";
import type {
  Service,
  ServiceStatus,
  Metric,
  LogEntry,
  LogLevel,
  PipelineStage,
  IncidentType,
  ChaosExperiment,
} from "@/lib/types";
import { generateScenario, type Scenario } from "@/ai/flows/generate-scenario";

const MAX_METRICS = 30;
const MAX_LOGS = 200;

// --- Helper Functions ---
const generateNormalMetric = (base: number, variance: number) =>
  Math.max(0, base + (Math.random() - 0.5) * variance);

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const generatePodName = (serviceId: string) =>
  `${serviceId.toLowerCase().replace(/\s+/g, '-').substring(0, 10)}-${Math.random().toString(36).substring(2, 7)}`;


const availableExperiments: ChaosExperiment[] = [
  {
    type: "pod-delete",
    name: "Pod Delete",
    description: "Randomly deletes a pod to test self-healing.",
  },
  {
    type: "network-latency",
    name: "Network Latency",
    description: "Injects latency into network traffic.",
  },
  {
    type: "container-kill",
    name: "Container Kill",
    description: "Kills a random container within a pod.",
  },
];

// --- State and Context ---
type PipelineStatus = 'idle' | 'running' | 'success' | 'failure';
type State = {
  services: Service[];
  metrics: {
    cpu: Metric[];
    ram: Metric[];
    network: Metric[];
  };
  logs: LogEntry[];
  scenarioLogs: LogEntry[];
  pipeline: PipelineStage[];
  incident: IncidentType | null;
  availableExperiments: ChaosExperiment[];
  isBusy: boolean;
  pipelineStatus: PipelineStatus;
  scenario: Scenario | null;
};

const initialState: State = {
  services: [],
  metrics: { cpu: [], ram: [], network: [] },
  logs: [
    { level: 'INFO', message: "Welcome to the production terminal.", timestamp: new Date() },
    { level: 'INFO', message: "Type 'help' for a list of available commands.", timestamp: new Date() }
  ],
  scenarioLogs: [],
  pipeline: [],
  incident: null,
  availableExperiments,
  isBusy: true,
  pipelineStatus: 'idle',
  scenario: null,
};

type DevOpsSimContextType = State & {
  runCommand: (command: string, args?: any) => void;
  runPipeline: () => void;
  isLoading: boolean;
};

const DevOpsSimContext = createContext<DevOpsSimContextType | undefined>(
  undefined
);

// --- Reducer ---
type Action =
  | { type: "INITIALIZE_STATE"; payload: { services: Service[], logs: LogEntry[] } }
  | { type: "UPDATE_METRICS" }
  | { type: "ADD_LOG"; payload: { level: LogLevel; message: string; command?: string } }
  | { type: "ADD_SCENARIO_LOG"; payload: { level: LogLevel; message: string } }
  | { type: "CLEAR_LOGS" }
  | { type: "SET_BUSY"; payload: boolean }
  | { type: "SET_PIPELINE_STATUS"; payload: PipelineStatus }
  | { type: "SET_PIPELINE_STAGES"; payload: PipelineStage[] }
  | { type: "UPDATE_PIPELINE_STAGE"; payload: { stageIndex: number; status: PipelineStage['status']; duration?: number } }
  | { type: "START_INCIDENT"; payload: { type: IncidentType, targetService: Service } }
  | { type: "RESOLVE_INCIDENT" }
  | { type: "UPDATE_SERVICE_STATUS"; payload: { serviceId: string; status: ServiceStatus } }
  | { type: "KILL_POD"; payload: { serviceId: string, podName: string } }
  | { type: "RESTART_POD"; payload: { serviceId: string, oldPodName: string } }
  | { type: "SET_SCENARIO"; payload: { scenario: Scenario } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "INITIALIZE_STATE": {
       const now = new Date();
       const dataPoints = Array.from({ length: MAX_METRICS }, (_, i) => {
         const time = new Date(now.getTime() - (MAX_METRICS - 1 - i) * 1000 * 60);
         return {
           time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           utilization: parseFloat(generateNormalMetric(20, 10).toFixed(2)),
           usage: parseFloat(generateNormalMetric(8, 2).toFixed(2)),
           traffic: parseFloat(generateNormalMetric(100, 50).toFixed(2)),
         };
       });
       return {
         ...state,
         services: action.payload.services,
         logs: action.payload.logs,
         metrics: {
           cpu: dataPoints.map(d => ({ time: d.time, utilization: d.utilization })),
           ram: dataPoints.map(d => ({ time: d.time, usage: d.usage })),
           network: dataPoints.map(d => ({ time: d.time, traffic: d.traffic })),
         },
       };
    }
    case "SET_SCENARIO":
      return {
        ...state,
        scenario: action.payload.scenario,
        pipeline: action.payload.scenario.pipeline.map(p => ({ name: p.name, status: 'pending' })),
        scenarioLogs: [{ level: 'INFO', message: `Scenario loaded: "${action.payload.scenario.scenarioTitle}".`, timestamp: new Date() }],
        pipelineStatus: 'idle',
      };
    case "UPDATE_METRICS": {
      let cpuBase = 20, cpuVar = 10;
      let ramBase = 8, ramVar = 2;
      let netBase = 100, netVar = 50;

      // Production workload metrics adjustments
      if (state.incident === "container-kill" || state.incident === "pod-delete") {
        cpuBase = 80; cpuVar = 15;
      } else if (state.incident === "network-latency") {
        netBase = 500; netVar = 200;
      }

      // Scenario pipeline metrics adjustments
      if (state.pipelineStatus === 'running') {
        cpuBase = 65; cpuVar = 20;
        ramBase = 12; ramVar = 3;
        netBase = 400; netVar = 150;
      } else if (state.scenario?.isIncident && state.pipelineStatus !== 'idle') {
         cpuBase = 85; cpuVar = 15;
      }

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...state,
        metrics: {
          cpu: [...state.metrics.cpu.slice(1), { time, utilization: parseFloat(generateNormalMetric(cpuBase, cpuVar).toFixed(2)) }],
          ram: [...state.metrics.ram.slice(1), { time, usage: parseFloat(generateNormalMetric(ramBase, ramVar).toFixed(2)) }],
          network: [...state.metrics.network.slice(1), { time, traffic: parseFloat(generateNormalMetric(netBase, netVar).toFixed(2)) }],
        },
      };
    }
    case "ADD_LOG":
      return {
        ...state,
        logs: [...state.logs, { ...action.payload, timestamp: new Date() }].slice(-MAX_LOGS),
      };
     case "ADD_SCENARIO_LOG":
      return {
        ...state,
        scenarioLogs: [...state.scenarioLogs, { ...action.payload, timestamp: new Date() }].slice(-MAX_LOGS),
      };
    case "CLEAR_LOGS":
      return { ...state, logs: [] };
    case "SET_BUSY":
      return { ...state, isBusy: action.payload };
    case "SET_PIPELINE_STATUS":
      return { ...state, pipelineStatus: action.payload };
    case "SET_PIPELINE_STAGES":
      return { ...state, pipeline: action.payload };
    case "UPDATE_PIPELINE_STAGE": {
      const newPipeline = [...state.pipeline];
      newPipeline[action.payload.stageIndex] = {
        ...newPipeline[action.payload.stageIndex],
        status: action.payload.status,
        duration: action.payload.duration ?? newPipeline[action.payload.stageIndex].duration,
      };
      return { ...state, pipeline: newPipeline };
    }
    case "START_INCIDENT":
      return {
        ...state,
        incident: action.payload.type,
        services: state.services.map(s =>
          s.id === action.payload.targetService.id ? { ...s, status: "DEGRADED" } : s
        ),
      };
    case "RESOLVE_INCIDENT":
      return {
        ...state,
        incident: null,
        services: state.services.map(s => ({ ...s, status: "OPERATIONAL" }))
      };
    case "UPDATE_SERVICE_STATUS":
      return {
        ...state,
        services: state.services.map(s => s.id === action.payload.serviceId ? { ...s, status: action.payload.status } : s)
      }
    case "KILL_POD": {
      return {
        ...state,
        services: state.services.map(s => {
          if (s.id === action.payload.serviceId) {
            return {
              ...s,
              pods: s.pods.filter(p => p !== action.payload.podName)
            }
          }
          return s;
        })
      }
    }
    case "RESTART_POD": {
      return {
        ...state,
        services: state.services.map(s => {
          if (s.id === action.payload.serviceId) {
            const newPodName = generatePodName(s.id);
            // Ensure the new pod name is unique, just in case
            if (s.pods.includes(newPodName)) {
                return { ...s, pods: [...s.pods, generatePodName(s.id)]}
            }
            return {
              ...s,
              pods: [...s.pods.filter(p => p !== action.payload.oldPodName), newPodName]
            }
          }
          return s;
        })
      }
    }
    default:
      return state;
  }
};

// --- Provider Component ---
export const DevopsSimProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  
  const stateRef = useRef(state);
  stateRef.current = state;

  const addLog = useCallback((level: LogLevel, message: string, command?: string) => {
    dispatch({ type: "ADD_LOG", payload: { level, message, command } });
  }, []);
  
  const addScenarioLog = useCallback((level: LogLevel, message: string) => {
    dispatch({ type: "ADD_SCENARIO_LOG", payload: { level, message } });
  }, []);

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const runPipeline = useCallback(async () => {
    const { scenario } = stateRef.current;
    if (!scenario) {
      addScenarioLog("ERROR", "No scenario loaded. Cannot run pipeline.");
      return;
    }
     if (stateRef.current.pipelineStatus !== 'idle') {
      addScenarioLog("WARN", "Pipeline is already running.");
      return;
    }

    dispatch({ type: "SET_PIPELINE_STATUS", payload: 'running' });
    addScenarioLog("INFO", `Starting pipeline for scenario: "${scenario.scenarioTitle}"`);
    await sleep(500);

    let pipelineFailed = false;

    for (let i = 0; i < scenario.pipeline.length; i++) {
      if (pipelineFailed) {
        dispatch({ type: "UPDATE_PIPELINE_STAGE", payload: { stageIndex: i, status: "pending" }});
        continue;
      }

      const stage = scenario.pipeline[i];
      dispatch({ type: "UPDATE_PIPELINE_STAGE", payload: { stageIndex: i, status: "running" } });
      
      const startTime = Date.now();
      addScenarioLog("INFO", `Executing stage: ${stage.name}`);
      await sleep(500);
      if (stage.logOutput) {
        stage.logOutput.split('\n').forEach(line => {
            if (line) addScenarioLog(stage.status === 'success' ? 'DEBUG' : 'ERROR', line);
        })
      }
      await sleep(stage.duration * 1000);

      const duration = Math.round((Date.now() - startTime) / 1000);
      dispatch({ type: "UPDATE_PIPELINE_STAGE", payload: { stageIndex: i, status: stage.status, duration } });
      addScenarioLog(
        stage.status === "success" ? "INFO" : "ERROR",
        `Stage '${stage.name}' completed with status ${stage.status.toUpperCase()} in ${duration}s.`
      );

      if (stage.status === 'failure') {
        pipelineFailed = true;
      }
    }

    dispatch({ type: "SET_PIPELINE_STATUS", payload: pipelineFailed ? 'failure' : 'success' });
    addScenarioLog("INFO", `Deployment pipeline finished with status: ${pipelineFailed ? 'FAILURE' : 'SUCCESS'}.`);
  }, [addScenarioLog]);

  const runCommand = useCallback(async (command: string, args?: any) => {
    dispatch({ type: "SET_BUSY", payload: true });
    addLog("INFO", command, "prompt");
    await sleep(300);
  
    const commandParts = command.toLowerCase().split(' ');
    const mainCommand = commandParts[0];
  
    const currentState = stateRef.current;
    let isAsyncOperation = false;
  
    switch (mainCommand) {
      case "help":
        addLog("INFO", "Available commands:");
        addLog("INFO", "  get services          - List all running services in production.");
        addLog("INFO", "  get pods              - List all pods in the production cluster.");
        addLog("INFO", "  run chaos             - Run a chaos experiment (use menu).");
        addLog("INFO", "  clear                 - Clear the terminal logs.");
        break;
      case "get":
        if (commandParts[1] === 'services') {
          addLog("INFO", "kubectl get services -n production");
          await sleep(500);
          let output = "NAME\t\t\t\tTYPE\t\tCLUSTER-IP\tEXTERNAL-IP\tPORT(S)\t\tAGE\n";
          currentState.services.forEach(s => {
            const shortName = s.name.length > 20 ? s.name.substring(0, 17) + "..." : s.name;
            output += `${shortName.padEnd(24, ' ')}\tClusterIP\t10.96.4.28\t<none>\t\t80/TCP\t\t${Math.floor(Math.random() * 24)}h\n`;
          });
          addLog("INFO", `\n${output}`);
        } else if (commandParts[1] === 'pods') {
          addLog("INFO", "kubectl get pods -n production -o wide");
          await sleep(500);
          let output = "NAME\t\t\t\t\tREADY\tSTATUS\t\tRESTARTS\tAGE\tIP\t\tNODE\n";
          currentState.services.forEach(s => {
            s.pods.forEach(p => {
              output += `${p.padEnd(32, ' ')}\t1/1\tRunning\t\t0\t\t${Math.floor(Math.random() * 60)}m\t10.1.2.3\tgke-node-1\n`;
            });
          });
          addLog("INFO", `\n${output}`);
        } else {
          addLog("ERROR", `Unknown resource type: '${commandParts[1]}'. Use 'services' or 'pods'.`);
        }
        break;
      case "run":
        if (commandParts[1] === 'chaos') {
          isAsyncOperation = true; 
          if (!args) {
            addLog("ERROR", "Please use the 'Run Chaos Experiment' menu to select an experiment and target.");
            dispatch({ type: "SET_BUSY", payload: false });
          } else if (currentState.incident) {
            addLog("WARN", "An incident is already in progress.");
            dispatch({ type: "SET_BUSY", payload: false });
          } else {
            const { experiment, service } = args;
            addLog("INFO", `Running chaos experiment '${experiment.name}' on service '${service.name}'...`);
            
            (async () => {
              await sleep(1000);
              addLog("INFO", `kubectl apply -f ${experiment.type}.yaml`);
              await sleep(500);
              addLog("INFO", `chaos-experiment.litmus.io/${experiment.type} created`);
              dispatch({ type: "START_INCIDENT", payload: { type: experiment.type, targetService: service } });
              await sleep(1000);
              addLog("WARN", `Service ${service.name} status is now DEGRADED.`);
  
              if (experiment.type === 'pod-delete') {
                const podToKill = service.pods[0];
                if (podToKill) {
                  addLog("ERROR", `kubectl delete pod ${podToKill} -n production`);
                  await sleep(1000);
                  dispatch({ type: "KILL_POD", payload: { serviceId: service.id, podName: podToKill } });
                  await sleep(2000);
                  addLog("INFO", "Pod deleted. Kubernetes ReplicaSet controller is creating a new one...");
                  await sleep(5000);
                  dispatch({ type: "RESTART_POD", payload: { serviceId: service.id, oldPodName: podToKill } });
                  addLog("INFO", `New pod created for service ${service.name}.`);
                }
              }
              if (experiment.type === 'container-kill') {
                addLog("ERROR", `Killing container in a random pod of service ${service.name}...`);
                await sleep(2000);
                addLog("INFO", "Container killed. Kubelet is restarting it...");
              }
              if (experiment.type === 'network-latency') {
                addLog("WARN", `Injecting 300ms latency into ${service.name}...`);
              }
  
              await sleep(8000);
              dispatch({ type: "RESOLVE_INCIDENT" });
              addLog("INFO", "Chaos experiment finished. System is returning to normal.");
              addLog("INFO", `Service ${service.name} status is now OPERATIONAL.`);
              dispatch({ type: "SET_BUSY", payload: false });
            })();
          }
        } else {
          addLog("ERROR", `Unknown 'run' command. Did you mean 'run chaos'?`);
        }
        break;
      case "clear":
        dispatch({ type: "CLEAR_LOGS" });
        break;
      default:
        addLog("ERROR", `Command not found: ${command}. Type 'help' for available commands.`);
    }
  
    if (!isAsyncOperation) {
      dispatch({ type: "SET_BUSY", payload: false });
    }
  }, [addLog]);


  useEffect(() => {
    let isMounted = true;
    
    const initializeSim = async () => {
      try {
        if (!isMounted) return;

        // Step 1: Initialize stable production environment
        const prodServices = [
            "Auth Service",
            "Data Ingest Worker",
            "API Gateway",
            "Frontend Web Server",
        ].map((name) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            status: "OPERATIONAL" as ServiceStatus,
            pods: [generatePodName(name), generatePodName(name)],
        }));

        dispatch({ type: "INITIALIZE_STATE", payload: {
            services: prodServices,
            logs: initialState.logs
        }});

        // Step 2: Generate and set up AI scenario in parallel
        addScenarioLog("INFO", "Generating a unique DevOps scenario with AI...");
        const scenario = await generateScenario();
        if (!isMounted) return;
        
        dispatch({ type: "SET_SCENARIO", payload: { scenario } });
        
        // Step 3: Finalize loading state
        setIsLoading(false);
        dispatch({ type: "SET_BUSY", payload: false });

      } catch (error) {
        console.error("Failed to initialize simulation:", error);
        addLog("ERROR", "Could not initialize simulation. Please check API key and configuration.");
        setIsLoading(false);
        dispatch({ type: "SET_BUSY", payload: false });
      }
    };
    
    initializeSim();
    
    const metricsInterval = setInterval(() => {
      if(isMounted) dispatch({ type: "UPDATE_METRICS" })
    }, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(metricsInterval);
    }
  }, [addLog, addScenarioLog]);

  const value = { ...state, runCommand, runPipeline, isLoading };

  return (
    <DevOpsSimContext.Provider value={value}>{children}</DevOpsSimContext.Provider>
  );
};

export const useDevopsSim = (): DevOpsSimContextType => {
  const context = useContext(DevOpsSimContext);
  if (context === undefined) {
    throw new Error("useDevopsSim must be used within a DevopsSimProvider");
  }
  return context;
};
