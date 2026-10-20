# Luci Prime Product Contract (2026-10-20)

Source of truth for this implementation turn.

## 01 Tower — WATCH
- Operational posture, manned-layer checklist, live pulse
- Two individually acknowledgeable alerts
- Readiness calculated from evidence-backed checklist items only (not document filing)

## 02 Luci — HOLD
- Accept a question or one of four predefined briefs
- If live AI link has no credit → explicit unavailable status
- Never fabricate responses or imply a live connection

## 03 Nodes
- Pretoria, Johannesburg, Cape Town
- Display modelled load and uplink separately from measured telemetry
- Simulated values must never appear as verified live readings

## 04 Ledger
- Create SHA-256 witnesses
- Link each witness to its predecessor
- Verify chain integrity
- A valid hash proves integrity of the recorded bytes, not the truth of the underlying claim

## 05 Vault
- Model portfolio with linked sleeve allocations constrained to exactly 100 %
- Clearly labelled as a model book: no custody, executed trades, or verified account balances

## 06 Orders
- Create orders, place them on hold, or mark them done
- Track status and evidence without implying that an external action occurred

## Operating controls
| Control | Behaviour |
|---------|-----------|
| WATCH | Read-only inspection |
| HOLD | Pause and preserve the current state |
| EXECUTE | Require explicit authorization and validated prerequisites |

## Persistence
Witnesses, orders, and sleeve allocations remain in the current browser's storage.
They are not automatically a central, backed-up, or cross-device Federation record.

## Engineering invariants
- AUTHORITY ≤ VERIFIED PROOF
- R0 new spending
- No external actions without explicit authorization
- Modelled, measured, verified, and unverified information remain distinct
- Failed validation must not silently produce a successful status
