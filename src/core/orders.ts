/**
 * Orders surface
 * Create, HOLD, mark done. Track status + evidence.
 * Never implies that an external action occurred.
 */

import { Order, OrderStatus } from './types';

export function createOrder(title: string, description: string = ''): Order {
  if (!title.trim()) {
    throw new Error('ORDER_TITLE_EMPTY');
  }
  const now = Date.now();
  return {
    id: `ord-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description.trim(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    evidenceRefs: [],
    externalActionClaimed: false,
  };
}

export function transitionOrder(
  order: Order,
  next: OrderStatus,
  evidenceRef?: string
): { ok: true; order: Order } | { ok: false; reason: string } {
  // Allowed transitions (fail-closed)
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    draft: ['hold', 'cancelled'],
    hold: ['done', 'cancelled', 'draft'],
    done: [],          // terminal
    cancelled: [],     // terminal
  };

  if (!allowed[order.status].includes(next)) {
    return {
      ok: false,
      reason: `ILLEGAL_TRANSITION_${order.status}_TO_${next}`,
    };
  }

  const updated: Order = {
    ...order,
    status: next,
    updatedAt: Date.now(),
    evidenceRefs: evidenceRef
      ? [...order.evidenceRefs, evidenceRef]
      : order.evidenceRefs,
    externalActionClaimed: false, // invariant
  };

  return { ok: true, order: updated };
}
