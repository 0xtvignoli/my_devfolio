'use client';

import { useState } from 'react';
import { Code2, Cloud, Network, Coins, FileCode2, Check, Clipboard, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { terraformTemplates, type TerraformTemplate } from '@/data/content/terraform-templates';
import type { Locale, Translations } from '@/lib/types';

interface CodePlaygroundProps {
  locale: Locale;
  translations: Translations;
}

const TEMPLATE_ICONS: Record<string, typeof Code2> = {
  'eks-cluster': Cloud,
  'vpc-network': Network,
  'x402-gateway': Coins,
};

// Shows the real Terraform from the repo inline (read-only) instead of an
// external CodeSandbox embed — self-contained, no private-sandbox / CSP issues.
export function CodePlayground({ translations }: CodePlaygroundProps) {
  const [selected, setSelected] = useState<TerraformTemplate | null>(null);
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const openTemplate = (t: TerraformTemplate) => {
    setSelected(t);
    setActiveFile(0);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied', description: 'Terraform copied to clipboard' });
    });
  };

  return (
    <div className="relative font-mono rounded-b-[4px] flex flex-col overflow-hidden bg-[#1a1717] text-[#fdfcfc] border border-[#3a3636] h-[26rem] sm:h-[30rem] lg:h-[34rem]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-[#3a3636] bg-[#201d1d] text-xs shrink-0">
        <Code2 className="h-4 w-4 text-[#4da3ff] shrink-0" aria-hidden="true" />
        <span className="text-[#c9c6c6] truncate">{translations.codesandbox.title}</span>
        <span className="ml-auto text-[#9a9898] truncate hidden sm:inline">{translations.codesandbox.description}</span>
      </div>

      {!selected ? (
        /* Template selection */
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {terraformTemplates.map((t) => {
            const Icon = TEMPLATE_ICONS[t.id] ?? FileCode2;
            return (
              <button
                key={t.id}
                onClick={() => openTemplate(t)}
                className={cn(
                  'group/tpl w-full text-left rounded-[4px] border border-[#3a3636] bg-[#201d1d] px-3 sm:px-4 py-3 transition-colors',
                  'hover:border-[#4da3ff] hover:bg-[#302c2c]',
                  'focus-visible:outline-1 focus-visible:outline-[#4da3ff]'
                )}
                aria-label={`Open Terraform module: ${t.name}`}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center h-9 w-9 rounded-[4px] bg-[#4da3ff]/15 border border-[#4da3ff]/40">
                    <Icon className="h-4 w-4 text-[#4da3ff]" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#fdfcfc]">{t.name}</h4>
                    <p className="text-xs text-[#9a9898] mt-0.5 mb-2">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-[4px] border border-[#3a3636] text-[#9a9898]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-[#9a9898] group-hover/tpl:text-[#4da3ff] transition-colors" aria-hidden>→</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Inline Terraform viewer */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar: back + file tabs + actions */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#201d1d] border-b border-[#3a3636] shrink-0 overflow-x-auto">
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-xs text-[#9a9898] hover:text-[#4da3ff] transition-colors rounded-[4px] focus-visible:outline-1 focus-visible:outline-[#4da3ff] shrink-0"
              aria-label="Back to templates"
            >
              ← templates
            </button>
            <span className="text-[#3a3636] shrink-0" aria-hidden>|</span>
            <div className="flex items-center gap-1" role="tablist" aria-label="Terraform files">
              {selected.files.map((f, i) => (
                <button
                  key={f.name}
                  role="tab"
                  aria-selected={i === activeFile}
                  onClick={() => setActiveFile(i)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-[4px] transition-colors focus-visible:outline-1 focus-visible:outline-[#4da3ff] shrink-0',
                    i === activeFile
                      ? 'text-[#4da3ff] bg-[#4da3ff]/10'
                      : 'text-[#9a9898] hover:text-[#fdfcfc]'
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyCode(selected.files[activeFile].code)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#9a9898] hover:text-[#4da3ff] rounded-[4px] focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
                aria-label="Copy file"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" aria-hidden /> : <Clipboard className="h-3.5 w-3.5" aria-hidden />}
              </button>
              <a
                href={selected.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#9a9898] hover:text-[#4da3ff] rounded-[4px] focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
                aria-label="View module on GitHub"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>
          {/* Code */}
          <div className="flex-1 min-h-0 overflow-auto bg-[#161313]">
            <pre className="p-3 sm:p-4 text-xs leading-relaxed text-[#e8e6e6]">
              <code aria-label={`${selected.name} — ${selected.files[activeFile].name}`}>
                {selected.files[activeFile].code}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
