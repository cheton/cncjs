# CNCjs Tonic UI v2 — 持久交接入口

## 現況

- **Latest checkpoint (2026-09-19T20:08:32+08:00):** **G1 Connection is complete** (commits `bd19ed63`, `5b0c00e2`, plus the restored-test follow-up). G1-B01 is resolved by redefining the scope instead of expanding it: the Connection widget reads `useConnection()`, a single frontend interface over a framework-independent runtime (`src/app/runtime/connectionRuntime.js`) with a `useSyncExternalStore` singleton started from `src/app/context.jsx`, and reads ports/baud rates through TanStack Query (`src/app/queries/serialport.js`). Redux connection and serial-port action imports are gone from the widget. Verified: focused 4 suites / 16 tests, full frontend 29 suites / 158 tests, ESLint 0 errors / 17 pre-existing warnings, `yarn build-dev` exit 0, `git diff --check` clean, and zero diff under `src/server/**`, `src/app/lib/controller/**`, reducers, sagas, and actions. Browser visual/focus evidence remains deferred to R6. **Rejected plan, kept for the record:** the earlier adversarial-review plan that added server operation IDs, `connectionLifecycleMeta`, and cancellation events was rejected by user direction; the existing Socket.IO protocol and `CNCJSController` stay unchanged. Next eligible tasks are **G2–G7**; none is claimed.

- Mode: **layout naming/API cleanup, B1 session boundary, M1–M3 Macro work, Q2-cleanup, T1–T3 Terminal work, P0 cleanup, and G1 Connection complete; G2–G7 remain eligible with BR0 waived**。使用者明確允許不要卡在 BR0；BR0 保留為未完成 browser evidence 的 accepted risk，不標示 completed。R0 的非 browser baseline、D1 pure widget layout state、D2 `WorkspaceLayoutProvider`/hydration、D3 `WidgetHost`/16 個 layout-aware consumers、D4 Workspace/group wiring、B1 session/query boundary、M1–M3 shared Macro query/mutation/UI contract、Q2-cleanup、T1–T3 Terminal work、P0 unused-family cleanup，以及 G1 Connection frontend runtime 已完成；B1, M1, M2, M3, Q2-cleanup, T1, T2, T3, P0, and G1 phase deliveries are committed on the current feature branch。現行 API 是 `view`（`normal`／`collapsed`／`fullscreen`）與 `onViewChange(view)`；`minimized` 僅保留為既有 config persistence key，fullscreen 不寫入 config。現有 BR0 evidence 證明 connection、small upload、Run/Pause/Resume，Stop、jog、disconnect、large fixture、watch-tree、viewport 與新 selector browser evidence 延後至 R6。

- 執行角色原指定為 Terra main loop + Luna implementation subagent。現有 main 為 root session、不是 Terra，這是執行限制；F1 worker 已結束，主控已完成獨立 source review。
- F1 已完成版本、manifest、entrypoint、lint、production build 與 headless login baseline。FIX-001 移除 CNCjs app-level session store；FIX-002 吸收 `/home/cheton/Code/cncjs/webappengine` 的必要 host 行為並移除 dependency。Focused host/app tests pass; BR0-B05 已解阻，fresh `yarn dev` 已成功；`br0-20260913-191850` 證明 Luna medium 可完成 port selection、connection、small upload、Run/Pause/Resume，但後續 retries 分別卡在 browser backend 或錯誤 React Select locator，剩餘 BR0 gates 尚未驗證。
- 每次派工再按合約明確度、狀態/時序、影響範圍、驗證能力判斷子任務 effort，brief 記一句選擇理由。合約歧義先交 Terra，缺 oracle 先建立驗證，不因失敗一律升 max。**Hard rule:** 所有 browser tests／browser regression／screenshot／accessible snapshot 必須由 `gpt-5.6-luna` / `medium` 執行；主控只審核 evidence 與更新 ledger，不得代跑或改派模型。此 session 已依規則派 Luna medium，並使用已授權的 bind 環境。
- [STATUS](STATUS.md)：BR0 為 waived；R0 non-browser baseline、D1、D2、D3、D4、R1、R2、R3、U2、U3、B1、M1、M2、M3、T1、T2、T3、P0、**G1** 已完成，browser gaps 依 waiver 延後至 R6。G1 完成 Connection 的 frontend-only 轉換：`useConnection()` 單一介面、framework-independent runtime（timeout／duplicate-request guard／late-event authority／disconnect release）、TanStack Query 讀取 ports/baud rates、app root 初始化 singleton；`src/server/**`、`CNCJSController`、Socket.IO protocol 與 Redux reducer/saga/action 全部未動。U3 完成 Custom SettingsModal 的 direct Tonic overlay/form contract 與六個 interaction tests；`useToast` 已是 Tonic Toast 並保持既有 persistence semantics。B1 完成 session mutation、pending/error login handling、logout cache ordering、以及 bootstrap pure transport reuse。M1 完成 shared Macro list/detail/CRUD query hooks, Axios signal propagation, stable key/options contracts, and invalidation ordering。M2 固定 caller retry override、mutation callback/invalidation ordering、App-only Macro read invalidation bridge、以及 session identity cache reset。M3 完成 shared Macro UI、loading/error/background-refetch states、mutation failure retention、pending locks、以及 nested delete close ordering。T1 固定 Console owner 的七個實際 terminal consumers、close ref contract、sender isolation 與 lifecycle baseline tests。T2 把 xterm、prompt/history、paste、option/size update、callback ref 與 cleanup 收回 `useTerminal`，Terminal 僅保留 DOM view。T3 驗證 reconnect disposal/recreation、最新 Enter callback、history/paste/action callbacks 與 StrictMode active-resource bounds。P0 刪除 14 個 graph/literal zero-consumer component families；`Notifications/ToastNotification` 仍依 P1 管理。R1 新增 16 個真 frame shell 的 contract tests；R2 新增 Workspace group/lifecycle regression coverage；R3 新增 real Three.js/GCodeVisualizer geometry and pivot baselines；U3、B1、M1、M2、M3、T1、T2、T3、P0 phase deliveries 已 committed；runtime-generated large G-code/watch-tree payload 不追蹤。BR0-B06 已解決，BR0-B07/B08 與 `br0-20260913-200600` evidence 已保存。
- Naming note：D3 scope 已收斂為 host dispatch，測試已命名為 `WidgetHost.test.jsx`。Widget runtime 不再使用 `chrome`/`widgetUI` props；frame-capable widgets 接收 `view` 與 `onViewChange(view)`。
- [EXECUTION](EXECUTION.md)：領取、blocking、驗收、停止與恢復程序。
- [README](README.md)、[設計](00-design.md)、[inventory](inventory.md)：範圍與 source/API 基線。

## 下一個可執行項目（依 STATUS 依賴計算，2026-09-19）

目前 **沒有** `in_progress`、也沒有未解 blocker。G1 已完成（G1-B01 已解除）。R1、R2、R3、U2、U3、B1、M1、M2、M3、Q2-cleanup、T1、T2、T3、P0、G1 已完成。

| 可執行 task | Depends on | 性質 | 需要 browser？ |
| --- | --- | --- | --- |
| **G2–G7** [一般 widgets](04-general-widgets.md) | U3 ✅, Q2-cleanup ✅ | widget migrations and behavior contracts | 否（unit; browser deferred） |

下一個推薦 task 是 **G2（GCode）**，因為 G1 已完成且 G2–G7 共用相同前置（U3、Q2-cleanup）。G1 建立的 pattern 可沿用：`useConnection()` 這類單一 frontend hook owner、`useSyncExternalStore` 或等價的訂閱介面、以及 HTTP server state 走 TanStack Query。

**要從哪裡開始？** 先領取 **G2**（推薦）。G2 的 U2 pilot UI 檢查必須併入本 task。

注意：`S1` 已取得 Q2-cleanup 前置；`V1` 仍依賴 `A3b`。不要跳過其前置 task。已完成的 crash 修正（`98ceb1f6`）不改變這些依賴狀態。

## Hard rules / current execution rules

接手 session 必須先讀本節，再讀 [EXECUTION](EXECUTION.md) 的完整規則。

1. **Browser ownership:** 所有 browser tests、browser regression、screenshots、accessible snapshots 與 browser runner 操作，必須由 `gpt-5.6-luna` / `medium` 執行。主控不得代跑或改派模型；只負責 bounded brief、evidence review 與 ledger。Luna medium 不可用時，browser gate 留在 `in_progress` 或記具名 blocker。
2. **Browser environment:** 使用 Playwright bundled Chromium，不用 system Chrome screenshot channel。Browser tests 應以 `SUPPRESS_WEBGL_WARNING=1` 啟動 dev build，使 Linux/headless WebGL fallback 保持 disabled 但不顯示 warning modal；若測試專門驗證 modal，才省略此變數。Production 永遠強制 `0`。未使用 suppression 時，若 modal 出現必須定位 portal 內 enabled `OK`，不能以廣泛 `Close` locator 誤點 disabled `Close G-code file`。
3. **Test config:** browser/simulator tests 唯一的受版本控制 config reference 是 [`docs/testing/configs/browser-test.cncrc`](../../../testing/configs/browser-test.cncrc)。它沒有 `users`，使用 anonymous sign-in；先複製到唯一 `/tmp` runtime path，然後以 `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` 啟動。`scripts/start-server-dev.sh` 只把 `CONFIG_PATH` 傳給 backend `--config`；webpack development config 只讀取 `SUPPRESS_WEBGL_WARNING`。不得以 repo 內檔案或使用者的 `~/.cncrc` 作 active config，也不可提交 token、password、machine-specific config 或 private watch contents。
4. **Simulator:** 從 repo root 只執行 `yarn dev`；它會啟動 simulator、frontend 與 backend。不要另跑 `grbl-simulator/start-with-cncjs.sh`，避免搶占 `/tmp/ttyGRBL`。browser test 結束只停止自己啟動的程序，確認 ports 8000/8080 與 `/tmp/ttyGRBL` 已清理。
5. **Scope and state:** `STATUS.md` 是唯一 task ledger，只有主控能改 STATUS/HANDOFF/execution-log/plan checkboxes。沒有可重跑 evidence 的 browser gate 不得標 completed；不以 chat 或 worker 自評取代 evidence。可建立 local commits；不得自行 push。
6. **Migration intent:** 淘汰不支援 React 16–18 的舊 runtime library，特別是 Bootstrap family。CNCjs Button 只有在整合證據顯示 Tonic 無法保留必要 domain 色票/語意時，才可做成薄的 Tonic-based `src/app/components/Button`；不可保留或 re-export `react-bootstrap-buttons`。
7. **Build verification:** 本地不要執行 `yarn build-prod`；production build 由 CI 把關。需要驗證 development server 或 browser flow 時，直接執行 `yarn dev`。
- 計畫更新前觀察 HEAD e09a642c，工作樹乾淨；本次 BR0 resume 已重新核對 HEAD `62ea82ca` 與工作樹，並增加 checkpoint docs、durable BR0 artifacts 與 synthetic fixtures；BR0-B05 解阻後 lifecycle 成功，BR0-B06 已由 191850 run 解決，但 BR0-B07/B08 的 retries 未能達到剩餘 gates，baseline 仍未全數完成。

## 最新 review 結論

已補持久 ledger、父子 task 對應、避免 regression gate 循環依賴、browser procedure，以及 widget/controller contract 補充。修正不存在的 Tonic Slider；rc-slider 暫留。Tonic Select 是 native select，自訂 option/search 不可直接降級；後續可另立 task 評估 Tonic `MenuButton/MenuList/MenuItem` domain selector，但必須先驗證 keyboard/focus、selected value、disabled、ARIA/i18n 與 custom metadata/callback 等價。react-datepicker 掃描未找到 src/app consumer，W3 再全 repo 複核。

本次解阻前 `yarn build-dev` 通過；D3/D4 source patch 後 `yarn build` 與 `yarn eslint` 通過，D4 focused run 為 5 suites / 21 tests，full frontend 為 10 suites / 30 tests；完整 Jest 不作本次 D4 gate，`SocketConnection` 依使用者要求排除，先前 sandbox server `listen EPERM` 另有記錄。BR0-B05 已由 `brew install socat`（exit 0）與使用者授權的 port bind 環境解除，fresh `yarn dev` lifecycle exit 0。BR0 依使用者明確 waiver 不阻擋目前 implementation；未驗證的 browser gates 仍必須在 R6 補跑，不能宣稱 BR0/R0 browser 通過。

最近 browser review：React Select 的 port entry 可由既有 visible parent/control 加 keyboard／exact visible text 操作；`#react-select-2-input` 是 hidden dummy input，`role=option` 也不是穩定角色。本次已補 `data-test` 與固定 id/class selectors 以降低測試耦合，但後續 Luna medium browser verification 因 worker 不可用未執行；BR0-B07/B08 已保留 durable evidence，BR0 依 waiver 不阻擋目前 implementation，缺口延後至 R6。

U3 completion checkpoint: `Custom/modals/SettingsModal.jsx` now uses direct Tonic Modal/Overlay/Content/Header/Body/Footer/Button/Input/Box/Text primitives. It explicitly configures open/close, Escape, overlay interaction, auto-focus, focus lock, and focus return while retaining the existing Custom `ModalProvider/ModalRoot` caller. React Final Form and config persistence remain intact; synchronous save failures return a form-level `FORM_ERROR` and keep the draft open. `SettingsModal.test.jsx` covers six interaction cases, including nested topmost-close ordering and focus restoration. Focused 1 suite/6 tests, nearby 3 suites/46 tests, and full frontend 17 suites/97 tests pass; changed-file ESLint and `git diff --check` pass. B1, M1, T1, and T2 are now complete; next eligible tasks are T3 and P0, with T3 recommended.

## T2 completion checkpoint

`useTerminal` now owns the xterm resource, FitAddon, scrollbar, prompt/history, key and paste handlers, fresh `onData` callback ref, option/size updates, and explicit disposal. Its public API is `{ containerRef, isReady, prompt, actions }`; `actions` contains only the seven T1 consumer methods. `Terminal.jsx` is now a function DOM view, and `Console.jsx` uses the hook owner for connection, pubsub, and widget events. Focused T2 tests pass 2 suites/9 tests; full frontend passes 22 suites/123 tests; `yarn build-dev` compiles successfully; ESLint exits 0 with 17 existing warnings; `git diff --check` passes. T3 reconnect/stress/browser gates remain separate. The T2 phase delivery is committed.

## T3 completion checkpoint

T3 lifecycle tests cover connected→disconnected→connected xterm disposal/recreation, latest `onData` callback on Enter, history up, multiline paste, selection/refresh/resize callbacks, fullscreen/size updates, and StrictMode one-active/zero-after-unmount resource bounds. Focused T3 tests pass 2 suites/12 tests; full frontend passes 22 suites/126 tests; ESLint exits 0 with 17 existing warnings; `git diff --check` passes. Browser font/size/selection evidence remains deferred to R6. The T3 phase delivery is committed.

## P0 completion checkpoint

The 14 P0 families with zero resolved runtime consumers were deleted: Blink, Breadcrumbs, ColorModeProvider, Ellipsis, Form, Input, Loader, OverflowTooltip, RefHolder, RowsHelper, SectionGroup, SectionTitle, Toggle, and ToastNotification. Graph/literal/barrel/style scans are clean; the separate P1 `Notifications/ToastNotification` remains. Full frontend passes 22 suites/126 tests; `yarn build-dev` compiles successfully; ESLint exits 0 with 17 existing warnings; `git diff --check` passes. The P0 phase delivery is committed.

## M2 completion checkpoint

Shared Macro CRUD mutations preserve exact endpoints and variables, invalidate the Macro prefix before caller `onSuccess`, and force `retry: false` even when a caller requests retries. `MacroQueryEvents` is mounted once by the main App and invalidates read data only; `createSessionQueryBoundary` cancels then removes old-session queries without storing or logging token keys. Focused Macro/session/event tests pass 3 suites/20 tests; full frontend passes 23 suites/132 tests; full ESLint exits 0 with 17 existing warnings; `yarn build-dev` compiles successfully; `git diff --check` passes. The M2 phase delivery is committed.

## M3 completion checkpoint

The Macro widget now consumes `useFetchMacrosQuery` directly and retains controller run/load/export behavior with the existing action gates. New/Edit/Delete use shared mutations, await success before closing, retain drafts and show i18n errors on rejection, and use synchronous pending locks. Delete confirmation keeps both layers open after failure and closes `closeConfirm` before `closeEdit` after success. `Macro.test.jsx` covers loading, empty, failure, background refetch with rows retained, and refresh; `MacroMutations.test.jsx` covers create success/failure, duplicate-submit locking, delete failure retention, and close order. Focused Macro/query/session tests pass 5 suites/29 tests; full frontend passes 25 suites/141 tests; full ESLint exits 0 with 17 existing warnings; `yarn build-dev` compiles successfully; `git diff --check` passes. Macro actor/context/machine imports are removed after a repo-wide source scan; XState dependency removal was completed in Q2-cleanup. Phase delivery commit: `db0db29e`.

## Q2-cleanup completion checkpoint

The repo-wide audit found no remaining XState or Macro fetch-machine consumers. `yarn remove xstate @xstate/react` removed both root dependencies and their lockfile entries. The shared Macro query regression mounts unfiltered widget and paginated Administration observers against one QueryClient, runs one create mutation, and proves both keys refetch and receive updated records. Focused Macro query tests pass 15/15; full frontend passes 25 suites/142 tests; ESLint exits 0 with 17 existing warnings; `yarn build-dev` compiles successfully; `git diff --check` passes. Q2-cleanup phase commit: `730a0045`; next eligible work is G1–G7.

## B1 completion checkpoint

`src/app/queries/session.js` now owns the React Query sign-in mutation and pure session transports. `LoginPage.jsx` uses `mutateAsync`, preserves the existing authenticated/error/analytics/controller/navigation flow, and disables duplicate pending submits. Header logout waits for sign-out, cancels active queries, clears the shared QueryClient, then navigates. Bootstrap reuses the pure signin transport and does not call hooks. Focused B1 tests pass 3 suites / 8 tests; full frontend passes 20 suites / 105 tests; changed-file ESLint and `git diff --check` pass. The B1 phase delivery is committed.

## M1 completion checkpoint

`src/app/queries/macros.js` now owns the shared Macro list/detail/CRUD hooks. List/detail requests return payload data with Axios abort signals; list filters retain distinct keys, detail entries use a separate cache segment, and missing detail ids remain disabled. CRUD success invalidates the Macro prefix before caller callbacks; retries are disabled and Administration duplicate invalidation calls were removed. Focused M1 tests pass 10/10; full frontend passes 21 suites / 115 tests; `yarn build-dev` compiles successfully; ESLint and `git diff --check` pass. The M1 phase delivery is committed.

## T1 completion checkpoint

`Console.test.jsx` now characterizes the existing Console owner contract before T2: connection-open/write/read `writeln`, string `prompt`, connection-close `clear`, shared/fullscreen `resize`, and terminal widget `clearSelection`/`refresh`/`selectAll`. It verifies the corrected `connection:close` wrapper shape, self-echo filtering, `onData` sender context, and distinct sender ids for two mounted owners. Focused T1 tests pass 1 suite/6 tests; full frontend passes 21 suites/120 tests; `yarn build-dev` compiles successfully; ESLint exits 0 with 17 existing warnings; `git diff --check` passes. No production source changed. The T1 phase delivery is committed.

## D4 completion checkpoint

`WorkspaceRoot.jsx` now owns the `WorkspaceLayoutProvider`; the connected/router Workspace export keeps a hook function boundary that passes `workspaceLayout` actions and selector-filtered group ids into the retained Workspace class. Primary/Secondary/Default containers use config-backed group ids, preserve PubSub and Sortable contracts, and persist fork/remove/sort changes without local widget lists or component refs. Toolbar bulk actions dispatch through `workspaceLayout.setWidgetsCollapsed`; Visualizer is excluded by `hasFrame: false`; removed active ids clear transient fullscreen state while native widget settings remain.

Verification: R1 focused contract test passes 36/36; nearby Workspace/layout suites pass 55/55; full frontend passes 12 suites / 68 tests; `yarn eslint` exits 0; `git diff --check` passes. No browser gate is claimed; BR0 remains waived and missing browser evidence is carried to R6. This is the historical D4 checkpoint; current completion and next tasks are recorded in the U3 checkpoint above.

## G1 completion checkpoint

**G1 Connection: completed 2026-09-19T20:08:32+08:00.** Commits `bd19ed63` (widget UI migration), `5b0c00e2` (redux-free runtime), `8768a09d` (restored dropped tests).

G1-B01 is resolved by redefining scope, not by expanding it. The original brief limited production changes to `src/app/widgets/Connection/` and forbade reducer/saga edits, which made the open/close timeout and stale-response contract unprovable. Adversarial review then produced a plan requiring server changes; the user rejected that and required the existing Socket.IO protocol to stay unchanged. The accepted design is frontend-only:

- `src/app/runtime/connectionRuntime.js` — framework-independent runtime with `getSnapshot()`/`subscribe()`; owns timeout, duplicate-request guard, late-event authority, and Socket.IO disconnect release.
- `src/app/runtime/connectionRuntimeSingleton.js` — singleton bound to `@app/lib/controller`.
- `src/app/context.jsx` — imports the singleton at the app root, so initialization is not tied to widget mount.
- `src/app/hooks/useConnection.js` — `useSyncExternalStore` binding; the single public frontend interface.
- `src/app/queries/serialport.js` — TanStack Query hooks for `getPorts()`/`getBaudRates()`.
- `Connection.jsx` — consumes the hook and query hooks; Redux connection and serial-port action imports removed.

Verification: focused 4 suites / 16 tests; full frontend 29 suites / **158** tests; ESLint 0 errors / 17 pre-existing warnings; `yarn build-dev` exit 0; `git diff --check` clean. `git diff 8121197d..HEAD` over `src/server/`, `src/app/lib/controller/`, `src/app/reducers`, `src/app/sagas`, `src/app/actions` is **empty**.

Two pre-existing cases (network/socket payload, refresh-disabled-while-connected) were dropped by the runtime rewrite and restored in `8768a09d`. The socket case also covers the intentional port correction (`connection.socket.port` read as a number instead of the previous undefined `connection.serial.port`).

Carry-forward: browser visual/focus evidence for Connection remains deferred to R6 under the BR0 waiver. Redux connection state is untouched and still serves widgets not yet migrated.

## 恢復 prompt

```text
請從 docs/superpowers/cncjs-next-tonic-ui-v2-handoff.md 接手（bootstrap 入口），再讀 docs/superpowers/plans/2026-09-07-tonic-ui-v2/HANDOFF.md。
請以 Terra high 當 main loop，Luna high/max 當 implementation subagent；這次授權執行目前階段。
先讀 EXECUTION.md、STATUS.md、00-design.md，核對 git status/HEAD（目前 HEAD 應為最新 phase commit；不要 reset）。
分支 `feat/tonic-ui-v2-migration` 目前領先 origin 4 commits（`bd19ed63`、`5b0c00e2`、`8768a09d`、`fd613f32`），尚未 push；不要自行 push，除非本次另有授權。
優先恢復 in_progress；目前沒有 in_progress。依 STATUS 依賴計算，R1/R2/R3/U2/U3/B1/M1/M2/M3/Q2-cleanup/T1/T2/T3/P0/G1 已完成；目前推薦先領取 G2，不能跳過各自仍未完成的前置 task。若要 waived dependency 的下游，依 STATUS 的 waiver scope 繼續。
G1 留下的可沿用 pattern：單一 frontend hook owner（`useConnection()`）、`useSyncExternalStore` 或等價訂閱介面、HTTP server state 走 TanStack Query；Redux 只用於尚未遷移的 widgets。
不可跨越的邊界：`src/server/**`、`CNCJSController`、現有 Socket.IO protocol、Redux reducer/saga/action。被否決的 server operation ID / `connectionLifecycleMeta` / cancellation event 方案不要重提。
開始前記 in_progress；結束同步 STATUS、execution-log、plan checkboxes、HANDOFF。
依實際 evidence 標 completed 或 blocking；保留未完成 diff 與下一個精確步驟。
Terra 先固定每個 task 的 contract，依 EXECUTION task matrix 設 model=gpt-5.6-luna、reasoning_effort=high 或 max、fork_turns=none 派一個 worker，記錄選擇理由。
再按四個維度核對實際子任務，勿以整個 widget 固定 effort；調整 task 預設需記理由，父 task 的整合 gate 不變。
架構/ownership/command 語義交 Terra high 決策；需要第二意見時暫停 worker，派唯讀 gpt-5.6-sol / medium advisor。
複雜不等於 blocking；只有明確缺少解阻條件、輸入、環境或可行方案時記 blocker。
Terra review 實際 diff 與驗證證據後才 completed；worker 不改 ledger，不派更多代理。
一個 task 通過後繼續本階段下一個 eligible task，階段完成或遇停止條件就交接。
不自行 commit/push；若本次另有授權則依授權執行。
```

## Suggested skills

- superpowers:executing-plans：依單一 task 實作。
- superpowers:verification-before-completion：狀態改 completed 前核對證據。
- handoff：session 結束產生 /tmp 便攜交接，引用本檔；長期 state 仍留 repo。
- vercel:agent-browser：需要 browser regression 時才使用。
