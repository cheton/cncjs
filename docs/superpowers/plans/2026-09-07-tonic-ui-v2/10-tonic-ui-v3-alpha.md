# Tonic UI 3 alpha upgrade

User authorized starting the upgrade on2026-10-03 after W3. Target is the previously planned exact3.0.0-alpha.1 for all three direct packages. React18.3.1 satisfies the published React18.3/19 peers; no React/Query/Three upgrade in this slice.

- [x] Inspect published metadata, exports, provider/theme/styles and consumer API compatibility.
- [x] Update direct packages/lock and verify every installed Tonic package uses the compatible v3 graph.
- [x] Correct breaking consumer contracts without changing CNC commands, form ownership or resource lifecycle.
- [x] Run immutable install, migration guard/fixtures, frontend, lint and scoped Node regression gates.
- [x] Verify SSR bootstrap, development compilation and CI-only production/package gates.
- [x] Reconcile evidence, status and delivery.

User additionally authorized semantic color token migration. All existing exports remain; Dropdown family is added. General UI JSX and Stylus now use native semantic text/background/border/action/status/shadow tokens; app-owned useColorStyle is removed. Explicit Widget palettes, camera reticles, WebGL/probe diagrams and syntax colors retain domain intent. Dropdown/Autocomplete feature substitutions remain separate work.

Previous full platform CI failures (8290d4ca): macOS ARM SocketConnection ECONNRESET, Windows Grbl callback test reading after a fixed100ms, Linux Electron22 download certificate failure. UI validation/production passes on that revision. Preserve shared CI coverage and distinguish those known failures from this upgrade. No local production build.

Local evidence: [validation](artifacts/v3/validation.json), [API audit](artifacts/v3/api-audit.json), [semantic audit](artifacts/v3/semantic-token-audit.json). Frontend78/504, Node22/641 natural exit, lint0errors/4warnings, guard68fixtures/0violations, immutable install and development compilation pass. Actual provider CSS emission regression reproduced unresolved alpha riskLevel references before the targeted theme override; global variables now emit and light/dark/auto/root cleanup pass. No new browser screenshot or V3 browser claim. Production gate passes on c82280d9 ([CI run](https://github.com/cheton/cncjs/actions/runs/37116468021)); downloaded package static review confirms Spinner/animation, preserved language placeholders, semantic CSS and valid entrypoints. Separate full platform workflow is still running at the snapshot, without a completion claim. V3 source/dependency/semantic migration is completed with no new browser visual validation claimed.

User requested a fresh visual rerun on2026-10-03, tracked separately as **V3-V** in STATUS. GPT-6-Luna xhigh owns all browser operations under EXECUTION.md; root reviews screenshots and actual assertion evidence. Target evidence: `artifacts/browser/v3-20261003-luna/`.

- [x] Fresh bundled Chromium metadata and isolated dev lifecycle recorded.
- [x] Light/dark/auto at1440×900 and768×900; live OS changes, semantic color/contrast/layout assertions.
- [x] Administration/Settings, widget/modal states and fixed domain colors reviewed.
- [x] Final filename contrast after fbea2042 and Grbl/Marlin/TinyG/Smoothie light/dark controller UI matrix.
- [x] Root independent screenshot review and any findings resolved/retested.
- [x] Owned runtime/data cleanup and final evidence/delivery reconciled.

Updated platform observation: run37116471004 finished with Linux/Windows/macOS ARM successful. macOS x64 passes initial full checks and production build, then fails DMG packaging at `hdiutil detach -force /dev/disk2`, exit16 (Resource busy). This packaging observation is separate from V3-V.

V3-V source fixes are delivered as f050804e: ToastManager uses slotProps.transition, and pending/empty resource rows keep TanStack table identity stable. The empty-row model regression fails before the fix and passes after; frontend78/505, lint0errors4existingwarnings, guard361files18classes0violations/68fixtures pass. UI production run37127637668 and full four-platform run37127637705 both succeed, including all binary packaging. Fresh post-table-fix routes pass15/15 and no update-depth/unclassified application errors; focused badge/Marlin and owned cleanup were pending at that historical checkpoint; the final closure below supersedes it.


Final focused browser evidence on fbea2042 passes: filename/badge2cases with24px fixed-light filename3.71:1 after actual color-alpha×element-opacity composition against the white WebGL canvas; badge6.411:1light/9.573:1dark. Each uses one explicitly authorized comment-only sender_load; no motion/run/jog commands. Grbl/Marlin/TinyG/Smoothie × light/dark passes8cases/32gates with zero outgoing controller commands/page errors/request failures. Grbl uses live simulator/parser state; other controllers use incoming state/settings replay. Root reviewed all eight body captures and both filename/badge captures. Controller text/icon color sampling is not a blanket contrast claim for every leaf. Production37130650516 and four-platform37130650504 pass on fbea2042. Owned runtime, listeners, tty and fixture/config cleanup pass; root restored17generated locale outputs after verifying all prior values unchanged. V3-V is completed on2026-10-06; evidence/ledger delivery follows the validated source.
