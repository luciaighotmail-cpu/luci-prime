# Luci Prime Implementation Evidence — 2026-10-20

## What was built

First working Control Desk implementation against the user-supplied product contract.

Location: `https://github.com/luciaighotmail-cpu/luci-prime`

### Delivered surfaces
- Tower (WATCH): evidence-backed readiness score, checklist with evidence refs, two ACK-able alerts
- Luci (HOLD): four predefined briefs + free question; explicit UNAVAILABLE when AI link has no credit; never fabricates
- Nodes: Pretoria / Johannesburg / Cape Town with MODELLED vs MEASURED visual and semantic separation
- Ledger: SHA-256 witness creation, predecessor linking, full chain verification (fail-closed with explicit reason)
- Vault: model portfolio, sleeve allocations enforced to exactly 100 %, labelled model book
- Orders: draft → hold → done transitions only; externalActionClaimed always false

### Operating modes
WATCH / HOLD / EXECUTE (EXECUTE gated on readiness)

### Persistence
localStorage key `luci-prime-control-desk-v1` only

### Source modules (in repo)
- `src/core/types.ts`
- `src/core/ledger.ts`
- `src/core/vault.ts`
- `src/core/orders.ts`
- `src/core/nodes.ts`
- `src/core/readiness.ts`
- `src/core/storage.ts`
- `public/index.html`
- `public/main.css`

### Build artefact note
`public/app.js` is produced by:
```bash
npx esbuild src/app.ts --bundle --outfile=public/app.js --format=esm --target=es2020 --sourcemap
```
(The full `src/app.ts` UI layer and the resulting bundle are maintained in the local working tree and can be committed in a follow-up once the source UI module is also pushed.)

## What was not done
- No automated unit test suite executed in CI
- No live AI link integration (intentionally unavailable)
- No measured telemetry feed (nodes start with measured = null)
- No spending
- No external actions

## Status claim
MODEL — first working version against the stated contract.
Not PROVEN. Not independently certified.
