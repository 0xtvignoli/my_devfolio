'use client';

import { useLocale } from '@/hooks/use-locale';
import { projects } from '@/data/content/projects';
import { experiences } from '@/data/content/experiences';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { KubernetesCluster, Pod } from '@/lib/types';
import { Check, Clipboard, FileTerminal, Power } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


type CommandOutput = string | string[] | null;

interface CommandHistory {
  command: string;
  output: CommandOutput;
}

interface InteractiveTerminalProps {
  runtimeLogs: string[];
  cluster: KubernetesCluster;
  onCommand: (command: string) => CommandOutput;
}

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

const CommandOutputDisplay = ({ output }: { output: CommandOutput }) => {
    const [hasCopied, setHasCopied] = useState(false);
    
    if (output === null) return null;
    const textToCopy = Array.isArray(output) ? output.join('\n') : output;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    };

    return (
        <div className="relative group whitespace-pre-wrap text-slate-300">
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
            >
                {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                <span className="sr-only">Copy output</span>
            </Button>
            {textToCopy}
        </div>
    );
};


export const InteractiveTerminal = forwardRef<{ setCommand: (command: string) => void, setActiveTab: (tab: 'terminal' | 'logs') => void }, InteractiveTerminalProps>(({ runtimeLogs, cluster, onCommand }, ref) => {
  const { locale, t } = useLocale();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [activeTab, setActiveTab] = useState('terminal');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    setCommand: (command: string) => {
        setInput(command);
        inputRef.current?.focus();
    },
    setActiveTab: (tab: 'terminal' | 'logs') => {
        setActiveTab(tab);
    }
  }));

  const fileSystem = {
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
    'skills.txt': t.skills.list.join('\n'),
    'contact.txt': `You can reach me at: ${t.contact.email}`,
    'README.md': "Welcome to my interactive portfolio! Type `help` to see available commands.",
  };

  const executeCommand = (cmd: string): CommandOutput => {
    // Trigger gamification event for terminal command
    window.dispatchEvent(new CustomEvent('lab_activity', {
      detail: { type: 'terminal_command', data: { command: cmd.split(' ')[0] } }
    }));
    
    // Delegate commands to parent first
    const delegatedOutput = onCommand(cmd);
    if (delegatedOutput !== null) {
      return delegatedOutput;
    }
    
    const [command, ...args] = cmd.trim().split(' ');
    const path = args[0] || '';

    switch (command) {
      case 'help':
        return [
          'SYSTEM COMMANDS:',
          '  help                - Show this help message',
          '  ls [path]           - List files in a directory (e.g., `ls projects`)',
          '  cat <file>          - Display file content (e.g., `cat skills.txt`)',
          '  whoami              - Display user information',
          '  clear               - Clear the terminal screen',
          '',
          'LAB COMMANDS:',
          '  deploy [--strategy] [--weight] [--version] - Trigger a new deployment pipeline',
          '    --strategy <name> - Deployment strategy (default: canary)',
          '    --weight <%>      - Traffic percentage for canary (default: 10)',
          '    --version <tag>   - Image version tag (default: random)',
          '  chaos <scenario>    - Start a chaos experiment (scenarios: latency, pod_failure, cpu_spike)',
          '',
          'SIMULATED TOOLS (try them!):',
          '  kubectl <cmd> [args]- Simulate Kubernetes commands',
          '    kubectl get pods              - List all pods',
          '    kubectl describe pod <name>   - Describe pod details',
          '    kubectl logs <pod-name>       - Show pod logs',
          '    kubectl get nodes             - List cluster nodes',
          '  helm <cmd> [args]   - Simulate Helm commands',
          '    helm list                     - List installed releases',
          '    helm status <release>         - Show release status',
          '  git <cmd> [args]    - Simulate Git commands',
          '    git status                    - Show working tree status',
          '    git log                       - Show commit history',
          '    git branch                    - List branches',
        ];
      case 'whoami':
        return 'A passionate DevOps Engineer exploring the vast world of cloud and automation.';
      case 'clear':
        setHistory([]);
        return '';
      case 'ls':
        const dir = path.split('/')[0] || null;
        if (!path) {
          return Object.keys(fileSystem).filter(k => !k.includes('.')).map(d => `${d}/`).concat(Object.keys(fileSystem).filter(k => k.includes('.')));
        }
        if (dir && typeof (fileSystem as any)[dir] === 'object') {
          return Object.keys((fileSystem as any)[dir]);
        }
        return `ls: cannot access '${path}': No such file or directory`;
      case 'cat':
        if (!path) return 'cat: missing operand';
        const parts = path.split('/');
        if (parts.length === 1) {
          if (typeof (fileSystem as any)[parts[0]] === 'string') {
            return (fileSystem as any)[parts[0]];
          }
        } else if (parts.length === 2) {
          const dir = parts[0];
          const file = parts[1];
          if ((fileSystem as any)[dir] && typeof (fileSystem as any)[dir][file] === 'string') {
            return (fileSystem as any)[dir][file];
          }
        }
        return `cat: ${path}: No such file or directory`;
      
      case 'kubectl':
        const kubeCmd = args[0];
        const kubeArg = args[1];
        switch(kubeCmd) {
            case 'get':
                if (kubeArg === 'pods') {
                    const pods = getAllPods(cluster);
                    const header = "NAME\t\t\t\tSTATUS\t\tTRAFFIC\t\tRESTARTS\tAGE";
                    const rows = pods.map(p => `${p.name.padEnd(24, ' ')}\t${p.status.padEnd(8, ' ')}\t${p.traffic?.toFixed(0) ?? 'N/A'}%\t\t0\t\t3h`);
                    return [header, ...rows];
                }
                if (kubeArg === 'nodes') {
                    const header = "NAME\t\t\tSTATUS\tROLES\t\tAGE\tVERSION";
                    const rows = cluster.nodes.map(n => `${n.name.padEnd(12, ' ')}\tReady\tworker\t\t5d\tv1.28.0`);
                    return [header, ...rows];
                }
                if (kubeArg === 'services' || kubeArg === 'svc') {
                    const header = "NAME\t\t\tTYPE\t\tCLUSTER-IP\tEXTERNAL-IP\tPORT(S)\t\tAGE";
                    const services = [
                        "frontend-service\tClusterIP\t10.96.0.10\t<none>\t\t80/TCP\t\t5d",
                        "api-gateway-svc\tClusterIP\t10.96.0.11\t<none>\t\t8080/TCP\t5d",
                        "monitoring-svc\tNodePort\t10.96.0.12\t<none>\t\t3000:30000/TCP\t5d"
                    ];
                    return [header, ...services];
                }
                return `error: resource type '${kubeArg}' not supported in this simulation. Try 'pods', 'nodes', or 'services'.`;
            case 'describe':
                if (args[1] === 'pod' && args[2]) {
                    const pod = getPodByName(cluster, args[2]);
                    if (!pod) return `Error from server (NotFound): pods "${args[2]}" not found`;
                    const nodeName = cluster.nodes.find(n => n.pods.some(p => p.name === pod.name))?.name || 'unknown';
                    return [
                        `Name:         ${pod.name}`,
                        `Namespace:    default`,
                        `Priority:     0`,
                        `Node:         ${nodeName}/${pod.ip}`,
                        `Start Time:   ${new Date(Date.now() - 3 * 60 * 60 * 1000).toUTCString()}`,
                        `Labels:       app=${pod.service.toLowerCase()}`,
                        `Status:       ${pod.status}`,
                        `IP:           ${pod.ip}`,
                        ``,
                        `Containers:`,
                        `  ${pod.service.toLowerCase().replace(/\\s/g, '-')}:`,
                        `    Container ID:  cri-o://<some-hash>`,
                        `    Image:         fake.registry.io/${pod.service.toLowerCase().replace(' ', '-')}:1.2.3`,
                        `    State:         Running`,
                        `    Ready:         True`,
                        `    Restart Count: 0`,
                        `    Requests:`,
                        `      cpu:      ${pod.cpu}`,
                        `      memory:   ${pod.memory}`,
                        `Events: <none>`
                    ];
                }
                return `Invalid command. Usage: kubectl describe pod <pod-name>`;
            case 'logs':
                if (kubeArg) {
                     const pod = getPodByName(cluster, kubeArg);
                     if (!pod) return `Error from server (NotFound): pods "${kubeArg}" not found`;
                     return [
                        `[2024-07-21T10:00:00Z] Initializing ${pod.service}...`,
                        `[2024-07-21T10:00:01Z] Service started successfully on port 8080.`,
                        `[2024-07-21T10:00:02Z] Listening for incoming connections...`,
                        `[2024-07-21T10:05:10Z] GET /healthz 200 OK`,
                        `[2024-07-21T10:10:11Z] GET /healthz 200 OK`,
                     ];
                }
                 return `Invalid command. Usage: kubectl logs <pod-name>`;
            default:
                return `'kubectl ${kubeCmd}' is not a valid command in this simulation. Try 'get pods', 'describe pod <name>', or 'logs <name>'.`;
        }
      
      case 'helm':
          const helmCmd = args[0];
          if (helmCmd === 'list') {
              const header = "NAME\t\tNAMESPACE\tREVISION\tUPDATED\t\t\tSTATUS\t\tCHART\t\t\tAPP VERSION";
              const rows = [
                  "devops-folio\tdefault\t\t1\t\t2024-07-21 10:00:00\tdeployed\tdevops-folio-1.0.0\t1.0.0",
                  "monitoring\tdefault\t\t3\t\t2024-07-20 15:30:00\tdeployed\tprometheus-15.0.0\t2.45.0"
              ];
              return [header, ...rows];
          }
          if (helmCmd === 'status' && args[1]) {
              const release = args[1];
              if (release === 'devops-folio') {
                  return [
                      `NAME: devops-folio`,
                      `LAST DEPLOYED: ${new Date().toUTCString()}`,
                      `NAMESPACE: default`,
                      `STATUS: deployed`,
                      `REVISION: 1`,
                      `TEST SUITE: None`,
                      ``,
                      `RESOURCES:`,
                      `==> v1/Deployment`,
                      `NAME           READY  UP-TO-DATE  AVAILABLE  AGE`,
                      `frontend-app   1/1    1           1          5d`,
                      `api-gateway    1/1    1           1          5d`,
                  ];
              }
              return `Error: release "${release}" not found`;
          }
          return `'helm ${helmCmd}' is not a valid command in this simulation. Try 'list' or 'status <release>'.`;

      case 'git':
          const gitCmd = args[0];
          if(gitCmd === 'status') {
            return [
                'On branch main',
                'Your branch is up to date with \'origin/main\'.',
                '',
                'nothing to commit, working tree clean'
            ]
          }
          if(gitCmd === 'log') {
            return [
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
            ]
          }
          if(gitCmd === 'branch') {
            return [
                '* main',
                '  develop',
                '  feature/gamification',
                '  hotfix/memory-leak'
            ]
          }
          if(gitCmd === 'remote') {
            if (args[1] === '-v') {
                return [
                    'origin\thttps://github.com/DevOps-Folio/portfolio.git (fetch)',
                    'origin\thttps://github.com/DevOps-Folio/portfolio.git (push)'
                ];
            }
            return ['origin'];
          }
          return `'git ${gitCmd}' is not a valid command in this simulation. Try 'status', 'log', 'branch', or 'remote'.`;

      case '':
        return '';
      default:
        return `${command}: command not found`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = input.trim();
      
      setHasUserInteracted(true); // Mark that user has interacted
      
      const output = executeCommand(trimmedInput);
      if (trimmedInput !== '') {
         setHistory(prev => [...prev.slice(-50), { command: trimmedInput, output }]);
      }
      setInput('');
    }
  };

  // Only auto-scroll when user interacts with terminal, not on external log updates
  useEffect(() => {
    if (activeTab === 'terminal' && history.length > 0 && hasUserInteracted) {
        // Only scroll if user has actually interacted with the terminal
        // This prevents auto-scroll on page load or external updates
        setTimeout(() => {
          endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [history.length, activeTab, hasUserInteracted]); // Include hasUserInteracted

  // Separate effect for logs that only scrolls when tab is active and user manually switches
  useEffect(() => {
    if (activeTab === 'logs' && hasUserInteracted) {
        // Only scroll logs when user actively switches to logs tab and has interacted
        setTimeout(() => {
          endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [activeTab, hasUserInteracted]); // Include hasUserInteracted

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terminal">
                <FileTerminal className="mr-2 h-4 w-4"/>
                Terminal
            </TabsTrigger>
            <TabsTrigger value="logs">
                 <Power className="mr-2 h-4 w-4"/>
                Runtime Logs
            </TabsTrigger>
        </TabsList>
        <TabsContent value="terminal">
            <div 
                className="bg-slate-950 text-slate-100 font-code p-4 rounded-b-md h-96 text-sm overflow-y-auto" 
                onClick={() => {
                  setHasUserInteracted(true);
                  inputRef.current?.focus();
                }}
            >
              {history.map((entry, index) => (
                <div key={`hist-${index}`}>
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 mr-2">$</span>
                    <span>{entry.command}</span>
                  </div>
                  <CommandOutputDisplay output={entry.output} />
                </div>
              ))}
              <div ref={endOfHistoryRef} />
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center mt-2">
                <label htmlFor="terminal-input" className="text-green-400 mr-2">$</label>
                <div className="relative w-full">
                    <input
                      ref={inputRef}
                      id="terminal-input"
                      name="terminal-input"
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      className="bg-transparent border-none text-slate-100 focus:ring-0 w-full p-0"
                      autoComplete="off"
                    />
                    <span className="absolute left-0 top-0 pointer-events-none">
                        <span className="invisible">{input}</span>
                        <span className="animate-pulse">_</span>
                    </span>
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
