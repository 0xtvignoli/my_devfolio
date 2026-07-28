import { cn } from './utils';

/**
 * Returns hover classes only if device is not touch and motion is not reduced
 */
export function getHoverClasses(
  hoverClasses: string,
  isTouchDevice: boolean,
  prefersReducedMotion: boolean
): string {
  if (isTouchDevice || prefersReducedMotion) {
    return '';
  }
  return hoverClasses;
}

/**
 * Returns transition classes only if motion is not reduced
 */
export function getTransitionClasses(
  transitionClasses: string,
  prefersReducedMotion: boolean
): string {
  if (prefersReducedMotion) {
    return '';
  }
  return transitionClasses;
}

/**
 * Combines hover and transition classes with mobile/reduced-motion awareness
 */
export function getInteractiveClasses(
  baseClasses: string,
  hoverClasses: string,
  transitionClasses: string,
  isTouchDevice: boolean,
  prefersReducedMotion: boolean
): string {
  return cn(
    baseClasses,
    getHoverClasses(hoverClasses, isTouchDevice, prefersReducedMotion),
    getTransitionClasses(transitionClasses, prefersReducedMotion)
  );
}



