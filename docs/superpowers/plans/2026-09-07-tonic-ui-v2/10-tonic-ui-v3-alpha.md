# Tonic UI 3 alpha upgrade

User authorized starting the upgrade on2026-10-03 after W3. Target is the previously planned exact3.0.0-alpha.1 for all three direct packages. React18.3.1 satisfies the published React18.3/19 peers; no React/Query/Three upgrade in this slice.

- [x] Inspect published metadata, exports, provider/theme/styles and consumer API compatibility.
- [x] Update direct packages/lock and verify every installed Tonic package uses the compatible v3 graph.
- [x] Correct breaking consumer contracts without changing CNC commands, form ownership or resource lifecycle.
- [x] Run immutable install, migration guard/fixtures, frontend, lint and scoped Node regression gates.
- [ ] Verify SSR bootstrap, development compilation and CI-only production/package gates.
- [ ] Reconcile evidence, status and delivery.

User additionally authorized semantic color token migration. All existing exports remain; Dropdown family is added. General UI JSX and Stylus now use native semantic text/background/border/action/status/shadow tokens; app-owned useColorStyle is removed. Explicit Widget palettes, camera reticles, WebGL/probe diagrams and syntax colors retain domain intent. Dropdown/Autocomplete feature substitutions remain separate work.

Previous full platform CI failures (8290d4ca): macOS ARM SocketConnection ECONNRESET, Windows Grbl callback test reading after a fixed100ms, Linux Electron22 download certificate failure. UI validation/production passes on that revision. Preserve shared CI coverage and distinguish those known failures from this upgrade. No local production build.

Local evidence: [validation](artifacts/v3/validation.json), [API audit](artifacts/v3/api-audit.json), [semantic audit](artifacts/v3/semantic-token-audit.json). Frontend78/504, Node22/641 natural exit, lint0errors/4warnings, guard68fixtures/0violations, immutable install and development compilation pass. Actual provider CSS emission regression reproduced unresolved alpha riskLevel references before the targeted theme override; global variables now emit and light/dark/auto/root cleanup pass. No new browser screenshot or V3 browser claim. Production gate remains CI-only and pending.
