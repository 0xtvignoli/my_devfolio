"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { motion } from 'framer-motion';
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
      <div className="container mx-auto px-4 py-16">
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
          <div className="space-y-3 border-b border-border pb-6" role="region" aria-labelledby="dashboard-heading">
            <h1 id="dashboard-heading" className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              <span aria-hidden className="text-muted-foreground mr-2">#</span>
              {t.nav.missionProgress}
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl">
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
