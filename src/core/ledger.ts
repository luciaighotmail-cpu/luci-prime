/**
 * Luci Prime Ledger — SHA-256 witness chain
 *
 * A valid hash proves integrity of the recorded bytes,
 * NOT the truth of the underlying claim.
 *
 * Fail-closed: any validation failure returns explicit error.
 */

import { Witness, GENESIS_PREV } from './types';

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Canonical payload format. Deterministic.
 * Changes to this format invalidate prior hashes (intentional).
 */
export function canonicalPayload(claim: string, timestamp: number, prevHash: string | null, meta?: Record<string, unknown>): string {
  const body = {
    claim,
    timestamp,
    prevHash: prevHash ?? GENESIS_PREV,
    meta: meta ?? {},
  };
  // Stable key order
  return JSON.stringify(body, Object.keys(body).sort());
}

export async function createWitness(
  claim: string,
  prevWitness: Witness | null,
  meta?: Record<string, unknown>
): Promise<Witness> {
  if (!claim || claim.trim().length === 0) {
    throw new Error('CLAIM_EMPTY: witness claim must be non-empty');
  }

  const timestamp = Date.now();
  const prevHash = prevWitness ? prevWitness.hash : null;
  const payload = canonicalPayload(claim.trim(), timestamp, prevHash, meta);
  const hash = await sha256Hex(payload);

  const witness: Witness = {
    id: `w-${timestamp}-${hash.slice(0, 8)}`,
    timestamp,
    claim: claim.trim(),
    payload,
    hash,
    prevHash,
    meta,
  };

  return witness;
}

export interface ChainVerificationResult {
  valid: boolean;
  length: number;
  brokenAt?: number;
  reason?: string;
  rootHash?: string;
  tipHash?: string;
}

/**
 * Verify the entire chain.
 * Returns explicit failure reason — never silent success.
 */
export async function verifyChain(witnesses: Witness[]): Promise<ChainVerificationResult> {
  if (witnesses.length === 0) {
    return { valid: true, length: 0, reason: 'empty chain' };
  }

  // Genesis must have null prevHash
  if (witnesses[0].prevHash !== null) {
    return {
      valid: false,
      length: witnesses.length,
      brokenAt: 0,
      reason: 'GENESIS_PREV_HASH_NOT_NULL',
    };
  }

  for (let i = 0; i < witnesses.length; i++) {
    const w = witnesses[i];

    // Recompute hash
    const expectedPayload = canonicalPayload(w.claim, w.timestamp, w.prevHash, w.meta);
    if (expectedPayload !== w.payload) {
      return {
        valid: false,
        length: witnesses.length,
        brokenAt: i,
        reason: `PAYLOAD_MISMATCH at index ${i}`,
      };
    }

    const recomputed = await sha256Hex(w.payload);
    if (recomputed !== w.hash) {
      return {
        valid: false,
        length: witnesses.length,
        brokenAt: i,
        reason: `HASH_MISMATCH at index ${i}: expected ${recomputed}, stored ${w.hash}`,
      };
    }

    // Link integrity
    if (i > 0) {
      const prev = witnesses[i - 1];
      if (w.prevHash !== prev.hash) {
        return {
          valid: false,
          length: witnesses.length,
          brokenAt: i,
          reason: `LINK_BROKEN at index ${i}: prevHash ${w.prevHash} !== previous.hash ${prev.hash}`,
        };
      }
    }
  }

  return {
    valid: true,
    length: witnesses.length,
    rootHash: witnesses[0].hash,
    tipHash: witnesses[witnesses.length - 1].hash,
  };
}

export function getTip(witnesses: Witness[]): Witness | null {
  return witnesses.length > 0 ? witnesses[witnesses.length - 1] : null;
}
