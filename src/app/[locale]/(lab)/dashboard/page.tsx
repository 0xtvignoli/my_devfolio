"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/backgrounds/aurora';
import { GridBackground } from '@/components/backgrounds/grid';
import { resolveLocaleParam } from '@/lib/i18n/config';
import { translations } from '@/data/locales';
import { localizedPath } from '@/lib/i18n/paths';
import { ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const locale = resolveLocaleParam(params?.locale as string | undefined);
  const t = translations[locale];

  return (
    <div className="relative">
      <AuroraBackground />
      <GridBackground />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <Link
            href={localizedPath(locale, '/lab')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} aria-hidden />
            {t.nav.lab}
          </Link>
          <div className="text-center space-y-4" role="region" aria-labelledby="dashboard-heading">
            <h1 id="dashboard-heading" className="font-headline text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500">
              {t.nav.missionProgress}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {locale === 'it'
                ? 'Monitora i progressi, sblocca achievement e sali di livello nelle simulazioni DevOps.'
                : 'Track progress, unlock achievements, and level up through interactive DevOps simulations.'}
            </p>
          </div>

          <GamificationDashboard />
        </motion.div>
      </div>
    </div>
  );
}
