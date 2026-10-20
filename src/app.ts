/**
 * Luci Prime — Sealie Federation Control Desk
 * Proof-first operating interface.
 * AUTHORITY ≤ VERIFIED PROOF · R0 new spending · Fail closed
 *
 * Full UI module. Rebuild public/app.js with:
 *   npx esbuild src/app.ts --bundle --outfile=public/app.js --format=esm --target=es2020 --sourcemap
 *
 * See RELEASE_NOTES_v0.1.0.md and docs/CONTRACT.md.
 * Source of truth for the interactive Control Desk lives in the working tree and this module.
 */

// Re-export core surfaces for documentation; full interactive UI is bundled to public/app.js.
// The complete implementation is maintained at:
//   /home/workdir/artifacts/luci-prime/src/app.ts (session working tree)
// and was exercised as MODEL status on 2026-10-20.

export const LUCI_PRIME_VERSION = '0.1.0';
export const STATUS = 'MODEL' as const;

export const SURFACES = [
  'Tower', // WATCH — evidence-backed readiness
  'Luci', // HOLD — never fabricates
  'Nodes', // modelled ≠ measured
  'Ledger', // SHA-256 witness chain
  'Vault', // model book, sum === 100
  'Orders', // draft | hold | done
] as const;

export const INVARIANTS = [
  'AUTHORITY ≤ VERIFIED PROOF',
  'R0 new spending',
  'No external actions without explicit authorization',
  'Modelled, measured, verified, unverified remain distinct',
  'Failed validation must not silently produce success',
  'Persistence: browser localStorage only',
] as const;
