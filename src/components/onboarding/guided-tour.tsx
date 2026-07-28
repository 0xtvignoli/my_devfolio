'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackLabTour } from '@/lib/lab-telemetry';
import type { Translations } from '@/lib/types';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // CTA text
}

export interface TourLabels {
  start: string;
  restart: string;
  previous: string;
  next: string;
  finish: string;
  close: string;
  stepOf: string; // "{current} of {total}"
}

const DEFAULT_LABELS: TourLabels = {
  start: 'Tour',
  restart: 'Restart tour',
  previous: 'Previous',
  next: 'Next',
  finish: 'Finish',
  close: 'Close tour',
  stepOf: '{current} of {total}',
};

/** Builds the lab tour steps from translations, targeting stable element ids. */
export function buildLabTourSteps(translations: Translations): TourStep[] {
  const s = translations.lab.tour.steps;
  return [
    { id: 'welcome', title: s.welcome.title, description: s.welcome.description, action: s.welcome.action },
    { id: 'terminal', title: s.terminal.title, description: s.terminal.description, target: '#lab-terminal', position: 'bottom' },
    { id: 'quick-actions', title: s.quickActions.title, description: s.quickActions.description, target: '#lab-quick-actions', position: 'bottom' },
    { id: 'mission-control', title: s.missionControl.title, description: s.missionControl.description, target: '#mission-control', position: 'bottom' },
    { id: 'pipeline', title: s.pipeline.title, description: s.pipeline.description, target: '#pipeline', position: 'top' },
    { id: 'metrics', title: s.metrics.title, description: s.metrics.description, target: '#lab-metrics', position: 'top' },
    { id: 'cluster', title: s.cluster.title, description: s.cluster.description, target: '#cluster', position: 'top' },
    { id: 'incidents', title: s.incidents.title, description: s.incidents.description, target: '#incident-history', position: 'top' },
    { id: 'complete', title: s.complete.title, description: s.complete.description, action: s.complete.action },
  ];
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface GuidedTourProps {
  tourId?: string;
  steps: TourStep[];
  labels?: TourLabels;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedTour({
  tourId = 'lab-tour',
  steps,
  labels = DEFAULT_LABELS,
  onComplete,
  autoStart = false,
}: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_completed_${tourId}`);
    setHasCompletedBefore(!!completed);
    if (!completed && autoStart) {
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [tourId, autoStart]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Scroll target into view, then measure for the spotlight overlay.
  useEffect(() => {
    if (!isActive) {
      setSpotlight(null);
      return;
    }
    const target = currentStepData?.target;
    if (!target) {
      setSpotlight(null);
      return;
    }
    const element = document.querySelector(target);
    if (!element) {
      setSpotlight(null);
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSpotlight({
        top: rect.top - 10,
        left: rect.left - 10,
        width: rect.width + 20,
        height: rect.height + 20,
      });
    };
    // Wait for smooth scroll to settle before measuring.
    const timer = setTimeout(measure, 450);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [isActive, currentStep, currentStepData?.target]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
    setHasCompletedBefore(true);
    trackLabTour('completed');
    onComplete?.();
  }, [tourId, onComplete]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(`tour_skipped_${tourId}`, 'true');
    trackLabTour('skipped', currentStep);
  }, [tourId, currentStep]);

  // Close on Escape while active.
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, handleSkip]);

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  };

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    trackLabTour('started');
  };

  if (!isActive) {
    // Inline trigger, always available (new visitors included).
    return (
      <button
        onClick={startTour}
        title={hasCompletedBefore ? labels.restart : labels.start}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{labels.start}</span>
      </button>
    );
  }

  const hasSpotlight = !!(currentStepData.target && spotlight);

  return (
    <AnimatePresence>
      {/* Backdrop overlay (spotlight punches its own hole via box-shadow) */}
      {!hasSpotlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[70]"
          onClick={handleSkip}
        />
      )}

      {hasSpotlight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed z-[70] rounded-[4px] border-2 border-[#007aff]"
          style={{
            ...spotlight,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip — centered to stay visible regardless of target position */}
      <motion.div
        key={currentStep}
        role="dialog"
        aria-modal="true"
        aria-label={currentStepData.title}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed z-[71] w-[calc(100vw-2rem)] max-w-md left-1/2 -translate-x-1/2',
          hasSpotlight ? 'bottom-6' : 'top-1/2 -translate-y-1/2'
        )}
      >
        <div className="bg-[var(--oc-surface-dark)] border border-[#3a3636] overflow-hidden">
          <div className="bg-[var(--oc-surface-dark-elevated)] border-b border-[#3a3636] p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-white pr-8">{currentStepData.title}</h3>
              <button
                onClick={handleSkip}
                aria-label={labels.close}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-300 mb-6 leading-relaxed">{currentStepData.description}</p>

            <div className="flex items-center gap-2 mb-4" aria-hidden>
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 flex-1 transition-all',
                    index <= currentStep ? 'bg-[#007aff]' : 'bg-[#3a3636]'
                  )}
                />
              ))}
            </div>

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
                <ChevronLeft className="h-4 w-4" aria-hidden />
                {labels.previous}
              </button>

              <span className="text-sm text-gray-500">
                {labels.stepOf
                  .replace('{current}', String(currentStep + 1))
                  .replace('{total}', String(steps.length))}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-[#007aff] hover:opacity-90 text-white rounded-[4px] font-medium transition-opacity"
              >
                {currentStepData.action || (isLastStep ? labels.finish : labels.next)}
                {!isLastStep && <ChevronRight className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
