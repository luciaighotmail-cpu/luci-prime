/**
 * Browser-local persistence only.
 * Not a central, backed-up, or cross-device Federation record.
 */

import { ControlDeskState } from './types';
import { createDefaultPortfolio } from './vault';
import { createDefaultNodes } from './nodes';

const STORAGE_KEY = 'luci-prime-control-desk-v1';

export function createInitialState(): ControlDeskState {
  return {
    mode: 'WATCH',
    alerts: [
      {
        id: 'alert-bootstrap-1',
        severity: 'info',
        title: 'Control Desk Online',
        message: 'Luci Prime initialised in WATCH mode. No external actions authorised.',
        createdAt: Date.now(),
        acknowledged: false,
      },
    ],
    checklist: [
      { id: 'chk-auth', label: 'Authority boundary confirmed', required: true, checked: false },
      { id: 'chk-ledger', label: 'Ledger chain integrity verified', required: true, checked: false },
      { id: 'chk-nodes', label: 'Node modelled/measured separation confirmed', required: true, checked: false },
      { id: 'chk-vault', label: 'Model portfolio allocations = 100%', required: true, checked: false },
      { id: 'chk-ai', label: 'AI link status explicitly known', required: false, checked: false },
    ],
    nodes: createDefaultNodes(),
    witnesses: [],
    portfolio: createDefaultPortfolio(),
    orders: [],
    aiLink: {
      available: false,
      creditRemaining: null,
      lastChecked: Date.now(),
      reason: 'NO_LIVE_LINK_CONFIGURED',
    },
    lastPersistedAt: null,
  };
}

export function loadState(): ControlDeskState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as ControlDeskState;
    // Basic shape guard
    if (!parsed.mode || !Array.isArray(parsed.witnesses)) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: ControlDeskState): void {
  const toSave: ControlDeskState = {
    ...state,
    lastPersistedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
