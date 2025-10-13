"use client";

import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  lastActivity: Date;
  badges: string[];
  title: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  deadline?: Date;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  achievements: number;
  avatar?: string;
}

export interface RecentActivity {
  id: string;
  type: 'achievement' | 'xp' | 'challenge' | 'level';
  message: string;
  timestamp: Date;
}

interface GamificationContextType {
  userProgress: UserProgress;
  achievements: Achievement[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  
  // Actions
  earnXP: (amount: number, source: string) => void;
  unlockAchievement: (achievementId: string) => void;
  completeChallenge: (challengeId: string) => void;
  updateStreak: () => void;
  
  // Getters
  getUnlockedAchievements: () => Achievement[];
  getProgressPercentage: () => number;
  canLevelUp: () => boolean;
  levelUp: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// XP calculation constants
const BASE_XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.2;

const calculateXPForLevel = (level: number): number => {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
};

const calculateLevelFromXP = (totalXp: number): number => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXp) {
    xpNeeded += calculateXPForLevel(level);
    level++;
  }
  
  return level - 1;
};

// Initial achievements data
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_deployment',
    title: 'First Deploy',
    description: 'Complete your first deployment',
    icon: '🚀',
    rarity: 'common',
    points: 50,
    maxProgress: 1
  },
  {
    id: 'chaos_engineer',
    title: 'Chaos Engineer',
    description: 'Run 5 chaos experiments',
    icon: '💥',
    rarity: 'rare',
    points: 150,
    maxProgress: 5
  },
  {
    id: 'terminal_master',
    title: 'Terminal Master',
    description: 'Execute 25 terminal commands',
    icon: '⌨️',
    rarity: 'epic',
    points: 300,
    maxProgress: 25
  },
  {
    id: 'infrastructure_guru',
    title: 'Infrastructure Guru',
    description: 'Complete all lab sections',
    icon: '🏗️',
    rarity: 'legendary',
    points: 500,
    maxProgress: 7
  },
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    rarity: 'rare',
    points: 200,
    maxProgress: 7
  }
];

// Initial challenges
const generateDailyChallenges = (): Challenge[] => [
  {
    id: 'daily_deploy',
    title: 'Daily Deployment',
    description: 'Run at least one deployment today',
    type: 'daily',
    difficulty: 'easy',
    xpReward: 25,
    completed: false,
    progress: 0,
    maxProgress: 1,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'chaos_experiment',
    title: 'Chaos Testing',
    description: 'Run 3 different chaos experiments',
    type: 'daily',
    difficulty: 'medium',
    xpReward: 50,
    completed: false,
    progress: 0,
    maxProgress: 3,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const isUpdatingRef = useRef(false);
  
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXPForLevel(1),
    totalXp: 0,
    streak: 0,
    lastActivity: new Date(),
    badges: [],
    title: 'Novice DevOps'
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [challenges, setChallenges] = useState<Challenge[]>(generateDailyChallenges());
  const [leaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('devfolio_user_progress');
    const savedAchievements = localStorage.getItem('devfolio_achievements');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('devfolio_user_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('devfolio_achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Helper function to add recent activity
  const addRecentActivity = useCallback((type: RecentActivity['type'], message: string) => {
    const newActivity: RecentActivity = {
      id: `activity-${Date.now()}-${crypto.randomUUID()}`,
      type,
      message,
      timestamp: new Date()
    };
    
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  }, []);

  const earnXP = useCallback((amount: number, source: string) => {
    if (isUpdatingRef.current) return; // Prevent concurrent updates
    isUpdatingRef.current = true;
    
    setUserProgress(prev => {
      const newTotalXp = prev.totalXp + amount;
      const newLevel = calculateLevelFromXP(newTotalXp);
      const currentLevelXp = newTotalXp - (newLevel > 1 ? 
        Array.from({length: newLevel - 1}, (_, i) => calculateXPForLevel(i + 1))
          .reduce((sum, xp) => sum + xp, 0) : 0
      );
      const xpToNextLevel = calculateXPForLevel(newLevel + 1) - currentLevelXp;
      
      const didLevelUp = newLevel > prev.level;
      
      // Schedule toast and activity logging for next tick to avoid state update during render
      setTimeout(() => {
        if (didLevelUp) {
          toast({
            title: `🎉 Level Up! You're now level ${newLevel}!`,
            description: `You earned ${amount} XP from ${source}`,
            variant: "default",
          });
          addRecentActivity('level', `🎉 Reached Level ${newLevel}!`);
        } else {
          toast({
            title: `+${amount} XP`,
            description: `From ${source}`,
            variant: "default",
          });
        }
        addRecentActivity('xp', `+${amount} XP from ${source}`);
      }, 0);
      
      const result = {
        ...prev,
        xp: currentLevelXp,
        totalXp: newTotalXp,
        level: newLevel,
        xpToNextLevel,
        lastActivity: new Date()
      };
      
      // Reset the updating flag after state update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
      
      return result;
    });
  }, [toast, addRecentActivity]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlockedAt) {
        // Schedule toast and activity logging for next tick to avoid state update during render
        setTimeout(() => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.title}`,
            variant: "default",
          });
          addRecentActivity('achievement', `🏆 Unlocked "${achievement.title}"`);
        }, 0);
        
        earnXP(achievement.points, `Achievement: ${achievement.title}`);
        
        return {
          ...achievement,
          unlockedAt: new Date(),
          progress: achievement.maxProgress
        };
      }
      return achievement;
    }));
  }, [toast, earnXP, addRecentActivity]);

  const updateAchievementProgress = useCallback((achievementId: string, increment: number = 1) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlockedAt) {
        const newProgress = Math.min(
          (achievement.progress || 0) + increment, 
          achievement.maxProgress || 1
        );
        
        if (newProgress >= (achievement.maxProgress || 1)) {
          unlockAchievement(achievementId);
        }
        
        return { ...achievement, progress: newProgress };
      }
      return achievement;
    }));
  }, [unlockAchievement]);

  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        // Schedule XP earning and activity logging for next tick to avoid state update during render
        setTimeout(() => {
          earnXP(challenge.xpReward, `Challenge: ${challenge.title}`);
          addRecentActivity('challenge', `🎯 Completed "${challenge.title}"`);
        }, 0);
        return { ...challenge, completed: true, progress: challenge.maxProgress };
      }
      return challenge;
    }));
  }, [earnXP, addRecentActivity]);

  const updateStreak = useCallback(() => {
    const now = new Date();
    const lastActivity = new Date(userProgress.lastActivity);
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    setUserProgress(prev => ({
      ...prev,
      streak: daysDiff <= 1 ? prev.streak + 1 : 1,
      lastActivity: now
    }));
  }, [userProgress.lastActivity]);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.unlockedAt);
  }, [achievements]);

  const getProgressPercentage = useCallback(() => {
    return Math.floor((userProgress.xp / (userProgress.xp + userProgress.xpToNextLevel)) * 100);
  }, [userProgress.xp, userProgress.xpToNextLevel]);

  const canLevelUp = useCallback(() => {
    return userProgress.xpToNextLevel <= 0;
  }, [userProgress.xpToNextLevel]);

  const levelUp = useCallback(() => {
    if (canLevelUp()) {
      setUserProgress(prev => ({
        ...prev,
        level: prev.level + 1,
        xp: 0,
        xpToNextLevel: calculateXPForLevel(prev.level + 1)
      }));
    }
  }, [canLevelUp]);

  // Helper function to update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, increment: number = 1) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + increment, challenge.maxProgress);
        
        // Auto-complete if progress reaches maximum
        if (newProgress >= challenge.maxProgress && !challenge.completed) {
          setTimeout(() => {
            completeChallenge(challengeId);
          }, 0);
        }
        
        return { ...challenge, progress: newProgress };
      }
      return challenge;
    }));
  }, [completeChallenge]);

  // Integration hooks for lab activities
  useEffect(() => {
    const handleLabActivity = (event: CustomEvent) => {
      const { type } = event.detail;
      
      switch (type) {
        case 'deployment_completed':
          earnXP(30, 'Deployment');
          updateAchievementProgress('first_deployment');
          updateAchievementProgress('infrastructure_guru');
          // Update daily deployment challenge
          updateChallengeProgress('daily_deploy', 1);
          break;
        case 'chaos_experiment':
          earnXP(20, 'Chaos Engineering');
          updateAchievementProgress('chaos_engineer');
          // Update chaos experiment challenge
          updateChallengeProgress('chaos_experiment', 1);
          break;
        case 'terminal_command':
          earnXP(5, 'Terminal Usage');
          updateAchievementProgress('terminal_master');
          break;
      }
    };

    window.addEventListener('lab_activity', handleLabActivity as EventListener);
    return () => window.removeEventListener('lab_activity', handleLabActivity as EventListener);
  }, [earnXP, updateAchievementProgress, updateChallengeProgress]);

  const value: GamificationContextType = {
    userProgress,
    achievements,
    challenges,
    leaderboard,
    recentActivities,
    isLoading,
    earnXP,
    unlockAchievement,
    completeChallenge,
    updateStreak,
    getUnlockedAchievements,
    getProgressPercentage,
    canLevelUp,
    levelUp
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

