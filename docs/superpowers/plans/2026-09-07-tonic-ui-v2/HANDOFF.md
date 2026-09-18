# CNCjs Tonic UI v2 — 持久交接入口

## 現況

- Mode: **layout naming/API cleanup complete; implementation paused with BR0 waived**。使用者明確允許不要卡在 BR0；BR0 保留為未完成 browser evidence 的 accepted risk，不標示 completed。R0 的非 browser baseline、D1 pure widget layout state、D2 `WorkspaceLayoutProvider`/hydration、D3 `WidgetHost`/16 個 layout-aware consumers 與 D4 Workspace/group wiring 已完成；最後一次落地為 `98ceb1f6`（Console `term.current.clear` crash 修正，已 push 至 `origin/feat/tonic-ui-v2-migration`）。現行 API 是 `view`（`normal`／`collapsed`／`fullscreen`）與 `onViewChange(view)`；`minimized` 僅保留為既有 config persistence key，fullscreen 不寫入 config。現有 BR0 evidence 證明 connection、small upload、Run/Pause/Resume，Stop、jog、disconnect、large fixture、watch-tree、viewport 與新 selector browser evidence 延後至 R6。

- 執行角色原指定為 Terra main loop + Luna implementation subagent。現有 main 為 root session、不是 Terra，這是執行限制；F1 worker 已結束，主控已完成獨立 source review。
- F1 已完成版本、manifest、entrypoint、lint、production build 與 headless login baseline。FIX-001 移除 CNCjs app-level session store；FIX-002 吸收 `/home/cheton/Code/cncjs/webappengine` 的必要 host 行為並移除 dependency。Focused host/app tests pass; BR0-B05 已解阻，fresh `yarn dev` 已成功；`br0-20260913-191850` 證明 Luna medium 可完成 port selection、connection、small upload、Run/Pause/Resume，但後續 retries 分別卡在 browser backend 或錯誤 React Select locator，剩餘 BR0 gates 尚未驗證。
- 每次派工再按合約明確度、狀態/時序、影響範圍、驗證能力判斷子任務 effort，brief 記一句選擇理由。合約歧義先交 Terra，缺 oracle 先建立驗證，不因失敗一律升 max。**Hard rule:** 所有 browser tests／browser regression／screenshot／accessible snapshot 必須由 `gpt-5.6-luna` / `medium` 執行；主控只審核 evidence 與更新 ledger，不得代跑或改派模型。此 session 已依規則派 Luna medium，並使用已授權的 bind 環境。
- [STATUS](STATUS.md)：BR0 為 waived；R0 non-browser baseline、D1、D2、D3、D4、R1、R2、R3、U2、U3 已完成，browser gaps 依 waiver 延後至 R6。U3 完成 Custom SettingsModal 的 direct Tonic overlay/form contract 與六個 interaction tests；`useToast` 已是 Tonic Toast 並保持既有 persistence semantics。R1 新增 16 個真 frame shell 的 contract tests；R2 新增 Workspace group/lifecycle regression coverage；R3 新增 real Three.js/GCodeVisualizer geometry and pivot baselines；U2 完成 Spindle/GCode 的 direct Tonic primitives pilot。U3 phase delivery 已 committed，worktree clean；runtime-generated large G-code/watch-tree payload 不追蹤。BR0-B06 已解決，BR0-B07/B08 與 `br0-20260913-200600` evidence 已保存。
- Naming note：D3 scope 已收斂為 host dispatch，測試已命名為 `WidgetHost.test.jsx`。Widget runtime 不再使用 `chrome`/`widgetUI` props；frame-capable widgets 接收 `view` 與 `onViewChange(view)`。
- [EXECUTION](EXECUTION.md)：領取、blocking、驗收、停止與恢復程序。
- [README](README.md)、[設計](00-design.md)、[inventory](inventory.md)：範圍與 source/API 基線。

## 下一個可執行項目（依 STATUS 依賴計算，2026-09-18）

目前 **沒有** `in_progress`、也沒有未解 blocker。R1、R2、R3、U2、U3 已完成；U3 已解除 B1、M1、T1、P0 的直接依賴，其餘 todo 仍被後續依賴擋住。

| 可執行 task | Depends on | 性質 | 需要 browser？ |
| --- | --- | --- | --- |
| **B1** [session boundary](details/03b-query-boundaries.md) | B0 ✅, U3 ✅ | query/session boundary implementation | 否（unit） |
| **M1** [Macro query](details/03a-query-contract.md) | B0 ✅, U3 ✅ | query contract implementation | 否（unit） |
| **T1** [Terminal baseline](details/04a-terminal-owner.md) | U3 ✅ | terminal owner baseline | 否（unit） |
| **P0** [unused families](details/08a-component-families.md) | U3 ✅ | remaining legacy-family inventory | 否（static/unit） |

R1、R2、R3、U2、U3 已完成。下一個推薦 task 是 **B1**，因為它 establishes the session boundary required by later query work; M1、T1、P0 也已符合依賴，可在不共享修改時平行評估。

**要從哪裡開始？** 先領取 **B1**（推薦），或選擇已解鎖的 M1、T1、P0。

注意：`G1`–`G7`、`S1` 與 `V1` 仍依賴 Q2-cleanup 或 A3b；不要跳過其前置 task。已完成的 crash 修正（`98ceb1f6`）不改變這些依賴狀態。

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

U3 completion checkpoint: `Custom/modals/SettingsModal.jsx` now uses direct Tonic Modal/Overlay/Content/Header/Body/Footer/Button/Input/Box/Text primitives. It explicitly configures open/close, Escape, overlay interaction, auto-focus, focus lock, and focus return while retaining the existing Custom `ModalProvider/ModalRoot` caller. React Final Form and config persistence remain intact; synchronous save failures return a form-level `FORM_ERROR` and keep the draft open. `SettingsModal.test.jsx` covers six interaction cases, including nested topmost-close ordering and focus restoration. Focused 1 suite/6 tests, nearby 3 suites/46 tests, and full frontend 17 suites/97 tests pass; changed-file ESLint and `git diff --check` pass. Next eligible tasks are B1, M1, T1, and P0; B1 is recommended.

## D4 completion checkpoint

`WorkspaceRoot.jsx` now owns the `WorkspaceLayoutProvider`; the connected/router Workspace export keeps a hook function boundary that passes `workspaceLayout` actions and selector-filtered group ids into the retained Workspace class. Primary/Secondary/Default containers use config-backed group ids, preserve PubSub and Sortable contracts, and persist fork/remove/sort changes without local widget lists or component refs. Toolbar bulk actions dispatch through `workspaceLayout.setWidgetsCollapsed`; Visualizer is excluded by `hasFrame: false`; removed active ids clear transient fullscreen state while native widget settings remain.

Verification: R1 focused contract test passes 36/36; nearby Workspace/layout suites pass 55/55; full frontend passes 12 suites / 68 tests; `yarn eslint` exits 0; `git diff --check` passes. No browser gate is claimed; BR0 remains waived and missing browser evidence is carried to R6. This is the historical D4 checkpoint; current completion and next tasks are recorded in the U3 checkpoint above.

## 恢復 prompt

```text
請從 docs/superpowers/plans/2026-09-07-tonic-ui-v2/HANDOFF.md 接手。
請以 Terra high 當 main loop，Luna high/max 當 implementation subagent；這次授權執行目前階段。
先讀 EXECUTION.md、STATUS.md、00-design.md，核對 git status/HEAD（目前 HEAD 應為最新 U3 phase commit；不要 reset）。
優先恢復 in_progress；目前沒有 in_progress。依 STATUS 依賴計算，R1/R2/R3/U2/U3 已完成；目前推薦先領取 B1，也可領取 M1、T1 或 P0，不能跳過各自仍未完成的前置 task。若要 waived dependency 的下游，依 STATUS 的 waiver scope 繼續。
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
