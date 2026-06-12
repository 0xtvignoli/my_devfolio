"use client";

import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-mui';
import { Trophy, Star, Zap } from 'lucide-react';
import { useGamification } from '@/contexts/gamification-context';
import { motion } from 'framer-motion';

export const UserProgressBar = () => {
  const { userProgress, getProgressPercentage } = useGamification();
  
  const getTitleColor = (level: number) => {
    if (level >= 20) return 'text-primary';
    if (level >= 15) return 'text-amber-600 dark:text-amber-400';
    if (level >= 10) return 'text-primary';
    if (level >= 5) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-muted-foreground';
  };

  const getTitleIcon = (level: number) => {
    if (level >= 20) return <Trophy className="h-4 w-4 text-primary" />;
    if (level >= 15) return <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    if (level >= 10) return <Zap className="h-4 w-4 text-primary" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="bg-gradient-to-r from-background/50 to-muted/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTitleIcon(userProgress.level)}
            <span className={getTitleColor(userProgress.level)}>
              Level {userProgress.level}
            </span>
          </div>
          <Chip label={`${userProgress.totalXp.toLocaleString()} XP`} size="small" color="primary" variant="outlined" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground dark:text-muted-foreground">Progress to Level {userProgress.level + 1}</span>
            <span className="font-medium text-foreground">{getProgressPercentage()}%</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <LinearProgress variant="determinate" value={getProgressPercentage()} sx={{ height: 8, borderRadius: 4 }} />
          </motion.div>
          <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground">
            <span>{userProgress.xp} XP</span>
            <span>{userProgress.xp + userProgress.xpToNextLevel} XP</span>
          </div>
        </div>
        
        {userProgress.streak > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="text-orange-500">🔥</div>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {userProgress.streak} day streak!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

