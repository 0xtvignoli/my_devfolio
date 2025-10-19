'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  input: string;
  output: string;
  timestamp: Date;
}

interface AutocompleteOption {
  command: string;
  description: string;
  category?: string;
}

const COMMANDS: AutocompleteOption[] = [
  // Kubernetes
  { command: 'kubectl get pods', description: 'List all pods', category: 'k8s' },
  { command: 'kubectl get services', description: 'List all services', category: 'k8s' },
  { command: 'kubectl describe pod', description: 'Describe a pod', category: 'k8s' },
  { command: 'kubectl logs', description: 'View pod logs', category: 'k8s' },
  
  // Helm
  { command: 'helm list', description: 'List releases', category: 'helm' },
  { command: 'helm status', description: 'Check release status', category: 'helm' },
  
  // Git
  { command: 'git status', description: 'Check git status', category: 'git' },
  { command: 'git log', description: 'View commit history', category: 'git' },
  { command: 'git branch', description: 'List branches', category: 'git' },
  
  // Deployment
  { command: 'deploy --strategy=canary --weight=20', description: 'Canary deployment', category: 'deploy' },
  { command: 'deploy --strategy=blue-green', description: 'Blue-green deployment', category: 'deploy' },
  
  // Chaos
  { command: 'chaos pod_failure', description: 'Simulate pod failure', category: 'chaos' },
  { command: 'chaos latency', description: 'Inject network latency', category: 'chaos' },
  { command: 'chaos cpu_spike', description: 'Simulate CPU spike', category: 'chaos' },
  
  // Utility
  { command: 'ls', description: 'List directory contents', category: 'utils' },
  { command: 'cat README.md', description: 'View file contents', category: 'utils' },
  { command: 'history', description: 'Show command history', category: 'utils' },
  { command: 'history -c', description: 'Clear command history', category: 'utils' },
  { command: 'clear', description: 'Clear terminal', category: 'utils' },
  { command: 'help', description: 'Show available commands', category: 'utils' },
];

interface EnhancedTerminalProps {
  onCommand?: (command: string) => string | null;
  initialHistory?: Command[];
}

export function EnhancedTerminal({ onCommand, initialHistory = [] }: EnhancedTerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Command[]>(initialHistory);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Load command history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('terminal_history');
    if (saved) {
      try {
        setCommandHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse command history');
      }
    }
  }, []);

  // Save command history to localStorage
  useEffect(() => {
    if (commandHistory.length > 0) {
      localStorage.setItem('terminal_history', JSON.stringify(commandHistory.slice(-50)));
    }
  }, [commandHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Autocomplete logic
  useEffect(() => {
    if (input.length > 0) {
      const filtered = COMMANDS.filter(cmd =>
        cmd.command.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Arrow Up - Previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showSuggestions && commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (showSuggestions) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      }
    }

    // Arrow Down - Next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions && historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : '');
      } else if (showSuggestions) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
      }
    }

    // Tab - Autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[selectedSuggestion].command);
        setShowSuggestions(false);
      }
    }

    // Escape - Clear suggestions
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }

    // Enter - Execute command
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    }
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    let output = '';

    // Handle special commands
    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (cmd === 'history') {
      output = commandHistory.map((c, i) => `${i + 1}  ${c}`).join('\n');
    } else if (cmd === 'history -c') {
      setCommandHistory([]);
      localStorage.removeItem('terminal_history');
      output = 'Command history cleared';
    } else if (cmd === 'help') {
      output = COMMANDS.map(c => `${c.command.padEnd(40)} - ${c.description}`).join('\n');
    } else {
      // Custom command handler
      output = onCommand?.(cmd) || `Command executed: ${cmd}`;
    }

    // Add to history
    setHistory(prev => [...prev, { input: cmd, output, timestamp: new Date() }]);
    setCommandHistory(prev => [...prev, cmd]);
    setInput('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
  };

  const copyOutput = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
      {/* Terminal Output */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {history.map((cmd, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              {/* Input line */}
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">❯</span>
                <span className="text-blue-400">{cmd.input}</span>
              </div>
              
              {/* Output */}
              {cmd.output && (
                <div className="pl-4 relative group">
                  <pre className="text-gray-300 whitespace-pre-wrap break-words">
                    {cmd.output}
                  </pre>
                  <button
                    onClick={() => copyOutput(cmd.output, index)}
                    className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded hover:bg-gray-700"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Autocomplete Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-t border-gray-800 max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion.command);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-gray-900 transition-colors',
                  'flex items-center justify-between',
                  index === selectedSuggestion && 'bg-gray-900 border-l-2 border-emerald-500'
                )}
              >
                <div>
                  <div className="text-emerald-400">{suggestion.command}</div>
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                </div>
                {suggestion.category && (
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                    {suggestion.category}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Line */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-500">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-blue-400"
            placeholder="Type a command or press Tab for suggestions..."
            autoFocus
          />
        </div>
        
        {/* Command hint */}
        {input && !showSuggestions && (
          <div className="text-xs text-gray-600 mt-1 pl-6">
            Press ↑↓ for history, Tab for autocomplete, Enter to execute
          </div>
        )}
      </div>
    </div>
  );
}
