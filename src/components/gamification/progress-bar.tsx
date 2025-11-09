"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';
import { useGamification } from '@/contexts/gamification-context';
import { motion } from 'framer-motion';

export const UserProgressBar = () => {
  const { userProgress, getProgressPercentage } = useGamification();
  
  const getTitleColor = (level: number) => {
    if (level >= 20) return 'text-purple-600 dark:text-purple-400';
    if (level >= 15) return 'text-yellow-600 dark:text-yellow-400';
    if (level >= 10) return 'text-blue-600 dark:text-blue-400';
    if (level >= 5) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTitleIcon = (level: number) => {
    if (level >= 20) return <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    if (level >= 15) return <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    if (level >= 10) return <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    return <Star className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
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
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {userProgress.totalXp.toLocaleString()} XP
          </Badge>
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
            <Progress 
              value={getProgressPercentage()} 
              className="h-3 bg-muted"
            />
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

