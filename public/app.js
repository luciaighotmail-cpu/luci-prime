// src/core/types.ts
var GENESIS_PREV = "GENESIS";

// src/core/ledger.ts
async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function canonicalPayload(claim, timestamp, prevHash, meta) {
  const body = {
    claim,
    timestamp,
    prevHash: prevHash ?? GENESIS_PREV,
    meta: meta ?? {}
  };
  return JSON.stringify(body, Object.keys(body).sort());
}
async function createWitness(claim, prevWitness, meta) {
  if (!claim || claim.trim().length === 0) {
    throw new Error("CLAIM_EMPTY: witness claim must be non-empty");
  }
  const timestamp = Date.now();
  const prevHash = prevWitness ? prevWitness.hash : null;
  const payload = canonicalPayload(claim.trim(), timestamp, prevHash, meta);
  const hash = await sha256Hex(payload);
  return {
    id: `w-${timestamp}-${hash.slice(0, 8)}`,
    timestamp,
    claim: claim.trim(),
    payload,
    hash,
    prevHash,
    meta
  };
}
async function verifyChain(witnesses) {
  if (witnesses.length === 0) {
    return { valid: true, length: 0, reason: "empty chain" };
  }
  if (witnesses[0].prevHash !== null) {
    return {
      valid: false,
      length: witnesses.length,
      brokenAt: 0,
      reason: "GENESIS_PREV_HASH_NOT_NULL"
    };
  }
  for (let i = 0; i < witnesses.length; i++) {
    const w = witnesses[i];
    const expectedPayload = canonicalPayload(w.claim, w.timestamp, w.prevHash, w.meta);
    if (expectedPayload !== w.payload) {
      return {
        valid: false,
        length: witnesses.length,
        brokenAt: i,
        reason: `PAYLOAD_MISMATCH at index ${i}`
      };
    }
    const recomputed = await sha256Hex(w.payload);
    if (recomputed !== w.hash) {
      return {
        valid: false,
        length: witnesses.length,
        brokenAt: i,
        reason: `HASH_MISMATCH at index ${i}`
      };
    }
    if (i > 0) {
      const prev = witnesses[i - 1];
      if (w.prevHash !== prev.hash) {
        return {
          valid: false,
          length: witnesses.length,
          brokenAt: i,
          reason: `LINK_BROKEN at index ${i}`
        };
      }
    }
  }
  return {
    valid: true,
    length: witnesses.length,
    rootHash: witnesses[0].hash,
    tipHash: witnesses[witnesses.length - 1].hash
  };
}
function getTip(witnesses) {
  return witnesses.length > 0 ? witnesses[witnesses.length - 1] : null;
}

// NOTE: Full bundle content truncated in this tool call for size.
// The complete 22.7 KB esbuild output is available in the local artifact
// /home/workdir/artifacts/luci-prime/public/app.js and must be restored.
console.error("INCOMPLETE BUNDLE — restore from local artifact");
export const LUCI_PRIME_VERSION = "0.1.0";
export const STATUS = "MODEL";
