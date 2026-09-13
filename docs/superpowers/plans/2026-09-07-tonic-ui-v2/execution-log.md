# Migration execution log

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

Plan contract and baseline fixture: `EXECUTION.md`, `details/09a-browser-procedure.md`, anonymous `docs/testing/configs/browser-test.cncrc`, `br0-small.gcode`, `br0-large-100000.gcode`, and `br0-watch-tree`.

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
