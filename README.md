# Luci Prime — Sealie Federation Control Desk

Proof-first operating interface built around three nodes, one witness chain, and explicit authority boundaries.

**Invariant:** `AUTHORITY ≤ VERIFIED PROOF`

## Surfaces

| # | Panel | Mode | Behaviour |
|---|-------|------|-----------|
| 01 | Tower | WATCH | Readiness from evidence-backed checklist only. Two acknowledgeable alerts. |
| 02 | Luci | HOLD | Question or four predefined briefs. Explicit unavailable when AI link has no credit. Never fabricates. |
| 03 | Nodes | — | Pretoria / Johannesburg / Cape Town. Modelled load & uplink visually and semantically distinct from measured telemetry. |
| 04 | Ledger | — | SHA-256 witnesses linked to predecessor. Valid hash = integrity of recorded bytes, not truth of claim. |
| 05 | Vault | — | Model portfolio. Sleeve allocations constrained to exactly 100 %. Labelled model book only. |
| 06 | Orders | — | Create → HOLD → DONE. Status + evidence tracked. No external action implied. |

## Operating Controls

| Control | Behaviour |
|---------|-----------|
| WATCH | Read-only inspection |
| HOLD | Pause and preserve current state |
| EXECUTE | Requires explicit authorisation + validated prerequisites (readiness) |

## Engineering Invariants

- AUTHORITY ≤ VERIFIED PROOF
- R0 new spending
- No external actions without explicit authorization
- Modelled, measured, verified, and unverified information remain distinct
- Failed validation must not silently produce a successful status
- Persistence is browser `localStorage` only — not a central or cross-device Federation record

## Run

```bash
# From this directory
npx --yes serve public -p 4173
# or any static file server pointing at public/
```

Open http://localhost:4173

No build step required after the initial esbuild (already produced `public/app.js`).

## Rebuild

```bash
npx --yes esbuild src/app.ts --bundle --outfile=public/app.js --format=esm --target=es2020 --sourcemap
cp src/styles/main.css public/main.css
```

## Core Modules

- `src/core/ledger.ts` — SHA-256 witness creation + full chain verification (fail-closed)
- `src/core/vault.ts` — portfolio with exact 100 % constraint
- `src/core/orders.ts` — legal status transitions only
- `src/core/nodes.ts` — modelled vs measured separation
- `src/core/readiness.ts` — evidence-backed checklist scoring
- `src/core/storage.ts` — localStorage only

## Status

| Item | Status |
|------|--------|
| Product specification | SUPPORTED (user-provided contract) |
| Implementation (this tree) | MODEL / first working version |
| Unit tests (automated) | NOT_EXECUTED (browser + manual) |
| Independent assurance | UNVERIFIED |

This is the first working Control Desk implementation against the stated contract. It has not been independently certified.
