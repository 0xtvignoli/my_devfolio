"use client";

import React from 'react';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
            Your Developer Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Track your progress, unlock achievements, and level up your DevOps skills through interactive challenges and real-world simulations.
          </p>
        </div>
        
        <GamificationDashboard />
      </motion.div>
    </div>
  );
}

