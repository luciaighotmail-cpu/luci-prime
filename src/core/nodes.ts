/**
 * Nodes — Pretoria, Johannesburg, Cape Town
 * Modelled values must never appear as verified live readings.
 */

import { NodeState, NodeId } from './types';

export function createDefaultNodes(): NodeState[] {
  return [
    {
      id: 'pretoria',
      name: 'Pretoria (Tshwane)',
      modelledLoadPct: 42,
      modelledUplinkMbps: 850,
      measuredLoadPct: null,
      measuredUplinkMbps: null,
      lastMeasuredAt: null,
      status: 'unknown',
    },
    {
      id: 'johannesburg',
      name: 'Johannesburg',
      modelledLoadPct: 58,
      modelledUplinkMbps: 1200,
      measuredLoadPct: null,
      measuredUplinkMbps: null,
      lastMeasuredAt: null,
      status: 'unknown',
    },
    {
      id: 'cape-town',
      name: 'Cape Town',
      modelledLoadPct: 31,
      modelledUplinkMbps: 640,
      measuredLoadPct: null,
      measuredUplinkMbps: null,
      lastMeasuredAt: null,
      status: 'unknown',
    },
  ];
}

/**
 * Update measured telemetry. Explicitly separates from modelled.
 */
export function applyMeasured(
  nodes: NodeState[],
  nodeId: NodeId,
  loadPct: number,
  uplinkMbps: number
): NodeState[] {
  return nodes.map(n => {
    if (n.id !== nodeId) return n;
    return {
      ...n,
      measuredLoadPct: loadPct,
      measuredUplinkMbps: uplinkMbps,
      lastMeasuredAt: Date.now(),
      status: loadPct > 90 ? 'degraded' : 'online',
    };
  });
}
