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
