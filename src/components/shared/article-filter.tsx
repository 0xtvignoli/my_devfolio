'use client';

import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

export type FilterableArticle = {
  slug: string;
  tags: string[];
  /** Server-rendered card, handed over as a prop so filtering costs no extra bundle. */
  card: ReactNode;
};

type ArticleFilterProps = {
  items: FilterableArticle[];
  label: string;
  allLabel: string;
  /** Contains `{count}`. A string, not a formatter — functions can't cross the RSC boundary. */
  countTemplate: string;
};

export function ArticleFilter({ items, label, allLabel, countTemplate }: ArticleFilterProps) {
  const [active, setActive] = useState<string | null>(null);

  // Tag order follows article order (newest first), so the freshest topics lead.
  const tags = [...new Set(items.flatMap((item) => item.tags))];
  const shown = active ? items.filter((item) => item.tags.includes(active)) : items;

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography
          component="h2"
          variant="caption"
          sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {label}
        </Typography>
        <Box role="group" aria-label={label} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={allLabel}
            clickable
            variant={active === null ? 'filled' : 'outlined'}
            aria-pressed={active === null}
            onClick={() => setActive(null)}
            sx={{ height: { xs: 40, md: 32 } }} // 32px is under the touch-target floor
          />
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              clickable
              variant={active === tag ? 'filled' : 'outlined'}
              aria-pressed={active === tag}
              onClick={() => setActive(active === tag ? null : tag)}
              sx={{ height: { xs: 40, md: 32 } }}
            />
          ))}
        </Box>
        <Typography variant="caption" aria-live="polite" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          {countTemplate.replace('{count}', String(shown.length))}
        </Typography>
      </Box>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shown.map((item) => (
          <div key={item.slug}>{item.card}</div>
        ))}
      </div>
    </>
  );
}
