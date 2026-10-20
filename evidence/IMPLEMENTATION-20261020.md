# Luci Prime Implementation Evidence — 2026-10-20

## What is on GitHub (`main`)

- Core modules: types, ledger, vault, orders, nodes, readiness, storage
- public/index.html, public/main.css
- docs/CONTRACT.md, RELEASE_NOTES_v0.1.0.md, package.json
- src/app.ts marker (version, surfaces, invariants)

## What remains local (session working tree)

- Full interactive `src/app.ts` UI implementation (~18KB)
- Bundled `public/app.js` from esbuild

Path: working directory artifacts under luci-prime (session).

Rebuild when full UI is committed:

```bash
npm run build   # or: npx esbuild src/app.ts --bundle --outfile=public/app.js --format=esm --target=es2020 --sourcemap
npm run serve
```

## Status

**MODEL** — first working Control Desk against the product contract.
Not PROVEN. Not independently certified.

## Related

- Federation Control Tower: sealie-federation `docs/CONTROL-TOWER-20261020.md`
