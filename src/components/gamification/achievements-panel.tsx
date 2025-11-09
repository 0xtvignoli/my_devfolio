"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/contexts/gamification-context';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import type { Achievement } from '@/contexts/gamification-context';

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.maxProgress || 1;
  const progressPercentage = (progress / maxProgress) * 100;
  
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400 dark:bg-purple-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/10';
      case 'common': return 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-700 dark:text-gray-400 dark:bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isUnlocked 
          ? 'border-primary/50 bg-primary/5' 
          : 'border-muted bg-muted/20 opacity-70'
      }`}>
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
        
        {!isUnlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={getRarityColor(achievement.rarity)}
                >
                  {achievement.rarity.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium text-primary">
                  {achievement.points} XP
                </span>
              </div>
              
              {!isUnlocked && maxProgress > 1 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground dark:text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground dark:text-muted-foreground">{progress}/{maxProgress}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
              
              {isUnlocked && achievement.unlockedAt && (
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Unlocked {(achievement.unlockedAt instanceof Date 
                    ? achievement.unlockedAt 
                    : new Date(achievement.unlockedAt)
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AchievementsPanel = () => {
  const { achievements, getUnlockedAchievements } = useGamification();
  const unlockedCount = getUnlockedAchievements().length;
  const totalCount = achievements.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🏆 Achievements
          </span>
          <Badge variant="secondary">
            {unlockedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

