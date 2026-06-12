'use client';

type LabEventParams = Record<string, string | number | boolean | undefined>;

let labViewTimestamp: number | null = null;
let firstInteractionTracked = false;

function gtagEvent(eventName: string, params?: LabEventParams) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Lab event:', eventName, params ?? {});
  }
}

/** Marks the start of a lab session. Call once when the lab page mounts. */
export function trackLabView(layout: string) {
  labViewTimestamp = Date.now();
  firstInteractionTracked = false;
  gtagEvent('lab_view', { layout });
}

/**
 * Records time-to-first-action once per session.
 * Safe to call on every interaction; only the first one is sent.
 */
export function trackLabFirstInteraction(interactionType: string) {
  if (firstInteractionTracked) return;
  firstInteractionTracked = true;
  const secondsToFirstAction = labViewTimestamp
    ? Math.round((Date.now() - labViewTimestamp) / 1000)
    : undefined;
  gtagEvent('lab_first_interaction', {
    interaction_type: interactionType,
    seconds_to_first_action: secondsToFirstAction,
  });
}

export function trackLabCommand(command: string) {
  trackLabFirstInteraction('command');
  gtagEvent('lab_command_executed', { command: command.split(' ')[0], full_command: command });
}

export function trackLabDeploy(action: 'start' | 'promote' | 'rollback', strategy?: string) {
  trackLabFirstInteraction('deploy');
  gtagEvent('lab_deploy', { action, strategy });
}

export function trackLabChaos(scenario: string) {
  trackLabFirstInteraction('chaos');
  gtagEvent('lab_chaos', { scenario });
}

export function trackLabLayoutSwitch(layout: string) {
  gtagEvent('lab_layout_switched', { layout });
}

export function trackLabTour(status: 'started' | 'completed' | 'skipped', step?: number) {
  gtagEvent('lab_tour', { status, step });
}

export function trackLabMission(
  mission: string,
  status: 'started' | 'step_completed' | 'completed',
  step?: string
) {
  gtagEvent('lab_mission', { mission, status, step });
}

export function trackLabDemo(status: 'started' | 'interrupted' | 'finished') {
  gtagEvent('lab_demo', { status });
}

export function trackLabPalette(action: 'opened' | 'executed', itemId?: string) {
  gtagEvent('lab_palette', { action, item: itemId });
}
