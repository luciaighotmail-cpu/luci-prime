/**
 * Model Portfolio / Vault
 * Sleeve allocations must sum to exactly 100%.
 * Explicitly a model book — no custody, no executed trades, no verified balances.
 */

import { ModelPortfolio, Sleeve } from './types';

export function sumAllocations(sleeves: Sleeve[]): number {
  return sleeves.reduce((acc, s) => acc + s.allocationPct, 0);
}

export function isValidPortfolio(portfolio: ModelPortfolio): { valid: boolean; sum: number; reason?: string } {
  if (!portfolio.isModelBook) {
    return { valid: false, sum: 0, reason: 'NOT_MODEL_BOOK' };
  }
  const sum = sumAllocations(portfolio.sleeves);
  // Allow floating-point tolerance of 1e-6
  if (Math.abs(sum - 100) > 1e-6) {
    return { valid: false, sum, reason: `ALLOCATION_SUM_${sum}_NOT_100` };
  }
  for (const s of portfolio.sleeves) {
    if (s.allocationPct < 0) {
      return { valid: false, sum, reason: `NEGATIVE_ALLOCATION_${s.id}` };
    }
  }
  return { valid: true, sum };
}

export function createDefaultPortfolio(): ModelPortfolio {
  return {
    id: 'model-book-001',
    name: 'Sealie Federation Model Book',
    isModelBook: true,
    updatedAt: Date.now(),
    sleeves: [
      { id: 'sleeve-core', name: 'Core Infrastructure', allocationPct: 40 },
      { id: 'sleeve-energy', name: 'Energy & Microgrid', allocationPct: 25 },
      { id: 'sleeve-compute', name: 'Compute & Nodes', allocationPct: 20 },
      { id: 'sleeve-ops', name: 'Operations Reserve', allocationPct: 10 },
      { id: 'sleeve-rd', name: 'R&D / Luci', allocationPct: 5 },
    ],
  };
}

/**
 * Update a single sleeve. Rebalances or rejects if sum would not equal 100.
 * Fail-closed: does not silently adjust other sleeves.
 */
export function updateSleeve(
  portfolio: ModelPortfolio,
  sleeveId: string,
  newPct: number
): { ok: true; portfolio: ModelPortfolio } | { ok: false; reason: string } {
  if (newPct < 0 || newPct > 100) {
    return { ok: false, reason: 'PCT_OUT_OF_RANGE' };
  }

  const sleeves = portfolio.sleeves.map(s =>
    s.id === sleeveId ? { ...s, allocationPct: newPct } : s
  );

  const candidate: ModelPortfolio = {
    ...portfolio,
    sleeves,
    updatedAt: Date.now(),
  };

  const check = isValidPortfolio(candidate);
  if (!check.valid) {
    return { ok: false, reason: check.reason ?? 'INVALID' };
  }

  return { ok: true, portfolio: candidate };
}
