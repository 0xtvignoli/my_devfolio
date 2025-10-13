"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserProgressBar } from './progress-bar';
import { AchievementsPanel } from './achievements-panel';
import { ChallengesWidget } from './challenges-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/contexts/gamification-context';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary' 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

const RecentActivity = () => {
  const { recentActivities } = useGamification();
  
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent activity yet.</p>
              <p className="text-sm">Start using the lab to see your activities here!</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <span className="text-sm">{activity.message}</span>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  const { userProgress, challenges } = useGamification();
  
  // Dynamic actions based on user progress and challenges
  const getQuickActions = () => {
    const actions = [];
    
    // Always available actions
    actions.push({
      id: 'explore_lab',
      title: 'Explore Lab',
      description: 'Visit the interactive lab',
      xp: 10,
      action: () => {
        window.location.href = '/lab';
      }
    });

    // Challenge-based actions
    const dailyDeployChallenge = challenges.find(c => c.id === 'daily_deploy' && !c.completed);
    if (dailyDeployChallenge) {
      actions.push({
        id: 'complete_deployment',
        title: 'Run Deployment',
        description: `Complete daily deployment (${dailyDeployChallenge.progress}/${dailyDeployChallenge.maxProgress})`,
        xp: dailyDeployChallenge.xpReward,
        action: () => {
          window.location.href = '/lab#deployment';
        }
      });
    }

    const chaosChallenge = challenges.find(c => c.id === 'chaos_experiment' && !c.completed);
    if (chaosChallenge) {
      actions.push({
        id: 'run_chaos',
        title: 'Chaos Engineering',
        description: `Run chaos experiments (${chaosChallenge.progress}/${chaosChallenge.maxProgress})`,
        xp: chaosChallenge.xpReward,
        action: () => {
          window.location.href = '/lab#chaos';
        }
      });
    }

    // Level-based actions
    if (userProgress.level < 5) {
      actions.push({
        id: 'view_portfolio',
        title: 'View Projects',
        description: 'Check out my work',
        xp: 5,
        action: () => {
          window.location.href = '/portfolio';
        }
      });
    }

    return actions.slice(0, 3); // Limit to 3 actions
  };

  const actions = getQuickActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <div>
                <h4 className="font-medium">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <Badge variant="secondary">+{action.xp} XP</Badge>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const GamificationDashboard = () => {
  const { userProgress, getUnlockedAchievements, challenges } = useGamification();
  
  const unlockedAchievements = getUnlockedAchievements();
  const completedChallenges = challenges.filter(c => c.completed).length;

  return (
    <div className="space-y-6">
      {/* User Progress Bar */}
      <UserProgressBar />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total XP"
          value={userProgress.totalXp.toLocaleString()}
          subtitle="Experience points earned"
          icon={TrendingUp}
          color="blue-500"
        />
        <StatsCard
          title="Current Level"
          value={userProgress.level}
          subtitle={`Next: ${userProgress.xpToNextLevel} XP to go`}
          icon={Award}
          color="purple-500"
        />
        <StatsCard
          title="Achievements"
          value={unlockedAchievements.length}
          subtitle={`${((unlockedAchievements.length / 5) * 100).toFixed(0)}% completed`}
          icon={Award}
          color="yellow-500"
        />
        <StatsCard
          title="Challenges"
          value={completedChallenges}
          subtitle="Completed today"
          icon={Target}
          color="green-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AchievementsPanel />
          <RecentActivity />
        </div>
        
        <div className="space-y-6">
          <ChallengesWidget />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

