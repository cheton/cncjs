# Migration execution log

## G1 Connection — started 2026-09-19T10:37:18+08:00

Task / session / timestamp: G1 / root session / 2026-09-19T10:37:18+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `8121197dab8a9999ea2487f8fa771fa122b16d75` / working tree clean.

Plan contract: `04-general-widgets.md` Task G1 and `details/04b-widget-contracts.md`. Preserve serial/network selection, port/baud settings, pending/error states, auto-reconnect, timeout cleanup, custom serial-port metadata, and the existing open/close payloads. Convert the widget shell to the controlled `view` / `onViewChange(view)` contract, replace local UI primitives with direct Tonic v2 equivalents where supported, and keep `react-select` until the later Tonic UI v3 Dropdown phase.

Worker brief: root session is implementing the bounded G1 change because the current main session is not the prescribed Terra/Luna model pair. No browser work is in scope; browser evidence remains deferred to R6. Production source changes are limited to `src/app/widgets/Connection/`; the new test is `src/app/widgets/Connection/__tests__/Connection.test.jsx`. The test must be written and observed failing before production changes. Do not change connection actions, reducers, sagas, or the Tonic dependency version.

Baseline: current Connection form is a function component but imports local Checkbox, Clickable, Input, FormGroup, GridSystem, InlineError, and ModalTemplate families; `index.jsx` still uses a React class. Existing behavior and payloads are the oracle. Verification will use the focused frontend test, full frontend tests, ESLint, `yarn build-dev`, and `git diff --check`.

Changed files / commit: pending.

Verification: pending failing contract tests, implementation, regression tests, ESLint, development build, and diff check.

Status transition / blocker ID: G1 `todo` → `in_progress`; no blocker.

## G1 Connection — checkpoint and blocker 2026-09-19T17:18:18+08:00

Task / session / timestamp: G1 / current root session / 2026-09-19T17:18:18+08:00.

Implementation: `ConnectionWidget` is now a function using `view` / `onViewChange(view)`; Connection uses direct Tonic `Checkbox`, `Input`, layout, alert, and modal primitives; local legacy imports are removed; `react-select` remains for rich serial-port metadata. The socket payload now intentionally reads `connection.socket.port` as a number because the previous `connection.serial.port` path produced an undefined network port. The close confirmation explicitly preserves the legacy close button and overlay-dismiss behavior through Tonic modal props. `onFork` and `onRemove` prop declarations were removed from the Connection shell.

Tests: `src/app/widgets/Connection/__tests__/Connection.test.jsx` covers controlled view behavior, serial metadata rendering and selection, exact serial/socket payloads, pending open/close gates, serial refresh gates, confirmation cancel/close behavior, error display, and no reconnect on rerender. The focused suite passes 10/10.

Independent review: the fresh read-only review found no Critical issues. It identified G1-B01 and test gaps; the in-scope gaps were addressed. The review also confirmed that browser visual/focus evidence remains outside G1 and deferred to R6.

Ruling: keep the socket-port correction — the config contract and new test use `connection.socket.port`, while HEAD used `connection.serial.port` and sent `undefined`; cost if wrong: network connections would retain the existing broken port payload.

Ruling: do not claim the open/close timeout and stale-response contract complete — the execution brief forbids reducer/saga changes, while `src/app/reducers/connection.js` and `src/app/sagas/controller/index.js` own connection state and accept uncorrelated controller responses; cost if wrong: a late open event could still restore connected state after a disconnect. Set G1 to `blocking` with blocker G1-B01. Next exact step: authorize the required reducer/saga scope expansion or amend the contract, then add the request-generation/timeout regression tests before resuming G1.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Connection/__tests__/Connection.test.jsx` / 0 / 1 suite and 10 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 26 suites and 152 tests passed; `yarn build-dev` / 0; ESLint / 0 errors with 17 existing warnings; `git diff --check` / 0. Local commit is authorized; no push will be performed.

Status transition / blocker ID: G1 `in_progress` → `blocking` (G1-B01).

## F1 start — 2026-09-07T11:48:50+08:00

Task / session / timestamp: F1 / root session / 2026-09-07T11:48:50+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `21c288dc` / none (`git status --short` empty; `git diff --check` exit 0).

Plan contract and baseline fixture: `01-foundation.md`, F1. User authorized implementation only through F1; stop after F1 completes or has a concrete blocker. Current main session is not Terra; one Luna high worker is used because the contract is fixed baseline collection.

Worker selection: Task F1 / `gpt-5.6-luna` high / contract fixed; no new state or timing contract; repository-wide commands have broad impact but objective evidence; no advisor decision required.

Next exact step and expected result: run the F1 installation, package-resolution, lint, test, and build commands without source changes; record each exit code and classify any failure as existing baseline or F1-created.

Scope update — 2026-09-07: User requires removal, not a compatibility exception, for outdated frontend runtime libraries that do not support React 16–18, with explicit priority on the Bootstrap family. Baseline scan identifies direct `react-bootstrap-buttons@~1.0.0`, imported only through `src/app/components/Buttons/index.js`; `src/app/sagas/app/bootstrap` is application code and out of scope. The requirement is recorded in `00-design.md` and W3; F1 remains baseline-only.

Design refinement — 2026-09-07: Do not create a Button pre-emptively. During later integration, use Tonic theme/style props first. If integration evidence shows CNCjs colour tokens or semantics need a reusable owner, `src/app/components/Button` is permitted only as a thin domain component built directly on Tonic Button; it must not retain Bootstrap imports or API re-exports. This refines, rather than weakens, the Bootstrap-removal gate.

Browser procedure refinement — 2026-09-07: This Linux environment has `google-chrome --headless=new --no-sandbox --version` exit 0 (`Google Chrome 152.0.7977.64`). `agent-browser` is not installed, but Playwright is present. The plan now makes headless Chrome the Linux/CI baseline and treats macOS headed browsing as optional; the subsequent checkpoint established that the dev server can bind with local-bind permission, while the remaining authenticated flows require a controlled backend session.

## F1 checkpoint — 2026-09-07T12:13:00+08:00

Changed files / uncommitted diff: `package.json` moves `@tanstack/react-query` from `devDependencies` to `dependencies`; `src/app/index.jsx` and `src/app/lib/portal.jsx` import/use `createRoot` from `react-dom/client`; `AGENTS.md` now states React 18.3.1 and React Router 6.3. Plan updates record Bootstrap-removal and a conditional, Tonic-based CNCjs Button owner. `yarn.lock` is unchanged. `git diff --check` exit 0.

Command / exit code / tested working tree: `yarn --version` 0 (3.3.1); `yarn install --immutable` 0; version probe 0: React/ReactDOM 18.3.1, Tonic React/hooks/icons 2.15.0/2.2.1/2.1.3, React Query 4.44.0; `yarn lint` 0; `timeout 120s yarn build` 0 (Webpack size warnings and a non-fatal i18next-scanner `Line 17: Unexpected reserved word` diagnostic); `yarn test --runInBand` under local-bind permission asserted 16 suites / 506 tests passed, then stayed alive due existing open handles and was stopped with exit 129.

Browser evidence: local dev server bound successfully only with local-bind permission and `WEBPACK_DEV_SERVER_HOST=127.0.0.1`; Webpack compiled successfully. Playwright headless Chrome 152.0.7977.64 captured the default dark login page at `artifacts/f1/20260907/login-default-dark.png`. Its `/api/signin` proxy logged `ECONNREFUSED` because no backend was started. Both Playwright and the dev server were stopped by this session.

Remaining untested paths: a controlled backend/config/test-login session is required to measure Workspace, Administration/Macros, light/dark theme switching, and a custom modal without using user data. Determine and document that fixture/session setup, then resume F1 from that point. Separately, diagnose Jest open handles before relying on clean test-run exit as a later gate. Do not start H1 until F1 has its required browser-flow baseline or an explicit plan change.

## F1 resumed — 2026-09-07T12:23:00+08:00

Worker selection: F1 controlled browser baseline / `gpt-5.6-luna` high / the server's no-enabled-users sign-in contract is explicit, while session-write behavior must be observed. Use a temporary `--config` file with no users; do not create credentials, write `~/.cncrc`, or modify source/ledger. Stop and report if session middleware writes user-owned state.

## F1-B01 — 2026-09-07T12:30:00+08:00

Observed blocker: before starting any process, source review found `src/server/config/settings.base.js:70-72` sets the session directory to `/home/cheton/.cncjs-sessions` from `HOME`, and `src/server/app.js:192-196` unconditionally runs `rimraf.sync(path)` and `fs.mkdirSync(path)`. The backend CLI lacks a session-path option; temporary `--config` only isolates the rcfile. Read-only check confirmed that user-owned directory exists. No backend/frontend process, temporary runtime directory, user credential, config, or session state was created or changed.

Status transition: F1 `in_progress` -> `blocking` (F1-B01). Required unblock action: user authorization to add a narrowly scoped, supported session-path override for controlled test runs, without repurposing `HOME`; then use `/tmp` path and replay the remaining browser baseline. H1 cannot begin until F1 is unblocked and completed.

## FIX-001 start — 2026-09-07T12:42:00+08:00

User decision: remove file-based sessions instead of adding a session-path override. Root-cause evidence: file session setup is the only `express-session`/`session-file-store` use; `req.session.id` is only the verbose Morgan request ID. HTTP protected routes and Socket.IO handshake use JWT. Worker selection: `gpt-5.6-luna` high because removal is local with a fixed JWT contract; no new state ownership or timing behavior. TDD oracle: a real temporary Express app's `/api/signin` response must issue a JWT token without `Set-Cookie`; the pre-fix session middleware should make this test fail.

FIX-001 evidence: the no-cookie integration test was red on the original app (`connect.sid` response cookie) and is green after direct middleware removal: `yarn test --runInBand src/server/__tests__/app.test.js` exit 0, 1/1 pass. Full lint, immutable install, and production build were run after the production changes (exit 0; pre-existing warnings only). Source/manifest cleanup removes `express-session`, `session-file-store`, `rimraf`, and `.cncjs-sessions` from CNCjs app-level code; `cookie-parser` remains intentionally out of scope.

## FIX-002 — 2026-09-07T13:20:00+08:00

User authorized absorbing `/home/cheton/Code/cncjs/webappengine`. Local `src/server/lib/webappengine.js` now preserves route mounting, static/proxy routes, HTTP `ready`/`error` events, and the server object passed to Socket.IO without file-session creation. `yarn jest src/server/lib/__tests__/webappengine.test.js src/server/__tests__/app.test.js --runInBand --coverage=false` passed with loopback permission; ESLint, `yarn lint`, `timeout 120s yarn build`, and `git diff --check` passed; `yarn why` found no webappengine/session-file-store/express-session path. Status: completed; first phase paused.

## FIX-001-B02 — 2026-09-07T13:05:00+08:00

Post-cleanup dependency tracing found `src/server/index.js` starts `webappengine`. Its `src/app/app.standalone.js:155-166` unconditionally deletes/recreates `./sessions` and installs its own file session store. `yarn why express-session` and `yarn why session-file-store` resolve only to `webappengine@1.2.0`. The direct app test does not exercise this outer host. Status: FIX-001 `in_progress` -> `blocking`; retain the verified direct-cleanup diff, but do not claim full server file sessions are removed. Required next task needs explicit authority to replace or upgrade the webappengine host while preserving route mounting/proxy/static behavior and the server supplied to Socket.IO.

## Dispatch dimensions — 2026-09-07

依使用者確認，補充合約明確度、狀態/時序、影響範圍、驗證能力四個派工維度；以子任務選 effort，worker brief 記選擇理由，失敗先分類再決定升級。沿用現有 matrix/ledger，不新增狀態。只更新文件，尚未派工或執行 migration。

## Effort policy — 2026-09-07

依使用者要求，將 61 個執行 task 分配 Luna high/max 預設；Terra main 使用 high，必要時 Sol medium 唯讀 advisor。EXECUTION 記錄分類、升級條件、實際派工參數與 blocking 判定。此為計畫修改，未派代理、未執行 migration，全部 tasks 狀態不變。

## Role configuration — 2026-09-07

使用者指定 Terra main loop + Luna worker。已更新 EXECUTION/HANDOFF/STATUS/README：單 worker、Terra 獨立 review 與唯一 state writer、worker brief/中斷恢復、階段停止邊界。尚未啟動 implementation 或派工；下一 task 仍 F1。

2026-09-07：只更新計畫與交接機制；未執行 migration、安裝套件、啟動 server 或跑 app regression。所有實作狀態見 [STATUS](STATUS.md)。每次執行依 [EXECUTION](EXECUTION.md) 追加 checkpoint；不要覆寫先前測試證據。

## Planning review — 2026-09-07

- 新增 61 個可追蹤執行單位，全部 todo；依賴檢查無未知 ID、無循環。
- 檢查所有 plan Markdown relative links、code fences 與 bash 範例語法：通過。只做 bash -n，未執行範例命令。首次 link checker 誤把 fenced regex 當連結，排除 code fences 後通過，文件無壞連結。
- git diff --check：通過。source/package/lock 無本次修改。
- 修正 Tonic Slider 不存在、native Select 相容性限制；補 controller command oracle、browser setup/fixtures/instrumentation 與 persistent handoff。
- 下一步：依使用者後續明確執行授權，從 STATUS 的 F1 開始；目前仍 plan_only / paused。

## BR0 G-code upload diagnosis — 2026-09-07T22:43:05+08:00

Task / session / timestamp: BR0 / root session / 2026-09-07T22:43:05+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `4274ec95` / prior BR0 artifacts only. Luna medium workers were used for browser-only work, per current user direction. The first fresh command-flow run confirmed anonymous Workspace, `/tmp/ttyGRBL`, Grbl 115200/Idle, and captured both viewports; its small upload then threw `TypeError: str.split is not a function` from `gcode-parser`.

Cause / fix: `src/app/widgets/Visualizer/Visualizer.jsx` defines `load(name, gcode, callback)`, while `VisualizerWidget.actions.loadGCode()` called it as `load(content, callback)`. The callback was therefore parsed as G-code. `src/app/widgets/Visualizer/__tests__/loadGCode.test.jsx` was written first; its RED failure exposed the missing named test seam, then the real action asserted the three arguments. The minimal fix exports the existing class for that test and calls `load(name, content, callback)`.

Command / exit code / tested working tree: `yarn test:frontend src/app/widgets/Visualizer/__tests__/loadGCode.test.jsx --runInBand` exit 0 (1/1); `yarn test:frontend --runInBand` exit 0 (3 suites, 7 tests). Node emitted existing `DEP0040 punycode` warnings.

Browser recheck: `artifacts/browser/br0-playwright-cli/` uses bundled Chromium CLI and records a small-fixture upload with `hasSplitError: false` and `hasReactOverlay: false`. It also records the remaining procedure failure: Linux headless WebGL modal was present, but automation clicked the disabled `Close G-code file` control instead of the modal portal `OK`; its overlay intercepted the Connection selector. No Run/Pause/Resume/Stop, disconnect, jog, 100,000-line fixture, or 5,000-node tree claim is made. The stopped worker left `/tmp/ttyGRBL`; root removed that exact generated symlink after confirming ports 8000/8080 were closed.

Artifacts: `artifacts/browser/br0-command-flow/` retains the original failure evidence; `artifacts/browser/br0-playwright-cli/` retains the fixed upload evidence. The transient MCP-profile-only retry was removed as an unnecessary intermediate artifact.

Next exact step and expected result: launch a fresh bundled-Chromium CLI session, target the portal's visible `OK` button within the WebGL modal before interacting with the Connection widget, then select `/tmp/ttyGRBL`, upload the small fixture, and verify enabled workflow/disconnect before simulator-only Run/Pause/Resume/Stop.

## BR0 targeted WebGL retry — 2026-09-07T23:05:00+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium browser worker / 2026-09-07T23:05:00+08:00.

Evidence: `artifacts/browser/br0-complete-flow/` confirms anonymous Workspace at 1440×900 and that the Linux WebGL modal was dismissed through its targeted portal `OK` before Connection interaction. The worker did not use a broad close locator and did not jog.

Blocker: fresh `yarn dev` compiled, but backend port 8000 and frontend port 8080 were already owned by pre-existing PIDs `3202712` and `3202685`; the fresh backend exited `EADDRINUSE`, so the browser reached the wrong existing lifecycle and had no `/tmp/ttyGRBL` option. The worker stopped only its own children and did not touch those PIDs. `/tmp/ttyGRBL` and its temporary profile were removed.

Remaining: select `/tmp/ttyGRBL`, upload small fixture in the same fresh lifecycle, Run/Pause/Resume/Stop, disconnect, 768px final state, 100,000-line fixture, and 5,000-node watch tree. BR0 remains `in_progress`.

## BR0 date-fns v4 blocker — 2026-09-08T00:30:00+08:00

Task / session / timestamp: BR0 / Luna medium browser worker plus root fix / `2026-09-08T00:30:00+08:00`.

Browser evidence from the pending-flow attempt loaded the small fixture, then showed a React runtime overlay from `src/app/widgets/GCode/GCodeStats.jsx`: `RangeError: Use \`yyyy\` instead of \`YYYY\``. The existing helper also divided the millisecond timestamp by `1000`, which produced an incorrect 1970 date with `date-fns@4.1.0`.

TDD fix: `src/app/widgets/GCode/__tests__/GCodeStats.test.js` was written first and failed; `GCodeStats.jsx` now uses the `yyyy` token and passes the millisecond timestamp unchanged. The focused test and full frontend suite pass: 5 suites / 9 tests. Local commit: `776b707c`.

The browser worker was stopped before post-fix rerun evidence was produced. BR0 therefore remains `in_progress`; pending workflow, disconnect, 768px, large fixture, and watch-tree coverage are not claimed. Generated `.playwright-mcp/` and incomplete pending-flow artifacts were removed. Next exact step: release externally owned ports 8000/8080, run the fixed dev bundle, and delegate only the affected browser cases to Luna medium.

## BR0 resume — 2026-09-13T18:38:22+08:00

Task / session / timestamp: BR0 / current root session with browser worker / 2026-09-13T18:38:22+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82ca` / none. Ports 8000 and 8080 were free before starting.

Plan contract and baseline fixture: `details/09a-browser-procedure.md`, BR0. The worker must use the repository-root `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle, Playwright bundled Chromium, anonymous config, synthetic fixtures, and fresh browser profile(s). Do not use system Chrome screenshots, a separately started simulator, user config, credentials, or tokens.

Worker selection: browser-only BR0 / `gpt-5.6-luna` medium / mandatory browser ownership rule. The contract and selectors are already fixed; medium is required by the plan for all browser tests, screenshots, accessible snapshots, and browser-runner operations. No source edits or ledger edits are authorized for the worker; any product defect is to be reported with evidence for root review.

Allowed worker outputs: BR0 durable artifacts under `docs/superpowers/plans/2026-09-07-tonic-ui-v2/artifacts/browser/`, generated synthetic fixtures under `src/app/test/fixtures/browser/` only if missing, and temporary runtime/config/watch/profile files under `/tmp`. The worker must stop only processes it started and report PIDs, ports, commands, exit codes, browser/viewport/DPR/GPU/theme, hashes, assertions, screenshots/snapshots, console errors, and remaining gaps.

Acceptance criteria: fresh post-fix small fixture upload without parser/React overlay; Grbl/115200 connection through `/tmp/ttyGRBL`; welcome/status; exact Run/Pause/Resume/Stop sequence; jog press/release; disconnect; 1440×900 and 768×900 evidence; fixed 100,000-line G-code and 5,000-node watch-tree coverage where the existing procedure requires them. BR0 stays `in_progress` unless every required gate has durable rerunnable evidence; a concrete environment failure is recorded as a named blocker.

Next exact step and expected result: Luna medium runs the bounded browser procedure and returns durable evidence; root reviews the actual artifacts and process cleanup before deciding whether BR0 can transition or needs a blocker record.

## BR0 blocker checkpoint — 2026-09-13T18:42:13+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium browser worker / 2026-09-13T18:42:13+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82cab0c680596ac89318b100be15133f1b63` / main-managed checkpoint docs were dirty; the worker changed only the permitted synthetic fixtures and durable browser artifact directory.

Plan contract and baseline fixture: `details/09a-browser-procedure.md`, BR0. The worker copied `docs/testing/configs/browser-test.cncrc` to `/tmp/cncjs-browser-test.cncrc`, used the anonymous config and `/tmp/cncjs-browser-watch`, and was instructed to run the exact repository-root `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle with bundled Chromium only.

Worker selection: browser-only BR0 / `gpt-5.6-luna` medium / mandatory browser ownership rule. All browser operations, snapshots, and screenshots were reserved for this worker. No source, ledger, plan, or commit changes were authorized.

Changed files / commit or uncommitted diff: durable artifacts under `artifacts/browser/br0-20260913-184213/`; synthetic fixtures `src/app/test/fixtures/browser/br0-linear.gcode`, `br0-arc.gcode`, `br0-probe.gcode`, `br0-large-100000.gcode`, and `br0-watch-tree/` were created; existing `br0-small.gcode` was preserved. No source code was changed and no commit was made.

Command / exit code / tested revision or working-tree description: `yarn build-dev` exit 0. The prescribed `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` exit 1 in the sandbox due to `socat is not installed` and bind `EPERM` on `0.0.0.0:8000` / `0.0.0.0:8080`; an elevated retry also exited 1 because `socat` remained unavailable. No browser command ran. Cleanup checks found no listeners on 8000/8080 and no `/tmp/ttyGRBL`.

Before / after / intentional differences: before, BR0 had partial historical browser evidence but no post-date-fix complete flow. After, the deterministic fixtures and a named environment blocker are durable; browser state is unchanged because the simulator/backend never started.

Review findings and resolutions: `results.json` reports 100,001 large-fixture lines, 100 watch directories, 4,900 watch files, and SHA-256 values for all G-code fixtures. The worker correctly did not claim Chromium, viewport, connection, upload, workflow, jog, disconnect, or large/watch UI results. The blocker is recorded as BR0-B05 in `STATUS.md`.

Artifacts: `artifacts/browser/br0-20260913-184213/README.md`, `commands.md`, and `results.json`.

Remaining untested paths: all browser actions in this session; the prior partial evidence still lacks post-fix end-to-end workflow, disconnect, jog, large-fixture, and watch-tree coverage.

Next exact step and expected result: provide `socat` and an execution context permitted to bind the required 8000/8080 addresses, then rerun the exact lifecycle with Luna medium. The simulator must create `/tmp/ttyGRBL` and all remaining bundled-Chromium assertions must produce durable artifacts before BR0 can be completed.

Status transition / blocker ID: BR0 `in_progress` → `blocking` / BR0-B05.

## BR0 unblock resume — 2026-09-13T18:58:21+08:00

Task / session / timestamp: BR0 / current root session preparing a Luna medium browser worker / 2026-09-13T18:58:21+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82ca` / existing main-managed docs, artifacts, and synthetic fixtures from the blocked checkpoint; no source changes. Ports 8000/8080 were free and `/tmp/ttyGRBL` was absent before retry.

Unblock evidence: user authorized the required environment changes. `brew install socat` exited 0; `/opt/homebrew/bin/socat` reports 1.8.1.3. The previous BR0-B05 missing-dependency condition is resolved. The worker must still use the prescribed single `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle and only bundled Chromium.

Worker selection: browser-only BR0 / `gpt-5.6-luna` medium / mandatory browser ownership rule. All browser operations, screenshots, accessible snapshots, and browser-runner commands remain delegated; root will only review durable evidence and update the ledger.

Acceptance criteria: complete the pending post-fix small upload, Grbl connection/status, Run/Pause/Resume/Stop, jog release, disconnect, 1440×900 and 768×900, 100,000-line G-code, and 5,000-node watch-tree cases where exposed; capture exact commands, hashes, browser details, console errors, assertions, and cleanup.

Next exact step and expected result: Luna medium runs the fresh lifecycle and writes durable evidence under `artifacts/browser/br0-20260913-185821/`; root reviews actual results before marking BR0 completed or recording a new named blocker.

## BR0 browser-runner checkpoint — 2026-09-13T19:08:41+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium browser worker / 2026-09-13T19:08:41+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82ca` / main-managed checkpoint docs, prior artifacts, and synthetic fixtures; no source changes.

Plan contract and baseline fixture: `details/09a-browser-procedure.md`, BR0. BR0-B05 was resolved before this run by installing Homebrew `socat` 1.8.1.3 and authorizing port binding. The worker used the anonymous config, `/tmp/cncjs-browser-watch`, the single repository-root `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle, and a fresh browser profile.

Worker selection: browser-only BR0 / `gpt-5.6-luna` medium / mandatory browser ownership rule. All browser operations and screenshot production were delegated to Luna; root reviewed only returned durable artifacts.

Changed files / commit or uncommitted diff: `artifacts/browser/br0-20260913-185821/README.md`, `commands.md`, `results.json`, and `workspace-1440x900.png`. Root corrected the artifact's reused blocker label from BR0-B05 to BR0-B06; no source code or commit changed.

Command / exit code / tested revision or working-tree description: `yarn build-dev` exit 0. The exact `yarn dev` lifecycle exited 0 after graceful cleanup and successfully started simulator, frontend, backend, and `/tmp/ttyGRBL`; simulator bridge ports were 50930/50931, frontend 8080, backend 8000. The Playwright Chromium fallback reached anonymous Workspace and selected `/tmp/ttyGRBL`, then exceeded its 30-second post-selection command timeout with no exit code.

Before / after / intentional differences: BR0-B05 environment failure is resolved. New durable evidence proves lifecycle, anonymous Workspace, port selection, and a clean 1440×900 screenshot. The timeout prevented durable connection, upload, workflow, jog, disconnect, 768px, large-fixture, and watch-tree assertions.

Review findings and resolutions: no new page errors or source defect was established. The in-app browser reported no available instances; default Playwright expected a missing headless-shell executable, so the worker used explicit installed Chrome for Testing 151.0.7922.34. This is recorded as BR0-B06, not a completed browser gate.

Artifacts: `artifacts/browser/br0-20260913-185821/README.md`, `commands.md`, `results.json`, and `workspace-1440x900.png`.

Remaining untested paths: post-selection connection/open, small and large G-code upload, GCodeStats/date-fns overlay check, Run/Pause/Resume/Stop/Close, jog release, disconnect, 768×900, durable accessible snapshot, 5,000-node watch-tree timing, and complete console capture.

Next exact step and expected result: Luna medium retries with a functioning direct Playwright/Chromium session and per-action timeout handling, preserving the post-selection connection assertion; if the same timeout recurs, keep BR0 blocking with the runner limitation and exact evidence.

Status transition / blocker ID: BR0 remains `in_progress`; active blocker BR0-B06.

## BR0 remaining-gates retry — 2026-09-13T19:33:02+08:00

Task / session / timestamp: BR0 / current root session with Luna worker `Cicero` / 2026-09-13T19:33:02+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82ca` / existing main-managed docs, durable browser artifacts, and synthetic fixtures; no source changes. Ports 8000/8080 and `/tmp/ttyGRBL` were clean before dispatch.

Worker selection: remaining browser-only BR0 gates / `gpt-5.6-luna` medium / mandatory browser ownership rule. The brief explicitly reuses existing accessible names/titles and the proven React Select DOM surface; no speculative `data-test` hook is authorized. The worker may write only durable browser artifacts and temporary runtime state, then must stop its own lifecycle.

Acceptance focus: use the fixed 100,000-line fixture for a reliable Stop attempt; capture jog press/release, disconnect disabled controls, Watch Directory 5,000-node behavior, and Macro if feasible. Keep each assertion pass/fail/not-run with screenshots, ARIA/HTML, logs, hashes, and cleanup evidence.

Next exact step and expected result: review the new artifact directory after the Luna worker completes. BR0 can become completed only when every required baseline gate has durable evidence; otherwise retain `in_progress` or record a concrete named blocker. Do not add `data-test` unless an existing role/title/domain selector is proven insufficient.

## BR0 remaining-gates retry result — 2026-09-13T19:33:30+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium worker / 2026-09-13T19:33:30+08:00.

Result: the prescribed config/watch setup and `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` lifecycle compiled successfully, but the browser runtime returned no available backend (`agent.browsers.list() = []`). No remaining browser gate was run or claimed. Durable report: `artifacts/browser/br0-20260913-193330/README.md`, `commands.md`, `results.json`. Cleanup verified ports 8000/8080 and `/tmp/ttyGRBL` absent; no source or ledger files changed.

Review: this is BR0-B07, an execution-surface limitation. It does not invalidate the earlier `br0-20260913-191850` bundled-Chromium evidence and does not justify a `data-test` source change.

## BR0 React Select locator retry result — 2026-09-13T19:37:07+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium worker / 2026-09-13T19:37:07+08:00.

Result: direct fallback used bundled Chromium and reached anonymous Workspace, but stopped at port selection after `getByRole('option').filter({ hasText: '/tmp/ttyGRBL' })` timed out. The lifecycle compiled and cleanup succeeded; no downstream gate was claimed. Durable report: `artifacts/browser/br0-20260913-193707/README.md`, `checkpoint-blocker.md`, `cleanup.md`. No source or ledger files changed.

Review: the open-menu snapshot shows the React Select entry as a generic visible surface, not `role=option`; this is BR0-B08 test-locator evidence, not a product defect.

## BR0 hidden dummy-input retry result — 2026-09-13T19:48:37+08:00

Task / session / timestamp: BR0 / `gpt-5.6-luna` medium worker / 2026-09-13T19:43:20–19:48:37+08:00.

Result: direct bundled Chromium launched successfully and captured the anonymous Workspace, but the script clicked `#react-select-2-input`, which is React Select's hidden readonly dummy input; the 15-second click timed out before port selection. No downstream gate was claimed. Durable report: `artifacts/browser/br0-20260913-194320-30867/README.md`, `commands.md`, `results.json`, `cleanup.log`. The worker stopped its own lifecycle and verified ports 8000/8080 and `/tmp/ttyGRBL` absent; no source or ledger files changed.

Review: the proven path is the visible parent/control plus keyboard or exact visible text, as recorded in `artifacts/browser/port-selection/02-open-menu.txt` and `br0-20260913-191850/`. No `data-test` hook was added because the product DOM already supports a working interaction and the failures were locator choices.

## React Select stable selector patch — 2026-09-13T20:00:00+08:00

Task / session / timestamp: BR0 follow-up / root session / 2026-09-13T20:00:00+08:00.

Change: `src/app/widgets/Connection/Connection.jsx` now gives serial port and baud-rate selects fixed `inputId` values, translated `aria-label` values, `classNamePrefix` values, and wrapper `data-test` attributes. The labels use matching `htmlFor` values. No selection or state behavior was changed.

Validation: `git diff --check`, `yarn eslint`, and `yarn build` passed. `yarn test --runInBand` reported 508 passed and one existing `SocketConnection` `ECONNRESET` failure. A follow-up browser verification was dispatched to Luna medium but could not run because no browser worker was available; no browser gate is claimed from this patch.

## BR0 remaining-gates retry — 2026-09-13T20:06:00+08:00

Task / session / timestamp: BR0 / current root session / 2026-09-13T20:06:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `62ea82ca` / existing main-managed docs, artifacts, synthetic fixtures, and the requested `Connection.jsx` selector patch; browser-only scope, no source edits in this run.

Plan contract and baseline fixture: `EXECUTION.md`, `details/09a-browser-procedure.md`, anonymous `docs/testing/configs/browser-test.cncrc`, `small.gcode`, `large-100000.gcode`, and `watch-tree`.

Worker selection: browser-only BR0 / required `gpt-5.6-luna` / `reasoning_effort: medium`; no worker dispatch capability was exposed in this session, so root did not substitute direct browser automation.

Command / exit code / tested revision or working-tree description: from repo root, copied config and ran `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev`; lifecycle compiled and started simulator/frontend/backend successfully, then exited 0 after owner Ctrl-C cleanup. Server observed `/tmp/ttyGRBL`, Grbl, `115200`, and an anonymous socket connection as setup evidence. No Jest was run per user instruction.

Artifacts: `artifacts/browser/br0-20260913-200600/README.md` records command, fixture hashes/counts, gate matrix, blocker, and cleanup. No browser screenshots, ARIA/HTML snapshots, console/page-error logs, or workflow JSON were created for this run.

Gate result: every requested remaining browser gate is `NOT RUN` because Luna medium was unavailable: React Select/connect, small upload, long Run→Pause→Stop, Run→Pause→Resume, jog press/release, disconnect/disabled controls, Watch Directory 5,000-node rendering/timing, and 1440×900/768×900 browser captures.

Cleanup: verified no listeners on ports 8000/8080 and `/tmp/ttyGRBL` absent after Ctrl-C. Status remains BR0 `blocking`; do not mark BR0 complete.

## BR0 waiver decision — 2026-09-13T20:20:00+08:00

Task / session / timestamp: BR0 → R0 dependency waiver / root session / 2026-09-13T20:20:00+08:00.

Decision: the user explicitly authorized continuing without waiting for BR0. BR0 is recorded as `waived`, not `completed`; its partial evidence and missing browser gates remain unchanged. R0 may start directly from H3 for non-browser characterization and must record the missing BR0 evidence as carry-forward.

Accepted risk and scope: Stop, jog press/release, disconnect, 100,000-line fixture, 5,000-node watch tree, 1440×900/768×900 browser captures, and browser verification of the new React Select selectors are not currently proven. R6 remains responsible for rerunning equivalent browser/performance coverage; W3 cannot complete while those gaps remain unresolved. The user-requested SocketConnection test remains excluded from the active validation path.

Status transition: BR0 `blocking` → `waived`; R0 dependency `BR0` → `H3 (BR0 waived)`, R0 remains `todo` pending its own characterization work.

## React Select future alternative — 2026-09-13T20:22:00+08:00

Decision: keep the current `react-select` implementation and selector patch in scope for the ongoing path. Record Tonic `MenuButton/MenuList/MenuItem` as a future domain-selector option, not as an implicit part of the BR0 waiver or current R0 start.

Acceptance criteria for a future evaluation: preserve keyboard interaction, focus and focus-return behavior, selected value and custom option metadata, disabled state, ARIA/i18n semantics, and existing Connection/Tool callback contracts. The evaluation must have its own implementation and regression task before any `react-select` dependency/import is removed.

## R0 non-browser baseline complete — 2026-09-13T20:35:00+08:00

Task / session / timestamp: R0 / root session / 2026-09-13T20:35:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `39edd315` / `src/app/widgets/Connection/Connection.jsx` selector patch and synthetic browser fixtures. No Tonic widget migration was included in this R0 checkpoint.

Plan contract and baseline fixture: `09-regression-gates.md`, `regression-baseline.md`, `geometry-baseline.json`, existing frontend characterization tests, and the BR0 waiver recorded above.

Command / exit code / tested revision: `yarn test:frontend --runInBand` / 0 / current working tree; 5 suites and 9 tests passed. Existing full Jest SocketConnection `ECONNRESET` remains excluded per user direction. The prescribed dev lifecycle had already exited 0 with cleanup verified.

Before / after / intentional differences: the baseline records existing source behavior and the four plan-approved future differences (fullscreen collapse, Macro cached refresh, mutation close behavior, Settings Save timing). Geometry oracle remains the existing real parser/Three.js read-only result. No production migration was performed.

Artifacts: `regression-baseline.md`, `geometry-baseline.json`, and frontend test paths listed in the baseline. BR0 browser gaps remain carry-forward to R6 under the explicit waiver.

Status transition: R0 `todo` → `completed` for the waived non-browser scope; D1 `todo` → `in_progress`. Next exact step: implement and test D1 pure widget registry/state helpers without connecting them to Provider or Workspace.

## D1 pure widget state complete — 2026-09-13T20:48:00+08:00

Task / session / timestamp: D1 / root session / 2026-09-13T20:48:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `39edd315` / `Connection.jsx` selector patch, R0 docs, and synthetic browser fixtures. D1 changed only `src/app/pages/Workspace/widgetRegistry.js`, `widgetUIState.js`, and `__tests__/widgetUIState.test.js`.

Plan contract and baseline fixture: `details/02a-widget-state.md`; registry preserves the existing 17 widget mappings, Visualizer has `supportsChrome: false`, and controller widgets use the existing controller constants. Pure helpers do not import config, React, or controller state.

Implementation / review: the first test run correctly failed because the modules did not exist. A second run exposed that importing real widgets pulled `import.meta` from the development Redux store; the test now mocks all 17 widget modules. One over-broad unknown-id expectation was removed because filtering belongs to `selectVisibleWidgetIds`, while `setWidgetsMinimized` intentionally trusts pre-filtered ids. Final review confirms selected/domain object identity and memoized minimized snapshot behavior.

Commands / exit codes: focused `yarn test:frontend --runInBand --runTestsByPath src/app/pages/Workspace/__tests__/widgetUIState.test.js` / 0 / 4 tests passed; full `yarn test:frontend --runInBand` / 0 / 6 suites and 13 tests passed; `yarn eslint` / 0 / no output.

Status transition: D1 `in_progress` → `completed`; D2 `todo` → `in_progress`. Next exact step: add config hydration notification, Provider actions, and group-id snapshot hook tests before wiring Workspace.

## D2 Provider and hydration checkpoint — 2026-09-13T21:20:00+08:00

Task / session / timestamp: D2 / root session / 2026-09-13T21:20:00+08:00.

Changed files: `WidgetUIProvider.jsx`, `useWorkspaceWidgetUI.js`, `useWorkspaceWidgetIds.js`, `widgetUIState` consumers, `src/app/store/config/hydration.js`, `src/app/store/config/index.js`, `hydration.test.js`, `WidgetUIProvider.test.jsx`, and `jest.frontend.config.js` (added exact bare `@app` mapper while retaining `@app/*`).

Verification: `yarn test:frontend --runInBand` / 0 / 8 suites and 19 tests passed; focused hydration/provider run / 0 / 6 tests passed; `yarn eslint` / 0; `yarn build` / 0. Build retains existing bundle-size and i18next scanner warnings plus `Error in undefined: Line 17: Unexpected reserved word` from the existing scanner path, but webpack compiled successfully.

Current implementation: Provider uses the memoized minimized snapshot reader and `useSyncExternalStore`; fullscreen state has a latest ref; bulk actions filter unsupported/unknown/fullscreen ids; group ids use the existing config paths; successful hydration emits one `change` after migration, while corrupt input leaves state untouched and calls the error handler.

Remaining D2 gates: add a real config-module restoreDefault/corrupt-settings integration check or explicitly record why the isolated hydration seam is sufficient; then review whether D2 can transition to completed. No Workspace wiring has started.

## D2 Provider and hydration complete — 2026-09-13T21:35:00+08:00

Task / session / timestamp: D2 / root session / 2026-09-13T21:35:00+08:00.

Completion review: the real config startup integration test now covers localStorage parse/normalize/assign and one post-migration `change` event; the corrupt-input seam preserves the existing state and does not emit. Provider tests cover bulk actions, fullscreen expand/exit semantics, restoreDefault followed by remount, unsupported/unknown ids, group path read/write, external minimized changes, and listener cleanup. Stable hook entry files were added without duplicating context logic. The Jest config now maps both bare `@app` and `@app/*`.

Verification: `yarn test:frontend --runInBand` / 0 / 8 suites and 21 tests passed; focused Provider / hydration runs passed; `yarn eslint` / 0; `yarn build` / 0 with existing bundle-size/scanner warnings. No browser gate was run; BR0 waiver and R6 carry-forward remain unchanged.

Status transition: D2 `in_progress` → `completed`; D3 `todo` → `in_progress`. Next exact step: write the D3 WidgetHost/chrome integration test against the new registry/provider contract before modifying `Widget.jsx`.

## D3 WidgetHost dispatch checkpoint — 2026-09-13T21:50:00+08:00

Task / session / timestamp: D3 / root session / 2026-09-13T21:50:00+08:00.

Implementation: added the function-based `Widget.jsx` registry lookup and declarative chrome dispatch boundary. Chrome-capable widgets receive `minimized`, `isFullscreen`, `onMinimizedChange`, and `onToggleFullscreen`; Visualizer bypasses chrome; unknown widget ids return `null`; no component instance ref is registered. Added `WidgetChromeIntegration.test.jsx` with 3/3 tests covering chrome props/actions, Visualizer bypass/unknown ids, and prop passthrough.

Naming decision: `WidgetChromeIntegration.test.jsx` remains the correct name while the test covers both host dispatch and chrome contract integration. If the remaining D3 scope is reduced to host dispatch only, rename it to `WidgetHost.test.jsx` and update `details/02a-widget-state.md`, `STATUS.md`, this log, and the prescribed test command together.

Verification: `yarn test:frontend --runInBand` / 0 / 9 suites and 24 tests passed; `yarn eslint` / 0 / 17 existing warnings, no errors; `yarn build` / 0 / webpack compiled with 3 existing performance warnings plus the existing i18next scanner warning. The 16 widget shell migrations and D4 Workspace wiring are not complete; D3 remains `in_progress`.

Next exact step: migrate the 16 chrome-consuming widget shells while preserving domain state, lifecycle, and service ownership; keep Visualizer outside the chrome contract.

## D3 WidgetHost and chrome consumers complete — 2026-09-13T21:56:00+08:00

Task / session / timestamp: D3 / root session / 2026-09-13T21:56:00+08:00.

Implementation: completed the function-based `Widget.jsx` host and function `components/Widget/Widget.jsx` / `Button.jsx`. The host performs registry lookup, returns `null` for unknown ids, bypasses chrome for Visualizer, and memoizes `{ minimized, isFullscreen, onMinimizedChange, onToggleFullscreen }` for chrome-capable widgets without component refs. Migrated all 16 chrome shells: Axes, Autolevel, Tool, Marlin, Smoothie, TinyG, Connection, Console, Custom, GCode, Grbl, Laser, Macro, Probe, Spindle, and Webcam. Local minimized/fullscreen state and chrome persistence were removed while domain state, lifecycle, Macro services, and non-chrome config persistence were retained.

Test coverage: `WidgetChromeIntegration.test.jsx` covers declarative host updates without body unmount, Visualizer bypass, unknown ids, prop passthrough, and real Connection/Autolevel shell action forwarding. The existing `Connection.jsx` selector/data-test patch remains in scope; the future Tonic Menu alternative remains deferred.

Verification: focused `yarn test:frontend --runInBand --runTestsByPath src/app/pages/Workspace/__tests__/WidgetChromeIntegration.test.jsx` / 0 / 5 tests passed; full `yarn test:frontend --runInBand` / 0 / 9 suites and 26 tests passed; `yarn eslint` / 0 / 17 existing warnings, no errors; `yarn build` / 0 / webpack compiled with existing performance and i18next scanner warnings; `git diff --check` / 0. The static scan for local chrome state/methods in all 16 shell indexes returned no matches (expected `rg` exit 1).

Full server Jest was not used as a D3 gate: `SocketConnection` remains excluded per user direction, and the earlier sandbox `listen EPERM` server failure remains environmental evidence. No browser gate is claimed; BR0 is explicitly waived and its missing evidence remains a carry-forward to R6.

Status transition: D3 `in_progress` → `completed`; D4 remains the next eligible task. The D3 test keeps the name `WidgetChromeIntegration.test.jsx` because it still covers shell chrome integration; rename to `WidgetHost.test.jsx` only if the remaining scope later becomes host dispatch alone, updating all references together.

Next exact step: D4 group containers and Workspace toolbar wiring, including `WorkspaceRoot`, group-id hooks in the real containers, toolbar bulk actions, fork/remove/sort persistence, and removal of imperative `widgetMap`/component-instance control.

## Browser fixture retention decision — 2026-09-13

Decision: keep only the small, reviewable browser fixtures in `src/app/test/fixtures/browser/` (`small.gcode`, `linear.gcode`, `arc.gcode`, and `probe.gcode`). Remove the runtime-generated `large-100000.gcode` and `watch-tree/` payloads from the working tree and prevent them from being re-added with `.gitignore` rules.

Reason: the large G-code and 5,000-node watch tree are useful BR0/R6 input shapes, but they are execution data rather than product source or D3 tests. Future browser runs should generate deterministic copies under unique `/tmp` paths and record the recipe/hash in durable artifacts. Historical browser artifacts may still describe the payloads that were used; that is evidence, not a request to keep the generated files in Git.

## D4 Workspace/group wiring complete — 2026-09-14T00:09:05+08:00

Task / session / timestamp: D4 / root session / 2026-09-14T00:09:05+08:00.

Implementation: added `WorkspaceRoot.jsx` as the `WidgetUIProvider` boundary and kept the connected/router default export in `Workspace.jsx` behind a hook function boundary. Primary, Secondary, and Default containers now read config-backed ids through `useWorkspaceWidgetIds`; controller visibility uses `selectVisibleWidgetIds`. Primary/Secondary preserve the existing PubSub topics, Sortable group `put/pull` options, fork settings clone, remove semantics, callback parameters, and config order writes without local widget lists or component refs. Workspace toolbar collapse/expand uses `widgetUI.setManyMinimized` with the current visible ids. Provider cleanup removes transient fullscreen entries when an active widget leaves all three groups.

Test coverage: `WidgetGroups.test.jsx` uses a Sortable contract mock and real `Widget.jsx` registry dispatch to cover sort/order persistence, cross-column options, PubSub updates, fork/remove with native settings preservation, toolbar→group→Host→chrome behavior, Visualizer chrome bypass, available controller filtering, and fullscreen cleanup.

Verification: focused D4 command (`widgetUIState`, `WidgetUIProvider`, `WidgetChromeIntegration`, `WidgetGroups`, and hydration tests) / 0 / 5 suites and 22 tests passed; `yarn test:frontend --runInBand --silent` / 0 / 10 suites and 31 tests passed; `yarn eslint` / 0 / 17 existing warnings, no errors; `yarn build` / 0 / webpack compiled with existing bundle-size and i18next scanner warnings; negative scan for `widgetMap|collapseAll|expandAll|useImperativeHandle` under `src/app/pages/Workspace` / no matches; `git diff --check` / 0.

Browser status: no browser gate is claimed in D4. BR0 remains explicitly waived; its missing Stop/jog/disconnect/large/watch/viewport/selector evidence is carried to R6. SocketConnection remains excluded per user direction.

Status transition: D4 `todo` → `completed`; R1/R2 are now the next eligible regression gates. The next exact step is the 16-widget chrome contract run, followed by Workspace list/event/config regression coverage.

## Browser fixture naming cleanup — 2026-09-14

Decision: remove the BR0 task prefix from the tracked small fixtures. The repository names are now `small.gcode`, `linear.gcode`, `arc.gcode`, and `probe.gcode`; the fixture contents are unchanged. Runtime-only `large-100000.gcode` and `watch-tree/` ignore entries use the same task-neutral names. Historical browser artifacts retain the paths recorded by the runs that produced them.

## Widget layout naming/API cleanup — 2026-09-14

Task / session: D3/D4 follow-up / root session.

Decision: the runtime terminology is now layout-oriented. `WidgetUIProvider` became `WorkspaceLayoutProvider`, `widgetUIState` became `widgetLayoutState`, `useWorkspaceWidgetUI` became `useWorkspaceLayout`, and `useWorkspaceWidgetIds` became `useWidgetGroup`. The registry capability is `hasFrame`; the host is named `WidgetHost`, and the host test is `WidgetHost.test.jsx` because the remaining test scope is host dispatch.

Final widget contract: frame-capable widgets receive `view` with one of `normal`, `collapsed`, or `fullscreen`, plus `onViewChange(view)`. The existing config key `widgets.<id>.minimized` remains the persistence schema for collapsed view. Fullscreen is transient in `WorkspaceLayoutProvider` and is never written to config. Bulk toolbar operations use `setWidgetsCollapsed(ids, collapsed)`.

Implementation: migrated all 16 frame widget shells from the old aggregate prop to the single view contract, kept Visualizer as `hasFrame: false`, and updated provider/group/host tests and plan references. The tracked browser fixture names remain task-neutral; runtime-generated large/watch payloads remain ignored.

Verification: focused layout run `yarn test:frontend --runInBand --silent --runTestsByPath src/app/pages/Workspace/__tests__/WorkspaceLayoutProvider.test.jsx src/app/pages/Workspace/__tests__/WidgetHost.test.jsx src/app/pages/Workspace/__tests__/WidgetGroups.test.jsx src/app/pages/Workspace/__tests__/widgetLayoutState.test.js` / 0 / 4 suites and 19 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 10 suites and 31 tests passed; `yarn eslint` / 0 / 17 existing warnings, no errors; `yarn build` / 0 / webpack compiled with 3 existing performance warnings plus the existing i18next scanner warning; `git diff --check` / 0. No browser gate was run; BR0 remains waived, and SocketConnection remains excluded per user direction.

## Console terminal-clear crash fixed; ready set re-established — 2026-09-18T14:56:00+08:00

Task / session / timestamp: FIX-003（未編號的既有 bug 修正，非新 task ID）/ root session / 2026-09-18T14:56:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `dd352521` / 工作樹乾淨；先前未提交的 `Console.test.jsx` 已由本 session 恢復。

Contract and result: `04a-terminal-owner.md` T1 第二個 checkbox 與 `regression-baseline.md` 列為 E1/R4 obligation 的 `Console` `term.current.clear`。`onConnectionClose` 先 `const { current: term } = terminalRef;` 取得 Terminal 實例，卻再呼叫 `term.current.clear()`；`Terminal.clear()`（`Terminal.jsx:351`）是實例上的直接方法，多一層 `.current` 解析為 `undefined`，因此關閉連線時 throw 而非清除 buffer。同檔其餘 8 個呼叫點皆正確使用 `term.method()`，此為唯一異常。改為 `term.clear()`。

Changed files / commit: `src/app/widgets/Console/Console.jsx`, `src/app/widgets/Console/__tests__/Console.test.jsx`; commit `98ceb1f6`; 已 push 至 `origin/feat/tonic-ui-v2-migration`（使用者明確授權）。push 為 fast-forward（`dd352521..98ceb1f6`），遠端當時無新 commit，零衝突。

Command / exit code / tested revision: `yarn test:frontend --runInBand --coverage=false --runTestsByPath src/app/widgets/Console/__tests__/Console.test.jsx` / 0 / 1 test pass at `98ceb1f6`. 反證：將 `term.clear()` 還原為 `term.current.clear()` 後同一測試 FAIL，訊息 `Cannot read properties of undefined (reading 'clear')`，確認測試確實綁定此修正而非空過。full `yarn test:frontend --runInBand` / 0 / 11 suites and 32 tests pass；`yarn eslint` / 0 / 17 existing warnings, no errors；development build `npx webpack serve --config webpack.config.development.js` / compiled with 1 existing `Connection.jsx` warning。依 HANDOFF rule 7 未執行 `yarn build-prod`。

Before / after / intentional differences: 修正前 `connection:close` 會 throw 且 buffer 不清除；修正後正常清除一次。無其他行為變更，未觸碰 emitter 事件或 xterm 資源處置。遠端先前亦存在同一 bug，本次為首次修正。

Review findings and resolutions: 全 repo 掃描 `.current.current` 與其餘 `term.current` 用法，均無同類錯誤（同類 bug 僅此一處）。plan 原要求的 owner action／`useTerminal` 架構屬 T2，**本次未做**，已於 `04a-terminal-owner.md` 誠實標註為未完成。

Artifacts: `src/app/widgets/Console/__tests__/Console.test.jsx`（受版本控制）。

Remaining untested paths: `Console` 其餘 consumers（`writeln`/`prompt`/`resize`/`clearSelection`/`refresh`/`selectAll`）仍無 characterization 測試；T1 第一個 checkbox 未完成。無 browser evidence。

Next exact step and expected result: 依 STATUS 依賴計算，R1、R2、R3 皆可開跑，尚未選定，需使用者決定。

Status transition / blocker ID: 無 task ID 變更（此修正不屬於任何 todo task 的完成條件）。R1/R2/R3 維持 todo；無新增 blocker。

## 依賴可執行集重算 — 2026-09-18

以 STATUS `Depends on`（completed 與 waived 均視為滿足）重算：可立即開跑的只有 **R1**（← D4）、**R2**（← D4）、**R3**（← R0）。其餘 47 個 todo 仍被未完成依賴擋住。無 `in_progress`、無未解 blocker。HANDOFF 已補「下一個可執行項目」章節與更新恢復 prompt；STATUS current checkpoint 同步。

## R1 Widget view contract — started 2026-09-18T17:36:35+08:00

Task / session / timestamp: R1 / root session / 2026-09-18T17:36:35+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `ecbdc560` / working tree clean.

Plan contract and baseline fixture: `09-regression-gates.md` Task R1. Create `src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx`; cover all 16 real frame-widget exports, saved collapsed state, single/bulk view changes, fullscreen, ARIA/content visibility, mount lifecycle, no command/HTTP mutation side effects, fork isolation, and Visualizer `hasFrame=false` behavior.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: the contract is fixed, but the test spans 16 real exports, shared Provider/Host state, mount/unmount lifecycle, and negative command-side-effect assertions; this is cross-widget integration with high state/timing and impact risk. Unresolved decision / decision owner: none; root reviews the diff and owns ledger/status.

Changed files / commit: pending worker.

Verification: pending worker; required focused frontend test, then root review and regression verification.

Status transition / blocker ID: R1 `todo` → `in_progress`; no blocker.

## R1 Widget view contract — completed 2026-09-18T17:58:00+08:00

Task / session / timestamp: R1 / root session / 2026-09-18T17:58:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `ecbdc560` / R1 test and Autolevel accessibility fix only; ledger files were the pre-existing session changes.

Changed files / commit or uncommitted diff: `src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx` (new), `src/app/widgets/Autolevel/index.jsx` (`aria-expanded={!isCollapsed}`); uncommitted, no commit requested.

Before / after / intentional differences: R1 had no 16-shell contract test. The new parameterized suite uses all 16 real frame exports through `WidgetHost` and `WorkspaceLayoutProvider`, asserting saved collapsed state, single/bulk view changes, fullscreen, ARIA/content visibility, stable body lifecycle, fork isolation, no controller/HTTP mutation, and Visualizer frame bypass. The Autolevel shell was the only frame shell missing `aria-expanded`; the one-line fix aligns it with the existing shell contract.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx` / 0 / 36 tests passed; nearby focused Workspace/layout suites / 0 / 5 suites and 55 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 12 suites and 68 tests passed; `yarn eslint src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx src/app/widgets/Autolevel/index.jsx` / 0; `git diff --check` / 0.

Review findings and resolutions: initial RED test exposed the missing Autolevel `aria-expanded`; fixed with the minimal production change. All other 15 shells already exposed the attribute. Domain-body and transport integrations remain mocked by design; those are outside R1 and remain covered by later widget/controller gates.

Artifacts: `src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx`.

Remaining untested paths: real domain-body behavior and actual transport integrations; no browser evidence is required for R1 and no browser gate is claimed.

Next exact step and expected result: select and start R2 (recommended) or R3. R2 should add/complete Workspace list/event/config regression coverage and preserve the R1 passing baseline.

Status transition / blocker ID: R1 `in_progress` → `completed`; no blocker.

## R2 Workspace regression — started 2026-09-18T18:07:41+08:00

Task / session / timestamp: R2 / root session / 2026-09-18T18:07:41+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `c1c1d91f` / working tree clean.

Plan contract and baseline fixture: `09-regression-gates.md` Task R2. Cover Workspace primary↔secondary reorder, fork/remove semantics, controller filtering, config event bursts, one-shot/idempotent bulk view changes, async hydration restore, and mount→unmount→mount listener cleanup including StrictMode-safe active listener counts. Create or extend `WidgetGroups.test.jsx` and create `WidgetLifecycle.test.jsx` as needed.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: R2 spans shared Workspace group state, PubSub/config event timing, hydration, and lifecycle cleanup across multiple consumers; contract is mostly fixed by D4 but state/timing and cross-component impact are high. Unresolved decision / decision owner: none; root reviews the diff and owns ledger/status.

Changed files / commit: pending worker.

Verification: pending worker; required focused R2 tests, nearby/full frontend regression, ESLint, and diff check.

Status transition / blocker ID: R2 `todo` → `in_progress`; no blocker.

## R2 Workspace regression — completed 2026-09-18T18:22:42+08:00

Task / session / timestamp: R2 / root session / 2026-09-18T18:22:42+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `c1c1d91f` / R2 tests and ledger updates only.

Changed files / commit or uncommitted diff: `src/app/pages/Workspace/__tests__/WidgetGroups.test.jsx` extended; `src/app/pages/Workspace/__tests__/WidgetLifecycle.test.jsx` added; uncommitted, phase commit pending.

Before / after / intentional differences: R2 now verifies primary↔secondary order and Sortable id/handle/filter contracts, repeated fork/remove callback and config semantics, Grbl/Marlin/Smoothie/TinyG filtering with hidden settings preservation, config burst snapshot identity/no persistence feedback, idempotent bulk view actions, async hydration and corrupt-state preservation, and StrictMode-safe config/controller/PubSub listener cleanup across remounts.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/pages/Workspace/__tests__/WidgetGroups.test.jsx src/app/pages/Workspace/__tests__/WidgetLifecycle.test.jsx` / 0 / 2 suites and 15 tests passed; nearby Workspace/layout suites / 0 / 6 suites and 65 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 13 suites and 78 tests passed; `yarn eslint src/app/pages/Workspace/__tests__/WidgetGroups.test.jsx src/app/pages/Workspace/__tests__/WidgetLifecycle.test.jsx` / 0 errors, 17 existing warnings.

Review findings and resolutions: initial lifecycle RED exposed that StrictMode produces six active config subscriptions for the Workspace composition; the test oracle was corrected to assert the actual active baseline and cleanup, not constructor/setup counts. No production changes were needed.

Artifacts: `src/app/pages/Workspace/__tests__/WidgetGroups.test.jsx`, `src/app/pages/Workspace/__tests__/WidgetLifecycle.test.jsx`.

Remaining untested paths: native browser Sortable drag mechanics and full localStorage persistence/debounce behavior; no browser gate is required for R2.

Next exact step and expected result: start R3 geometry baseline with real `three` and `GCodeVisualizer`; preserve R1/R2 frontend test baseline.

Status transition / blocker ID: R2 `in_progress` → `completed`; no blocker.

## R3 geometry baseline — started 2026-09-18T18:25:06+08:00

Task / session / timestamp: R3 / root session / 2026-09-18T18:25:06+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `89a863a8` / working tree clean.

Plan contract and baseline fixture: `09-regression-gates.md` Task R3 and `geometry-baseline.json`. Create `src/app/widgets/Visualizer/__tests__/fixtures.js`, `geometry.test.js`, and `pivot.test.js`; use real `three`, real `GCodeVisualizer`, real parser/helpers, hand-written expected geometry, explicit cleanup, arc-plane fixtures, empty/reload/unit/frame cases, and pivot oracle with tolerance.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: R3 is a geometry oracle and pivot/state baseline spanning parser, Three.js object ownership, arc sampling, and machine-profile transitions; contract is fixed but verification and numerical/state risk are high. Unresolved decision / decision owner: none; root reviews the oracle and owns ledger/status.

Changed files / commit: pending worker.

Verification: pending worker; required focused geometry/pivot tests, nearby/full frontend regression, ESLint, and diff check.

Status transition / blocker ID: R3 `todo` → `in_progress`; no blocker.

## R3 geometry baseline — completed 2026-09-18T18:43:47+08:00

Task / session / timestamp: R3 / root session / 2026-09-18T18:43:47+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `89a863a8` / R3 tests and ledger updates only.

Changed files / commit or uncommitted diff: `src/app/widgets/Visualizer/__tests__/fixtures.js`, `geometry.test.js`, and `pivot.test.js`; uncommitted, phase commit pending.

Before / after / intentional differences: R3 now records real parser/Three.js geometry using the fixed rectangle and repo arc-plane fixtures, hand-written bounds and sample points, metric/imperial units, empty input, frame-index bounds, same/different reload replacement, and explicit geometry/material cleanup. Pivot tests exercise profile A/profile B/no profile transitions, G-code centering, unload behavior, and world-center tolerance `1e-6` through the existing Visualizer class and renderer scene capture.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Visualizer/__tests__/geometry.test.js src/app/widgets/Visualizer/__tests__/pivot.test.js` / 0 / 2 suites and 10 tests passed; nearby Visualizer tests / 0 / 4 suites and 12 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 15 suites and 88 tests passed; `yarn eslint src/app/widgets/Visualizer/__tests__/fixtures.js src/app/widgets/Visualizer/__tests__/geometry.test.js src/app/widgets/Visualizer/__tests__/pivot.test.js` / 0 errors, 17 existing warnings; `git diff --check` / 0.

Review findings and resolutions: the initial rectangle assertion used `min.x = 11`, but the real parser and plan fixture produce `10`; corrected to the plan oracle. The initial frame-color assertion assumed a THREE.Color object, but Three.js stores the known lightgrey value as an integer; removed the non-contract color assertion rather than coupling the gate to representation. No production changes were needed.

Artifacts: `src/app/widgets/Visualizer/__tests__/fixtures.js`, `geometry.test.js`, `pivot.test.js`.

Remaining untested paths: renderer/WebGL resource lifecycle and browser visual evidence remain R4/R6 obligations; R3 is a non-browser geometry/pivot gate.

Next exact step and expected result: R1, R2, and R3 are complete. U2 is now the only eligible implementation task because its R1/R2 dependencies are complete; preserve the three passing regression baselines.

Status transition / blocker ID: R3 `in_progress` → `completed`; no blocker.

## U2 primitives pilot — started 2026-09-18T19:30:55+08:00

Task / session / timestamp: U2 / root session / 2026-09-18T19:30:55+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `90d7b1b5` / working tree clean.

Plan contract and baseline fixture: `02-shared-ui.md` Task U2. Pilot direct replacement in `src/app/widgets/Spindle/Spindle.jsx` and `src/app/widgets/GCode/index.jsx`; add `src/app/widgets/Spindle/__tests__/Spindle.test.jsx`; preserve controller command callbacks, numeric speed persistence, G-code data rendering, existing view contract, and responsive/light-dark behavior. Do not remove all legacy consumers or create a permanent compatibility wrapper.

Worker brief: model `gpt-5.6-luna`, reasoning `high`, `fork_turns: none`. Selection reason: Tonic primitive mappings and pilot scope are fixed and local; state/timing risk is limited to existing form/controller callbacks, so high is sufficient. Escalation condition: if Tonic prop behavior or callback ownership proves cross-component/async and cannot be validated locally, stop and reclassify to max. Unresolved decision / decision owner: none; root reviews the diff and owns ledger/status.

Changed files / commit: pending worker.

Verification: pending worker; required Spindle/GCode focused tests, nearby/full frontend regression, ESLint, and diff check.

Status transition / blocker ID: U2 `todo` → `in_progress`; no blocker.

## U2 primitives pilot — completed 2026-09-18T19:40:40+08:00

Task / session / timestamp: U2 / root session / 2026-09-18T19:40:40+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `90d7b1b5` / U2 source/tests and ledger updates only.

Changed files / commit or uncommitted diff: `src/app/widgets/Spindle/Spindle.jsx`, `src/app/widgets/GCode/index.jsx`, `src/app/widgets/Spindle/__tests__/Spindle.test.jsx`, and the Tonic `Box` mock update in `WidgetLayoutContract.test.jsx`; uncommitted, phase commit pending.

Before / after / intentional differences: Spindle no longer imports legacy Buttons, FormControl/Input, FormGroup, GridSystem, or InputGroup. It uses direct Tonic Button/ButtonGroup/Input/InputGroup/InputGroupAddon/Box/Flex primitives while preserving 12-column width semantics (`8/12` → `66.66666667%`), spacing, disabled rules, speed config persistence, and controller commands. GCode replaces the legacy fluid Container with a full-width Tonic Box. The Spindle test rejects legacy primitive imports and verifies all six command payloads, disabled state, and positive/non-positive speed persistence. No broad legacy deletion was attempted.

Verification: required `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Spindle/__tests__/Spindle.test.jsx src/app/widgets/GCode/__tests__/GCodeStats.test.js` / 0 / 2 suites and 4 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 16 suites and 91 tests passed; `yarn eslint src/app/widgets/Spindle/Spindle.jsx src/app/widgets/GCode/index.jsx src/app/widgets/Spindle/__tests__/Spindle.test.jsx src/app/pages/Workspace/__tests__/WidgetLayoutContract.test.jsx` / 0 errors, 17 existing warnings; `git diff --check` / 0.

Review findings and resolutions: Tonic `InputGroupAddon` replaces the legacy compound append/text pair; no compatibility wrapper was introduced. Remaining legacy consumers are intentional and include 34 widget Button imports plus layout imports in `GCodeStats.jsx` and `Spindle/index.jsx`.

Artifacts: `src/app/widgets/Spindle/__tests__/Spindle.test.jsx`.

Remaining untested paths: browser visual comparison and other legacy consumers remain later task scope; no browser gate is required for U2.

Next exact step and expected result: start U3 overlay/form contract pilot, preserving the 16-suite/91-test baseline.

Status transition / blocker ID: U2 `in_progress` → `completed`; no blocker.

## U3 overlay/form contract — started 2026-09-18T19:47:18+08:00

Task / session / timestamp: U3 / root session / 2026-09-18T19:47:18+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `a2a19935` / generated `.codebase-memory/` only; no source changes.

Plan contract: `02-shared-ui.md` Task U3. Pilot the Custom settings modal with direct Tonic Modal/Button/field primitives; explicitly configure `isOpen`, `isClosable`, overlay/Escape behavior, focus lock and focus restoration; preserve react-final-form initial values, validation timing, dirty/cancel/submit semantics; retain existing `useToast` persistence behavior; add modal/form interaction tests including submit success/failure, cancel, overlay/Escape, and nested-close focus ordering. Do not add another modal provider/root or broadly remove legacy families.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, moderate index generation `2026-09-18T11:44:50Z`; `search_graph` located `src/app/widgets/Custom/modals/SettingsModal.jsx`, old Modal family, and `useToast.js`; `trace_path` returned no JSX callers/callees, so literal callers must be checked with `rg`; `check_index_coverage` reported no recorded issue for all relied-on source files.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: U3 changes modal lifecycle, focus lock/restoration, overlay/Escape semantics, react-final-form validation/submission timing, and nested modal behavior; the task has fixed scope but high state and accessibility risk. Worker must use test-first red/green evidence, stop and report if the Tonic API cannot preserve the old contract, and must not modify STATUS/HANDOFF/execution-log.

Changed files / commit: pending worker.

Verification: pending worker; required focused SettingsModal tests, nearby/full frontend regression, ESLint, and `git diff --check`.

Status transition / blocker ID: U3 `todo` → `in_progress`; no blocker.

## U3 overlay/form contract — completed 2026-09-18T20:01:41+08:00

Task / session / timestamp: U3 / root session / 2026-09-18T20:01:41+08:00.

Changed files: `src/app/widgets/Custom/modals/SettingsModal.jsx` and `src/app/widgets/Custom/__tests__/SettingsModal.test.jsx`. Existing Custom `ModalProvider/ModalRoot` caller wiring remains; no second provider/root was added. `useToast` was inspected and left unchanged because it already renders Tonic `Toast` with the required success/info 5-second and error/warning persistent durations.

Before / after / intentional differences: the pilot removed legacy Button, FormControl/Input, FormGroup, InlineError, and compound Modal imports. It now renders direct Tonic Modal/Overlay/Content/Header/Body/Footer/Button/Input/Box/Text primitives; maps `isOpen`/`isClosable`; explicitly enables `autoFocus`/`ensureFocus`/`closeOnEsc`/`returnFocusOnClose` behavior and disables outside interaction. React Final Form initial values, field wiring, submit/cancel flow, config writes, touched-error rendering, and draft preservation remain in place. Synchronous config-write failures become form-level errors and do not close the modal.

Worker execution: the two dispatched Luna `max` workers were stopped after no source/test diff became visible; root completed the bounded implementation after preserving the same contract and recording the result here. No worker ledger changes were accepted.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Custom/__tests__/SettingsModal.test.jsx` / 0 / 1 suite and 6 tests passed; nearby Custom + Workspace contract/lifecycle tests / 0 / 3 suites and 46 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 17 suites and 97 tests passed; ESLint exits 0 with 17 existing warnings and no errors; `git diff --check` exits 0. Codebase-memory coverage check returned no recorded issue for the changed source and new test (source metadata changed/new test not tracked, so direct source/test reads were used).

Review findings and resolutions: Tonic focus restoration completes after the controlled caller unmounts the always-open modal; the test harness models that lifecycle. Nested Escape closes only the top dialog and then restores the original trigger after the outer dialog closes. The literal `final-form` `FORM_ERROR` key is used so returned failures render through `FormSpy`.

Status transition / blocker ID: U3 `in_progress` → `completed`; no blocker.

## B1 session boundary — started 2026-09-18T20:17:38+08:00

Task / session / timestamp: B1 / root session / 2026-09-18T20:17:38+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `7995ee67` / working tree clean.

Plan contract: `details/03b-query-boundaries.md` Task B1. Create `src/app/queries/session.js` and `src/app/queries/__tests__/session.test.jsx`; migrate LoginPage sign-in to a `useSigninMutation` with `retry: false` and pending-submit protection; cancel and clear session-scoped Query cache before logout navigation; make bootstrap reuse a pure sign-in transport without calling hooks; preserve token storage, authenticated/error/navigation, analytics, and controller connection behavior. Never place tokens in query keys, DOM, errors, or logs.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, moderate generation `2026-09-18T11:44:50Z`, status ready, parse-partial only unrelated files; `search_graph` found `lib.user.signin`, `lib.user.signout`, `bootstrap.authenticateSessionToken`, LoginPage, Header, GlobalProvider, and QueryClientProvider. `trace_path` returned zero for the JS import callers, so literal callers were confirmed with `rg`: LoginPage sign-in, Header logout, and bootstrap session restore. Coverage checks for LoginPage, Header, bootstrap, user, context, and test render returned no recorded issues.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: B1 crosses React Query mutation state, logout cache lifecycle, saga/bootstrap non-React boundaries, and authentication failure semantics; it has a fixed contract but high session-state risk. Worker must use test-first red/green evidence, preserve the existing controller/analytics flows, stop and report if the QueryClient ownership or logout ordering is ambiguous, and must not modify STATUS/HANDOFF/execution-log.

Changed files / commit: pending worker.

Verification: pending worker; required focused session tests, nearby auth/provider regression, full frontend regression, ESLint, and `git diff --check`.

Status transition / blocker ID: B1 `todo` → `in_progress`; no blocker.

## B1 session boundary — completed 2026-09-18T20:44:00+08:00

Task / session / timestamp: B1 / root session / 2026-09-18T20:44:00+08:00.

Changed files: `src/app/queries/session.js`, `src/app/queries/__tests__/session.test.jsx`, `src/app/containers/app/LoginPage.jsx`, `src/app/containers/app/__tests__/LoginPage.test.jsx`, `src/app/sagas/app/bootstrap.js`, `src/app/sagas/app/__tests__/bootstrap.test.js`, and `src/app/containers/app/Header.jsx`.

Implementation: `useSigninMutation` wraps the pure `signin` transport with `retry: false`; LoginPage uses `mutateAsync`, preserves authentication failure, analytics, controller, and navigation behavior, and blocks duplicate pending submits. Logout awaits pure sign-out, then cancels active queries and clears the QueryClient before navigation. Bootstrap exports and reuses the same pure signin transport without invoking a hook. No access token is added to a query key, DOM output, error message, or execution log.

Worker execution: the dispatched `gpt-5.6-luna` / max worker produced no source diff after a progress check and was stopped; root completed the bounded implementation and recorded the same contract. No worker ledger changes were accepted.

Verification: focused B1 command (`session`, `LoginPage`, and `bootstrap`) passed 3 suites / 8 tests; full `yarn test:frontend --runInBand --silent` passed 20 suites / 105 tests; changed-file ESLint exited 0; `git diff --check` passed. Phase delivery committed as `feat: add session query boundary`.

Status transition / blocker ID: B1 `in_progress` → `completed`; no blocker. Next eligible tasks are M1, T1, and P0.

## M1 shared Macro query contract — started 2026-09-18T20:37:20+08:00

Task / session / timestamp: M1 / root session / 2026-09-18T20:37:20+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `338da320` / working tree clean.

Plan contract: `details/03a-query-contract.md` Task M1. Create `src/app/queries/macros.js` and its tests; move Administration Macro query hooks behind the shared module; preserve `API_MACROS_QUERY_KEY`, hook names, `{ meta, data }` variables, response payloads, filter/detail key separation, Axios abort signal, option overrides that are not `queryKey`/`queryFn`, and mandatory CRUD invalidation ordering.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, ready moderate index generation `2026-09-18T11:44:50Z`; Macro query hooks and all Administration/widget callers were located with `search_graph`/`rg`; coverage checks are required for every changed source and test path before completion. M1 is unit-only; no browser gate applies.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: M1 has a fixed hook/transport contract but multiple Query v4 cache, signal, option, and invalidation edge cases; a max worker can implement the test-first contract in isolation while root audits callers and ledger state. Worker must own only the Macro query module/tests and Administration query re-export/import edits, must not modify STATUS/HANDOFF/execution-log, and must stop on contract ambiguity.

Changed files / commit: pending worker.

Verification: pending worker; required Macro query focused tests, nearby/full frontend regression, ESLint, and `git diff --check`.

Status transition / blocker ID: M1 `todo` → `in_progress`; no blocker.

## M1 shared Macro query contract — completed 2026-09-18T20:50:29+08:00

Task / session / timestamp: M1 / root session / 2026-09-18T20:50:29+08:00.

Changed files: `src/app/queries/macros.js`, `src/app/queries/__tests__/macros.test.jsx`, `src/app/pages/Administration/Macros/queries.js`, `src/app/pages/Administration/Macros/Macros.jsx`, `src/app/pages/Administration/Macros/drawers/CreateMacroDrawer.jsx`, and `src/app/pages/Administration/Macros/drawers/UpdateMacroDrawer.jsx`.

Implementation: shared list/detail hooks preserve the existing list key and mutation variable shapes, return `response.data`, pass Axios abort signals, isolate detail cache entries, and disable missing-id detail queries. Query key/query function options are fixed while caller options such as `select` remain available. All Macro CRUD hooks explicitly disable retries, invalidate the Macro key prefix before caller `onSuccess`, and preserve failure behavior. Administration now imports the shared module directly; its local module remains a compatibility re-export and duplicate invalidation calls were removed.

Worker execution: the dispatched `gpt-5.6-luna` / max worker produced no source diff after repeated progress checks and was stopped; root completed the bounded implementation with the same test-first contract. No worker ledger changes were accepted.

Verification: focused M1 suite passed 10 tests; full `yarn test:frontend --runInBand --silent` passed 21 suites / 115 tests; `yarn build-dev` compiled successfully; full ESLint exited 0 with 17 existing warnings; changed-file ESLint exited 0; `git diff --check` passed. Production `yarn build` was not run because the repository rules reserve production builds for CI.

Status transition / blocker ID: M1 `in_progress` → `completed`; no blocker. Next eligible tasks are T1 and P0.

## T1 Terminal owner baseline — started 2026-09-18T20:55:00+08:00

Task / session / timestamp: T1 / root session / 2026-09-18T20:55:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `3386cd7b` / working tree clean.

Plan contract: `details/04a-terminal-owner.md` Task T1. Inventory the actual `Console` owner contract (`writeln`, `prompt`, `clear`, `resize`, `clearSelection`, `refresh`, `selectAll`), preserve the fixed `connection:close` ref shape, and prove each Console owner instance has a stable distinct sender id with self-echo filtering. T1 is a characterization baseline; do not introduce `useTerminal` or T2 lifecycle changes.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, ready moderate generation `2026-09-18T11:44:50Z`; `search_graph` located `Console.jsx`, `Terminal.jsx`, `History.js`, and `ConsoleWidget`; direct source reads are required for the test directory because tests are excluded from the graph index. Coverage checks will be run for every relied-on source/test path before completion.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: T1 is a bounded characterization task, but Terminal has multiple event/lifecycle consumers and per-owner sender filtering; max effort reduces the risk of missing an existing consumer while keeping the worker limited to the Console baseline test. Worker must own only `src/app/widgets/Console/__tests__/Console.test.jsx`, must not modify STATUS/HANDOFF/execution-log, and must stop on any contract ambiguity.

Changed files / commit: pending worker; no production change claimed.

Verification: pending focused Console baseline tests, nearby/full frontend regression, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: T1 `todo` → `in_progress`; no blocker.

## T1 Terminal owner baseline — completed 2026-09-18T21:40:00+08:00

Task / session / timestamp: T1 / root session / 2026-09-18T21:40:00+08:00.

Changed files: `src/app/widgets/Console/__tests__/Console.test.jsx` and the T1 plan/ledger documents. No production source change was required; the existing `98ceb1f6` close-ref fix remains the implementation baseline.

Implementation: the Console characterization suite now inventories all actual owner consumers: connection-open/write/read `writeln`, string `prompt`, connection-close `clear`, shared/fullscreen `resize`, and terminal widget `clearSelection`/`refresh`/`selectAll`. It verifies the fixed wrapper ref shape, filters self-echo by sender id, forwards `onData` context, and proves two mounted owners receive distinct sender ids.

Worker execution: the dispatched `gpt-5.6-luna` / max worker completed source inventory and reported no diff; root added the bounded test coverage. No worker ledger changes were accepted.

Verification: focused `yarn test:frontend --runInBand --runTestsByPath src/app/widgets/Console/__tests__/Console.test.jsx` passed 1 suite / 6 tests; full `yarn test:frontend --runInBand --silent` passed 21 suites / 120 tests; `yarn build-dev` compiled successfully; full `yarn eslint` exited 0 with 17 existing warnings; `git diff --check` passed. Codebase-memory coverage for all relied-on production files reported no recorded issue; the test subtree is intentionally excluded and was read directly.

Status transition / blocker ID: T1 `in_progress` → `completed`; no blocker. Next eligible tasks are T2 and P0.

## T2 Terminal owner — started 2026-09-18T21:42:00+08:00

Task / session / timestamp: T2 / root session / 2026-09-18T21:42:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `c10e4569` / working tree clean.

Plan contract: `details/04a-terminal-owner.md` Task T2. Create `useTerminal({ enabled, cols, rows, cursorBlink, scrollback, tabStopWidth, onData })` with `{ containerRef, isReady, prompt, actions }`; move xterm ownership and Terminal input/history/prompt behavior into the hook; make `Terminal` a function DOM view; preserve the T1 consumer list, disconnected output behavior, options/size updates, callback freshness, and explicit resource cleanup. Do not implement T3 lifecycle gates beyond what T2 cleanup requires.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, ready moderate generation `2026-09-18T11:44:50Z`; source coverage for Console/Terminal/History was clean at T1, while tests are excluded by design and require direct reads. The worker must review the full Terminal implementation before changing ownership.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: T2 crosses xterm resource creation, DOM refs, keyboard/paste/history state, callback freshness, option/size updates, and Console event ownership; max effort is required for the fixed API and lifecycle risk. Worker owns only `useTerminal.js`, `useTerminal.test.jsx`, `Terminal.jsx`, `Console.jsx`, and relevant Console test adjustments; it must not modify STATUS/HANDOFF/execution-log, must preserve T1 behavior, and must stop/report if xterm or React lifecycle semantics are ambiguous.

Changed files / commit: pending worker; no production change claimed.

Verification: pending focused Console/useTerminal tests, nearby/full frontend regression, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: T2 `todo` → `in_progress`; no blocker.

## T2 Terminal owner — completed 2026-09-18T21:55:01+08:00

Task / session / timestamp: T2 / root session / 2026-09-18T21:55:01+08:00.

Changed files: `src/app/widgets/Console/useTerminal.js`, `src/app/widgets/Console/__tests__/useTerminal.test.jsx`, `src/app/widgets/Console/Terminal.jsx`, `src/app/widgets/Console/Console.jsx`, `src/app/widgets/Console/__tests__/Console.test.jsx`, and the T2 plan/ledger documents.

Implementation: `useTerminal` now owns xterm, FitAddon, PerfectScrollbar, prompt, keyboard editing, paste normalization, History, current callback ref, option/size updates, and explicit event/addon/terminal cleanup. Its public API is `{ containerRef, isReady, prompt, actions }`, with only the seven T1 consumer actions. `Terminal` is a function DOM view with the existing log semantics and CSS. `Console` uses the hook owner for controller/pubsub/widget events and keeps sender filtering unchanged.

Worker execution: the dispatched `gpt-5.6-luna` / max worker completed contract review but produced no source diff; root implemented the bounded T2 change and recorded the same contract. No worker ledger changes were accepted.

Verification: focused Console/useTerminal command passed 2 suites / 9 tests; full `yarn test:frontend --runInBand --silent` passed 22 suites / 123 tests; `yarn build-dev` compiled successfully; full `yarn eslint` exited 0 with 17 existing warnings; `git diff --check` passed. Codebase-memory coverage reported metadata changes for Console/Terminal and new/untracked useTerminal/test paths; all were read directly, and the Console test subtree remains intentionally excluded.

Scope boundary: T3 reconnect/disconnect/reconnect, callback-after-rerender Enter, paste/history/selection event matrix, StrictMode 20-cycle resource gate, and browser evidence remain unimplemented and are not claimed here.

Status transition / blocker ID: T2 `in_progress` → `completed`; no blocker. Next eligible tasks are T3 and P0.

## T3 Terminal lifecycle — started 2026-09-18T21:58:00+08:00

Task / session / timestamp: T3 / root session / 2026-09-18T21:58:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `8c9a8646` / working tree clean.

Plan contract: `details/04a-terminal-owner.md` Task T3. Prove connected→disconnected→connected resource disposal/recreation, fullscreen resize without owner replacement, latest `onData` on Enter, connection read/write once, paste/history/selection/refresh/resize callbacks, and bounded active resources over repeated mount/unmount plus StrictMode. Browser font/size/selection evidence remains R6 scope.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, ready moderate generation `2026-09-18T11:44:50Z`; T2 source paths have metadata changes and new hook/test paths are not tracked, so direct source/test reads remain authoritative. Coverage will be checked for the T3 paths before completion.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: T3 combines React effect ordering, xterm resource disposal, callback freshness, history/input semantics, and StrictMode accounting; max effort is required for lifecycle risk. Worker owns only T3 test additions/adjustments and bounded hook fixes in the Console files; it must not modify STATUS/HANDOFF/execution-log, must preserve T2’s public API, and must stop/report if a browser-only claim is required.

Changed files / commit: pending worker; no lifecycle gate claimed.

Verification: pending focused Console/useTerminal lifecycle tests, nearby/full frontend regression, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: T3 `todo` → `in_progress`; no blocker.

## T3 Terminal lifecycle — completed 2026-09-18T22:01:00+08:00

Task / session / timestamp: T3 / root session / 2026-09-18T22:01:00+08:00.

Changed files: `src/app/widgets/Console/__tests__/useTerminal.test.jsx` and the T3 plan/ledger documents. No production source change was required; T2’s resource owner passed the lifecycle gates.

Verification: focused Console/useTerminal command passed 2 suites / 12 tests; full `yarn test:frontend --runInBand --silent` passed 22 suites / 126 tests; full `yarn eslint` exited 0 with 17 existing warnings; `git diff --check` passed. Codebase-memory coverage reported no recorded issue but stale metadata for T2/new paths; direct source/test reads were used, and the test subtree remains intentionally excluded.

Coverage: connected→disconnected→connected disposes and recreates xterm resources; latest `onData` is used by Enter after rerender; history up, multiline paste, selection, refresh, resize, fullscreen/size updates, connection owner behavior, and StrictMode one-active/zero-after-unmount checks pass. Browser font/size/selection evidence remains deferred to R6 under the existing BR0 waiver.

Worker execution: the dispatched `gpt-5.6-luna` / max worker was stopped after contract review without a diff; root added the bounded lifecycle tests. No worker ledger changes were accepted.

Status transition / blocker ID: T3 `in_progress` → `completed`; no blocker. Next eligible task is P0.

## P0 unused families — started 2026-09-18T22:03:00+08:00

Task / session / timestamp: P0 / root session / 2026-09-18T22:03:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `0074ff98` / working tree clean.

Plan contract: `details/08a-component-families.md` Task P0. Run import-graph/static inventory for Blink, Breadcrumbs, ColorModeProvider, Ellipsis, Form, Input, Loader, OverflowTooltip, RefHolder, RowsHelper, SectionGroup, SectionTitle, Toggle, and ToastNotification. Delete only families with zero resolved runtime consumers, including orphaned index/style/assets/context files; if a consumer exists, use the documented Tonic/native replacement and add only behavior tests. Do not touch P1–P6 families or unrelated UI code.

Codebase-memory handoff: project `cncjs-tonic-ui-v2`, ready moderate generation `2026-09-18T11:44:50Z`; structural graph queries plus literal `rg`/filesystem resolution are required because aliases, barrels, and deprecated files can evade one method. Coverage checks will be run for every changed/deleted path and the negative scan.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: P0 is a static/import-resolution task with potentially destructive deletions; max effort is required to prove zero consumers and avoid deleting hidden barrel/style/context dependencies. Worker owns inventory and bounded P0 deletions only, must not modify STATUS/HANDOFF/execution-log, must stop on any consumer ambiguity, and must not delete P1–P6 families.

Changed files / commit: pending worker; no family deletion claimed.

Verification: pending P0 import scan, focused consumer tests if needed, full frontend regression, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: P0 `todo` → `in_progress`; no blocker.

## P0 unused families — completed 2026-09-18T22:15:00+08:00

Task / session / timestamp: P0 / root session / 2026-09-18T22:15:00+08:00.

Changed files: deleted the 14 orphaned P0 family directories under `src/app/components`: Blink, Breadcrumbs, ColorModeProvider, Ellipsis, Form, Input, Loader, OverflowTooltip, RefHolder, RowsHelper, SectionGroup, SectionTitle, Toggle, and ToastNotification. Updated the P0 plan/ledger documents. No consumer replacement was needed. `src/app/components/Notifications/ToastNotification.jsx` is a distinct P1 family and remains untouched.

Import audit: codebase graph search plus literal alias/relative/barrel/style scans found zero resolved runtime consumers for every deleted path. No `src/app/styles` import referenced deleted Stylus. The negative path scan is clean after deletion.

Verification: full `yarn test:frontend --runInBand --silent` passed 22 suites / 126 tests; `yarn build-dev` compiled successfully; full `yarn eslint` exited 0 with 17 existing warnings; `git diff --check` passed. Codebase-memory coverage was refreshed after deletion and reported the deleted family paths as not tracked; direct source and import reads were used for the audit.

Worker execution: the dispatched `gpt-5.6-luna` / max worker completed the initial static review but produced no diff before it was stopped; root performed the bounded deletion after independently verifying the same zero-consumer result. No worker ledger changes were accepted.

Status transition / blocker ID: P0 `in_progress` → `completed`; no blocker. Next eligible task is M2.

## M2 Macro mutation — started 2026-09-18T22:14:00+08:00

Task / session / timestamp: M2 / root session / 2026-09-18T22:14:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `d37338f0` / working tree clean.

Plan contract: `details/03a-query-contract.md` Task M2. Verify every shared Macro CRUD mutation keeps the exact API shape, uses `retry: false`, invalidates the `API_MACROS_QUERY_KEY` prefix before the caller `onSuccess`, and leaves failure paths without invalidation or callbacks. Audit shared QueryClient ownership across the main app and portal roots; config changes may invalidate reads only and must not trigger mutations. Preserve session cache-boundary behavior and do not change unrelated query domains.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: M2 combines mutation ordering with multi-root QueryClient/session lifecycle behavior; max effort is required to verify async ordering and avoid duplicate invalidation or mutation triggers. Worker owns bounded M2 tests/source changes only, must not modify STATUS/HANDOFF/execution-log, must stop on any contract ambiguity, and must not start M3 UI work.

Verification: M2 focused mutation/lifecycle tests passed 3 suites / 20 tests; full `yarn test:frontend --runInBand --silent` passed 23 suites / 132 tests; full ESLint exited 0 with 17 existing warnings; `yarn build-dev` compiled successfully; `git diff --check` passed.

Status transition / blocker ID: M2 `todo` → `in_progress`; no blocker.

## M2 Macro mutation — completed 2026-09-18T22:25:00+08:00

Task / session / timestamp: M2 / root session / 2026-09-18T22:25:00+08:00.

Changed files: `src/app/queries/__tests__/macros.test.jsx` now proves caller retry overrides cannot resubmit any CRUD mutation; `src/app/queries/MacroQueryEvents.jsx` and its test add one App-owned config listener that invalidates Macro read data only; `src/app/queries/session.js` and `App.jsx` add the main-root session cache boundary; session tests cover identity-change cancel/remove ordering. The shared `macros.js` mutation implementation already matched the required exact endpoint, payload, retry, invalidation, and callback contract, so no hook source change was needed.

Lifecycle audit: `context.jsx` keeps one module-level QueryClient, and `portal.jsx` reuses that same GlobalProvider module. MacroQueryEvents is mounted by the main App, not GlobalProvider, so portal roots do not create duplicate bridge listeners. Session identity is held only in memory; a change cancels queries before removing old cache entries, without logging or keying by token.

Worker execution: the dispatched `gpt-5.6-luna` / max worker completed contract review but produced no diff before it was stopped. Root added the bounded tests and lifecycle bridge after independently reviewing the same source contract. No worker ledger changes were accepted.

Verification: focused `macros`, `session`, and `MacroQueryEvents` suites passed 3 suites / 20 tests; full `yarn test:frontend --runInBand --silent` passed 23 suites / 132 tests; full ESLint exited 0 with 17 existing warnings; `yarn build-dev` compiled successfully; `git diff --check` passed.

Status transition / blocker ID: M2 `in_progress` → `completed`; no blocker. Next eligible task is M3.

## M3 Macro UI — started 2026-09-18T22:29:00+08:00

Task / session / timestamp: M3 / root session / 2026-09-18T22:29:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `f2dd2d66` / working tree clean.

Plan contract: `details/03a-query-contract.md` Task M3. Convert the Macro widget to shared `useFetchMacrosQuery` data and controlled view props; preserve controller run/load/export behavior and existing action gating. New/Edit/Delete must use shared mutations, await success before close, retain form values and show an i18n error on failure, and prevent duplicate pending submissions. Verify delete confirmation closes exactly the intended layer. Cover initial loading, empty, failure, background refetch with rows retained, and widget/Administration cache synchronization. Do not remove XState packages or unrelated widgets until repo-wide consumer audit proves they are unused.

Worker brief: model `gpt-5.6-luna`, reasoning `max`, `fork_turns: none`. Selection reason: M3 crosses class-to-function conversion, Query observer states, portal form lifecycles, and nested modal close ordering; max effort is required to preserve user-visible behavior while removing the fetch actor. Worker owns Macro widget/modal source and colocated tests only, must not modify STATUS/HANDOFF/execution-log, must stop on any API or close-order ambiguity, and must not start Q2 cleanup or remove shared XState dependencies.

Verification: pending focused Macro UI/mutation tests, full frontend regression, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: M3 `todo` → `in_progress`; no blocker.

## M3 Macro UI — completed 2026-09-18T22:55:00+08:00

Task / session / timestamp: M3 / root session / 2026-09-18T22:55:00+08:00.

Changed files: `src/app/widgets/Macro/index.jsx`, `Macro.jsx`, `modals/NewMacro.jsx`, `modals/EditMacro.jsx`, `modals/ConfirmDeleteMacro.jsx`, `__tests__/Macro.test.jsx`, and `__tests__/MacroMutations.test.jsx`; removed the Macro-only `context.js` and orphaned `src/app/machines/index.js`. Updated the M3 plan/ledger documents. The unrelated `src/server/controllers/Grbl/GrblController.js` warning remains pre-existing and was not changed.

Implementation: Macro now uses the shared `useFetchMacrosQuery` observer and controlled widget view props. New/Edit/Delete use shared mutations, await success before close, retain form drafts and show i18n form errors on failure, and use synchronous pending locks. Delete confirmation keeps both layers open on failure and closes `closeConfirm` before `closeEdit` on success. Background refetch errors retain visible rows. The error text uses the Tonic spacing token `mr="-9x"` (`1x = 4px`, so `-9x = -36px`). A repo-wide source scan found no remaining Macro actor/machine/context consumers; XState package removal remains Q2-cleanup scope.

Worker execution: the dispatched `gpt-5.6-luna` / max worker completed the contract review but produced no source diff before it was stopped. Root implemented and verified the bounded M3 change. No worker ledger changes were accepted.

Verification: focused Macro/query/session command passed 5 suites / 29 tests; full `yarn test:frontend --runInBand --silent` passed 25 suites / 141 tests; `yarn build-dev` compiled successfully; full `yarn eslint` exited 0 with 17 existing warnings; `git diff --check` passed. Browser gates remain waived/deferred to R6.

Status transition / blocker ID: M3 `in_progress` → `completed`; no blocker. Phase commit: `db0db29e`. Next eligible task is Q2-cleanup.

## Q2-cleanup — started 2026-09-18T23:10:00+08:00

Task / session / timestamp: Q2-cleanup / root session / 2026-09-18T23:10:00+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `c89efced` / working tree clean.

Plan contract: remove `xstate` and `@xstate/react` only after a repo-wide consumer audit; verify widget and Administration Macro observers share the same invalidation contract after create/update/delete; preserve controller Run/Load and existing Administration pagination/filter behavior. Do not remove unrelated generic fetch hooks or change other widgets.

Consumer audit: source and non-generated repository scans found no `createFetchMachine`, `fetchMacrosService`, `ServiceContext`, `@xstate/react`, `xstate`, or `@app/machines` consumers. `yarn why` reports both packages as root-only dependencies.

Worker assignment: plan default is `gpt-5.6-luna` / high; this Q2 subtask has a fixed consumer boundary and bounded package/cache verification, so max effort is not required. Root is executing the implementation; no worker ledger changes are authorized.

Changed files / commit: pending; no source change claimed yet.

Verification: pending dependency audit, shared-cache cross-screen regression, full frontend tests, ESLint, development build, and `git diff --check`.

Status transition / blocker ID: Q2-cleanup `todo` → `in_progress`; no blocker.

## Q2-cleanup — completed 2026-09-18T23:25:00+08:00

Task / session / timestamp: Q2-cleanup / root session / 2026-09-18T23:25:00+08:00.

Changed files: `package.json` and `yarn.lock` remove the now-unused `xstate` and `@xstate/react` root dependencies. `src/app/queries/__tests__/macros.test.jsx` adds a shared-cache regression with active unfiltered widget and paginated Administration observers. Updated the Q2 checkboxes and task ledger.

Audit and behavior: repo-wide source/literal scans found no XState, Macro fetch actor, context, or machine consumers; `yarn why` showed both packages as root-only. The new test proves one create mutation invalidates both observers, causes two refetches, and stores updated records under both query keys. No controller workflow, Run/Load gating, export path, or unrelated generic fetch hook was changed.

Verification: focused Macro query suite passed 15 tests; full `yarn test:frontend --runInBand --silent` passed 25 suites / 142 tests; `yarn remove xstate @xstate/react` completed with existing peer warnings; full ESLint exited 0 with 17 existing warnings; `yarn build-dev` compiled successfully; `git diff --check` passed.

Status transition / blocker ID: Q2-cleanup `in_progress` → `completed`; no blocker. Phase commit: `730a0045`. Next eligible tasks are G1–G7.

## G1 Connection — scope redefinition and completion 2026-09-19T20:08:32+08:00

Task / session / timestamp: G1 / current root session / 2026-09-19T20:08:32+08:00.

G1-B01 resolution path: adversarial review of the blocking contract produced a plan that required server changes (`src/server/**`, operation IDs, `connectionLifecycleMeta`, cancellation events). User direction reset the scope: frontend-only, existing Socket.IO protocol unchanged, keep `CNCJSController.open(controllerType, connectionType, options, callback)` and `CNCJSController.close(callback)`, do not add Redux actions/reducers/sagas. Blocker reasoning, rejected server-side options, and the accepted frontend design are captured in `docs/superpowers/plans/2026-09-19-connection-frontend-runtime.md`.

Design: the server owns one global physical connection; Socket.IO lifecycle events are authoritative for every browser client. A local timeout settles only the caller promise. The runtime serializes local open/close until a server lifecycle result arrives or Socket.IO disconnects, which prevents a second local request from consuming the first request's late callback. A late `connection:open` always drives the snapshot to `connected`.

Changed files / commit: `5b0c00e2`

- `src/app/runtime/connectionRuntime.js` (new): controller-bound runtime with `getSnapshot()`/`subscribe()`, `open()`/`close()`/`command()`/`write()`/`writeln()`/`destroy()`; timeout, duplicate-request guard, and late-event authority.
- `src/app/runtime/connectionRuntimeSingleton.js` (new): singleton bound to `@app/lib/controller`.
- `src/app/context.jsx`: imports the singleton at the application root so initialization is not tied to the Connection widget mounting.
- `src/app/hooks/useConnection.js` (new): `useSyncExternalStore` over the singleton; single public interface.
- `src/app/queries/serialport.js` (new): TanStack Query hooks for `getPorts()` and `getBaudRates()`.
- `src/app/widgets/Connection/Connection.jsx`: consumes `useConnection()` and the query hooks; Redux connection and serial-port action imports removed.
- Tests: `src/app/runtime/__tests__/connectionRuntime.test.js`, `src/app/hooks/__tests__/useConnection.test.jsx`, `src/app/queries/__tests__/serialport.test.jsx`, `src/app/widgets/Connection/__tests__/Connection.test.jsx`.

Scope boundary: `git diff 8121197d..HEAD -- src/server/ src/app/lib/controller/ src/app/reducers src/app/sagas src/app/actions` is empty. Redux connection state is untouched and still serves widgets not migrated in this slice.

Verification: focused `yarn test:frontend --runInBand --silent --runTestsByPath src/app/runtime/__tests__/connectionRuntime.test.js src/app/hooks/__tests__/useConnection.test.jsx src/app/queries/__tests__/serialport.test.jsx src/app/widgets/Connection/__tests__/Connection.test.jsx` / 0 / 4 suites and 16 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 29 suites and 158 tests passed; `yarn eslint` / 0 errors with 17 pre-existing warnings; `yarn build-dev` / 0; `git diff --check` / 0.

Follow-up slice in the same G1 scope: the network (socket) selection test and the serial-refresh disabled-while-connected test were dropped during the runtime rewrite and were restored from the pre-rewrite suite (`bd19ed63`). `yarn build-dev` passed, `git diff --check` clean.

Carry-forward: browser visual/focus evidence for the Connection widget remains deferred to R6 under the existing BR0 waiver. The intentional socket-port correction (`connection.socket.port` read as a number instead of the previous undefined `connection.serial.port`) is covered by the restored network test.

Status transition / blocker ID: G1 `blocking` → `completed` (G1-B01 resolved). Next eligible tasks are G2–G7.

## G2 GCode — started 2026-09-19T22:10:24+08:00

Task / session / timestamp: G2 / current root session / 2026-09-19T22:10:24+08:00.

Branch / start HEAD / reviewed dirty files: `feat/tonic-ui-v2-migration` / `7e83b629` / working tree clean before this checkpoint.

Plan contract and baseline fixture: `04-general-widgets.md` Task G2 and `details/04b-widget-contracts.md`; source baseline is `GCode/index.jsx` class shell plus Redux-connected `GCodeStats.jsx`, with sender metadata available from `controller.sender.status` (`loaded`, `name`, `size`, `total`, `sent`, `received`, timing fields). The GCode test subtree is intentionally excluded from the graph index and will be verified from source and test output directly.

Worker brief: model `gpt-5.6-luna`, reasoning `high`, `fork_turns: none` (host equivalent: `fork_context: false`). Selection reason: the G2 contract is fixed and local, with a direct Tonic primitive migration and bounded Redux presentation state; high effort is sufficient unless implementation reveals cross-widget ownership or lifecycle ambiguity. Worker owns only `src/app/widgets/GCode/`, its colocated test, and `index.styl`; worker must not modify ledger documents, commit, dispatch subagents, or run browser operations.

Changed files / commit: pending. Focused baseline command pending before implementation worker dispatch.

Verification: focused G2 tests, full frontend suite, ESLint, `yarn build-dev`, static legacy-import/React-class scans, and `git diff --check` are required. Browser evidence remains deferred to R6 under BR0 waiver.

Status transition / blocker ID: G2 `todo` → `in_progress`; no blocker.

## G2 GCode — completed 2026-09-19T22:34:42+08:00

Task / session / timestamp: G2 / current root session / 2026-09-19T22:34:42+08:00.

Changed files: `src/app/widgets/GCode/index.jsx`, `src/app/widgets/GCode/GCodeStats.jsx`, and new `src/app/widgets/GCode/__tests__/GCode.test.jsx`. The widget shell is function-based; stats use direct Tonic primitives; metadata, empty/loading state, units, counters, progress, timing, view callbacks, fork/remove, and zero-controller-command behavior are covered. No Stylus change and no server/controller/Redux workflow change. No commit or push.

Review and correction: independent task review found three Important issues: the bytes label was not translated, the controller-import test did not fail on an accidental import, and Collapse/Expand callbacks were not exercised through the real controls. A failing test was added first for the translation issue; production then uses `i18n._('bytes')`. The controller mock now throws at module load, and the test clicks the real Collapse and Expand controls with rerender assertions. No unresolved review finding remains.

Verification: focused GCode command / exit code / result: `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/GCode/__tests__/GCode.test.jsx src/app/widgets/GCode/__tests__/GCodeStats.test.js` / 0 / 2 suites and 7 tests passed; full frontend / 0 / 30 suites and 164 tests passed; `yarn eslint` / 0 / 0 errors and 17 pre-existing warnings; `yarn build-dev` / 0 / compiled successfully; legacy-import/class scans / clean; `git diff --check` / 0. Build-generated locale entries were removed because they were outside G2 scope.

Browser/simulator evidence remains deferred to R6 under the explicit BR0 waiver. Status transition / blocker ID: G2 `in_progress` → `completed`; no blocker. Next eligible task is G3 Spindle.

## G3 Spindle — started 2026-09-19T22:37:02+08:00

Task / session / timestamp: G3 / current root session / 2026-09-19T22:37:02+08:00.

Plan contract: `04-general-widgets.md` Task G3 and `details/04b-widget-contracts.md`; controlled speed draft, distinct empty/zero behavior, M7/M8/M9 coolant, M3/M4/M5 spindle commands, disabled gates, and one controller command per action. Implementation brief: `.superpowers/sdd/04-general-widgets/task-3-brief.md`.

Worker assignment: implementation worker will own only `src/app/widgets/Spindle/`, its colocated test, and relevant Stylus; no ledger edits, commit, subagents, or browser operations. The root session will review the resulting diff and run the required verification.

Changed files / commit: pending. Baseline pending before implementation worker dispatch.

Verification: focused Spindle tests, full frontend suite, ESLint, `yarn build-dev`, static migration scans, and `git diff --check` are required. Browser evidence remains deferred to R6 under BR0 waiver.

Status transition / blocker ID: G3 `todo` → `in_progress`; no blocker.

## G3 Spindle — completed 2026-09-19T22:53:16+08:00

Task / session / timestamp: G3 / current root session / 2026-09-19T22:53:16+08:00.

Implementation: `src/app/widgets/Spindle/Spindle.jsx` now owns a controlled speed draft and derives M3/M4 payloads from the current draft; empty and invalid values disable M3/M4, while zero sends bare M3/M4. M7/M8/M9 and M5 remain one-command actions. Speed changes persist through widget config without controller commands. `src/app/widgets/Spindle/index.jsx` is a function shell using direct Tonic content layout and preserves the host `view`/`onViewChange` contract. The colocated test covers commands, disabled gates, config persistence, current-draft behavior, empty/zero/invalid values, exact command counts, and host view dispatch. No Stylus file exists in the Spindle inventory. No server/controller transport/Redux workflow change. No commit or push.

Worker note: the `gpt-5.6-luna` max implementation worker stopped after contributing the bounded test expansion without returning a completion report. The root session completed the source implementation, reviewed the diff, and retained only the approved Spindle changes.

Review: independent `gpt-5.6-sol` medium review found one valid low-severity test gap—missing total command-count assertion—and one scope warning caused by the already-completed uncommitted G2 diff. The command-count assertion was added. The G2 files remain because they are the prior completed task in the same branch; no unrelated G3 production scope was added.

Verification: focused Spindle command / exit code / result: `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Spindle/__tests__/Spindle.test.jsx` / 0 / 1 suite and 7 tests passed; full frontend / 0 / 30 suites and 168 tests passed; `yarn eslint` / 0 / 0 errors and 17 pre-existing warnings; `yarn build-dev` / 0 / compiled successfully; production Spindle legacy import/class scan / clean; locale diff / clean after removing build-generated entries; `git diff --check` / 0.

Browser/simulator evidence remains deferred to R6 under the explicit BR0 waiver. Status transition / blocker ID: G3 `in_progress` → `completed`; no blocker. Next eligible task is G4 Laser.

## G4 Laser — started 2026-09-19T22:55:11+08:00

Task / session / timestamp: G4 / current root session / 2026-09-19T22:55:11+08:00.

Plan contract: `04-general-widgets.md` Task G4 and `details/04b-widget-contracts.md`; controlled LaserTest drafts, exact laser-test and spindle-override payloads, preserved repeat timing, singular timer ownership, and release/blur/disabled/unmount cleanup. Implementation brief: `.superpowers/sdd/04-general-widgets/task-4-brief.md`.

Worker assignment: implementation worker will own only `src/app/widgets/Laser/`, its colocated tests, and relevant Stylus; no ledger edits, commit, subagents, or browser operations. The root session will review the resulting diff and run the required verification.

Changed files / commit: pending. Baseline pending before implementation worker dispatch.

Verification: focused Laser tests, full frontend suite, ESLint, `yarn build-dev`, static migration scans, and `git diff --check` are required. Browser evidence remains deferred to R6 under BR0 waiver.

Status transition / blocker ID: G4 `todo` → `in_progress`; no blocker.

## G4 Laser — completed 2026-09-19T23:16:41+08:00

Task / session / timestamp: G4 / current root session / 2026-09-19T23:16:41+08:00.

Implementation: `LaserTest`, `LaserIntensityOverride`, the Laser shell, and `OverrideReadout` use direct Tonic function components. LaserTest owns controlled power/duration/maxS drafts and sends exact `laser_test` payloads. Override controls preserve the 500ms delay and `floor(1000/15)` repeat interval; release, blur, disabled state, and unmount clean up timers. Enter/Space activation sends the corresponding one-shot override command. Local Tonic styling uses `sx`; the third-party slider is styled through an outer Tonic `sx` selector. No server/controller transport/Redux workflow change, commit, or push.

Review and correction: independent review found missing keyboard activation and a Redux selector test seam. A failing keyboard test was added before the production key handler. The test connect mock now evaluates the production `connection.state` mapping, covering the disconnected gate. The plan and detailed contract now require `sx` for all local Tonic styling and prescribe an outer Tonic selector for third-party components.

Verification: focused Laser command / exit code / result: `yarn test:frontend --runInBand --silent src/app/widgets/Laser/__tests__/Laser.test.jsx` / 0 / 1 suite and 7 tests passed; full frontend / 0 / 31 suites and 175 tests passed; `yarn eslint` / 0 / 0 errors and 17 pre-existing warnings; `yarn build-dev` / 0 / webpack compiled successfully; production inline-style and legacy-import/class scans / clean; locale diff clean after removing build-generated entries; `git diff --check` / 0.

Browser/simulator evidence remains deferred to R6 under the explicit BR0 waiver. Status transition / blocker ID: G4 `in_progress` → `completed`; no blocker. Next eligible task is G5 Probe.

## G5 Probe — started 2026-09-19T23:20:00+08:00

Task / session / timestamp: G5 / current root session / 2026-09-19T23:20:00+08:00.

Plan contract: `04-general-widgets.md` Task G5 and `details/04b-widget-contracts.md`; controlled ProbeModal parameters, preview, exact one-shot command, cancel/invalid/disconnected gates, and controller workflow gates. Source/contract discovery started. Per user direction, `resource.json` files are out of scope; do not run or clean generators that modify them.

Status transition / blocker ID: G5 `todo` → `in_progress`; no blocker.

G5 partial checkpoint: commit `89e0517d` migrates `ProbeModal` to direct Tonic Modal/Button/ButtonGroup and adds two command-contract tests (cancel sends no command; Run sends one WCS preview command). The uncommitted `Probe/index.jsx` and its expanded test migrate only the host shell to a function and Tonic `Box`/`sx`; focused test passes 3/3 and lint exits 0 with 16 pre-existing warnings. `Probe.jsx` remains legacy and is the next required unit. `resource.json` remains out of scope; do not run generators that modify it.

## G5 Probe — completed 2026-09-20T00:40:40+08:00

Task / session / timestamp: G5 / current root session / 2026-09-20T00:40:40+08:00.

Implementation: `Probe.jsx` now uses direct Tonic `Button`, `ButtonGroup`, `FormControl`, `FormHelperText`, `Input`, `InputGroup`, `InputGroupAddon`, and `Tooltip` primitives. React Final Form remains the draft owner; valid drafts open the existing `ProbeModal` preview and only the modal can send one `gcode` payload. Connection, idle-workflow, machine-state, and invalid-form gates remain in the Redux selector/form owner. No server, controller protocol, reducer, saga, action, or browser change was made.

TDD / review: the new test first failed because `Probe.jsx` still imported legacy Buttons. It now covers real form draft changes, preview handoff without a command, disconnected/active-workflow/invalid gates, and the full literal WCS command. The host-view test was moved to `ProbeWidget.test.jsx` so legacy-import tripwires can exercise the real form. Self-review found the development build had generated tracked translation resources; all 17 generated `resource.json` changes were removed before completion, per user direction.

Verification: focused `yarn test:frontend --runInBand --silent src/app/widgets/Probe/__tests__/Probe.test.jsx src/app/widgets/Probe/__tests__/ProbeWidget.test.jsx` / 0 / 2 suites and 6 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 33 suites and 181 tests passed; `yarn eslint` / 0 / 0 errors and 17 existing warnings; `yarn build-dev` / 0 / webpack compiled; production legacy/class/inline-style scan / clean; `git diff --check` / 0. Browser/simulator evidence remains deferred to R6 under BR0 waiver. No `resource.json` diff remains.

Status transition / blocker ID: G5 `in_progress` → `completed`; no blocker. Next eligible task is G6 Custom.

## G6 Custom — started 2026-09-20T00:40:40+08:00

Task / session / timestamp: G6 / current root session / 2026-09-20T00:40:40+08:00.

Plan contract: `04-general-widgets.md` Task G6 and `details/04b-widget-contracts.md`; preserve iframe URL setting, save/cancel persistence, load/error lifecycle, and per-fork URL isolation. `resource.json` files are out of scope and must not be read, generated, modified, or cleaned. Browser evidence remains deferred to R6 under BR0 waiver.

Status transition / blocker ID: G6 `todo` → `in_progress`; no blocker.

G6 checkpoint: `Custom/index.jsx` is now a function shell that reads the per-widget config through its provider, writes disabled state directly to that config, and preserves the host `view` / `onViewChange(view)` contract. `Custom.jsx` retains the iframe domain lifecycle while replacing the styled-components wrapper and inline style with the colocated Stylus classes. Its refresh and PubSub listeners have explicit effect cleanup; iframe before-unload, unload, and error paths release the iframe ref and listener tokens. `Custom.test.jsx` covers Settings URL draft cancel/save behavior, fork URL isolation, iframe load callback cleanup, PubSub cleanup on unmount, and host collapse behavior.

Verification checkpoint: focused `yarn test:frontend --runInBand --silent src/app/widgets/Custom/__tests__/Custom.test.jsx` / 0 / 1 suite and 5 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 34 suites and 186 tests passed; `yarn eslint` / 0 / 0 errors and 17 existing warnings; `git diff --check` / 0; Custom legacy/class/inline-style scans are clean. `yarn build-dev` was invoked twice but the available command runner returned after its Babel phase at about 30 seconds without webpack's final result or an exit status; this is not completion evidence. Browser/simulator evidence remains deferred to R6 under BR0 waiver.

Next exact step: obtain a terminal `yarn build-dev` result, then review the G6 diff against the contract and update STATUS, the G6 plan checkbox, execution log, and handoff together only if all gates pass. Do not modify `resource.json` files.

## G6 Custom — completed 2026-09-20T11:40:00+08:00

Completion review: `Custom/index.jsx` is a function widget shell with controlled `view` / `onViewChange(view)`, per-fork `WidgetConfigProvider` isolation, config-backed disabled state, and preserved refresh/settings/fullscreen/fork/remove actions. `Custom.jsx` retains the iframe as the domain owner; its refresh and PubSub subscriptions have matching cleanup, and iframe before-unload, unload, and error paths release the iframe ref and listener tokens. The local styled-components wrapper and inline style are replaced by colocated Stylus. No server, controller protocol, reducer, saga, action, or browser source was changed.

Verification: focused `yarn test:frontend --runInBand --silent src/app/widgets/Custom/__tests__/Custom.test.jsx` / 0 / 1 suite and 5 tests passed; full `yarn test:frontend --runInBand --silent` / 0 / 34 suites and 186 tests passed; `yarn eslint` / 0 / 0 errors and 17 existing warnings; `git diff --check` / 0; Custom legacy/class/inline-style scans / clean. User-provided build evidence at 11:40: `yarn build-dev` compiled Babel sources and webpack 5.75.0 `compiled successfully in 8209 ms`. Browser/simulator evidence remains deferred to R6 under the explicit BR0 waiver. No `resource.json` diff is retained.

Status transition / blocker ID: G6 `in_progress` → `completed`; no blocker. Next eligible task is G7 Webcam.

## G7 Webcam — started 2026-09-20T11:40:00+08:00

Task / session / timestamp: G7 / current root session / 2026-09-20T11:40:00+08:00.

Plan contract: `04-general-widgets.md` Task G7 and `details/04b-widget-contracts.md`; `Webcam` resource ownership must preserve URL/media lifecycle across rotate, flip, crosshair, and mute settings. Settings own an unsubmitted URL draft. URL replacement, late load, timeout, and unmount must clean up resources. `Circle` and `Line` are function SVG geometry, not Tonic icon replacements. Browser evidence remains deferred to R6 under BR0 waiver.

Worker assignment: `gpt-5.6-luna` / max because the existing Webcam component has asynchronous resource ownership and late-callback cleanup. The worker owns only `src/app/widgets/Webcam/`, `src/app/components/Webcam/`, and the G7 test path; it must not edit ledger/docs, commit, push, or use browser tooling. Terra/root will review and run completion gates.

Routing override: user requested `gpt-5.6-terra` / medium after the Luna max assignment began. Luna was interrupted before integration; Terra medium now owns the same bounded source/test scope. This lowers the task-matrix default at explicit user direction; the root completion gate and browser ownership rule are unchanged.

Browser instruction: user explicitly requested that no browser tests run. G7 will not invoke browser runner, Playwright, screenshots, accessible snapshots, or simulator browser procedures. All browser evidence is deferred to R6, when the user will select a different, cheaper model. Browser evidence remains deferred and is not claimed passed.

Status transition / blocker ID: G7 `todo` → `in_progress`; no blocker.

Checkpoint: function media ownership now stops late-resolving, replaced, and unmounted streams. `Circle` and `Line` are function SVG geometry. Webcam Settings uses a Tonic modal with an unsubmitted draft; its tests prove Cancel leaves config unchanged and Save writes the three settings. Focused command `yarn test:frontend --runInBand --silent src/app/widgets/Webcam/__tests__/Webcam.test.jsx src/app/widgets/Webcam/__tests__/SettingsModal.test.jsx` passed 2 suites / 5 tests. Targeted ESLint had 0 errors and 16 pre-existing repository warnings. Browser evidence remains deferred to R6.

Modal-title audit: source-wide static scan of `src/app` found no `ModalHeader`, `ModalTitle`, or legacy `Modal.Header` / `Modal.Title` containing `Text` with explicit `fontSize` or `fontWeight`. The touched Webcam, Custom, and Probe modals use their header primitive directly. No browser tooling was used.

## G7 Webcam — completed 2026-09-20

Completion review: the shared media component is a function owner that releases active, replaced, late-resolving, and unmounted streams. The widget display/control layer uses Tonic `Box` and `Tooltip`; no legacy GridSystem, Anchor, Image, Tooltip, styled-components, `propTypes`, inline style, class component, or memo HOC remains in the G7 source. Circle and Line remain coordinate-preserving function SVG geometry. Settings retains its unsubmitted local draft until Save.

Verification: focused `yarn test:frontend --runInBand --silent src/app/widgets/Webcam/__tests__/Webcam.test.jsx src/app/widgets/Webcam/__tests__/SettingsModal.test.jsx src/app/widgets/Webcam/__tests__/Display.test.jsx` / 0 / 3 suites and 7 tests passed. Full `yarn test:frontend --runInBand --silent` / 0 / 37 suites and 193 tests passed. Targeted ESLint / 0 / 0 errors and 16 existing repository warnings. `yarn build-dev` / 0 / webpack 5.75.0 compiled successfully in 17036 ms. `git diff --check` and the G7 legacy/inline-style/PropTypes scan are clean. Generated i18n resources were restored and not retained. Browser evidence remains deferred to R6 and is not claimed passed.

Status transition: G7 `in_progress` → `completed`; no blocker. Next eligible task is C1 Grbl.

## C1 Grbl — started 2026-09-20

Task / session: C1 / current root session. Inventory: `index.jsx` is the class shell and uses Redux only for `controller.type` and `connection.state`; child overrides/reports/modal groups are Redux-connected presentation/action consumers. Redux remains the sole machine-state owner. Direct transport contracts are `write('?')`, `writeln('$C')`, `command('homing'|'unlock'|'sleep')`, `writeln('$'|'$$'|'$#'|'$G'|'$I'|'$N')`, feed/spindle override `command` values `-10,-1,1,10,0`, rapid override `25,50,100,0`, and ControllerModal Refresh exactly `writeln('$#')` then `writeln('$$')`. No Grbl widget-local controller listener exists to migrate; test mount/unmount behavior through the real shell and mocked transport.

Browser instruction remains unchanged: do not run browser tooling. Browser evidence is deferred to R6. Status transition: C1 `todo` → `in_progress`; no blocker.

Baseline: `src/app/widgets/Grbl/__tests__/Grbl.test.jsx` uses the real Redux-connected override controls and ControllerModal with only the controller transport mocked. It proves exact feed/spindle/rapid payload sequences and ControllerModal Refresh ordering. Repeatable controls dispatch on mouseDown/mouseUp (`onHold`/`onRelease`), not a text click; preserve that interaction contract during Tonic migration. Focused baseline command passed 1 suite / 2 tests.

## C1 Grbl — implementation checkpoint 2026-09-20

Implementation: `index.jsx` is now a JSDoc-typed function shell; local state owns only ControllerModal visibility while Redux remains the sole owner of controller and connection data. The modal uses Tonic Modal/Tabs and preserves `$#` then `$$`. Feed, spindle, and rapid controls use direct Tonic Box/Button/ButtonGroup/Space plus a local Repeatable wrapper that retains mouse hold/release behavior. Queue, status, and modal-group reports use controlled Tonic accordion sections; `ensurePositiveNumber` stays at Grbl status-buffer boundaries and `ensureArray` stays at the untrusted coolant collection boundary. No Grbl `propTypes`, class component, legacy panel/form/grid/modal/navigation/control imports, or inline `style` remain.

Tests: `Grbl.test.jsx` now has 7 assertions covering all controller menu payloads, all override values, refresh ordering, the disconnected command gate, accessible tab/reset controls, and controlled report expansion. Focused test passes 1 suite / 7 tests. Full `yarn test:frontend --runInBand --silent` passes 38 suites / 200 tests. Targeted ESLint has 0 errors and 16 existing repository warnings. `git diff --check` passes.

Build status: two `yarn build-dev` attempts completed Babel compilation (2, 6, and 127 files) but did not return Webpack's final completion line within the 30-second command window. This is not recorded as a successful build; rerun it before C1 completion. Browser tooling was not run, per the explicit R6 deferral.

## C1 Grbl — completed 2026-09-20

Verification: focused `yarn test:frontend --runInBand --silent src/app/widgets/Grbl/__tests__/Grbl.test.jsx` passed 1 suite / 7 tests. Full `yarn test:frontend --runInBand --silent` passed 38 suites / 200 tests. Targeted Grbl ESLint, legacy/PropTypes/inline-style static scan, and `git diff --check` passed. A Luna-medium build-only worker ran `yarn build-dev`: exit 0, Babel compilation complete, webpack 5.75.0 compiled successfully in 7877 ms; only Node deprecation warnings appeared. Browser tooling was not run; browser evidence remains deferred to R6. Status transition: C1 `in_progress` → `completed`; C2 is next.

## C2 Marlin — completed 2026-09-20

Implementation: Marlin now uses function components with JSDoc interfaces, direct Tonic controls/modal/tabs/progress/accordion primitives, and a local Tonic-backed repeatable button. Controller settings/state listeners use effect setup/cleanup, preserve Marlin type filtering and partial-state merges, and disconnect resets the ready gate. The obsolete Marlin Stylus/layout and constants module, styled-components FadeInOut, legacy UI imports, classes, and PropTypes were removed.

Verification: focused `Marlin.test.jsx` passed 1 suite / 8 tests. Full `yarn test:frontend --runInBand --silent` passed 39 suites / 208 tests. Targeted Marlin ESLint, legacy/class/PropTypes scan, and `git diff --check` passed. Browser tooling was not run; browser evidence remains deferred to R6. Status transition: C2 `in_progress` → `completed`; C3 is next.

## C3 Smoothie — completed 2026-09-20

Implementation: Smoothie now uses function hooks with effect-owned controller listeners and cleanup, Smoothie-specific type filtering, nested partial state/settings merges, disconnect reset, direct Tonic accordion/box/button/modal/tabs primitives, a local Tonic repeatable button, and JSDoc-only interfaces. Legacy UI imports, React classes, PropTypes, styled-components, unused constants, and widget Stylus were removed. Exact Smoothie write/command/writeln contracts and reported units were preserved.

Verification: focused `Smoothie.test.jsx` plus `WidgetLayoutContract.test.jsx` passed 2 suites / 44 tests. Targeted Smoothie ESLint passed with 0 errors / 0 warnings; static forbidden-import/class/inline-style scan and `git diff --check` passed. Browser tooling and build-dev were not run; browser evidence remains deferred to R6. Status transition: C3 `in_progress` → `completed`; C4 is next.

## C4 TinyG/g2core — completed 2026-09-20

Implementation: TinyG now uses function hooks with effect-owned controller listeners and cleanup, TinyG/g2core type filtering, partial settings/state merges, disconnect reset, direct Tonic status/footer, progress, modal/tabs, motor and override controls, a local Tonic repeatable button, and JSDoc-only interfaces. Legacy UI imports, React classes, PropTypes, styled-components, unused constants, and widget Stylus were removed. Exact TinyG/g2core transport order and motor payload contracts were preserved.

Verification: focused `TinyG.test.jsx` passed 1 suite / 8 tests. Full `yarn test:frontend --runInBand --silent` passed 41 suites / 224 tests. Targeted TinyG ESLint, static forbidden-import/class/inline-style scan, and `git diff --check` passed. Luna-medium `yarn build-dev` exited 0; webpack 5.75.0 compiled successfully in 15321 ms with only the Node `fs.Stats` deprecation warning. Browser tooling was not run and browser evidence remains deferred to R6. Status transition: C4 `in_progress` → `completed`; R5 is next.

## R5 command acceptance — started 2026-09-20

The prescribed R5 files are not yet present: `Visualizer/__tests__/WorkflowControl.test.jsx` and `Autolevel/__tests__/VisualizerIntegration.test.jsx`. Their plan dependencies `E4`, `A1b`, and `A3b` are still todo. A valid partial acceptance run was executed without browser tooling: `yarn test:frontend --runInBand --silent` with the Grbl, Marlin, Smoothie, TinyG, and Console test paths passed 5 suites / 37 tests. R5 remains `in_progress`; do not mark it completed until the missing WorkflowControl and Autolevel integration command/lifecycle cases are implemented and verified.

## S1 Settings draft — completed 2026-09-20

Implementation: added `src/app/widgets/Axes/Settings/draft.js` with the existing config defaults, editable jog-distance draft values, canonical X/Y/Z/A/B/C axis normalization, positive-distance normalization at save time, and cloned MDI records. No finite-number policy was added beyond the existing `Number(value) > 0` behavior.

Verification: focused `draft.test.js` passed 4 tests. Targeted ESLint completed with 0 errors and `git diff --check` passed. Browser tooling was not run.

## S2 MDI query — completed 2026-09-20

Implementation: added `src/app/widgets/Axes/queries.js` with the `['api/mdi']` query key, `useMdiQuery`, and `useSaveMdiMutation`. The hooks use the existing `/api/mdi` GET and PUT wrappers, disable automatic retry, return response bodies, and invalidate the shared query only after a successful save.

Verification: focused draft/query run passed 2 suites / 7 tests. Targeted ESLint completed with 0 errors and `git diff --check` passed. Browser tooling was not run. Status transition: S1/S2 `todo` → `completed`; S3 is next.

## S3 Settings tabs — completed 2026-09-20

Implementation: converted General, ShuttleXpress, MDI, record dialogs, and the MDI table to controlled function components. The tabs now receive value/callback contracts, preserve editable jog drafts and MDI order, create UUIDs only for new records, and use direct Tonic Input/Checkbox/Button/Grid primitives where applicable. Parent state/action objects, child instance refs, fetch state, classes, and PropTypes were removed from the migrated files; interfaces are documented with JSDoc.

Verification: focused `Settings.test.jsx` passed 2 tests; the full frontend suite passed 44 suites / 233 tests. Targeted ESLint completed with 0 errors and `git diff --check` passed. Browser tooling was not run. Status transition: S3 `todo` → `completed`; S4 is next.

## S4 Settings save — completed 2026-09-20

Implementation: the Settings owner now owns the controlled draft and MDI query lifecycle. Save snapshots the draft, rejects missing MDI data, uses a synchronous submit lock plus mutation pending state, awaits the MDI PUT, writes normalized general and ShuttleXpress values only after success, and calls `onSave` once. Errors preserve the draft and perform no local writes; pending disables Save, Cancel, and modal close. The owner and all migrated Settings interfaces use JSDoc instead of PropTypes.

Verification: focused Settings/draft/query tests passed 3 suites / 11 tests; the full frontend suite passed 44 suites / 235 tests. Targeted ESLint passed with 0 errors and `git diff --check` passed. Browser tooling was not run. Status transition: S4 `todo` → `completed`; A1b is next.

## A1b Axes input — active checkpoint 2026-09-20

Implementation so far: added focused Axes unit coverage for position drafts, normalized Grbl/Marlin/Smoothie/TinyG reports, metric/imperial jog distance selection, keypad action parameters, MDI command emission, global jog gating, provider consumption, and listener cleanup. `AxesProvider` supplies state and named commands to Axes/DisplayPanel/Keypad/MDI, eliminating their `actions` bag and callback prop drilling. The legacy class remains the state owner; the project must not treat its `setState` calls as a reducer migration. Controller/hotkey subscriptions are paired in one lifecycle helper that removes original callbacks and clears pending ShuttleControl work. The guard prevents a global jog from editable controls, an open modal, `keyup`, or `blur`; it permits background `keydown`. The Axes widget now uses Tonic `Box` rather than native `<div>` layout wrappers. The editable position path uses direct Tonic InputGroup/Input/Button primitives; PositionLabel/Fraction, Keypad, and KeypadOverlay use Tonic Box and JSDoc instead of PropTypes/raw spans. Widget-modal source was normalized to the installed Tonic Modal composition and supported props; legacy widget Modal imports/APIs are absent.

Verification: focused Axes/Settings/Custom/Probe tests pass 8 suites / 39 tests; the current Axes slice passes 11 tests; targeted ESLint has 0 errors; `git diff --check` passes. Browser tooling and builds were not run. A1b remains in progress: the Axes owner is still class-based rather than a real function/reducer/effect owner, and full command/disconnect/unmount cleanup coverage required by the task is still incomplete.

## A1b Axes input — completed 2026-09-20

Implementation: `AxesWidgetContent` now owns domain state through `useReducer`; it uses stable named callbacks and a current-state ref for controller, combokey, and ShuttleControl event handlers. The effect creates and tears down one ShuttleControl/listener resource, preserving its `G91`, feed move, `G90` flush sequence. Disconnect resets owner state without losing shared MDI commands. `DisplayPanel` is now a direct `useAxes()` function component; Keypad and MDI remain direct consumers. No Axes UI has an `actions` bag, PropTypes, or native `div`/`span`; `ShuttleControl` remains the intentional non-React class.

Verification: `yarn test:frontend --runInBand --silent --runTestsByPath src/app/widgets/Axes/__tests__/Axes.test.jsx src/app/widgets/Axes/__tests__/Settings.test.jsx src/app/widgets/Axes/__tests__/queries.test.jsx src/app/widgets/Axes/Settings/__tests__/draft.test.js` passed 4 suites / 29 tests. The focused cases cover reported drafts, all supported controller normalization, metric/imperial distance, X/Y/Z/additional-axis hotkeys, shuttle feed flush, MDI submission, editable/modal/keyup/blur hotkey rejection, disconnect safety, unmount callback removal, and stable subscriptions. Targeted Axes ESLint and `git diff --check` passed. Browser tooling and builds were not run under the explicit R6 deferral. Status transition: A1b `in_progress` → `completed`; A2 is next.

## A2 Tool — completed 2026-09-20

Implementation: commit `98396e35` migrates Tool to a local function owner with React Query query/mutation hooks, a separate editable display-unit draft, React Final Form/Tonic controls, direct textarea caret handling, controller listener cleanup, and debounced full-payload saves. The approved follow-up uses the existing Immer v9 `produce` directly in the owner callback; it adds no helper abstraction and does not upgrade the dependency. The Axes formatting regression discovered during A2 verification was repaired with ESLint in `DisplayPanel.jsx` and `Axes/index.jsx`.

Verification: focused Tool tests passed 11/11. Fresh full `yarn test:frontend --runInBand --silent` passed 47 suites / 268 tests. Fresh `yarn lint` exited 0; only the known `DisplayPanel` max-lines warning remains. `git diff --check` passed. Browser tooling and builds were not run under the explicit R6 deferral.

Status transition: A2 `in_progress` → `completed`; A3a `todo` → `in_progress`.

## A3a Autolevel forms — started 2026-09-20

Implementation checkpoint: StartProbeModal, StopProbeModal, and TestProbeModal are now JSDoc function components with explicit callback contracts. The safety confirmations use React Final Form and Tonic FormControl/Checkbox; start, test, and stop confirmation buttons use a same-tick submit lock. The owner passes the existing command actions as callbacks and supplies the existing validation gate. `ProbeDialogs.test.jsx` covers cancel, required confirmation, invalid-value gates, and duplicate confirmation prevention. ApplyView remains the next source slice; browser tooling and builds are prohibited by the current deferral.

## A3a Autolevel forms — completed 2026-09-21

Implementation: `ApplyView` is now a JSDoc function component using Tonic Box/Button/Text/CircularProgress/LinearProgress and explicit owner callbacks. It preserves the file reader pipeline, compensation progress/success/error callbacks, original-G-code retry, cached Blob export, clear's existing controller/PubSub owner action, and the exact paired `gcode:unload`/`gcode:load` subscriptions with cleanup. The event-facing pipeline ref prevents an immediate external unload after completion from leaving stale completed UI. Null probe positions retain the legacy insufficient-data behavior and errors retain the failed filename.

Verification: `ProbeDialogs.test.jsx` passes 10 tests covering cancel, confirmation, invalid gates, same-tick duplicate prevention, PubSub subscribe/unsubscribe, null probe data, clear, retry, external unload reset, and compensation-originated G-code load preservation. Full `yarn test:frontend --runInBand --silent` passes 47 suites / 274 tests. Fresh `yarn lint` exits 0, and `git diff --check` passes. Browser tooling and builds were not run under the explicit R6 deferral.

Status transition: A3a `in_progress` → `completed`; A3b is eligible but not started.
