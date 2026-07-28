'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import {
  Command,
  FileTerminal,
  GaugeCircle,
  LayoutGrid,
  Rocket,
  Route,
  Search,
  ShieldAlert,
  Boxes,
  History,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { trackLabPalette } from '@/lib/lab-telemetry';
import type { Translations } from '@/lib/types';

export interface PaletteItem {
  id: string;
  group: 'commands' | 'actions' | 'navigate';
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
}

interface LabCommandPaletteProps {
  translations: Translations;
  /** Executes a command in the terminal as if typed by the user. */
  onRunCommand: (command: string) => void;
  /** Opens the chaos confirm flow for a scenario. */
  onChaos: (scenario: string) => void;
  /** Scroll/navigate to a lab section by element id. */
  onNavigate?: (sectionId: string) => void;
}

const TERMINAL_COMMANDS = [
  'kubectl get pods',
  'kubectl describe pod api',
  'helm list',
  'cat contact.txt',
];

const NAV_SECTIONS: { id: string; icon: LucideIcon }[] = [
  { id: 'lab-terminal', icon: Terminal },
  { id: 'pipeline', icon: Route },
  { id: 'lab-metrics', icon: GaugeCircle },
  { id: 'cluster', icon: Boxes },
  { id: 'incident-history', icon: History },
];

/**
 * Lab command palette (Ctrl/Cmd+K): fuzzy-free filtered list of terminal
 * commands, deploy/chaos actions, and section navigation.
 */
export function LabCommandPalette({
  translations,
  onRunCommand,
  onChaos,
  onNavigate,
}: LabCommandPaletteProps) {
  const t = translations.lab;
  const p = t.palette;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const navLabels: Record<string, string> = useMemo(
    () => ({
      'lab-terminal': t.terminal.title,
      pipeline: t.sections.pipeline,
      'lab-metrics': t.metrics.title,
      cluster: t.sections.cluster,
      'incident-history': t.sections.incidents,
    }),
    [t]
  );

  const defaultNavigate = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const navigate = onNavigate ?? defaultNavigate;

  const items: PaletteItem[] = useMemo(() => {
    const commands: PaletteItem[] = TERMINAL_COMMANDS.map((cmd) => ({
      id: `cmd:${cmd}`,
      group: 'commands' as const,
      label: cmd,
      icon: FileTerminal,
      run: () => {
        navigate('lab-terminal');
        onRunCommand(cmd);
      },
    }));

    const actions: PaletteItem[] = [
      {
        id: 'deploy-canary',
        group: 'actions',
        label: t.macros.canary.label,
        hint: t.macros.canary.description,
        keywords: 'deploy canary release rollout',
        icon: Rocket,
        run: () => onRunCommand('deploy --strategy=canary --weight=20'),
      },
      {
        id: 'deploy-bluegreen',
        group: 'actions',
        label: t.macros.blueGreen.label,
        hint: t.macros.blueGreen.description,
        keywords: 'deploy blue green cutover',
        icon: LayoutGrid,
        run: () => onRunCommand('deploy --strategy=blue-green'),
      },
      {
        id: 'chaos-pod',
        group: 'actions',
        label: t.macros.chaosPod.label,
        hint: t.macros.chaosPod.description,
        keywords: 'chaos pod failure kill',
        icon: ShieldAlert,
        run: () => onChaos('pod_failure'),
      },
      {
        id: 'chaos-latency',
        group: 'actions',
        label: t.macros.chaosLatency.label,
        hint: t.macros.chaosLatency.description,
        keywords: 'chaos latency spike slow',
        icon: GaugeCircle,
        run: () => onChaos('latency'),
      },
    ];

    const nav: PaletteItem[] = NAV_SECTIONS.map(({ id, icon }) => ({
      id: `nav:${id}`,
      group: 'navigate' as const,
      label: navLabels[id] ?? id,
      icon,
      run: () => navigate(id),
    }));

    return [...commands, ...actions, ...nav];
  }, [t, navLabels, navigate, onRunCommand, onChaos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint?.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const groups: { key: PaletteItem['group']; label: string }[] = [
    { key: 'commands', label: p.groups.commands },
    { key: 'actions', label: p.groups.actions },
    { key: 'navigate', label: p.groups.navigate },
  ];

  // Flat ordered list (grouped) used for keyboard navigation indices.
  const ordered = useMemo(
    () => groups.flatMap((g) => filtered.filter((i) => i.group === g.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, p]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const execute = useCallback(
    (item: PaletteItem) => {
      trackLabPalette('executed', item.id);
      close();
      item.run();
    },
    [close]
  );

  // Global Ctrl/Cmd+K shortcut while the lab is mounted.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) trackLabPalette('opened');
          return !prev;
        });
        setQuery('');
        setActiveIndex(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, ordered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && ordered[activeIndex]) {
      e.preventDefault();
      execute(ordered[activeIndex]);
    }
  };

  // Keep the active option in view while navigating with the keyboard.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          trackLabPalette('opened');
          setOpen(true);
        }}
        title={`${p.buttonLabel} (Ctrl+K)`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
      >
        <Command className="h-4 w-4" aria-hidden />
        <span className="hidden md:inline">{p.buttonLabel}</span>
        <kbd className="hidden md:inline text-[10px] px-1 py-0.5 rounded border border-[var(--md-sys-color-outline-variant)]">
          ⌘K
        </kbd>
      </button>
    );
  }

  let flatIndex = -1;

  return (
    <Box
      onClick={close}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        bgcolor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: { xs: '12vh', md: '18vh' },
        px: 2,
      }}
    >
      <Box
        role="dialog"
        aria-modal="true"
        aria-label={p.buttonLabel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 'var(--lab-radius-lg, 0px)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          bgcolor: 'var(--md-sys-color-surface-container)',
          boxShadow: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <Search size={18} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} aria-hidden />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={p.placeholder}
            fullWidth
            inputProps={{
              role: 'combobox',
              'aria-expanded': true,
              'aria-controls': 'lab-palette-list',
              'aria-activedescendant':
                ordered[activeIndex] ? `palette-item-${ordered[activeIndex].id}` : undefined,
            }}
            sx={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}
          />
          <kbd
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            Esc
          </kbd>
        </Box>

        <Box
          component="ul"
          id="lab-palette-list"
          role="listbox"
          ref={listRef}
          sx={{ m: 0, p: 1, listStyle: 'none', maxHeight: 360, overflowY: 'auto' }}
        >
          {ordered.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ p: 2, textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              {p.noResults}
            </Typography>
          ) : (
            groups.map((group) => {
              const groupItems = filtered.filter((i) => i.group === group.key);
              if (groupItems.length === 0) return null;
              return (
                <Box component="li" key={group.key} sx={{ '& + &': { mt: 0.5 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'block',
                      px: 1.5,
                      pt: 0.5,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: '0.65rem',
                      letterSpacing: 1,
                    }}
                  >
                    {group.label}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const isActive = index === activeIndex;
                      const Icon = item.icon;
                      return (
                        <Box
                          component="li"
                          key={item.id}
                          id={`palette-item-${item.id}`}
                          data-index={index}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => execute(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 1.5,
                            py: 1,
                            borderRadius: 'var(--lab-radius-md)',
                            cursor: 'pointer',
                            bgcolor: isActive ? 'var(--md-sys-color-surface-container-highest)' : 'transparent',
                          }}
                        >
                          <Icon
                            size={16}
                            style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0 }}
                            aria-hidden
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                              {item.label}
                            </Typography>
                            {item.hint ? (
                              <Typography
                                variant="caption"
                                sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                                noWrap
                              >
                                {item.hint}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
}
