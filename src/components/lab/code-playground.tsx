'use client';

import { useState } from 'react';
import { Code2, Cloud } from 'lucide-react';
import { CodeSandboxEmbed } from '@/components/shared/codesandbox-embed';
import { cn } from '@/lib/utils';
import type { Locale, Translations } from '@/lib/types';

interface TerraformTemplate {
  id: string;
  name: string;
  description: string;
  sandboxId: string;
  icon: typeof Code2;
  tags: string[];
}

interface CodePlaygroundProps {
  locale: Locale;
  translations: Translations;
}

// Only templates backed by a real published CodeSandbox are listed. To add one,
// publish a module under codesandbox-templates/ and paste its sandbox ID (the
// part after /s/ in the URL) here — no placeholder IDs, they render as broken embeds.
const TERRAFORM_TEMPLATES: TerraformTemplate[] = [
  {
    id: 'eks-cluster',
    name: 'EKS Cluster',
    description: 'Production-ready EKS cluster with node groups, IAM roles, and networking',
    sandboxId: 'summer-tree-z6nwdp',
    icon: Cloud,
    tags: ['Kubernetes', 'AWS', 'EKS', 'Terraform']
  },
];

export function CodePlayground({ locale, translations }: CodePlaygroundProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TerraformTemplate | null>(null);

  return (
    <div className="relative font-mono rounded-b-[4px] flex flex-col overflow-hidden bg-[#1a1717] text-[#fdfcfc] border border-[#3a3636] h-[26rem] sm:h-[30rem] lg:h-[34rem]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-[#3a3636] bg-[#201d1d] text-xs shrink-0">
        <Code2 className="h-4 w-4 text-[#4da3ff] shrink-0" aria-hidden="true" />
        <span className="text-[#c9c6c6] truncate">{translations.codesandbox.title}</span>
        <span className="ml-auto text-[#9a9898] truncate hidden sm:inline">{translations.codesandbox.description}</span>
      </div>

      {!selectedTemplate ? (
        /* Template selection */
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {TERRAFORM_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={cn(
                  "group/tpl w-full text-left rounded-[4px] border border-[#3a3636] bg-[#201d1d] px-3 sm:px-4 py-3 transition-colors",
                  "hover:border-[#4da3ff] hover:bg-[#302c2c]",
                  "focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
                )}
                aria-label={`Select template: ${template.name}`}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center h-9 w-9 rounded-[4px] bg-[#4da3ff]/15 border border-[#4da3ff]/40">
                    <Icon className="h-4 w-4 text-[#4da3ff]" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#fdfcfc]">{template.name}</h4>
                    <p className="text-xs text-[#9a9898] mt-0.5 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.map((tag) => (
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
        /* CodeSandbox embed */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-3 sm:px-4 py-2 bg-[#201d1d] border-b border-[#3a3636] shrink-0">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="inline-flex items-center gap-1.5 text-xs text-[#9a9898] hover:text-[#4da3ff] transition-colors rounded-[4px] focus-visible:outline-1 focus-visible:outline-[#4da3ff]"
              aria-label="Back to templates"
            >
              ← templates
            </button>
          </div>
          <div className="flex-1 p-3 sm:p-4 min-h-0">
            <CodeSandboxEmbed
              sandboxId={selectedTemplate.sandboxId}
              title={selectedTemplate.name}
              description={selectedTemplate.description}
              variant="compact"
              height="100%"
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

