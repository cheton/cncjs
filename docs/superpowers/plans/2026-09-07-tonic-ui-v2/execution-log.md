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
