'use client';

import React from 'react';
import { projects } from '@/data/content/projects';
import { experiences } from '@/data/content/experiences';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { KubernetesCluster, Locale, Pod, Translations } from '@/lib/types';
import { AlertTriangle, FileTerminal, Loader2, Power, Code2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { SOCIAL_LINKS } from '@/lib/seo/constants';
import { cn } from '@/lib/utils';
import { CodePlayground } from './code-playground';

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
  visualVariant?: 'cyber' | 'md3';
}

const HISTORY_STORAGE_KEY = 'lab_terminal_history';

const AUTOCOMPLETE_COMMANDS = [
  'help',
  'ask what has Thomas built with Kubernetes?',
  'ask summarize his experience',
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
  // Real-shell semantics: exit 0 is silent. Only surface running / error.
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        running
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-400">
        <AlertTriangle className="h-3 w-3" aria-hidden />
        exit 1
      </span>
    );
  }
  return null;
};

// Regex patterns for link detection (defined outside component for performance)
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

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

  // Render output with clickable links and emails
  const renderOutput = (text: string) => {
    const parts: Array<{ type: 'url' | 'email' | 'text'; content: string }> = [];
    let lastIndex = 0;
    
    // Find all URLs and emails
    const matches: Array<{ type: 'url' | 'email'; index: number; content: string }> = [];
    
    let match;
    URL_REGEX.lastIndex = 0;
    while ((match = URL_REGEX.exec(text)) !== null) {
      matches.push({ type: 'url', index: match.index, content: match[0] });
    }
    
    EMAIL_REGEX.lastIndex = 0;
    while ((match = EMAIL_REGEX.exec(text)) !== null) {
      matches.push({ type: 'email', index: match.index, content: match[0] });
    }
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Build parts array
    matches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: match.type, content: match.content });
      lastIndex = match.index + match.content.length;
    });
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
    
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts.map((part, index) => {
      if (part.type === 'url') {
        return (
          <a
            key={index}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4da3ff] hover:underline hover:text-[#4da3ff] transition-colors font-semibold hover:bg-[#4da3ff]/10 px-1 rounded"
          >
            {part.content}
          </a>
        );
      } else if (part.type === 'email') {
        return (
          <a
            key={index}
            href={`mailto:${part.content}`}
            className="text-[#4da3ff] hover:underline hover:text-[#4da3ff] transition-colors font-semibold hover:bg-[#4da3ff]/10 px-1 rounded"
          >
            {part.content}
          </a>
        );
      }
      return <span key={index}>{part.content}</span>;
    });
  };

  return (
    <div className="relative group/out">
      <button
        type="button"
        onClick={copyToClipboard}
        className="absolute right-0 -top-0.5 opacity-0 group-hover/out:opacity-100 focus-visible:opacity-100 transition-opacity text-[10px] leading-none px-1.5 py-1 rounded-[4px] border border-[#3a3636] bg-[#201d1d] text-[#9a9898] hover:text-[#fdfcfc] hover:border-[#4da3ff] focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
        aria-label="Copy output"
      >
        {hasCopied ? 'copied' : 'copy'}
      </button>
      <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed font-mono text-[#c9c6c6] m-0">
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {renderOutput(line)}
            {lineIndex < lines.length - 1 && '\n'}
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
};

export const InteractiveTerminal = forwardRef<{ setCommand: (command: string) => void, runCommand: (command: string) => void, setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => void, getCommands: () => string[] }, InteractiveTerminalProps>(({ runtimeLogs, cluster, onCommand, locale, translations, visualVariant = 'cyber' }, ref) => {
  const isMd3 = visualVariant === 'md3';
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs' | 'playground'>('terminal');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [storedCommands, setStoredCommands] = useState<string[]>([]);
  // Mirror for the imperative handle, which is created once and would otherwise
  // close over the initial empty array.
  const storedCommandsRef = useRef<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(contextualSuggestions.default);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const { isTouchDevice } = useDeviceDetection();

  const sessionRef = useRef<SessionMeta | null>(null);
  const promptRef = useRef<string>('[infra@control-plane-1 ~]');
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const systemIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const meta = createSessionMeta();
    sessionRef.current = meta;
    promptRef.current = `[${meta.user}@${meta.host} ~]`;
    setSessionMeta(meta);
  }, []);

  // Click to focus functionality
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    
    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', handleClick);
    }
    
    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('click', handleClick);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setCommand: (command: string) => {
      setInput(command);
      inputRef.current?.focus();
    },
    runCommand: (command: string) => {
      // Runs the full submission pipeline (streaming, latency, history),
      // as if the user typed the command and pressed Enter.
      setActiveTab('terminal');
      handleCommandExecutionRef.current?.(command);
    },
    setActiveTab: (tab: 'terminal' | 'logs' | 'playground') => {
      setActiveTab(tab);
    },
    // The terminal owns the only complete command log: `ask` and `clear` return
    // before onCommand fires, so the parent hook never sees them.
    getCommands: () => storedCommandsRef.current,
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
    // Profile URLs, not the address: this component is client-side, so anything
    // here ships in the page payload where email obfuscation can't reach it.
    // The contact section has a real mail link.
    'contact.txt': [
      `GitHub:   ${SOCIAL_LINKS.github}`,
      `LinkedIn: ${SOCIAL_LINKS.linkedin}`,
      '',
      'Email: see the contact section on the home page.',
    ].join('\n'),
    'README.md': "Welcome to my interactive portfolio! Type `help` to see available commands.",
  }), [locale, translations.skills.list]);

  const pushEntry = useCallback((entry: Omit<TerminalEntry, 'id'>) => {
    const id = createId();
    setHistory(prev => [...prev.slice(-80), { ...entry, id }]);
    return id;
  }, []);

  // ASCII Art Welcome Message (first time only)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('lab_terminal_welcome_seen');
    if (!hasSeenWelcome) {
      const welcomeMessage = `╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗██╗   ██╗ ██████╗ ██████╗ ███████╗███████╗  ║
║   ██╔══██╗██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔════╝██╔═══╝   ║
║   ██║  ██║█████╗  ██║   ██║██║   ██║██║  ██║█████╗  █████╗    ║
║   ██║  ██║██╔══╝  ╚██╗ ██╔╝██║   ██║██║  ██║██╔══╝  ██╔══╝    ║
║   ██████╔╝███████╗ ╚████╔╝ ╚██████╔╝██████╔╝███████╗███████╗  ║
║   ╚═════╝ ╚══════╝  ╚═══╝   ╚═════╝ ╚═════╝ ╚══════╝╚══════╝  ║
║                                                               ║
║   [SYSTEM INITIALIZED] - DevOps Lab Terminal v2.0             ║
║   Welcome to your mission console. Type 'help' to begin.      ║
╚═══════════════════════════════════════════════════════════════╝`;
      
      // Add welcome message before system boot sequence
      setTimeout(() => {
        pushEntry({
          command: '/welcome',
          output: welcomeMessage,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success',
          isSystem: true,
          prompt: 'system',
        });
        localStorage.setItem('lab_terminal_welcome_seen', 'true');
      }, 50);
    }
  }, [pushEntry]);

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
    storedCommandsRef.current = storedCommands;
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
            '╔═══════════════════════════════════════════════════════════════╗',
            '║                    AVAILABLE COMMANDS                         ║',
            '╚═══════════════════════════════════════════════════════════════╝',
            '',
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
            '  ask <question>                               - Ask the AI about Thomas’ work',
            '  deploy [--strategy] [--weight] [--version]   - Trigger pipeline',
            '  chaos <scenario>                             - Run chaos experiment',
            '  status                                       - Show control-plane vitals',
            '',
            'SIMULATED TOOLS:',
            '  kubectl get|describe|logs ...',
            '  helm list|status <release>',
            '  git status|log|branch|remote -v',
            '',
            '💡 Use Tab for autocomplete, ↑/↓ for history, or click "Help" button for full documentation.',
          ],
          contextHint: 'Everything in this terminal is wired to the lab simulator. Experiment freely.',
          suggestion: 'Try `kubectl get pods` or `deploy --strategy=canary --weight=20`',
        };
      case 'whoami':
        return {
          output: 'infra@control-plane (DevOps Engineer orchestrating this lab). Access level: root-equivalent within the sandbox.',
          contextHint: 'Ephemeral sandbox session — no real auth, nothing leaves your browser.',
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

  // `ask` is the one async command: it calls the server-side AI assistant and
  // streams the answer into the already-created entry via appendOutput/finalizeEntry.
  const runAssistant = useCallback(async (rawInput: string, entryId: string) => {
    const question = rawInput.replace(/^ask\s*/i, '').trim();
    if (!question) {
      finalizeEntry(entryId, {
        output: ['Usage: ask <question>  —  e.g. `ask what has Thomas built with Kubernetes?`'],
        status: 'error',
      });
      return;
    }
    window.dispatchEvent(new CustomEvent('lab_activity', {
      detail: { type: 'terminal_command', data: { command: 'ask' } },
    }));
    appendOutput(entryId, '🤖 querying portfolio assistant…');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({} as Record<string, string>));
      const answer = data.answer ?? data.error ?? 'No response from assistant.';
      finalizeEntry(entryId, {
        output: String(answer).split('\n'),
        status: res.ok ? 'success' : 'error',
        contextHint: 'Answered by Gemini over the real portfolio data (projects, skills, experience).',
      });
    } catch {
      finalizeEntry(entryId, {
        output: ['Assistant unreachable — network error.'],
        status: 'error',
      });
    }
  }, [appendOutput, finalizeEntry]);

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

    if (baseCommand === 'ask') {
      void runAssistant(trimmedInput, entryId);
      setStoredCommands(prev => [...prev, trimmedInput]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

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
  }, [appendOutput, executeCommand, finalizeEntry, getLatency, pushEntry, pushSystemMessage, runAssistant]);

  // Keeps the imperative runCommand handle pointing at the latest closure.
  const handleCommandExecutionRef = useRef(handleCommandExecution);
  useEffect(() => {
    handleCommandExecutionRef.current = handleCommandExecution;
  }, [handleCommandExecution]);

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
    if (value === 'terminal' || value === 'logs' || value === 'playground') {
      setActiveTab(value as 'terminal' | 'logs' | 'playground');
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList
        className={cn(
          'grid w-full grid-cols-3 rounded-t-lg rounded-b-none p-0 gap-0 text-xs sm:text-sm',
          isMd3
            ? 'bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] font-sans'
            : 'bg-[#201d1d] border border-[#3a3636] font-mono'
        )}
        aria-label="Terminal view selection"
      >
        <TabsTrigger 
          value="terminal"
          className={cn(
            'rounded-tl-lg rounded-tr-none gap-1 sm:gap-1.5 py-2 px-2 border-0 border-r last:border-r-0 transition-colors duration-200 focus-visible:ring-2',
            isMd3
              ? 'border-[var(--md-sys-color-outline-variant)] data-[state=active]:bg-[var(--md-sys-color-primary-container)] data-[state=active]:text-[var(--md-sys-color-on-primary-container)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--md-sys-color-primary)] data-[state=inactive]:text-[var(--md-sys-color-on-surface-variant)] data-[state=inactive]:hover:bg-[var(--md-sys-color-surface-container)] focus-visible:ring-[var(--md-sys-color-primary)]'
              : 'border-[#3a3636] data-[state=active]:bg-[#4da3ff]/15 data-[state=active]:text-[#4da3ff] data-[state=active]:border-b-2 data-[state=active]:border-[#4da3ff] data-[state=inactive]:bg-[#302c2c] data-[state=inactive]:text-[#9a9898] data-[state=inactive]:hover:bg-[#3a3636] data-[state=inactive]:hover:text-[#c9c6c6] focus-visible:ring-[#4da3ff]'
          )}
          aria-label="Terminal Core tab"
          title="Terminal"
        >
          <FileTerminal className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{isMd3 ? 'Terminal' : '[ Terminal ]'}</span>
          <span className="sm:hidden">{isMd3 ? 'Cmd' : '[ Cmd ]'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="logs"
          className={cn(
            'rounded-none gap-1 sm:gap-1.5 py-2 px-2 border-0 border-r last:border-r-0 transition-colors duration-200 focus-visible:ring-2',
            isMd3
              ? 'border-[var(--md-sys-color-outline-variant)] data-[state=active]:bg-[var(--md-sys-color-primary-container)] data-[state=active]:text-[var(--md-sys-color-on-primary-container)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--md-sys-color-primary)] data-[state=inactive]:text-[var(--md-sys-color-on-surface-variant)] data-[state=inactive]:hover:bg-[var(--md-sys-color-surface-container)] focus-visible:ring-[var(--md-sys-color-primary)]'
              : 'border-[#3a3636] data-[state=active]:bg-[#4da3ff]/15 data-[state=active]:text-[#4da3ff] data-[state=active]:border-b-2 data-[state=active]:border-[#4da3ff] data-[state=inactive]:bg-[#302c2c] data-[state=inactive]:text-[#9a9898] data-[state=inactive]:hover:bg-[#3a3636] data-[state=inactive]:hover:text-[#c9c6c6] focus-visible:ring-[#4da3ff]'
          )}
          aria-label="Runtime Logs tab"
          title="Logs"
        >
          <Power className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{isMd3 ? 'Logs' : '[ Logs ]'}</span>
          <span className="sm:hidden">{isMd3 ? 'Log' : '[ Log ]'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="playground"
          className={cn(
            'rounded-tl-none rounded-tr-lg gap-1 sm:gap-1.5 py-2 px-2 border-0 transition-colors duration-200 focus-visible:ring-2',
            isMd3
              ? 'data-[state=active]:bg-[var(--md-sys-color-primary-container)] data-[state=active]:text-[var(--md-sys-color-on-primary-container)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--md-sys-color-primary)] data-[state=inactive]:text-[var(--md-sys-color-on-surface-variant)] data-[state=inactive]:hover:bg-[var(--md-sys-color-surface-container)] focus-visible:ring-[var(--md-sys-color-primary)]'
              : 'data-[state=active]:bg-[#4da3ff]/15 data-[state=active]:text-[#4da3ff] data-[state=active]:border-b-2 data-[state=active]:border-[#4da3ff] data-[state=inactive]:bg-[#302c2c] data-[state=inactive]:text-[#9a9898] data-[state=inactive]:hover:bg-[#3a3636] data-[state=inactive]:hover:text-[#c9c6c6] focus-visible:ring-[#4da3ff]'
          )}
          aria-label="Code Playground tab"
          title="Playground"
        >
          <Code2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{isMd3 ? 'Playground' : '[ Playground ]'}</span>
          <span className="sm:hidden">{isMd3 ? 'Play' : '[ Play ]'}</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="terminal">
        <div
          ref={terminalRef}
          className="relative font-mono rounded-b-[4px] text-sm flex flex-col cursor-text overflow-hidden bg-[#1a1717] text-[#fdfcfc] border border-[#3a3636] h-[26rem] sm:h-[30rem] lg:h-[34rem]"
          onClick={() => {
            setHasUserInteracted(true);
            inputRef.current?.focus();
          }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-[#3a3636] bg-[#201d1d] text-xs shrink-0">
            <div className="flex gap-1.5" aria-hidden>
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-1 text-[#9a9898] truncate">
              {sessionMeta ? `${sessionMeta.user}@${sessionMeta.host}` : 'infra@control-plane'}
              <span className="hidden sm:inline text-[#9a9898]"> — DevOps Lab</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[#30d158] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" aria-hidden />
              live
            </span>
          </div>

          {/* MOTD / last login */}
          <div className="px-3 sm:px-4 py-1.5 border-b border-[#302c2c] bg-[#201d1d] text-[11px] text-[#9a9898] truncate shrink-0" suppressHydrationWarning>
            {sessionMeta ? (
              <>Last login: {sessionMeta.lastLogin} from {sessionMeta.ip}<span className="hidden md:inline"> · {sessionMeta.distro} · {sessionMeta.kernel}</span></>
            ) : (
              <>Last login: <span className="animate-pulse">connecting…</span></>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-1.5 text-[13px] leading-relaxed relative z-0">
            {history.map((entry) =>
              entry.isSystem ? (
                <div key={entry.id} className="text-[#9a9898] break-words">
                  <span className="text-[#9a9898]">{entry.timestamp} </span>
                  {ensureArray(entry.output).join(' ')}
                </div>
              ) : (
                <div key={entry.id} className="break-words">
                  {entry.command && (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[#4da3ff] shrink-0">{entry.prompt}</span>
                      <span className="text-[#fdfcfc] break-all">{entry.command}</span>
                      {(entry.status === 'running' || entry.status === 'error') && (
                        <span className="ml-auto shrink-0">
                          <StatusPill status={entry.status} />
                        </span>
                      )}
                    </div>
                  )}
                  <CommandOutputDisplay output={entry.output} />
                  {entry.contextHint && (
                    <div className="text-[#9a9898] mt-0.5"># {entry.contextHint}</div>
                  )}
                  {entry.suggestion && (
                    <div className="text-[#9a9898] mt-0.5">→ {entry.suggestion}</div>
                  )}
                </div>
              )
            )}
            <div ref={endOfHistoryRef} />
          </div>

          <div className="flex gap-2 overflow-x-auto px-3 sm:px-4 py-2 border-t border-[#302c2c] bg-[#201d1d] shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.command}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.command)}
                title={suggestion.helper}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-[4px] border border-[#3a3636] bg-[#302c2c] px-2.5 whitespace-nowrap text-xs text-[#c9c6c6]",
                  "hover:border-[#4da3ff] hover:bg-[#3a3636] hover:text-[#fdfcfc] transition-colors",
                  "focus-visible:outline-1 focus-visible:outline-[#4da3ff]",
                  isTouchDevice ? "py-2 min-h-[40px]" : "py-1"
                )}
                aria-label={`Run: ${suggestion.label} — ${suggestion.helper}`}
              >
                <span className="text-[#4da3ff]" aria-hidden>$</span>
                {suggestion.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="px-3 sm:px-4 py-2.5 border-t border-[#3a3636] bg-[#201d1d] shrink-0">
            <label htmlFor="terminal-input" className="sr-only">Terminal input</label>
            {/* Compact windows: the prompt (~200px) and the input can't share a row —
                below sm it took the whole line and left the field 10px wide. */}
            <div className="flex items-baseline gap-2 max-sm:flex-col max-sm:items-stretch max-sm:gap-0">
              <span className="text-[#4da3ff] shrink-0 whitespace-nowrap max-sm:text-xs">
                {sessionMeta ? promptRef.current : 'infra@control-plane:~$'}
              </span>
              <input
                ref={inputRef}
                id="terminal-input"
                name="terminal-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className={cn(
                  "flex-1 min-w-0 bg-transparent border-none text-[#fdfcfc] p-0 caret-[#4da3ff]",
                  "focus-visible:outline-hidden focus-visible:ring-0",
                  "placeholder:text-[#646262]",
                  isTouchDevice ? "text-base min-h-[40px]" : "text-[13px]"
                )}
                autoComplete="off"
                placeholder="type a command — try 'help'"
                aria-label="Terminal command input"
              />
            </div>
          </form>

          {/* Footer hints (desktop) */}
          <div className="hidden sm:block px-4 py-2 border-t border-[#302c2c] bg-[#201d1d] text-[11px] text-[#9a9898] shrink-0">
            <span className="text-[#4da3ff]">help</span> commands · <span className="text-[#c9c6c6]">↑/↓</span> history · <span className="text-[#c9c6c6]">Tab</span> autocomplete · <span className="text-[#c9c6c6]">Ctrl+C</span> interrupt
          </div>
        </div>
      </TabsContent>
      <TabsContent value="logs">
        <div className="relative font-mono rounded-b-[4px] flex flex-col overflow-hidden bg-[#1a1717] text-[#fdfcfc] border border-[#3a3636] h-[26rem] sm:h-[30rem] lg:h-[34rem]">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-[#3a3636] bg-[#201d1d] text-xs shrink-0">
            <span className="text-[#9a9898] truncate">
              tail -f <span className="text-[#9a9898]">/var/log/lab-agent.log</span>
            </span>
            <span className="ml-auto text-[#9a9898] shrink-0">{runtimeLogs.length} lines</span>
            <span className="inline-flex items-center gap-1.5 text-[#30d158] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" aria-hidden />
              live
            </span>
          </div>
          {/* Log stream */}
          <div className="flex-1 overflow-y-auto py-2 text-[13px] leading-relaxed" role="log" aria-live="polite">
            {runtimeLogs.length === 0 ? (
              <div className="px-4 py-10 text-center text-[#9a9898]">In attesa di eventi runtime…</div>
            ) : (
              runtimeLogs.map((log, index) => (
                <div
                  key={`log-${index}`}
                  className="flex gap-3 px-3 sm:px-4 hover:bg-[#302c2c]/50 transition-colors"
                >
                  <span className="shrink-0 select-none text-right tabular-nums text-[#524d4d] w-7 sm:w-9" aria-hidden>
                    {index + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-words text-[#c9c6c6]">{log}</span>
                </div>
              ))
            )}
            <div ref={endOfLogsRef} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="playground">
        <CodePlayground locale={locale} translations={translations} />
      </TabsContent>
    </Tabs>
  );
});

InteractiveTerminal.displayName = 'InteractiveTerminal';
