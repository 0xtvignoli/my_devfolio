"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/contexts/gamification-context';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Target } from 'lucide-react';
import type { Challenge } from '@/contexts/gamification-context';

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const { completeChallenge } = useGamification();
  const progressPercentage = (challenge.progress / challenge.maxProgress) * 100;
  const isCompleted = challenge.completed;
  
  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'hard': return 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'easy': return 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Clock className="h-4 w-4" />;
      case 'special': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatTimeRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all duration-300 ${
        isCompleted 
          ? 'border-green-500/50 bg-green-500/10' 
          : 'border-muted hover:border-primary/50'
      }`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(challenge.type)}
                <h4 className={`font-semibold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                  {challenge.title}
                </h4>
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <Badge 
                variant="outline" 
                className={getDifficultyColor(challenge.difficulty)}
              >
                {challenge.difficulty}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  +{challenge.xpReward} XP
                </span>
                {challenge.deadline && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimeRemaining(challenge.deadline)}
                  </span>
                )}
              </div>
              
              {challenge.progress >= challenge.maxProgress && !isCompleted && (
                <Button 
                  size="sm" 
                  onClick={() => completeChallenge(challenge.id)}
                  className="h-7 px-3"
                >
                  Claim
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ChallengesWidget = () => {
  const { challenges } = useGamification();
  const activeChallenges = challenges.filter(c => !c.completed);
  const completedToday = challenges.filter(c => c.completed && c.type === 'daily').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🎯 Daily Challenges
          </span>
          <Badge variant="secondary">
            {completedToday}/{challenges.filter(c => c.type === 'daily').length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>All challenges completed!</p>
              <p className="text-sm">Come back tomorrow for new challenges.</p>
            </div>
          ) : (
            activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

