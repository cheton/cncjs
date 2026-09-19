# Migration task status

更新日期：2026-09-19。執行模式：**implementation / active**。計畫文件完成不代表實作完成；目前依 task ledger 執行。

本檔是任務狀態唯一來源；[HANDOFF](HANDOFF.md) 是恢復入口，[執行規則](EXECUTION.md) 定義狀態轉移。不要由聊天歷史或已消失的 /tmp 文件猜進度。

## Current checkpoint

- Active task: **G1**（Connection；started 2026-09-19T10:37:18+08:00；現在 `blocking`）
- Main: current root session（非 Terra；此限制已記錄）；Q2 used the plan-default `gpt-5.6-luna` / high scope because the consumer audit was fixed and the work was dependency removal plus bounded cache regression verification.
- Next eligible task: **G1** is blocked by G1-B01; no parallel task is authorized in this lane.
- Current blockers: G1-B01 requires open/close request timeout and stale-response protection, but the current execution brief limits production changes to `src/app/widgets/Connection/` and forbids reducer/saga changes. Redux/controller own the connection state, so this contract cannot be proven within the authorized scope. BR0 is waived, not passed, by explicit user direction. Existing browser evidence still proves only connection/upload/Run/Pause/Resume; remaining browser gaps are carried to R6. System Chrome channel remains unsupported for screenshots.
- D3 naming decision: remaining scope is host dispatch, so the test is named `WidgetHost.test.jsx`. The runtime contract is `view` (`normal`／`collapsed`／`fullscreen`) plus `onViewChange(view)`; `WidgetUI`/`chrome` names are not part of the active API.
- Source inventory baseline: f301cde7；最近已見文件提交 e09a642c。接手時重新記錄 HEAD/worktree，不硬編碼此值為當前 HEAD。
- Validation: `98ceb1f6` 修正 `Console` `term.current.clear` crash（`term.clear()`），並新增 `Console.test.jsx`；該 commit 上 full frontend 為 11 suites / 32 tests pass、`yarn eslint` 0 errors、development build 編譯成功（僅既有 `Connection.jsx` warning）。D4 focused tests pass 5 suites / 22 tests; full frontend passes 10 suites / 31 tests; `yarn eslint` exits 0 with 17 existing warnings; `yarn build` compiles successfully with existing bundle-size and i18next scanner warnings. The negative Workspace instance-control scan is clean. The full Jest path is not a D4 completion gate: `SocketConnection` remains excluded per user direction, and the prior sandbox server run recorded `listen EPERM` separately. BR0 browser gaps are waived for the current implementation path and must be re-run at R6.

## Explicit waiver

- Decision: 2026-09-13，使用者明確要求不要卡在 BR0，允許後續 implementation 繼續。
- Scope: `BR0` 改為 `waived`；`R0` 直接依賴 `H3` 開始。此 waiver 不宣稱 BR0 browser gates 通過，也不改寫既有 blocker/evidence。
- Deferred evidence: Stop、jog press/release、disconnect、100,000-line fixture、5,000-node watch tree、768×900/1440×900 browser captures，以及 `Connection.jsx` 新 selector 的 browser verification。
- Risk / final gate: R0 需把未驗證項目列為 carry-forward；R6 必須補齊等價 browser/performance evidence，W3 前不得保留未解的 browser gap。
- Future UI option: `react-select` 暫不在本次 waiver 中替換；後續可依 `00-design.md` 評估 Tonic `MenuButton/MenuList/MenuItem` domain selector，先證明 keyboard、focus、selected value、disabled、ARIA/i18n 與既有 metadata/callback contract 等價。

## Task ledger

依賴是完成條件；R1/R2/R4/R5 的案例需在對應重構開始前準備，通過 gate 才在表中 completed，避免反向循環依賴。

| ID | Plan / deliverable | Depends on | Status | Owner / updated | Evidence / blocker |
| --- | --- | --- | --- | --- | --- |
| F1 | [環境與既有行為](01-foundation.md) | — | completed | root session / 2026-09-07T13:40:00+08:00 | Session-path blocker resolved by removing both app-level and outer-host file sessions; focused tests pass. Browser/frontend regression remains pending. |
| FIX-001 | 移除 file-based session | — | completed | root session / 2026-09-07T13:40:00+08:00 | App-level middleware/direct deps removed; no-cookie signin test passes. |
| FIX-002 | 吸收 webappengine host 並移除 dependency | FIX-001 | completed | root session / 2026-09-07T13:40:00+08:00 | Local host preserves static/server routes and HTTP `ready`/`error`; focused host/app tests pass; `yarn why` finds no webappengine/session-file-store/express-session path. |
| H1 | [frontend config](details/01a-test-harness.md) | F1 | completed | root session / 2026-09-07T14:25:00+08:00 | `9478abf0`; isolated jsdom config, script, exact dependencies, and mocks. Fresh checks: frontend discovery (0 H1 tests), Node/simulator discovery (18 suites), immutable install, ESLint (0 errors; 17 existing warnings), diff check. Independent review approved. |
| H2 | [providers tests](details/01a-test-harness.md) | H1 | completed | root session / 2026-09-07T14:35:00+08:00 | `17033b7a`; each render gets a new QueryClient, Tonic provider smoke tests cover Button/theme/shared client/dispose cleanup. Fresh focused and frontend suite: 4/4 pass; Node `DEP0040` warning remains pre-existing. Independent review approved. |
| H3 | [lifecycle 工具](details/01a-test-harness.md) | H2 | completed | root session / 2026-09-07T14:45:00+08:00 | `fcaf92f9`; exact deferred utility with resolve/reject tests. Fresh focused test and frontend suite: 6/6 pass; Node `DEP0040` warning remains pre-existing. Independent review approved. |
| BR0 | [可重跑 browser baseline](details/09a-browser-procedure.md) | H3 | waived | root session / 2026-09-13T20:20:00+08:00 | Explicit user waiver. `artifacts/browser/br0-20260913-191850/` proves connection, small upload, and Run/Pause/Resume; Stop/jog/disconnect/large/watch/viewport and new selector browser evidence remain unverified and are deferred to R6. |
| R0 | [原版 baseline](09-regression-gates.md) | H3 (BR0 waived) | completed | root session / 2026-09-13T20:35:00+08:00 | [`regression-baseline.md`](regression-baseline.md); frontend characterization 5/5 suites and 9/9 tests pass; geometry oracle preserved. BR0 browser gaps are explicitly carry-forward to R6. |
| D1 | [layout 純資料](details/02a-widget-state.md) | R0 | completed | root session / 2026-09-13T20:48:00+08:00 | `widgetRegistry.js`, `widgetLayoutState.js`, and `__tests__/widgetLayoutState.test.js`; focused and full frontend suites pass (4/4 and 6/6 suites respectively). Pure helpers preserve no-op/object identity; registry covers 17 widgets and controller filtering. |
| D2 | [Layout Provider](details/02a-widget-state.md) | D1 | completed | root session / 2026-09-13T21:35:00+08:00 | `WorkspaceLayoutProvider.jsx`, hook entry files, hydration utility, config wiring, and tests; full frontend 8 suites / 21 tests and build pass. Covers successful/corrupt hydration, restoreDefault remount, fullscreen, bulk filtering, config subscriptions, and group ids. |
| D3 | [16 shells 接線](details/02a-widget-state.md) | D2 | completed | root session / 2026-09-13T21:56:00+08:00 | `Widget.jsx` is the function-based `WidgetHost` with registry lookup, `view`/`onViewChange(view)` dispatch, Visualizer bypass, and unknown→null behavior. All 16 layout-aware shells consume the view contract without local layout state/persistence; `WidgetHost.test.jsx` covers host dispatch and shell forwarding. D4 Workspace wiring completed in the following task. |
| D4 | [Workspace 接線](details/02a-widget-state.md) | D3 | completed | root session / 2026-09-14T00:09:05+08:00 | Added `WorkspaceRoot` layout Provider boundary, function group containers with config-backed ids and one PubSub subscription each, selector-based controller filtering, toolbar `setWidgetsCollapsed` actions, fork/remove/sort persistence, active-id fullscreen cleanup, and `WidgetGroups.test.jsx`. Focused D4 command: 5 suites / 22 tests; full frontend: 10 suites / 31 tests; ESLint/build/diff checks pass. Browser gates remain waived/deferred to R6. |
| R1 | [Widget view contract 驗收](09-regression-gates.md) | D4 | completed | root session / 2026-09-18T17:58:00+08:00 | `WidgetLayoutContract.test.jsx`: 16 real frame shells, view/fullscreen/accessibility/lifecycle/fork/side-effect assertions; focused 36/36, nearby 55/55, full frontend 12 suites/68 tests; ESLint clean. Fixed missing Autolevel `aria-expanded`. |
| R2 | [Workspace 驗收](09-regression-gates.md) | D4 | completed | root session / 2026-09-18T18:22:42+08:00 | `WidgetGroups.test.jsx` and `WidgetLifecycle.test.jsx`: reorder, sortable contract, fork/remove, controller filtering, config bursts, idempotent bulk view, hydration/corrupt data, StrictMode listener cleanup; focused 15/15, nearby 65/65, full frontend 13 suites/78 tests; ESLint clean. |
| U2 | [primitives pilot](02-shared-ui.md) | R1, R2 | completed | root session / 2026-09-18T19:40:40+08:00 | Direct Tonic pilot in Spindle/GCode; Spindle behavior tests cover M7/M8/M9/M3/M4/M5, disabled state, and speed persistence. Full frontend 16 suites/91 tests; ESLint clean. Remaining legacy consumers logged. |
| U3 | [overlay/form 合約](02-shared-ui.md) | U2 | completed | root session / 2026-09-18T20:01:41+08:00 | Custom SettingsModal uses direct Tonic Modal/Button/Input/layout primitives with explicit focus, Escape, and overlay settings; six interaction tests cover submit success/failure, cancel, overlay/Escape, nested close order, and focus restoration. Focused 1 suite/6 tests, nearby 3 suites/46 tests, full frontend 17 suites/97 tests; ESLint 0 errors (17 existing warnings); diff check clean. `useToast` was already Tonic-based and unchanged. |
| B0 | [HTTP import baseline](details/03b-query-boundaries.md) | H3 | completed | root session / 2026-09-07T18:55:00+08:00 | `query-boundary-baseline.md`; direct imports classified by endpoint, operation, owner task, and explicit exceptions. Static audit only; no transport or browser behavior run. |
| B1 | [session boundary](details/03b-query-boundaries.md) | B0, U3 | completed | root session / 2026-09-18T20:44:00+08:00 | Added `useSigninMutation`/pure signin export, LoginPage pending/error boundary, logout `signout → cancelQueries → clear` ordering, and bootstrap shared-transport caller. Focused B1 tests: 3 suites / 8 tests pass; full frontend: 20 suites / 105 tests pass; changed-file ESLint and diff checks pass. |
| M1 | [Macro query](details/03a-query-contract.md) | B0, U3 | completed | root session / 2026-09-18T20:50:29+08:00 | Shared `src/app/queries/macros.js` owns list/detail/CRUD hooks; Administration imports the shared module and retains a re-export compatibility layer. Focused M1 tests: 10 pass; full frontend: 21 suites / 115 tests pass; development build compiled; ESLint and diff checks pass. |
| M2 | [Macro mutation](details/03a-query-contract.md) | M1 | completed | root session / 2026-09-18T22:25:00+08:00 | Shared CRUD hooks cover exact endpoints/variables, prefix invalidation before caller success, failure isolation, and retry=false even when requested by callers. Main App now mounts one MacroQueryEvents bridge and one session cache boundary; focused 3 suites/20 tests pass. |
| M3 | [Macro UI](details/03a-query-contract.md) | M2 | completed | root session / 2026-09-18T22:55:00+08:00 | Commit `db0db29e`; `Macro.test.jsx` and `MacroMutations.test.jsx` cover query view states, mutation failure retention, pending locks, and nested delete close order. Full frontend: 25 suites / 141 tests; build-dev compiled; ESLint 0 errors / 17 existing warnings; diff check clean. |
| Q2-cleanup | [fetch machine 移除與跨畫面驗收](03-query-and-macro.md) | M3 | completed | root session / 2026-09-18T23:25:00+08:00 | Commit `730a0045`; removed `xstate` and `@xstate/react` after a clean repo-wide audit. Shared-cache regression proves unfiltered widget and paginated Administration observers refetch after one mutation. Full frontend: 25 suites / 142 tests; build-dev compiled; ESLint 0 errors / 17 existing warnings; diff check clean. |
| G1 | [Connection](04-general-widgets.md) | U3, Q2-cleanup | blocking | root session / 2026-09-19T17:18:18+08:00 | Partial implementation and tests are complete: focused Connection suite 10/10, full frontend 26 suites/152 tests, `yarn build-dev` exit 0, ESLint exit 0 with 17 existing warnings, and diff check clean. G1-B01 remains: request timeout/generation and late open-after-disconnect protection require reducer/saga ownership outside the authorized Connection-only scope. |
| G2 | [GCode](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G3 | [Spindle](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G4 | [Laser](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G5 | [Probe](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G6 | [Custom](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G7 | [Webcam](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| T1 | [Terminal baseline](details/04a-terminal-owner.md) | U3 | completed | root session / 2026-09-18T21:40:00+08:00 | `Console.test.jsx` covers all seven owner consumers, close ref shape, connection read/write/self-echo, resize, widget actions, and distinct sender ids. Focused 6/6; full frontend 21 suites/120 tests; build-dev, ESLint, and diff checks pass. No production change. |
| T2 | [Terminal owner](details/04a-terminal-owner.md) | T1 | completed | root session / 2026-09-18T21:55:01+08:00 | `useTerminal` owns xterm/input/history/paste/resources; Terminal is a DOM view and Console uses the seven T1 actions. Focused 2 suites/9 tests; full frontend 22 suites/123 tests; build-dev, ESLint, and diff checks pass. T3 gates remain separate. |
| T3 | [Terminal lifecycle](details/04a-terminal-owner.md) | T2 | completed | root session / 2026-09-18T22:01:00+08:00 | Reconnect disposal/recreation, latest Enter callback, history/paste/actions, resize, and StrictMode resource tests pass. Focused 2 suites/12 tests; full frontend 22 suites/126 tests; ESLint and diff checks pass. Browser evidence remains R6. |
| C1 | [Grbl](05-controller-widgets.md) | G4 | todo | — | — |
| C2 | [Marlin](05-controller-widgets.md) | G4 | todo | — | — |
| C3 | [Smoothie](05-controller-widgets.md) | G4 | todo | — | — |
| C4 | [TinyG/g2core](05-controller-widgets.md) | G4 | todo | — | — |
| S1 | [Settings draft](details/06a-controlled-settings.md) | U3, Q2-cleanup | todo | — | — |
| S2 | [MDI query](details/06a-controlled-settings.md) | S1 | todo | — | — |
| S3 | [Settings tabs](details/06a-controlled-settings.md) | S2 | todo | — | — |
| S4 | [Settings save](details/06a-controlled-settings.md) | S3 | todo | — | — |
| A1b | [Axes input](06-motion-widgets.md) | S4, G4 | todo | — | — |
| A2 | [Tool](06-motion-widgets.md) | A1b | todo | — | — |
| A3a | [Autolevel forms](06-motion-widgets.md) | A1b | todo | — | — |
| A3b | [Autolevel workflow](06-motion-widgets.md) | A3a | todo | — | — |
| R3 | [geometry baseline](09-regression-gates.md) | R0 | completed | root session / 2026-09-18T18:43:47+08:00 | Real `three` + `GCodeVisualizer` geometry, arc-plane samples, units, empty/reload/frame cases, and Visualizer pivot/profile transitions; focused 10/10 R3, Visualizer nearby 12/12, full frontend 15 suites/88 tests; ESLint clean. |
| V1 | [toolbar/watch directory](07-visualizer.md) | A3b, U3 | todo | — | — |
| E1 | [load characterization](details/07a-visualizer-engine.md) | R3, A3b | todo | — | — |
| E2 | [engine extraction](details/07a-visualizer-engine.md) | E1 | todo | — | — |
| E3 | [engine ownership](details/07a-visualizer-engine.md) | E2 | todo | — | — |
| E4 | [owner integration](details/07a-visualizer-engine.md) | E3, V1 | todo | — | — |
| R4 | [resources 驗收](09-regression-gates.md) | E4, T3 | todo | — | — |
| R5 | [commands 驗收](09-regression-gates.md) | E4, A1b, A3b, T3, C1, C2, C3, C4 | todo | — | — |
| W1 | [Workspace domain](08-workspace-and-cleanup.md) | G1, G2, G3, G4, G5, G6, G7, T3, C1, C2, C3, C4, A2, A3b, E4, B1 | todo | — | — |
| P0 | [unused families](details/08a-component-families.md) | U3 | completed | root session / 2026-09-18T22:15:00+08:00 | Deleted all 14 P0 families after graph/literal zero-consumer audit. `Notifications/ToastNotification` remains separate P1 code. Full frontend 22 suites/126 tests; build-dev, ESLint, and diff checks pass. |
| P1 | [overlays](details/08a-component-families.md) | W1, P0 | todo | — | — |
| P2 | [forms](details/08a-component-families.md) | P1 | todo | — | — |
| P3 | [layout](details/08a-component-families.md) | P2 | todo | — | — |
| P4 | [Administration tables](details/08a-component-families.md) | P3 | todo | — | — |
| P5 | [domain families](details/08a-component-families.md) | P4 | todo | — | — |
| P6 | [class 對帳](details/08a-component-families.md) | P5 | todo | — | — |
| B3 | [static migration gate](details/03b-query-boundaries.md) | P6, B1 | todo | — | — |
| R6 | [全 browser/performance 驗收](09-regression-gates.md) | B3, R4, R5 | todo | — | — |
| W3 | [依賴清理與最終 gate](08-workspace-and-cleanup.md) | R6 | todo | — | — |

## 父 task 對應（不再另領一次）

| 父 task | 唯一執行單位 |
| --- | --- |
| F2 | H1–H3 |
| U1a/U1b | D1–D4 + R1/R2；D3/D4 為同一可交付整合批次 |
| Q1 | M1/M2 |
| Q2 | M3 + Q2-cleanup；cleanup 僅做未由 M3 完成的刪除、跨畫面驗收 |
| G8 | T1–T3 |
| A1a | S1–S4 |
| A3 | A3a/A3b |
| V2/V3 | E1–E4 + R4/R5 |
| W2 | P0–P6 |
| B2 | M1–M3、S2/S4、A2/A3b、V1、W1 的資源搬移彙總，不另實作 |

## Blocker records

### F1-B01 — controlled backend session path

- Observed failure + exact command / exit code: required backend command not run (N/A) after source review showed it would execute `rimraf.sync('/home/cheton/.cncjs-sessions')` then `fs.mkdirSync()` during startup.
- Cause / evidence path: `src/server/config/settings.base.js:70-72` resolves session storage from `HOME`; `src/server/app.js:192-196` unconditionally removes and recreates it. The CLI has no session-path option and the temporary `--config` does not override this settings value.
- Attempts and results: confirmed a temporary `--config` can isolate `.cncrc`; read-only check confirmed `/home/cheton/.cncjs-sessions` exists. Did not set `HOME`, start the backend, or alter user-owned state.
- Required unblock action / owner: user decides whether to authorize a narrowly scoped, supported session-path configuration for controlled test runs; implementation owner then adds and verifies that interface.
- Next check condition: a supported session path can point to `/tmp` without repurposing `HOME`; restart F1 browser baseline with the temporary config and session directory.
- Unaffected eligible tasks: none; H1 depends on F1.

### FIX-001-B02 — webappengine outer file session

- Observed failure + exact command / exit code: source inspection after direct cleanup; no server start run, exit N/A.
- Cause / evidence path: `src/server/index.js:236` starts `webappengine`; `node_modules/webappengine/src/app/app.standalone.js:155-166` removes/recreates `./sessions` and registers its own `express-session` + `session-file-store`. `yarn why` identifies this as the remaining dependency path.
- Attempts and results: direct app middleware/manifest cleanup completed with a real `/api/signin` no-`Set-Cookie` test; it does not govern the outer host created by `webappengine`.
- Required unblock action / owner: user authorizes a scoped replacement or upgrade of the `webappengine` host that preserves CNCjs route mounting, proxy/static behavior, and the HTTP server passed to Socket.IO, but does not add session middleware.
- Next check condition: a full `createServer()` integration test starts without creating `sessions` and preserves JWT HTTP/Socket.IO behavior.
- Unaffected eligible tasks: none; full browser F1 baseline needs the server host.

### BR0-B03 — browser screenshot protocol unavailable (resolved for bundled Chromium)

- Observed failure + exact command / exit code: system Chrome channel screenshot failed with `Protocol error (Page.captureScreenshot): Unable to capture screenshot`; bundled Chromium now passes.
- Cause / evidence path: the installed global Playwright 1.62.1 can control Chrome 152.0.7977.64 enough for navigation/snapshot, but the screenshot CDP command is unavailable in this browser/runner pair.
- Attempts and results: `playwright screenshot -b chromium about:blank /tmp/cncjs-playwright-br0.png` succeeded with a 4,254-byte PNG.
- Required unblock action / owner: use Playwright's bundled Chromium for BR0; keep system Chrome channel failure recorded as an environment limitation.
- Next check condition: bundled Chromium captures a snapshot and screenshot at `http://127.0.0.1:8080` after `yarn build-dev` and the prescribed server/app startup.
- Unaffected eligible tasks: non-browser unit tasks remain eligible only where their dependency graph allows them; BR0/R0 browser baseline cannot proceed.

### BR0-B04 — date-fns v4 G-code stats formatting (resolved)

- Observed failure + exact command / exit code: Luna medium browser run loaded the small fixture, then showed a React runtime overlay with `RangeError: Use \`yyyy\` instead of \`YYYY\`` from `GCodeStats.jsx`; the browser run could not continue to workflow controls.
- Cause / evidence path: `src/app/widgets/GCode/GCodeStats.jsx` used the pre-v4 `YYYY` token and divided a millisecond timestamp by `1000` before calling `date-fns@4.1.0` `format()`.
- Attempts and results: added a failing frontend test first; changed the token to `yyyy` and passed the millisecond timestamp unchanged. `yarn test:frontend src/app/widgets/GCode/__tests__/GCodeStats.test.js --runInBand` and the full frontend suite pass; commit `776b707c`.
- Required unblock action / owner: rerun only the affected BR0 pending browser cases against the fixed dev bundle using Luna medium.
- Next check condition: no GCodeStats runtime overlay after loading the small fixture; Run/Pause/Resume/Stop and disconnect controls can be exercised in the same fresh lifecycle.
- Unaffected eligible tasks: none for BR0; existing port 8000/8080 ownership remains a separate blocker.

### BR0-B05 — simulator bridge and bind environment

- Resolution checkpoint: 2026-09-13T18:58:21+08:00 — user authorized the required environment changes; `brew install socat` exited 0, `/opt/homebrew/bin/socat` reports version 1.8.1.3, and ports 8000/8080 are free. BR0 is resumed for a fresh Luna-medium lifecycle; retain the historical failure evidence below.

- Observed failure + exact command / exit code: `yarn build-dev` exited 0. `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` exited 1 in the sandbox with `socat is not installed` and `listen EPERM` for `0.0.0.0:8000` / `0.0.0.0:8080`; an elevated retry exited 1 with the same missing-`socat` failure.
- Cause / evidence path: `grbl-simulator/start-with-cncjs.sh` requires `command -v socat` before creating `/tmp/ttyGRBL`; `scripts/start-server-dev.sh` and webpack dev server require the configured backend/frontend binds. The durable evidence is `artifacts/browser/br0-20260913-184213/README.md`, `commands.md`, and `results.json`.
- Attempts and results: the worker used the exact repository-root `yarn dev` lifecycle, did not start a separate simulator, created the synthetic fixtures and copied the anonymous config to `/tmp`, then stopped only its own failed lifecycle. No browser runner was invoked. Cleanup found no listeners on 8000/8080 and no `/tmp/ttyGRBL`.
- Required unblock action / owner: provide `socat` in the execution environment and an execution context permitted to bind the required 8000/8080 addresses; environment owner or user supplies that capability, then rerun BR0 with Luna medium.
- Next check condition: `command -v socat` returns an executable; the exact `CONFIG_PATH=... SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle stays up with simulator, frontend, and backend listeners; `/tmp/ttyGRBL` exists; then run the remaining bundled-Chromium browser cases.
- Unaffected eligible tasks: no downstream baseline or UI migration task may claim BR0/R0 browser evidence; existing completed unit/static tasks remain unchanged.

### BR0-B06 — browser runner timeout after port selection

- Resolution checkpoint: 2026-09-13T19:31:37+08:00 — `br0-20260913-191850` used direct bundled Chromium with action-level handling; React Select and the post-selection connection flow completed. The remaining failure is fixture timing (`Stop` became disabled after the short program completed), not browser-runner availability. BR0 remains in progress for the missing gates.

- Observed failure + exact command / exit code: fresh Playwright Chromium reached the anonymous Workspace, selected `/tmp/ttyGRBL`, emitted `selected`, then the browser command exceeded its 30-second limit with no exit code. The exact `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle exited 0 after graceful worker cleanup.
- Cause / evidence path: simulator/backend/frontend were healthy and the page had no new page errors; the browser runner/session timed out during the post-selection connection interaction. `agent.browsers.list()` returned no available in-app browser instances, the default Playwright launch lacked its expected headless-shell executable, and the explicit installed Chrome for Testing fallback reached the page. Evidence: `artifacts/browser/br0-20260913-185821/README.md`, `commands.md`, `results.json`, and `workspace-1440x900.png`.
- Attempts and results: server ports and `/tmp/ttyGRBL` were confirmed; anonymous Workspace and port selection were captured. The worker stopped only its own lifecycle. No browser retry was made after the timeout, and no connection or workflow result is claimed.
- Required unblock action / owner: resolved for the connection portion by `br0-20260913-191850`; remaining gates need a separate long-fixture run with action-level timeout handling. Do not use system Chrome screenshots or bypass the post-selection connection assertion.
- Next check condition: a fresh run uses the proven visible-parent/keyboard React Select interaction, then completes the remaining BR0 cases and cleanup.
- Unaffected eligible tasks: BR0 and dependent R0 remain incomplete; existing completed unit/static tasks remain unchanged.

### BR0-B07 — browser backend unavailable on a remaining-gates retry

- Observed failure + exact command / exit code: the Luna medium retry initialized the prescribed `yarn dev` lifecycle and then reported `agent.browsers.list() = []`; no browser gates ran. Lifecycle cleanup completed with ports 8000/8080 and `/tmp/ttyGRBL` absent.
- Cause / evidence path: the browser runtime had no available backend in that worker session. Durable evidence: `artifacts/browser/br0-20260913-193330/README.md`, `commands.md`, and `results.json`.
- Attempts and results: config/watch setup and lifecycle compilation succeeded; the worker correctly made no browser claims and made no source changes. A prior same-date Luna run had already demonstrated direct bundled Chromium availability, so this is a retry-surface limitation rather than a product finding.
- Required unblock action / owner: provide a functioning Luna browser surface or use the already proven direct bundled Playwright fallback; do not mark BR0 complete from lifecycle-only evidence.
- Next check condition: bundled Chromium produces durable assertions for the missing Stop/jog/disconnect/large/watch cases, with cleanup checks.
- Unaffected eligible tasks: completed tasks remain unchanged; BR0/R0 remain incomplete.

### BR0-B08 — React Select test locator does not target the existing visible control

- Observed failure + exact command / exit code: `br0-20260913-193707` timed out after 8 seconds using `getByRole('option')` for `/tmp/ttyGRBL`; `br0-20260913-194320-30867` timed out after 15 seconds clicking `#react-select-2-input`, which resolves to a hidden readonly `css-*-dummyInput`. Neither run reached downstream gates.
- Cause / evidence path: the port entry is rendered by `react-select` as a generic visible option surface, while the input id is an invisible dummy input. Existing `artifacts/browser/port-selection/02-open-menu.txt` shows the visible entry, and `br0-20260913-191850/README.md` proves selection through the visible parent/keyboard path. This is a test locator mismatch; no product defect or missing `data-test` requirement is established.
- Attempts and results: both fresh prescribed lifecycles compiled and cleaned successfully; both workers used bundled Chromium and made no source changes. Durable failure evidence is in `br0-20260913-193707/` and `br0-20260913-194320-30867/`.
- Required unblock action / owner: rerun with the proven visible parent/control plus `ArrowDown`/`Enter` or exact visible text locator, then exercise the missing gates. Add a `data-test` hook only if that proven DOM interaction is independently shown insufficient.
- Next check condition: one bounded Luna medium run reaches a connected `Close` state without using `getByRole('option')` or clicking the hidden dummy input, then records Stop/jog/disconnect/large/watch assertions.
- Unaffected eligible tasks: completed unit/static tasks remain unchanged; BR0 and dependent R0 remain incomplete.

新增格式：

- Blocker ID / task:
- Observed failure + exact command / exit code:
- Cause / evidence path:
- Attempts and results:
- Required unblock action / owner:
- Next check condition（版本、依賴、使用者輸入等；不靠無限重試）:
- Unaffected eligible tasks:
