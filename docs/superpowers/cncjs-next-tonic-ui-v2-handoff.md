# CNCjs next → Tonic UI v2 — 交接入口

本檔是**唯一**的跨 session 交接入口：bootstrap、現況、hard rules、恢復 prompt 都在這裡。

舊路徑 `docs/superpowers/plans/2026-09-07-tonic-ui-v2/HANDOFF.md` 已移除，內容併入本檔；歷史 checkpoint 保留在 [execution-log](plans/2026-09-07-tonic-ui-v2/execution-log.md) 與 Git history。

## 接手第一步

1. 讀本檔全部（快照、本輪重點、hard rules）。
2. 讀 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md)：唯一 task ledger、依賴與 blockers。
3. 讀 [EXECUTION](plans/2026-09-07-tonic-ui-v2/EXECUTION.md)：領取、驗收、暫停與恢復的完整規則。
4. 讀 [README](plans/2026-09-07-tonic-ui-v2/README.md)、[設計](plans/2026-09-07-tonic-ui-v2/00-design.md)、[inventory](plans/2026-09-07-tonic-ui-v2/inventory.md)：範圍與 source/API 基線。
5. 實測並核對：`git status --short`、`git rev-parse HEAD`、`git log --oneline origin/feat/tonic-ui-v2-migration..HEAD`。**不要 reset 未知差異。**
6. 貼上下方「恢復 prompt」開始工作。

## 現況快照（2026-09-19；本檔重整前的狀態）

| 項目 | 撰寫時的值 |
| --- | --- |
| Branch | `feat/tonic-ui-v2-migration` |
| HEAD | `06041616`（本檔自身尚未 commit） |
| 工作樹 | clean |
| 未 push | branch 領先 origin；以 `git log origin/feat/tonic-ui-v2-migration..HEAD` 實測 |
| Active task | **A1b Axes input** |
| 最近完成 | **C4 TinyG/g2core**（G1-B01 已解除） |
| 下一步推薦 | **A1b Axes input** |
| Open blockers | 無 |
| BR0 | 使用者明確 `waived`，**不是 passed**；未驗證 browser gates 延後至 R6 |

本表是撰寫當下的事實，**不是當前狀態**——本檔與後續 doc commit 都會推進 HEAD。接手時一律自行實測；若與 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) 不一致，以 STATUS 為準。

## 下一個可執行項目

A3b Autolevel workflow, V1 toolbar/watch directory, E1 load characterization, E2–E4 Visualizer engine work, and R5 command acceptance are complete. Browser evidence remains deferred to R6.

| 可執行 task | Depends on | 性質 | 需要 browser？ |
| --- | --- | --- | --- |
| **P1** [overlays](plans/2026-09-07-tonic-ui-v2/details/08a-component-families.md) | W1 ✅, P0 ✅ | Migrate the next bounded overlay component family | 否 |

V1 passed its non-browser gate on 2026-09-21: focused 2 suites / 16 tests, full frontend 51 suites / 308 tests, ESLint 0 errors (13 pre-existing warnings), static migration scan, and diff check. E1 added a real parser-backed owner-load regression: focused 3 suites / 10 tests and fresh full frontend 52 suites / 309 tests pass. E2 extracts a non-React engine with synchronous `load({ name, content }) -> { bbox }`; E3 hardens resource ownership with rejecting loaders, all-settlement cleanup, current-state late attachment, idempotent engine/G-code/probe disposal, shared-sprite safety, and resource regressions. E4 now supplies a host-gated `useVisualizer` owner boundary, synchronous one-time bbox publication, latest-pending load handling, paired subscriptions/resize cleanup, and a DOM-only visualizer view. R5 adds exact WorkflowControl command acceptance plus Autolevel-to-Visualizer metric/imperial, drag, command-order, and nonzero work-offset compensation acceptance. R4 adds one-frame RAF/stale-restart ownership, delayed assets/current view state, renderer reuse/remount, resize-throttle, xterm ownership, 20-cycle, and StrictMode acceptance; focused 3 suites / 33 tests and full frontend 57 suites / 364 tests pass. Target ESLint has 0 errors with 13 pre-existing warnings and diff check passes. The 5,000-node browser p95 and all browser evidence remain deferred to R6.

## 本輪交接重點（G1）

原計畫只允許改 `src/app/widgets/Connection/`，但 open/close timeout 與 late-response protection 無法在該範圍內證明。使用者把範圍重新界定為 **frontend-only**，因此交付多出三個新模組：

- `src/app/runtime/connectionRuntime.js`：framework-independent runtime，擁有 timeout、duplicate-request guard、late-event authority、Socket.IO disconnect release。
- `src/app/hooks/useConnection.js`：`useSyncExternalStore` 綁定，唯一公開前端介面。
- `src/app/queries/serialport.js`：TanStack Query 讀取 `getPorts()` / `getBaudRates()`。
- `src/app/context.jsx`：app root 匯入 singleton，初始化不綁 widget mount。

驗證：focused 4 suites / 16 tests；full frontend 29 suites / 158 tests；ESLint 0 errors；`yarn build-dev` exit 0。`src/server/**`、`src/app/lib/controller/**`、reducers、sagas、actions 的 diff 為空。

**邊界（後續 task 一體適用）：** `src/server/**`、`CNCJSController`、現有 Socket.IO protocol、Redux reducer/saga/action 一律不動。曾被提出的 server operation ID / `connectionLifecycleMeta` / cancellation event 方案已由使用者否決，不要再提。詳見 [G1 前端 runtime 計畫](plans/2026-09-19-connection-frontend-runtime.md)。

## Hard rules

完整執行規則見 [EXECUTION](plans/2026-09-07-tonic-ui-v2/EXECUTION.md)；以下是接手時最容易違反的摘要。

1. **Browser evidence deferred：** 使用者已要求目前不要執行任何 browser test／regression／screenshot／accessible snapshot／browser runner 操作。所有 browser evidence 延後至 R6，屆時使用者會指定不同且較低成本的 model；在該指示前不得自行選模型、執行 browser tooling，或宣稱 browser gate 已驗證。
2. **Project rules：** 修改 React interface、Tonic UI 或 runtime boundary 時，先讀取 [`.omp/RULES.md`](../../.omp/RULES.md)。
3. **Browser 環境：** 用 Playwright bundled Chromium，不用 system Chrome screenshot channel。以 `SUPPRESS_WEBGL_WARNING=1` 啟動 dev build；production 永遠強制 `0`。
4. **測試 config：** 唯一受版本控制的 reference 是 [`docs/testing/configs/browser-test.cncrc`](../testing/configs/browser-test.cncrc)。先複製到唯一 `/tmp` 路徑，再以 `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` 啟動。不可用 repo 內檔案或使用者的 `~/.cncrc` 作 active config，不可提交 token／password／machine-specific config。
5. **Simulator：** 只從 repo root 執行 `yarn dev`（同時啟動 simulator、frontend、backend）。不要另跑 `grbl-simulator/start-with-cncjs.sh`，避免搶占 `/tmp/ttyGRBL`。結束只停自己啟動的程序，確認 ports 8000／8080 與 `/tmp/ttyGRBL` 已清理。
5. **狀態：** [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) 是唯一 ledger；只有主控能改 STATUS／本檔／execution-log／plan checkboxes。沒有可重跑 evidence 的 browser gate 不得標 `completed`；不以 chat 或 worker 自評取代 evidence。可建立 local commit，**不得自行 push**（除本次另有授權）。
6. **Migration intent：** 淘汰不支援 React 16–18 的舊 runtime library，特別是 Bootstrap family。不可保留或 re-export `react-bootstrap-buttons`。
7. **Build：** 本地不要執行 `yarn build-prod`（由 CI 把關）。要驗證 development server 或 browser flow 時直接執行 `yarn dev`。
8. **Component interfaces：** `propTypes` are prohibited for all new or migrated code. Use JSDoc for component interfaces and function defaults for runtime defaults. Do not reintroduce PropTypes while completing adjacent migration work.
9. **Widget modals：** use only the installed Tonic Modal contract: `isOpen`, `onClose`, `size`, `isClosable`, `closeOnEsc`, and `closeOnInteractOutside`, with `ModalContent`/`ModalHeader`/`ModalBody`/`ModalFooter`. Do not use legacy `disableOverlay*`, `show`, or static Modal APIs.
10. **Layout primitives：** use Tonic `Box` instead of native `<div>` in React code.
11. **Widget-local layout:** use Tonic `sx` props. Do not add or retain a widget-local `index.styl` during a widget migration; apply this rule when each remaining widget is migrated, not as an unrelated bulk conversion.

## Current implementation checkpoint — 2026-09-20

- A1b is **completed**. Its focused unit coverage proves that normalized Grbl/Marlin/Smoothie/TinyG reports retain a focused draft; X/Y/Z/additional-axis hotkeys use the selected distance; shuttle feed flushes the original exact command sequence; MDI emits the exact `gcode` command; and global jog handling rejects editable controls, an open modal, `keyup`, `blur`, disconnect, and unmount paths.
- `AxesWidgetContent` is now a JSDoc function owner using `useReducer`, current-state refs, and paired controller/combokey/ShuttleControl effects. `DisplayPanel`, `Keypad`, and `MDI` directly consume `AxesProvider`; no Axes UI uses an `actions` bag or React class. `ShuttleControl` remains the intentional non-React resource class.
- **Widget owner pattern:** default to one function owner with controlled props. Add a widget-scoped provider and consumer hook only when sibling or deep consumers share the same domain state and named commands, as Axes does for `DisplayPanel`, `Keypad`, and `MDI`. The provider replaces real prop drilling or a cross-component `actions` bag; it is not a default migration wrapper. Marlin, Smoothie, and TinyG already use the function-owner/effect-cleanup half of this pattern without a widget context. Apply the same decision to later widgets only when their component tree needs shared ownership.
- The Axes widget has no native `<div>` elements; its layout wrappers use Tonic `Box`.
- The position draft is now owned above DisplayPanel through the reducer; DisplayPanel is controlled. PositionInput, PositionLabel, Fraction, Keypad, and KeypadOverlay use JSDoc-only interfaces; the Keypad path has no raw spans.
- All widget modal source imports have been migrated from the legacy app Modal to Tonic Modal composition. Static scans found no legacy Modal source import, `disableOverlay*`, legacy static Modal components, or legacy provider/root use in widget source. A3a is complete: its dialog forms use JSDoc functions, React Final Form/Tonic FormControl, explicit callbacks, and covered same-tick confirmation gates.
- Latest focused verification: Axes/Settings/query/draft passes 4 suites / 29 tests, with targeted Axes ESLint and `git diff --check` clean. No browser tooling or build was run.

## Current checkpoint — A3b Autolevel workflow complete

- A3b migrated `src/app/widgets/Autolevel/index.jsx` to a JSDoc function/Tonic owner. A pure reducer owns the idle/probing/stopped/completed/error workflow; user and event handlers own controller commands. The owner preserves exact full-probe display-unit payloads, result/progress flow, one stop command, disconnected/error cleanup, Visualizer configuration/result sync, and the local fullscreen/layout contract. Its layout now uses `Box sx` only; `Autolevel/index.styl` is removed.
- `src/app/queries/gcode.js` provides the explicit, non-retrying `useLoadGCodeMutation()` boundary for `api.loadGCode(meta, context)`. Compensation errors retain the original G-code and probe data; retry uses those original values.
- Test-first evidence was recorded before each production slice: the legacy owner accepted an update after stop; the initial query module lacked the mutation hook; reviewer regressions lacked configuration sync, canonical unit persistence, and fullscreen styling; and raw icon markup lacked the Tonic/Font Awesome icon contract. The latest focused Autolevel validation passed 16 tests; full frontend passed 49 suites / 292 tests; `yarn lint` and `git diff --check` passed.
- Autolevel uses Tonic `MenuIcon`, `MoreIcon`, chevrons, and `CloseIcon`. Only unavailable equivalents use explicit Font Awesome definitions: `faExpand`, `faCompress`, and `faCodeBranch`; do not depend on app-root Font Awesome library registration from an isolated widget.
- No browser tooling, simulator browser procedure, or build was run. The mock controller fixture covers unavailable probe events; browser and simulator evidence remain deferred to R6. The protected Prettier paths `.prettierrc.json`, `package.json`, and `yarn.lock` are not changed or staged.

## Deferred widget icon migration TODO

This is a follow-up inventory, not an authorization to batch-edit widgets or change the task ledger. Each item is a separate, test-first slice: add a consumer-visible icon contract, record RED against current markup, then replace only that slice and run its focused regression tests.

**Icon rule:** prefer `@tonic-ui/react-icons` when it has a semantic equivalent. If it does not, use `FontAwesomeIcon` with a direct imported icon definition (for example `faExpand`), not a raw `<i className="fa …">` and not a string name that requires app-root library registration. Preserve Font Awesome when the Tonic catalogue has no equivalent or the UI needs a deliberate legacy visual distinction.

- [ ] **I1 — Autolevel child views:** replace raw icons in `ApplyView.jsx`, `SetupProbeView.jsx`, and `StopProbeModal.jsx`. Tonic equivalents exist for chevrons, download, folder-open, close, play, and stop.
- [ ] **I2 — Axes:** replace raw icons in `DisplayPanel.jsx`, `Keypad.jsx`, `KeypadOverlay.jsx`, `Settings/MDI/TableRecords.jsx`, and `components/PositionInput.jsx`. Preserve rotation, spinning, and fixed-width behavior in the component props or `sx`; assess circular-arrow icons individually rather than substituting a non-equivalent arrow.
- [ ] **I3 — Tool:** replace raw widget header controls and action icons in `index.jsx` and `Tool.jsx`; cover refresh's pending/spinning state as well as menu/collapse behavior.
- [ ] **I4 — controller widgets:** replace raw icons in Grbl (`index.jsx`, `modals/ControllerModal.jsx`), Marlin (`index.jsx`, `Controller.jsx`, `Marlin.jsx`), Smoothie (`index.jsx`, `Controller.jsx`), and TinyG (`index.jsx`, `TinyG.jsx`, `Overrides.jsx`). Treat controller command grids, refresh, status, and battery indicators as distinct behavior contracts.
- [ ] **I5 — Visualizer:** replace raw icons in `Loading.jsx`, `PrimaryToolbar.jsx`, `Rendering.jsx`, `WatchDirectory.jsx`, `WorkflowControl.jsx`, and the legacy renderer tree. Preserve busy/spinner state, file-tree icon semantics, toggles, and workflow action meaning.
- [ ] **I6 — existing Font Awesome widget header controls:** audit the currently migrated string-based `FontAwesomeIcon` use in Axes, Connection, Console, Custom, GCode, Grbl, Laser, Macro, Marlin, Probe, Smoothie, Spindle, TinyG, and Webcam. Convert Tonic-equivalent menu/more/chevron/close icons; retain direct Font Awesome definitions only where no Tonic equivalent exists. Do not assume the app-root icon library is mounted in widget tests.

Static inventory date: 2026-09-21. The raw-markup scan is limited to `src/app/widgets/**/*.jsx`; re-run it before each slice because source may change. Browser evidence remains deferred to R6.

## 恢復 prompt

```text
請從 docs/superpowers/cncjs-next-tonic-ui-v2-handoff.md 接手。
請以 Terra high 當 main loop，Luna high/max 當 implementation subagent；這次授權執行目前階段。
先讀 EXECUTION.md、STATUS.md、00-design.md，核對 git status/HEAD（不要 reset 未知差異）。
不要自行 push，除非本次另有授權。
優先恢復 in_progress；目前沒有 in_progress。依 STATUS 依賴計算，R1/R2/R3/U2/U3/B1/M1/M2/M3/Q2-cleanup/T1/T2/T3/P0/G1/G2/G3 已完成；目前推薦先領取 G4，不能跳過各自仍未完成的前置 task。若要 waived dependency 的下游，依 STATUS 的 waiver scope 繼續。
G1 留下的可沿用 pattern：單一 frontend hook owner（useConnection()）、useSyncExternalStore 或等價訂閱介面、HTTP server state 走 TanStack Query；Redux 只用於尚未遷移的 widgets。
不可跨越的邊界：src/server/**、CNCJSController、現有 Socket.IO protocol、Redux reducer/saga/action。被否決的 server operation ID / connectionLifecycleMeta / cancellation event 方案不要重提。
開始前記 in_progress；結束同步 STATUS、execution-log、plan checkboxes、本檔。
依實際 evidence 標 completed 或 blocking；保留未完成 diff 與下一個精確步驟。
Terra 先固定每個 task 的 contract，依 EXECUTION task matrix 設 model=gpt-5.6-luna、reasoning_effort=high 或 max、fork_turns=none 派一個 worker，記錄選擇理由。
再按四個維度核對實際子任務，勿以整個 widget 固定 effort；調整 task 預設需記理由，父 task 的整合 gate 不變。
架構/ownership/command 語義交 Terra high 決策；需要第二意見時暫停 worker，派唯讀 gpt-5.6-sol / medium advisor。
複雜不等於 blocking；只有明確缺少解阻條件、輸入、環境或可行方案時記 blocker。
Terra review 實際 diff 與驗證證據後才 completed；worker 不改 ledger，不派更多代理。
一個 task 通過後繼續本階段下一個 eligible task，階段完成或遇停止條件就交接。
不自行 commit/push；若本次另有授權則依授權執行。
```

## 文件索引

| 文件 | 用途 |
| --- | --- |
| [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) | 唯一 task ledger、依賴、blockers、waiver |
| [EXECUTION](plans/2026-09-07-tonic-ui-v2/EXECUTION.md) | 狀態轉移、派工、證據格式、停止與恢復 |
| [execution-log](plans/2026-09-07-tonic-ui-v2/execution-log.md) | 追加式執行歷史與每輪驗證證據 |
| [README](plans/2026-09-07-tonic-ui-v2/README.md) | 計畫索引、範圍、目錄規則 |
| [00-design](plans/2026-09-07-tonic-ui-v2/00-design.md) | 架構決策與 UI 套件相容性限制 |
| [inventory](plans/2026-09-07-tonic-ui-v2/inventory.md) | 元件、consumer、source 基線 |
| [04-general-widgets](plans/2026-09-07-tonic-ui-v2/04-general-widgets.md) | G1–G8 任務定義（下一個 G2 在此） |
| [09a-browser-procedure](plans/2026-09-07-tonic-ui-v2/details/09a-browser-procedure.md) | BR0／R6 可重跑 browser 程序 |
| [G1 前端 runtime 計畫](plans/2026-09-19-connection-frontend-runtime.md) | 為何 server protocol 不動的決策記錄 |
| `plans/2026-09-07-tonic-ui-v2/artifacts/` | browser／simulator 驗證產物 |

## Suggested skills

- `superpowers:executing-plans`：依單一 task 實作。
- `superpowers:verification-before-completion`：狀態改 `completed` 前核對證據。
- `handoff`：session 結束產生 /tmp 便攜交接，引用本檔；長期 state 仍留 repo。
- `vercel:agent-browser`：需要 browser regression 時才使用（仍受 hard rule 1 的模型限制）。

## 不要從本檔推定的事

- 不要推定執行授權：授權範圍每次由使用者當面指定。
- 不要推定 HEAD、未 push 數量或下一個 task：以 `git` 實測與 STATUS 為準。
- 不要以本檔取代 EXECUTION 的完整規則。
- 歷史交接內容看 [execution-log](plans/2026-09-07-tonic-ui-v2/execution-log.md) 與 Git history。
