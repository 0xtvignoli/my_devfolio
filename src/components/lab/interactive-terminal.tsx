'use client';

import { projects } from '@/data/content/projects';
import { experiences } from '@/data/content/experiences';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { KubernetesCluster, Locale, Pod, Translations } from '@/lib/types';
import { AlertTriangle, Check, Clipboard, FileTerminal, Loader2, Power, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CommandOutput = string | string[] | null;
type CommandStatus = 'running' | 'success' | 'error';

interface TerminalEntry {
  id: string;
  command?: string;
  output: CommandOutput;
  timestamp: string;
  status?: CommandStatus;
  isSystem?: boolean;
  contextHint?: string;
  suggestion?: string;
  prompt: string;
}

interface CommandExecutionResult {
  output: CommandOutput;
  status?: CommandStatus;
  suggestion?: string;
  contextHint?: string;
  emulateDelayMs?: number;
  streamingSteps?: string[];
  skipStreaming?: boolean;
}

interface Suggestion {
  label: string;
  helper: string;
  command: string;
}

interface SessionMeta {
  user: string;
  host: string;
  tty: string;
  ip: string;
  distro: string;
  kernel: string;
  lastLogin: string;
}

interface InteractiveTerminalProps {
  runtimeLogs: string[];
  cluster: KubernetesCluster;
  onCommand: (command: string) => CommandOutput | CommandExecutionResult | null;
  locale: Locale;
  translations: Translations;
}

const HISTORY_STORAGE_KEY = 'lab_terminal_history';

const AUTOCOMPLETE_COMMANDS = [
  'help',
  'ls',
  'ls projects',
  'ls experience',
  'cat README.md',
  'cat skills.txt',
  'kubectl get pods',
  'kubectl get nodes',
  'kubectl describe pod frontend',
  'kubectl logs api-gateway',
  'helm list',
  'helm status devops-folio',
  'git status',
  'git log',
  'git branch',
  'deploy --strategy=canary --weight=20',
  'deploy --strategy=blue-green',
  'chaos latency',
  'chaos pod_failure',
  'history',
  'uptime',
  'status',
];

const commandLatencyMap: Record<string, [number, number]> = {
  kubectl: [650, 1200],
  helm: [420, 820],
  git: [180, 420],
  deploy: [900, 1800],
  chaos: [750, 1400],
  ls: [120, 260],
  cat: [120, 260],
  status: [200, 350],
  default: [250, 450],
};

const streamingSteps: Record<string, string[]> = {
  kubectl: [
    '[busy] contacting api-server...',
    '[ready] aggregating cluster objects...',
  ],
  deploy: [
    '[busy] wiring CI context...',
    '[sync] applying manifest templates...',
    '[ready] waiting for pods to become Ready...',
  ],
  chaos: [
    '[busy] preparing fault injection...',
    '[sync] arming scenario safeguards...',
  ],
  git: [
    '[busy] inspecting worktree...',
  ],
  helm: [
    '[busy] talking to Tiller replacement...',
  ],
};

const contextualSuggestions: Record<string, Suggestion[]> = {
  default: [
    { label: 'kubectl get pods', helper: 'Check rollout pulse', command: 'kubectl get pods' },
    { label: 'deploy --strategy=canary --weight=20', helper: 'Progressive release', command: 'deploy --strategy=canary --weight=20' },
    { label: 'chaos latency', helper: 'Stress the mesh', command: 'chaos latency' },
  ],
  kubectl: [
    { label: 'kubectl describe pod frontend', helper: 'Drill into a pod', command: 'kubectl describe pod frontend-app' },
    { label: 'kubectl logs api-gateway', helper: 'Inspect live logs', command: 'kubectl logs api-gateway' },
    { label: 'deploy --strategy=blue-green', helper: 'Promote a green stack', command: 'deploy --strategy=blue-green' },
  ],
  deploy: [
    { label: 'kubectl get pods', helper: 'Verify rollout health', command: 'kubectl get pods' },
    { label: 'git log', helper: 'Trace latest commits', command: 'git log' },
    { label: 'chaos pod_failure', helper: 'Validate resiliency', command: 'chaos pod_failure' },
  ],
  git: [
    { label: 'git status', helper: 'Working tree summary', command: 'git status' },
    { label: 'deploy --strategy=canary --weight=20', helper: 'Ship the change', command: 'deploy --strategy=canary --weight=20' },
    { label: 'kubectl get pods', helper: 'Validate pods', command: 'kubectl get pods' },
  ],
  chaos: [
    { label: 'status', helper: 'Check mission control', command: 'status' },
    { label: 'kubectl get pods', helper: 'Observe healing', command: 'kubectl get pods' },
    { label: 'history', helper: 'Inspect command tape', command: 'history' },
  ],
};

const systemBootSequence = [
  { message: 'systemd[1]: Mounting lab-observability.target...', delay: 250 },
  { message: 'auditd: secure channel negotiated (TLS1.3, AES-256-GCM)', delay: 650 },
  { message: 'lab-agent: telemetry bus online • streaming cluster stats', delay: 1100 },
];

const systemKeepAliveMessages = [
  'systemd[1]: Completed lab-agent.service heartbeat',
  'kernel: cgroup v2 reports steady pressure (cpu 12%)',
  'auditd: no escalations detected in the last scan window',
  'vault-sidecar: renewed workload token, TTL 55m',
  'istio-proxy: mTLS session rotated for edge gateway',
];

const ensureArray = (output: CommandOutput): string[] => {
  if (output === null || output === undefined) return [];
  return Array.isArray(output) ? output : [output];
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cmd-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const randomIpPart = () => Math.floor(Math.random() * 200) + 20;

const createSessionMeta = (): SessionMeta => ({
  user: 'infra',
  host: `control-plane-${Math.floor(Math.random() * 3) + 1}`,
  tty: `pts/${Math.floor(Math.random() * 4) + 1}`,
  ip: `10.${randomIpPart()}.${randomIpPart()}.${randomIpPart()}`,
  distro: 'Ubuntu 24.04.1 LTS',
  kernel: '6.8.0-41-generic',
  lastLogin: new Date(Date.now() - 1000 * 60 * 42).toUTCString(),
});

const getPodByName = (cluster: KubernetesCluster, name: string): Pod | undefined => {
  for (const node of cluster.nodes) {
    const found = node.pods.find(p => p.name.includes(name));
    if (found) return found;
  }
  return undefined;
};

const getAllPods = (cluster: KubernetesCluster): Pod[] => {
  return cluster.nodes.flatMap(node => node.pods);
};

const StatusPill = ({ status }: { status?: CommandStatus }) => {
  if (status === 'running') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-300">
        <Loader2 className="h-3 w-3 animate-spin" />
        running
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <AlertTriangle className="h-3 w-3" />
        error
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-emerald-300">
      <Check className="h-3 w-3" />
      ok
    </span>
  );
};

const CommandOutputDisplay = ({ output }: { output: CommandOutput }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const lines = ensureArray(output);
  if (lines.length === 0) return null;
  const textToCopy = lines.join('\n');

  const copyToClipboard = () => {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(() => setHasCopied(false));
  };

  return (
    <div className="relative group mt-2 rounded border border-slate-800/80 bg-black/40 px-3 py-2 text-slate-200">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
        type="button"
      >
        {hasCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Clipboard className="h-4 w-4" />}
        <span className="sr-only">Copy output</span>
      </Button>
      <pre className="whitespace-pre-wrap text-xs leading-relaxed">{textToCopy}</pre>
    </div>
  );
};

export const InteractiveTerminal = forwardRef<{ setCommand: (command: string) => void, setActiveTab: (tab: 'terminal' | 'logs') => void }, InteractiveTerminalProps>(({ runtimeLogs, cluster, onCommand, locale, translations }, ref) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs'>('terminal');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [storedCommands, setStoredCommands] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(contextualSuggestions.default);

  const sessionRef = useRef<SessionMeta>(createSessionMeta());
  const promptRef = useRef(`[${sessionRef.current.user}@${sessionRef.current.host} ~]`);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const systemIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    setCommand: (command: string) => {
      setInput(command);
      inputRef.current?.focus();
    },
    setActiveTab: (tab: 'terminal' | 'logs') => {
      setActiveTab(tab);
    }
  }));

  const fileSystem = useMemo(() => ({
    'projects': {
      ...Object.fromEntries(
        projects.map(p => [
          `${p.id}.md`,
          `# ${p.title[locale]}\n\n${p.description[locale]}\n\nTags: ${p.tags.join(', ')}`
        ])
      ),
      'README.md': 'This directory contains details about my projects. Use `cat projects/project-id.md` to view a specific one.'
    },
    'experience': {
      ...Object.fromEntries(
        experiences.map(e => [
          `${e.company.toLowerCase().replace(' ', '-')}.md`,
          `# ${e.title[locale]} at ${e.company}\n\n${e.date[locale]}\n\n${e.description[locale]}\n\nSkills: ${e.tags.join(', ')}`
        ])
      ),
      'README.md': 'This directory contains my professional experience.'
    },
    'skills.txt': translations.skills.list.join('\n'),
    'contact.txt': `You can reach me at: ${translations.contact.email}`,
    'README.md': "Welcome to my interactive portfolio! Type `help` to see available commands.",
  }), [locale, translations.contact.email, translations.skills.list]);

  const pushEntry = useCallback((entry: Omit<TerminalEntry, 'id'>) => {
    const id = createId();
    setHistory(prev => [...prev.slice(-80), { ...entry, id }]);
    return id;
  }, []);

  const updateEntry = useCallback((id: string, updater: (entry: TerminalEntry) => TerminalEntry) => {
    setHistory(prev => prev.map(entry => entry.id === id ? updater(entry) : entry));
  }, []);

  const appendOutput = useCallback((id: string, line: string) => {
    updateEntry(id, entry => {
      const current = ensureArray(entry.output);
      return { ...entry, output: [...current, line] };
    });
  }, [updateEntry]);

  const finalizeEntry = useCallback((id: string, result: CommandExecutionResult) => {
    updateEntry(id, entry => {
      const existing = ensureArray(entry.output);
      const finalLines = ensureArray(result.output);
      return {
        ...entry,
        output: finalLines.length ? [...existing, ...finalLines] : existing,
        status: result.status ?? 'success',
        contextHint: result.contextHint ?? entry.contextHint,
        suggestion: result.suggestion ?? entry.suggestion,
      };
    });
  }, [updateEntry]);

  const pushSystemMessage = useCallback((message: string, contextHint?: string) => {
    pushEntry({
      command: 'system',
      output: message,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      isSystem: true,
      contextHint,
      prompt: 'systemd[1]',
    });
  }, [pushEntry]);

  const getLatency = useCallback((commandName: string) => {
    const range = commandLatencyMap[commandName] ?? commandLatencyMap.default;
    const [min, max] = range;
    if (min === max) return min;
    return Math.floor(Math.random() * (max - min)) + min;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setStoredCommands(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load terminal history', error);
    }
  }, []);

  useEffect(() => {
    if (storedCommands.length === 0) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      return;
    }
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(storedCommands.slice(-50)));
  }, [storedCommands]);

  useEffect(() => {
    const timeouts = systemBootSequence.map(step =>
      setTimeout(() => pushSystemMessage(step.message), step.delay)
    );
    systemIntervalRef.current = setInterval(() => {
      const sample = systemKeepAliveMessages[Math.floor(Math.random() * systemKeepAliveMessages.length)];
      pushSystemMessage(sample);
    }, 35000);

    return () => {
      timeouts.forEach(clearTimeout);
      if (systemIntervalRef.current) {
        clearInterval(systemIntervalRef.current);
      }
    };
  }, [pushSystemMessage]);

  useEffect(() => {
    if (activeTab === 'terminal' && history.length > 0 && hasUserInteracted) {
      setTimeout(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [history.length, activeTab, hasUserInteracted]);

  useEffect(() => {
    if (activeTab === 'logs' && hasUserInteracted) {
      setTimeout(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [activeTab, hasUserInteracted]);

  useEffect(() => {
    const lastCommandEntry = [...history].reverse().find(entry => !entry.isSystem && entry.command);
    const commandKey = lastCommandEntry?.command?.split(' ')[0] ?? 'default';
    setSuggestions(contextualSuggestions[commandKey] ?? contextualSuggestions.default);
  }, [history]);

  const executeCommand = useCallback((cmd: string): CommandExecutionResult => {
    window.dispatchEvent(new CustomEvent('lab_activity', {
      detail: { type: 'terminal_command', data: { command: cmd.split(' ')[0] } }
    }));

    const delegated = onCommand(cmd);
    if (delegated !== null && delegated !== undefined) {
      if (typeof delegated === 'object' && 'output' in delegated) {
        return delegated as CommandExecutionResult;
      }
      return { output: delegated };
    }

    const [command, ...args] = cmd.trim().split(' ');
    const path = args[0] || '';

    switch (command) {
      case 'help':
        return {
          output: [
            'SYSTEM COMMANDS:',
            '  help                - Show this panel',
            '  ls [path]           - List workspace directories',
            '  cat <file>          - Inspect a file',
            '  pwd                 - Print the current workspace path',
            '  history             - Command log (use history -c to clear)',
            '  clear               - Clear the viewport',
            '  uptime              - Show session uptime',
            '',
            'LAB COMMANDS:',
            '  deploy [--strategy] [--weight] [--version]   - Trigger pipeline',
            '  chaos <scenario>                             - Run chaos experiment',
            '  status                                       - Show control-plane vitals',
            '',
            'SIMULATED TOOLS:',
            '  kubectl get|describe|logs ...',
            '  helm list|status <release>',
            '  git status|log|branch|remote -v',
          ],
          contextHint: 'Everything in this terminal is wired to the lab simulator. Experiment freely.',
          suggestion: 'Try `kubectl get pods` or `deploy --strategy=canary --weight=20`',
        };
      case 'whoami':
        return {
          output: 'infra@control-plane (DevOps Engineer orchestrating this lab). Access level: root-equivalent within the sandbox.',
          contextHint: 'Session fingerprint derived from signed cookie via middleware.',
        };
      case 'pwd':
        return {
          output: '/home/infra/mission-control',
        };
      case 'uptime':
        return {
          output: `${new Date().toLocaleTimeString()} up 05 days,  load average: 0.42, 0.38, 0.33`,
          contextHint: 'Simulated load averages pulled from monitoring buffers.',
        };
      case 'history':
        if (args[0] === '-c') {
          setStoredCommands([]);
          return {
            output: 'Command history cleared.',
            status: 'success',
            suggestion: 'The shell still remembers in-memory commands for this session.',
          };
        }
        if (storedCommands.length === 0) {
          return {
            output: 'No commands recorded yet. Start issuing actions to populate history.',
            suggestion: 'Use ↑ / ↓ to navigate once you build history.',
          };
        }
        return {
          output: storedCommands.map((value, index) => `${String(index + 1).padStart(4, ' ')}  ${value}`),
          contextHint: 'Use ↑ / ↓ to recall commands, Tab to autocomplete.',
        };
      case 'ls': {
        const dir = path.split('/')[0] || null;
        if (!path) {
          return {
            output: Object.keys(fileSystem)
              .filter(k => !k.includes('.'))
              .map(d => `${d}/`)
              .concat(Object.keys(fileSystem).filter(k => k.includes('.'))),
            contextHint: 'Directories map to real sections of the public portfolio.',
          };
        }
        if (dir && typeof (fileSystem as Record<string, unknown>)[dir] === 'object') {
          return {
            output: Object.keys((fileSystem as Record<string, unknown>)[dir] as Record<string, string>),
            contextHint: `Listing ${dir}/`,
          };
        }
        return {
          output: `ls: cannot access '${path}': No such file or directory`,
          status: 'error',
          suggestion: 'Try ls projects',
        };
      }
      case 'cat': {
        if (!path) {
          return { output: 'cat: missing operand', status: 'error', suggestion: 'Usage: cat <file>' };
        }
        const parts = path.split('/');
        if (parts.length === 1) {
          const fsEntry = (fileSystem as Record<string, unknown>)[parts[0]];
          if (typeof fsEntry === 'string') {
            return { output: fsEntry };
          }
        } else if (parts.length === 2) {
          const dir = parts[0];
          const file = parts[1];
          const fsDir = (fileSystem as Record<string, unknown>)[dir] as Record<string, string> | undefined;
          if (fsDir && typeof fsDir[file] === 'string') {
            return { output: fsDir[file] };
          }
        }
        return {
          output: `cat: ${path}: No such file or directory`,
          status: 'error',
          suggestion: 'Use ls to inspect directories first.',
        };
      }
      case 'status':
        return {
          output: [
            'Mission Control Status',
            '──────────────────────',
            `Cluster Nodes     : ${cluster.nodes.length} (all Ready)`,
            `Pods Healthy      : ${getAllPods(cluster).filter(p => p.status === 'Running').length}`,
            'CI/CD Pipeline    : Awaiting operator input',
            'Chaos Automation  : Scoped to non-prod namespaces',
          ],
          contextHint: 'This mirrors the cards below the lab terminal.',
        };
      case 'kubectl': {
        const kubeCmd = args[0];
        const kubeArg = args[1];
        switch (kubeCmd) {
          case 'get':
            if (kubeArg === 'pods') {
              const pods = getAllPods(cluster);
              const header = "NAME\t\t\tSTATUS\tTRAFFIC\tRESTARTS\tAGE";
              const rows = pods.map(p => `${p.name.padEnd(24, ' ')}\t${p.status.padEnd(8, ' ')}\t${p.traffic?.toFixed(0) ?? 'N/A'}%\t0\t3h`);
              return {
                output: [header, ...rows],
                contextHint: 'Traffic percentages mirror the live chart above.',
              };
            }
            if (kubeArg === 'nodes') {
              const header = "NAME\t\tSTATUS\tROLES\tAGE\tVERSION";
              const rows = cluster.nodes.map(n => `${n.name.padEnd(12, ' ')}\tReady\tworker\t5d\tv1.28.0`);
              return { output: [header, ...rows] };
            }
            if (kubeArg === 'services' || kubeArg === 'svc') {
              const header = "NAME\t\tTYPE\tCLUSTER-IP\tPORT(S)\tAGE";
              const services = [
                "frontend-service\tClusterIP\t10.96.0.10\t80/TCP\t5d",
                "api-gateway-svc\tClusterIP\t10.96.0.11\t8080/TCP\t5d",
                "monitoring-svc\tNodePort\t10.96.0.12\t3000:30000/TCP\t5d"
              ];
              return { output: [header, ...services] };
            }
            return { output: `error: resource type '${kubeArg}' not supported`, status: 'error' };
          case 'describe':
            if (args[1] === 'pod' && args[2]) {
              const pod = getPodByName(cluster, args[2]);
              if (!pod) {
                return {
                  output: `Error from server (NotFound): pods "${args[2]}" not found`,
                  status: 'error',
                  suggestion: 'Use kubectl get pods to check the name.',
                };
              }
              const nodeName = cluster.nodes.find(n => n.pods.some(p => p.name === pod.name))?.name || 'unknown';
              return {
                output: [
                  `Name:         ${pod.name}`,
                  `Namespace:    default`,
                  `Node:         ${nodeName}/${pod.ip}`,
                  `Start Time:   ${new Date(Date.now() - 3 * 60 * 60 * 1000).toUTCString()}`,
                  `Labels:       app=${pod.service.toLowerCase()}`,
                  `Status:       ${pod.status}`,
                  '',
                  `Containers:`,
                  `  ${pod.service.toLowerCase().replace(/\\s/g, '-')}:`,
                  `    Image:         fake.registry.io/${pod.service.toLowerCase().replace(' ', '-')}:1.2.3`,
                  `    Requests:      cpu=${pod.cpu}  memory=${pod.memory}`,
                  `Events: <none>`
                ],
              };
            }
            return {
              output: 'Invalid command. Usage: kubectl describe pod <pod-name>',
              status: 'error',
            };
          case 'logs':
            if (kubeArg) {
              const pod = getPodByName(cluster, kubeArg);
              if (!pod) {
                return {
                  output: `Error from server (NotFound): pods "${kubeArg}" not found`,
                  status: 'error',
                };
              }
              return {
                output: [
                  `[${new Date().toISOString()}] ${pod.service} bootstrapping...`,
                  `[${new Date().toISOString()}] Service started successfully on port 8080.`,
                  `[${new Date().toISOString()}] Listening for incoming connections...`,
                ]
              };
            }
            return { output: 'Invalid command. Usage: kubectl logs <pod-name>', status: 'error' };
          default:
            return { output: `'kubectl ${kubeCmd}' is not a valid command in this simulation.`, status: 'error' };
        }
      }
      case 'helm': {
        const helmCmd = args[0];
        if (helmCmd === 'list') {
          const header = "NAME\t\tNAMESPACE\tREVISION\tUPDATED\t\tSTATUS\t\tCHART";
          const rows = [
            "devops-folio\tdefault\t\t1\t2024-07-21 10:00:00\tdeployed\tdevops-folio-1.0.0",
            "monitoring\tdefault\t\t3\t2024-07-20 15:30:00\tdeployed\tprometheus-15.0.0"
          ];
          return { output: [header, ...rows] };
        }
        if (helmCmd === 'status' && args[1]) {
          const release = args[1];
          if (release === 'devops-folio') {
            return {
              output: [
                `NAME: devops-folio`,
                `LAST DEPLOYED: ${new Date().toUTCString()}`,
                `NAMESPACE: default`,
                `STATUS: deployed`,
                `REVISION: 1`,
                ``,
                `RESOURCES:`,
                `==> v1/Deployment`,
                `NAME           READY  UP-TO-DATE  AVAILABLE  AGE`,
                `frontend-app   1/1    1           1          5d`,
                `api-gateway    1/1    1           1          5d`,
              ],
              contextHint: 'Matches the live pods rendered in the grid.',
            };
          }
          return {
            output: `Error: release "${release}" not found`,
            status: 'error',
          };
        }
        return {
          output: `'helm ${helmCmd}' is not supported. Try 'list' or 'status <release>'.`,
          status: 'error',
        };
      }
      case 'git': {
        const gitCmd = args[0];
        if (gitCmd === 'status') {
          return {
            output: [
              'On branch main',
              "Your branch is up to date with 'origin/main'.",
              '',
              'nothing to commit, working tree clean'
            ],
            contextHint: 'Repo state mirrors this very portfolio.',
          };
        }
        if (gitCmd === 'log') {
          return {
            output: [
              'commit a1b2c3d4 (HEAD -> main, origin/main)',
              'Author: DevOps Folio <your.email@example.com>',
              'Date:   Sun Jul 21 12:00:00 2024 +0200',
              '',
              '    feat: Implement fully interactive lab experience',
              '',
              'commit e5f6g7h8',
              'Author: DevOps Folio <your.email@example.com>',
              'Date:   Sat Jul 20 18:30:00 2024 +0200',
              '',
              '    feat: Add initial lab structure and monitoring charts',
            ],
          };
        }
        if (gitCmd === 'branch') {
          return {
            output: [
              '* main',
              '  develop',
              '  feature/gamification',
              '  hotfix/memory-leak'
            ]
          };
        }
        if (gitCmd === 'remote') {
          if (args[1] === '-v') {
            return {
              output: [
                'origin\thttps://github.com/DevOps-Folio/portfolio.git (fetch)',
                'origin\thttps://github.com/DevOps-Folio/portfolio.git (push)'
              ]
            };
          }
          return { output: ['origin'] };
        }
        return {
          output: `'git ${gitCmd}' is not available here.`,
          status: 'error',
        };
      }
      case '':
        return { output: '' };
      default:
        return {
          output: `${command}: command not found`,
          status: 'error',
          suggestion: 'Type help to list the available commands.',
        };
    }
  }, [cluster, fileSystem, onCommand, storedCommands]);

  const handleCommandExecution = useCallback((commandInput: string) => {
    const trimmedInput = commandInput.trim();
    if (!trimmedInput) return;

    const [baseCommand] = trimmedInput.split(' ');
    if (baseCommand === 'clear') {
      setHistory([]);
      pushSystemMessage('Viewport cleared. Session still active.', 'Use history or ↑ to recall commands.');
      setStoredCommands(prev => [...prev, trimmedInput]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    const entryId = pushEntry({
      command: trimmedInput,
      output: [],
      timestamp: new Date().toLocaleTimeString(),
      status: 'running',
      prompt: promptRef.current,
    });

    const result = executeCommand(trimmedInput);
    const steps = result.skipStreaming ? [] : result.streamingSteps ?? streamingSteps[baseCommand] ?? [];
    steps.forEach((line, index) => {
      setTimeout(() => appendOutput(entryId, line), 150 * (index + 1));
    });

    const latency = result.emulateDelayMs ?? getLatency(baseCommand);
    setTimeout(() => {
      finalizeEntry(entryId, result);
    }, latency);

    setStoredCommands(prev => [...prev, trimmedInput]);
    setInput('');
    setHistoryIndex(-1);
  }, [appendOutput, executeCommand, finalizeEntry, getLatency, pushEntry, pushSystemMessage]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!storedCommands.length) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= storedCommands.length) return;
      setHistoryIndex(newIndex);
      setInput(storedCommands[storedCommands.length - 1 - newIndex]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(storedCommands[storedCommands.length - 1 - newIndex]);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const suggestion = AUTOCOMPLETE_COMMANDS.find(cmd => cmd.startsWith(input));
      if (suggestion) {
        setInput(suggestion);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      setHasUserInteracted(true);
      handleCommandExecution(input);
    }
  };

  const handleSuggestionClick = (command: string) => {
    setInput(command);
    inputRef.current?.focus();
  };

  const handleTabChange = (value: string) => {
    if (value === 'terminal' || value === 'logs') {
      setActiveTab(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="terminal">
          <FileTerminal className="mr-2 h-4 w-4" />
          Terminal Core
        </TabsTrigger>
        <TabsTrigger value="logs">
          <Power className="mr-2 h-4 w-4" />
          Runtime Logs
        </TabsTrigger>
      </TabsList>
      <TabsContent value="terminal">
        <div
          className="bg-slate-950 text-slate-100 font-mono rounded-b-md h-[28rem] text-sm border border-slate-900/70 shadow-inner flex flex-col"
          onClick={() => {
            setHasUserInteracted(true);
            inputRef.current?.focus();
          }}
        >
          <div className="border-b border-slate-900/80 px-4 py-2 text-xs text-slate-400 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span>Last login: {sessionRef.current.lastLogin} from {sessionRef.current.ip} on {sessionRef.current.tty}</span>
            <span>{sessionRef.current.distro} • {sessionRef.current.kernel}</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {history.map(entry => (
              <div
                key={entry.id}
                className={`rounded-lg border border-slate-900/60 px-3 py-2 ${entry.isSystem ? 'bg-slate-900/60' : 'bg-slate-950/40'}`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className={entry.isSystem ? 'text-cyan-300' : 'text-emerald-300'}>
                      {entry.isSystem ? '[system]' : promptRef.current}
                    </span>
                    <span>{entry.timestamp}</span>
                  </span>
                  <StatusPill status={entry.status} />
                </div>
                {!entry.isSystem && entry.command && (
                  <div className="mt-1 flex items-center gap-2 text-slate-100">
                    <span className="text-emerald-400">❯</span>
                    <span>{entry.command}</span>
                  </div>
                )}
                <CommandOutputDisplay output={entry.output} />
                {entry.contextHint && (
                  <p className="mt-2 text-xs text-slate-400">{entry.contextHint}</p>
                )}
                {entry.suggestion && (
                  <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {entry.suggestion}
                  </p>
                )}
              </div>
            ))}
            <div ref={endOfHistoryRef} />
          </div>

          <div className="border-t border-slate-900/70 px-4 py-2 text-xs text-slate-400 flex flex-wrap gap-3">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.command}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.command)}
                className="flex flex-col rounded border border-slate-800/60 px-3 py-2 text-left transition hover:border-emerald-500/60 hover:text-slate-100"
              >
                <span className="text-slate-100 text-xs font-semibold">{suggestion.label}</span>
                <span className="text-[10px] text-slate-500">{suggestion.helper}</span>
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="px-4 py-3 border-t border-slate-900/80">
            <label htmlFor="terminal-input" className="sr-only">Terminal input</label>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">{promptRef.current}</span>
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  id="terminal-input"
                  name="terminal-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="bg-transparent border-none text-slate-100 focus:ring-0 w-full p-0"
                  autoComplete="off"
                  placeholder="Type a command..."
                />
                <span className="absolute left-0 top-0 pointer-events-none">
                  <span className="invisible">{input}</span>
                  <span className="animate-pulse">_</span>
                </span>
              </div>
            </div>
          </form>
        </div>
      </TabsContent>
      <TabsContent value="logs">
        <div className="bg-slate-950 text-slate-100 font-code p-4 rounded-b-md h-96 text-sm overflow-y-auto">
          {runtimeLogs.map((log, index) => (
            <div key={`log-${index}`} className="whitespace-pre-wrap opacity-70">{log}</div>
          ))}
          <div ref={endOfLogsRef} />
        </div>
      </TabsContent>
    </Tabs>
  );
});

InteractiveTerminal.displayName = 'InteractiveTerminal';
