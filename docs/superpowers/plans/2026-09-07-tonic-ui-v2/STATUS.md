# Migration task status

更新日期：2026-09-07。執行模式：**implementation / active**。計畫文件完成不代表實作完成；目前依 task ledger 執行。

本檔是任務狀態唯一來源；[HANDOFF](HANDOFF.md) 是恢復入口，[執行規則](EXECUTION.md) 定義狀態轉移。不要由聊天歷史或已消失的 /tmp 文件猜進度。

## Current checkpoint

- Active task: BR0（blocked: browser runner missing）
- Main: current root session（非 Terra；此限制已記錄）；worker: none；advisor: gpt-5.6-sol / medium（按需唯讀）。
- Next eligible task: BR0（install a browser runner first）
- Current blockers: BR0 has global Playwright 1.62.1 and can open Chrome 152.0.7977.64 plus capture an accessibility snapshot, but both Playwright screenshot paths fail on `Page.captureScreenshot`. Browser/frontend regression remains unrun.
- Source inventory baseline: f301cde7；最近已見文件提交 e09a642c。接手時重新記錄 HEAD/worktree，不硬編碼此值為當前 HEAD。
- Validation: app/frontend/browser/simulator regression 尚未執行。

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
| BR0 | [可重跑 browser baseline](details/09a-browser-procedure.md) | H3 | blocked | root session / 2026-09-07T19:10:00+08:00 | Global Playwright 1.62.1 opens Chrome 152.0.7977.64 and captures a snapshot, but `playwright cli screenshot` and `playwright screenshot --channel chrome` both fail on `Page.captureScreenshot`. Use a compatible browser/runner pair, then resume from `yarn build-dev`. |
| R0 | [原版 baseline](09-regression-gates.md) | BR0 | todo | — | — |
| D1 | [chrome 純資料](details/02a-widget-state.md) | R0 | todo | — | — |
| D2 | [Provider](details/02a-widget-state.md) | D1 | todo | — | — |
| D3 | [16 shells 接線](details/02a-widget-state.md) | D2 | todo | — | — |
| D4 | [Workspace 接線](details/02a-widget-state.md) | D3 | todo | — | — |
| R1 | [chrome 驗收](09-regression-gates.md) | D4 | todo | — | — |
| R2 | [Workspace 驗收](09-regression-gates.md) | D4 | todo | — | — |
| U2 | [primitives pilot](02-shared-ui.md) | R1, R2 | todo | — | — |
| U3 | [overlay/form 合約](02-shared-ui.md) | U2 | todo | — | — |
| B0 | [HTTP import baseline](details/03b-query-boundaries.md) | H3 | completed | root session / 2026-09-07T18:55:00+08:00 | `query-boundary-baseline.md`; direct imports classified by endpoint, operation, owner task, and explicit exceptions. Static audit only; no transport or browser behavior run. |
| B1 | [session boundary](details/03b-query-boundaries.md) | B0, U3 | todo | — | — |
| M1 | [Macro query](details/03a-query-contract.md) | B0, U3 | todo | — | — |
| M2 | [Macro mutation](details/03a-query-contract.md) | M1 | todo | — | — |
| M3 | [Macro UI](details/03a-query-contract.md) | M2 | todo | — | — |
| Q2-cleanup | [fetch machine 移除與跨畫面驗收](03-query-and-macro.md) | M3 | todo | — | — |
| G1 | [Connection](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G2 | [GCode](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G3 | [Spindle](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G4 | [Laser](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G5 | [Probe](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G6 | [Custom](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| G7 | [Webcam](04-general-widgets.md) | U3, Q2-cleanup | todo | — | — |
| T1 | [Terminal baseline](details/04a-terminal-owner.md) | U3 | todo | — | — |
| T2 | [Terminal owner](details/04a-terminal-owner.md) | T1 | todo | — | — |
| T3 | [Terminal lifecycle](details/04a-terminal-owner.md) | T2 | todo | — | — |
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
| R3 | [geometry baseline](09-regression-gates.md) | R0 | todo | — | — |
| V1 | [toolbar/watch directory](07-visualizer.md) | A3b, U3 | todo | — | — |
| E1 | [load characterization](details/07a-visualizer-engine.md) | R3, A3b | todo | — | — |
| E2 | [engine extraction](details/07a-visualizer-engine.md) | E1 | todo | — | — |
| E3 | [engine ownership](details/07a-visualizer-engine.md) | E2 | todo | — | — |
| E4 | [owner integration](details/07a-visualizer-engine.md) | E3, V1 | todo | — | — |
| R4 | [resources 驗收](09-regression-gates.md) | E4, T3 | todo | — | — |
| R5 | [commands 驗收](09-regression-gates.md) | E4, A1b, A3b, T3, C1, C2, C3, C4 | todo | — | — |
| W1 | [Workspace domain](08-workspace-and-cleanup.md) | G1, G2, G3, G4, G5, G6, G7, T3, C1, C2, C3, C4, A2, A3b, E4, B1 | todo | — | — |
| P0 | [unused families](details/08a-component-families.md) | U3 | todo | — | — |
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

### BR0-B03 — browser screenshot protocol unavailable

- Observed failure + exact command / exit code: global `playwright cli -s=cncjs-br0-smoke open about:blank --browser chrome` and `snapshot` succeed, but `screenshot --filename /tmp/cncjs-playwright-smoke.png --full-page` fails with `Protocol error (Page.captureScreenshot): Unable to capture screenshot`; standard `playwright screenshot --channel chrome about:blank /tmp/cncjs-playwright-standard-smoke.png` fails identically.
- Cause / evidence path: the installed global Playwright 1.62.1 can control Chrome 152.0.7977.64 enough for navigation/snapshot, but the screenshot CDP command is unavailable in this browser/runner pair.
- Attempts and results: Chrome opens with the global Playwright CLI and creates an accessibility snapshot; both independent screenshot entry points reproduce the same failure.
- Required unblock action / owner: provide a compatible browser/Playwright pair (prefer Playwright's matching bundled Chromium or a compatible Chrome channel); do not add a second E2E framework.
- Next check condition: the same global Playwright command captures a non-empty PNG after opening `about:blank`, then can capture a snapshot and screenshot at `http://127.0.0.1:8080`.
- Unaffected eligible tasks: non-browser unit tasks remain eligible only where their dependency graph allows them; BR0/R0 browser baseline cannot proceed.

新增格式：

- Blocker ID / task:
- Observed failure + exact command / exit code:
- Cause / evidence path:
- Attempts and results:
- Required unblock action / owner:
- Next check condition（版本、依賴、使用者輸入等；不靠無限重試）:
- Unaffected eligible tasks:
