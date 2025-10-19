'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // CTA text
}

const LAB_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to the DevOps Lab!',
    description: 'An interactive environment to explore DevOps practices, Kubernetes, CI/CD pipelines, and chaos engineering. Let me show you around!',
    action: 'Start Tour',
  },
  {
    id: 'terminal',
    title: '💻 Interactive Terminal',
    description: 'Execute commands like kubectl, helm, git, and more. Try typing "help" to see all available commands. Press ↑↓ for history, Tab for autocomplete.',
    target: '.terminal-container',
    position: 'top',
  },
  {
    id: 'quick-actions',
    title: '⚡ Quick Actions',
    description: 'Use these shortcuts for common operations. Perfect for rapid experimentation without typing commands.',
    target: '.quick-actions-bar',
    position: 'bottom',
  },
  {
    id: 'cluster-viz',
    title: '☸️ Kubernetes Cluster',
    description: 'Visualize your cluster in real-time. Click on pods to see details and monitor their health status.',
    target: '.cluster-visualization',
    position: 'right',
  },
  {
    id: 'pipeline',
    title: '🚀 CI/CD Pipeline',
    description: 'Deploy applications with canary, blue-green, or rolling strategies. Watch the deployment progress through each stage.',
    target: '.deploy-pipeline',
    position: 'right',
  },
  {
    id: 'chaos',
    title: '🔥 Chaos Engineering',
    description: 'Test system resilience with chaos experiments. Simulate pod failures, network issues, or resource spikes.',
    target: '.chaos-controls',
    position: 'top',
  },
  {
    id: 'metrics',
    title: '📊 Real-time Metrics',
    description: 'Monitor CPU, memory, latency, and deployment stats. All data updates live as you interact with the lab.',
    target: '.metrics-dashboard',
    position: 'left',
  },
  {
    id: 'gamification',
    title: '🏆 Achievements & XP',
    description: 'Earn points and unlock achievements as you explore. Complete challenges to level up your DevOps skills!',
    target: '.gamification-widget',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Start exploring at your own pace. Type "help" in the terminal anytime, or hover over elements for tooltips. Have fun!',
    action: 'Start Exploring',
  },
];

interface GuidedTourProps {
  tourId?: string;
  steps?: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedTour({ 
  tourId = 'lab-tour',
  steps = LAB_TOUR_STEPS,
  onComplete,
  autoStart = false,
}: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const completed = localStorage.getItem(`tour_completed_${tourId}`);
    setHasCompletedBefore(!!completed);

    // Auto-start if not completed and autoStart is true
    if (!completed && autoStart) {
      // Delay to let page load
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [tourId, autoStart]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    localStorage.setItem(`tour_skipped_${tourId}`, 'true');
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
    onComplete?.();
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  // Calculate spotlight position
  const getSpotlightStyle = () => {
    if (!currentStepData.target) return {};

    const element = document.querySelector(currentStepData.target);
    if (!element) return {};

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top - 10,
      left: rect.left - 10,
      width: rect.width + 20,
      height: rect.height + 20,
    };
  };

  if (!isActive) {
    // Show restart button if completed before
    if (hasCompletedBefore) {
      return (
        <button
          onClick={restartTour}
          className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-all hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Restart Tour</span>
        </button>
      );
    }
    return null;
  }

  const tooltipPosition = currentStepData.position || 'bottom';
  const spotlightStyle = getSpotlightStyle();

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleSkip}
      />

      {/* Spotlight on target element */}
      {currentStepData.target && spotlightStyle.width && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed z-50 rounded-lg"
          style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed z-50 max-w-md',
          !currentStepData.target && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
        style={
          currentStepData.target && spotlightStyle.width
            ? {
                [tooltipPosition]: tooltipPosition === 'bottom' || tooltipPosition === 'top'
                  ? spotlightStyle.height + 20
                  : undefined,
                [tooltipPosition === 'left' ? 'right' : tooltipPosition === 'right' ? 'left' : 'top']: 
                  tooltipPosition === 'left' || tooltipPosition === 'right'
                    ? spotlightStyle.width + 20
                    : undefined,
                left: tooltipPosition === 'top' || tooltipPosition === 'bottom' 
                  ? spotlightStyle.left
                  : undefined,
                top: tooltipPosition === 'left' || tooltipPosition === 'right'
                  ? spotlightStyle.top
                  : undefined,
              }
            : {}
        }
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-white pr-8">{currentStepData.title}</h3>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-6 leading-relaxed">{currentStepData.description}</p>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all',
                    index <= currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  isFirstStep
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all hover:scale-105"
              >
                {currentStepData.action || (isLastStep ? 'Finish' : 'Next')}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
