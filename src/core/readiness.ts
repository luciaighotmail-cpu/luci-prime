/**
 * Tower readiness is calculated only from evidence-backed checklist items.
 * Document filing alone does not count.
 */

import { ChecklistItem } from './types';

export interface ReadinessResult {
  scorePct: number;
  requiredTotal: number;
  requiredMet: number;
  evidenceBackedMet: number;
  ready: boolean;
  gaps: string[];
}

export function calculateReadiness(checklist: ChecklistItem[]): ReadinessResult {
  const required = checklist.filter(c => c.required);
  const requiredMet = required.filter(c => c.checked);
  // Only items that have an evidenceRef count as evidence-backed
  const evidenceBackedMet = requiredMet.filter(c => !!c.evidenceRef);

  const scorePct = required.length === 0
    ? 0
    : Math.round((evidenceBackedMet.length / required.length) * 100);

  const gaps = required
    .filter(c => !c.checked || !c.evidenceRef)
    .map(c => c.label);

  return {
    scorePct,
    requiredTotal: required.length,
    requiredMet: requiredMet.length,
    evidenceBackedMet: evidenceBackedMet.length,
    ready: gaps.length === 0 && required.length > 0,
    gaps,
  };
}
