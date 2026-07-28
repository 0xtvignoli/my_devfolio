'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui-mui';
import { HelpCircle, Terminal, Code, Zap, GitBranch, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { Translations } from '@/lib/types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  system: Terminal,
  lab: Zap,
  kubernetes: Code,
  helm: Code,
  git: GitBranch,
};

interface HelpModalProps {
  translations: Translations;
}

export function HelpModal({ translations }: HelpModalProps) {
  const [open, setOpen] = useState(false);
  const t = translations.lab.help;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label={t.buttonLabel}>
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t.buttonLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {t.categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.key] ?? Terminal;
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="h-5 w-5" aria-hidden />
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
            <strong>{t.tipLabel}</strong> {t.tip}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
