"use client";

import React from 'react';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/backgrounds/aurora';
import { GridBackground } from '@/components/backgrounds/grid';

export default function DashboardPage() {
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
          <div className="text-center space-y-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500">
              Developer Journey Dashboard
            </h1>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-3xl mx-auto">
              Track progress, unlock achievements, and level up through interactive DevOps simulations.
            </p>
          </div>
          
          <GamificationDashboard />
        </motion.div>
      </div>
    </div>
  );
}

