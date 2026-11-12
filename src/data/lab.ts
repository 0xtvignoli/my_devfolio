/**
 * The Lab's experiments, in reading order: the /lab index lists them, and LabNav at the
 * bottom of each one links to the previous, the next and the rest. One place to add a page.
 */
export const LAB_EXPERIMENTS = [
  { key: 'observatory', path: '/lab/observatory', group: 'watch' },
  { key: 'canaries', path: '/lab/decoys/canaries', group: 'decoys' },
  { key: 'ports', path: '/lab/decoys/ports', group: 'decoys' },
  { key: 'ai', path: '/lab/decoys/ai', group: 'decoys' },
  { key: 'compare', path: '/lab/compare', group: 'watch' },
  { key: 'passwords', path: '/lab/passwords', group: 'you' },
  { key: 'homelab', path: '/lab/homelab', group: 'behind' },
  { key: 'status', path: '/lab/status', group: 'behind' },
] as const;

export type LabKey = (typeof LAB_EXPERIMENTS)[number]['key'];
export type LabGroup = (typeof LAB_EXPERIMENTS)[number]['group'];
