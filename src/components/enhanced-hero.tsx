'use client';

import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Terminal, Sparkles } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { HeroCTAButton } from '@/components/shared/hero-cta-button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { LabPreviewPanel } from '@/components/hero/lab-preview-panel';
import type { Locale } from '@/lib/types';
import { localizedPath } from '@/lib/i18n/paths';
import Box from '@mui/material/Box';

interface EnhancedHeroProps {
  locale: Locale;
  title: string;
  subtitle: string;
  badge: string;
  ctaPortfolio: string;
  ctaLab: string;
  ctaContact: string;
  labPreviewTitle: string;
  labPreviewSubtitle: string;
}

const PARTICLE_COUNT = 8;

export function EnhancedHero({
  locale,
  title,
  subtitle,
  badge,
  ctaPortfolio,
  ctaLab,
  ctaContact,
  labPreviewTitle,
  labPreviewSubtitle,
}: EnhancedHeroProps) {
  const [isClient, setIsClient] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsClient(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const onMouseMove = useCallback(
    ({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const maskImage = useMotionTemplate`radial-gradient(350px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const evervaultStyle = prefersReducedMotion ? undefined : { maskImage, WebkitMaskImage: maskImage };

  return (
    <section
      id="hero"
      onMouseMove={onMouseMove}
      className="group/hero relative py-16 md:py-24 lg:py-28 overflow-hidden text-foreground"
    >
      <GlassPanel
        strong
        className="absolute inset-0 z-0 rounded-3xl border border-[var(--glass-border)] shadow-[var(--elevation-soft)]"
      />
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 ${prefersReducedMotion ? '' : 'animate-pulse-slow'}`} />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={evervaultStyle}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover/hero:opacity-5 pointer-events-none bg-primary/10"
            style={evervaultStyle}
          />
        </>
      )}

      <Box className="relative z-10 px-4">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/20 bg-[var(--glass-bg)]">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{badge}</span>
                </div>
              </motion.div>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              >
                {subtitle}
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4"
              >
                <HeroCTAButton href={localizedPath(locale, '/portfolio')} variant="primary">
                  {ctaPortfolio}
                </HeroCTAButton>
                <HeroCTAButton href={localizedPath(locale, '/lab')} variant="secondary" icon={Terminal}>
                  {ctaLab}
                </HeroCTAButton>
                <HeroCTAButton href="#contact" variant="outline">
                  {ctaContact}
                </HeroCTAButton>
              </motion.div>
          </Box>

          <Box>
            <LabPreviewPanel title={labPreviewTitle} subtitle={labPreviewSubtitle} />
          </Box>
        </Box>

        {isClient && !prefersReducedMotion && (
          <div className="absolute inset-0 -z-10 pointer-events-none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                initial={{ x: (i * 137) % 800, y: (i * 89) % 400 }}
                animate={{
                  y: [(i * 89) % 400, ((i * 89) + 200) % 400],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
        )}
      </Box>
    </section>
  );
}
