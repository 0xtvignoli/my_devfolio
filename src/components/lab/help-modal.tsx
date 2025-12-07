'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Terminal, Code, Zap, ShieldAlert, GitBranch } from 'lucide-react';
import { useState } from 'react';

const COMMAND_CATEGORIES = [
  {
    title: 'System Commands',
    icon: Terminal,
    commands: [
      { cmd: 'help', desc: 'Show this help panel' },
      { cmd: 'ls [path]', desc: 'List workspace directories' },
      { cmd: 'cat <file>', desc: 'Inspect a file' },
      { cmd: 'pwd', desc: 'Print current workspace path' },
      { cmd: 'history', desc: 'Command log (use history -c to clear)' },
      { cmd: 'clear', desc: 'Clear the viewport' },
      { cmd: 'uptime', desc: 'Show session uptime' },
    ],
  },
  {
    title: 'Lab Commands',
    icon: Zap,
    commands: [
      { cmd: 'deploy [--strategy] [--weight] [--version]', desc: 'Trigger CI/CD pipeline' },
      { cmd: 'chaos <scenario>', desc: 'Run chaos experiment (pod_failure, latency, cpu_spike)' },
      { cmd: 'status', desc: 'Show control-plane vitals' },
    ],
  },
  {
    title: 'Kubernetes Commands',
    icon: Code,
    commands: [
      { cmd: 'kubectl get pods', desc: 'List all pods' },
      { cmd: 'kubectl get nodes', desc: 'List cluster nodes' },
      { cmd: 'kubectl get services', desc: 'List services' },
      { cmd: 'kubectl describe pod <name>', desc: 'Describe a pod' },
      { cmd: 'kubectl logs <pod>', desc: 'View pod logs' },
    ],
  },
  {
    title: 'Helm Commands',
    icon: Code,
    commands: [
      { cmd: 'helm list', desc: 'List releases' },
      { cmd: 'helm status <release>', desc: 'Check release status' },
    ],
  },
  {
    title: 'Git Commands',
    icon: GitBranch,
    commands: [
      { cmd: 'git status', desc: 'Check git status' },
      { cmd: 'git log', desc: 'View commit history' },
      { cmd: 'git branch', desc: 'List branches' },
      { cmd: 'git remote -v', desc: 'Show remote repositories' },
    ],
  },
];

export function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label="Show help">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Commands</DialogTitle>
          <DialogDescription>
            Complete list of commands available in the Lab terminal. Use Tab for autocomplete, ↑/↓ for history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {COMMAND_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="h-5 w-5" />
                  {category.title}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                  {category.commands.map((command) => (
                    <div key={command.cmd} className="flex flex-col">
                      <code className="text-sm font-mono text-primary">{command.cmd}</code>
                      <span className="text-xs text-muted-foreground">{command.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Type <kbd className="px-1.5 py-0.5 bg-background rounded">help</kbd> in the terminal for a quick reference, or use Tab to autocomplete commands.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}



