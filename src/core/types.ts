/**
 * Luci Prime — Sealie Federation Control Desk
 * Core types. AUTHORITY ≤ VERIFIED PROOF
 */

export type OperatingMode = 'WATCH' | 'HOLD' | 'EXECUTE';

export type NodeId = 'pretoria' | 'johannesburg' | 'cape-town';

export type OrderStatus = 'draft' | 'hold' | 'done' | 'cancelled';

export type AlertSeverity = 'info' | 'warn' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: number;
  acknowledged: boolean;
  evidenceRef?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  evidenceRef?: string; // only evidence-backed items count toward readiness
  checked: boolean;
  checkedAt?: number;
}

export interface NodeState {
  id: NodeId;
  name: string;
  // Modelled (never presented as live)
  modelledLoadPct: number;
  modelledUplinkMbps: number;
  // Measured (telemetry — may be absent)
  measuredLoadPct: number | null;
  measuredUplinkMbps: number | null;
  lastMeasuredAt: number | null;
  status: 'online' | 'degraded' | 'offline' | 'unknown';
}

export interface Witness {
  id: string;
  timestamp: number;
  claim: string;           // human-readable claim
  payload: string;         // canonical bytes that were hashed
  hash: string;            // SHA-256 of payload
  prevHash: string | null; // null for genesis
  meta?: Record<string, unknown>;
}

export interface Sleeve {
  id: string;
  name: string;
  allocationPct: number; // must sum exactly 100 across portfolio
}

export interface ModelPortfolio {
  id: string;
  name: string;
  sleeves: Sleeve[];
  updatedAt: number;
  // Explicit label: this is a model book only
  isModelBook: true;
}

export interface Order {
  id: string;
  title: string;
  description: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  evidenceRefs: string[];
  // Never implies external action occurred
  externalActionClaimed: false;
}

export interface AiLinkStatus {
  available: boolean;
  creditRemaining: number | null;
  lastChecked: number;
  reason?: string;
}

export interface ControlDeskState {
  mode: OperatingMode;
  alerts: Alert[];
  checklist: ChecklistItem[];
  nodes: NodeState[];
  witnesses: Witness[];
  portfolio: ModelPortfolio;
  orders: Order[];
  aiLink: AiLinkStatus;
  lastPersistedAt: number | null;
}

export const GENESIS_PREV = 'GENESIS';
