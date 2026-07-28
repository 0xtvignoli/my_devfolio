'use client';

import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui-mui';
import { buildPostmortem } from '@/lib/postmortem';
import { trackLabPostmortem } from '@/lib/lab-telemetry';
import type { Incident, Translations } from '@/lib/types';

type PostmortemButtonProps = {
  translations: Translations;
  incidents: Incident[];
  logs: string[];
  successfulDeploys: number;
};

/**
 * Exports the session as an incident postmortem. Always enabled — with no
 * incidents the doc says so in one line, which beats a disabled button the
 * visitor has to guess about.
 */
export function PostmortemButton({
  translations,
  incidents,
  logs,
  successfulDeploys,
}: PostmortemButtonProps) {
  const download = () => {
    const now = new Date();
    const markdown = buildPostmortem({
      incidents,
      logs,
      generatedAt: now.toISOString(),
      successfulDeploys,
    });
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `postmortem-${now.toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    trackLabPostmortem(incidents.length);
  };

  return (
    <Button variant="outline" size="sm" onClick={download} startIcon={<FileDown size={14} />}>
      {translations.lab.postmortem.download}
    </Button>
  );
}
