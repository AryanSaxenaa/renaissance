export const SHEPHERD_DEMO_SCAN_ID = 'shepherd-demo';

export type ShepherdDecision = 'unset' | 'declined' | 'accepted';

const DECISION_KEY = 'renaissance:shepherd:decision';

export function readShepherdDecision(): ShepherdDecision {
  const raw = localStorage.getItem(DECISION_KEY);
  if (raw === 'declined' || raw === 'accepted') return raw;
  return 'unset';
}

export function writeShepherdDecision(value: ShepherdDecision): void {
  localStorage.setItem(DECISION_KEY, value);
}
