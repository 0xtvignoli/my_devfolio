'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Locale, Project, Translations } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-mui';
import { Button } from '@/components/ui-mui';
import { ExternalLink, Code2 } from 'lucide-react';
import { GithubIcon } from '@/components/icons/brand-icons';
import { CodeSandboxEmbed } from '@/components/shared/codesandbox-embed';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  translations: Translations;
}

const PROJECT_COVER_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px';

function isSvgSrc(src: string) {
  return src.endsWith('.svg');
}

export function ProjectCard({ project, locale, translations }: ProjectCardProps) {
  const [isCodeSandboxOpen, setIsCodeSandboxOpen] = useState(false);
  const coverIsSvg = isSvgSrc(project.imageUrl);

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/10',
            minHeight: 160,
            bgcolor: 'action.hover',
          }}
        >
          <Image
            src={project.imageUrl}
            alt={project.title[locale]}
            fill
            sizes={PROJECT_COVER_SIZES}
            unoptimized={coverIsSvg}
            style={{ objectFit: 'cover' }}
            data-ai-hint={project.imageHint}
          />
        </Box>
        <CardHeader
          title={<CardTitle>{project.title[locale]}</CardTitle>}
          subheader={<CardDescription>{project.description[locale]}</CardDescription>}
        />
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {project.metrics && project.metrics.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                {translations.project.metricsLabel}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {project.metrics.map((metric) => (
                  <Box
                    key={metric.label[locale]}
                    sx={{
                      p: 1,
                      borderRadius: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      textAlign: 'center',
                      bgcolor: 'transparent',
                    }}
                  >
                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                      {metric.label[locale]}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {project.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </CardContent>
        <CardFooter sx={{ justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap', pt: 0 }}>
          {project.githubUrl && (
            <Button variant="outline" size="sm" component={Link} href={project.githubUrl} target="_blank" rel="noopener noreferrer" startIcon={<GithubIcon width={16} height={16} />}>
              {translations.project.github}
            </Button>
          )}
          {project.codesandboxId && (
            <Button variant="outline" size="sm" onClick={() => setIsCodeSandboxOpen(true)}>
              <Code2 style={{ width: 16, height: 16, marginRight: 8 }} />
              {translations.codesandbox.tryIt}
            </Button>
          )}
          {project.demoUrl && (
            <Button variant="default" size="sm" component={Link} href={project.demoUrl} target="_blank" rel="noopener noreferrer" startIcon={<ExternalLink style={{ width: 16, height: 16 }} />}>
              {translations.project.demo}
            </Button>
          )}
        </CardFooter>
      </Card>

      {project.codesandboxId && (
        <Dialog open={isCodeSandboxOpen} onClose={() => setIsCodeSandboxOpen(false)} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { height: '90vh' } } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider', py: 2 }}>
            <Code2 style={{ width: 20, height: 20 }} />
            {project.title[locale]}
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <DialogContentText component="div" sx={{ px: 3, py: 2, color: 'text.secondary' }}>
              {project.description[locale]}
            </DialogContentText>
            <Box sx={{ flex: 1, p: 2, overflow: 'hidden', minHeight: 0 }}>
              <CodeSandboxEmbed
                sandboxId={project.codesandboxId}
                title={project.title[locale]}
                description={project.description[locale]}
                variant="full"
                className="h-full"
              />
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
