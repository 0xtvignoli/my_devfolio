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

// Helper functions for Date serialization/deserialization
const serializeDate = (date: Date): string => {
  return date.toISOString();
};

const deserializeDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

// Helper function to generate UUID with fallback
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

// Initial challenges - generate with consistent deadline based on day
const generateDailyChallenges = (existingChallenges?: Challenge[]): Challenge[] => {
  // Get start of today in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If we have existing challenges, preserve their state
  if (existingChallenges && existingChallenges.length > 0) {
    return existingChallenges.map(challenge => {
      // Only update deadline if challenge is expired or not completed
      if (challenge.deadline && new Date(challenge.deadline) < today && !challenge.completed) {
        return {
          ...challenge,
          deadline: tomorrow,
          completed: false,
          progress: 0
        };
      }
      // Preserve existing deadline and state
      return {
        ...challenge,
        deadline: challenge.deadline ? deserializeDate(challenge.deadline) : tomorrow
      };
    });
  }
  
  // Generate new challenges
  return [
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
      deadline: tomorrow
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
      deadline: tomorrow
    }
  ];
};

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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading] = useState(false);
  const timeoutRefs = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('devfolio_user_progress');
      const savedAchievements = localStorage.getItem('devfolio_achievements');
      const savedChallenges = localStorage.getItem('devfolio_challenges');
      const savedActivities = localStorage.getItem('devfolio_recent_activities');
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setUserProgress({
          ...parsed,
          lastActivity: deserializeDate(parsed.lastActivity)
        });
      }
      
      if (savedAchievements) {
        const parsed = JSON.parse(savedAchievements);
        setAchievements(parsed.map((a: Achievement & { unlockedAt?: string }) => ({
          ...a,
          unlockedAt: a.unlockedAt ? deserializeDate(a.unlockedAt) : undefined
        })));
      }
      
      if (savedChallenges) {
        const parsed = JSON.parse(savedChallenges);
        const deserialized = parsed.map((c: Challenge & { deadline?: string }) => ({
          ...c,
          deadline: c.deadline ? deserializeDate(c.deadline) : undefined
        }));
        setChallenges(generateDailyChallenges(deserialized));
      } else {
        setChallenges(generateDailyChallenges());
      }
      
      if (savedActivities) {
        const parsed = JSON.parse(savedActivities);
        setRecentActivities(parsed.map((a: RecentActivity & { timestamp: string }) => ({
          ...a,
          timestamp: deserializeDate(a.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading gamification data from localStorage:', error);
      // Initialize with defaults on error
      setChallenges(generateDailyChallenges());
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem('devfolio_user_progress', JSON.stringify({
        ...userProgress,
        lastActivity: serializeDate(userProgress.lastActivity)
      }));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }, [userProgress]);

  useEffect(() => {
    try {
      localStorage.setItem('devfolio_achievements', JSON.stringify(
        achievements.map(a => ({
          ...a,
          unlockedAt: a.unlockedAt ? serializeDate(a.unlockedAt) : undefined
        }))
      ));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem('devfolio_challenges', JSON.stringify(
        challenges.map(c => ({
          ...c,
          deadline: c.deadline ? serializeDate(c.deadline) : undefined
        }))
      ));
    } catch (error) {
      console.error('Error saving challenges:', error);
    }
  }, [challenges]);

  useEffect(() => {
    try {
      localStorage.setItem('devfolio_recent_activities', JSON.stringify(
        recentActivities.map(a => ({
          ...a,
          timestamp: serializeDate(a.timestamp)
        }))
      ));
    } catch (error) {
      console.error('Error saving recent activities:', error);
    }
  }, [recentActivities]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timers = timeoutRefs.current;
    return () => {
      timers.forEach(timeout => clearTimeout(timeout));
      timers.clear();
    };
  }, []);

  // Helper function to add recent activity
  const addRecentActivity = useCallback((type: RecentActivity['type'], message: string) => {
    const newActivity: RecentActivity = {
      id: `activity-${Date.now()}-${generateId()}`,
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
      const timeout1 = setTimeout(() => {
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
      timeoutRefs.current.add(timeout1);
      
      const result = {
        ...prev,
        xp: currentLevelXp,
        totalXp: newTotalXp,
        level: newLevel,
        xpToNextLevel,
        lastActivity: new Date()
      };
      
      // Reset the updating flag after state update
      const timeout2 = setTimeout(() => {
        isUpdatingRef.current = false;
        timeoutRefs.current.delete(timeout2);
      }, 100);
      timeoutRefs.current.add(timeout2);
      
      return result;
    });
  }, [toast, addRecentActivity]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlockedAt) {
        // Schedule toast and activity logging for next tick to avoid state update during render
        const timeout = setTimeout(() => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.title}`,
            variant: "default",
          });
          addRecentActivity('achievement', `🏆 Unlocked "${achievement.title}"`);
          timeoutRefs.current.delete(timeout);
        }, 0);
        timeoutRefs.current.add(timeout);
        
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
        const timeout = setTimeout(() => {
          earnXP(challenge.xpReward, `Challenge: ${challenge.title}`);
          addRecentActivity('challenge', `🎯 Completed "${challenge.title}"`);
          timeoutRefs.current.delete(timeout);
        }, 0);
        timeoutRefs.current.add(timeout);
        return { ...challenge, completed: true, progress: challenge.maxProgress };
      }
      return challenge;
    }));
  }, [earnXP, addRecentActivity]);

  const updateStreak = useCallback(() => {
    const now = new Date();
    const lastActivity = userProgress.lastActivity instanceof Date 
      ? userProgress.lastActivity 
      : deserializeDate(userProgress.lastActivity);
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
          const timeout = setTimeout(() => {
            completeChallenge(challengeId);
            timeoutRefs.current.delete(timeout);
          }, 0);
          timeoutRefs.current.add(timeout);
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
