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

## 現況快照（2026-09-23）

| 項目 | 撰寫時的值 |
| --- | --- |
| Branch | `feat/tonic-ui-v2-migration` |
| HEAD | `bf369a2b`（文件更新本身尚未 commit） |
| 工作樹 | source clean；本 handoff 更新本身尚未 commit |
| 未 push | branch 領先 origin；以 `git log origin/feat/tonic-ui-v2-migration..HEAD` 實測 |
| Active task | **P2 controlled forms** |
| 最近完成 | P2 Login `5322f77b`；十個 Administration drawer form controls `bf369a2b` |
| 下一步推薦 | Audit remaining P2 keyboard/invalid-submit evidence |
| Open blockers | 無 |
| BR0 | 使用者明確 `waived`，**不是 passed**；未驗證 browser gates 延後至 R6 |

本表是撰寫當下的事實，**不是當前狀態**——本檔與後續 doc commit 都會推進 HEAD。接手時一律自行實測；若與 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) 不一致，以 STATUS 為準。

## 下一個可執行項目

P1 has passed its zero-import gate. P2 controlled forms is in progress. Browser evidence remains deferred to R6.

| 可執行 task | Depends on | 性質 | 需要 browser？ |
| --- | --- | --- | --- |
| **P2** [controlled forms](plans/2026-09-07-tonic-ui-v2/details/08a-component-families.md) | P1 ✅ | Legacy family zero-import gate and Connection Menu migration done; next: behavior evidence audit | 否 |

P1 migrated the modal, menu, tooltip, action, link, and notification consumers to Tonic UI v2. All P1 legacy families are deleted. Widget Button uses Tonic `LinkButton`/`ButtonLink` and `sx`; Keypad uses direct Tonic `Button size="sm"`. The exact source import and family-file scans are empty, and the direct `react-bootstrap-buttons` and `rc-trigger` dependencies are removed. The final frontend suite passed 62 suites / 379 tests; changed-file ESLint and diff checks passed. The zero-consumer legacy `Paginations` family and deprecated Administration pagination file were also deleted; active `TablePagination` remains for P4. Browser, simulator, and build evidence remain deferred to R6.

P2 forms should pair `react-final-form` ownership with the installed Tonic UI v2 `FormControl` family. The current lock has `react-final-form` 6.5.9 and `final-form` 4.20.10. The user placed any v7 upgrade after P2 form migration; it is not a P2 prerequisite. If one becomes necessary, assess the [official v6→v7 guide](https://github.com/final-form/react-final-form/blob/main/MIGRATION_V7.md) as a separate dependency slice.

The first P2 slice (`5322f77b`) migrates Login from legacy `FormGroup`/`InlineError` to Tonic `FormControl`, `FormLabel`, `FormInput`, and `FormErrorMessage` while retaining `react-final-form`. Its new regression was RED on the missing accessible labels, then passed with linked required errors and invalid-submit suppression. Full frontend passed 62 suites / 380 tests; targeted ESLint and diff checks passed. P2 remains in progress because other family consumers remain.

The second P2 slice (`bf369a2b`) migrates all ten Administration create/update drawers and shared FieldInput/FieldTextarea to Tonic form controls while retaining React Final Form ownership and submit-failed error timing. The representative Create Command regression was RED on the inaccessible label, then passed with linked errors and invalid-submit suppression. Fresh full frontend passed 62 suites / 381 tests; targeted ESLint and diff checks passed. The next direct production `FormGroup` consumers are Macro New/Edit modals; other P2 family consumers remain.

The third P2 slice migrates Macro New/Edit modal fields to Tonic form controls while retaining React Final Form. Two regressions were RED on missing accessible labels, then passed with linked errors and invalid-submit suppression. Fresh full frontend passed 62 suites / 383 tests; targeted ESLint and diff checks passed. Remaining P2 families and the zero-import gate remain open.

Fresh inventory found no production imports of the nine legacy P2 families, so the unused modules were removed and a source import regression was added. Fresh full frontend passed 63 suites / 384 tests. P2 remains open for the Connection `react-select` equivalence decision and keyboard/invalid-submit evidence audit.

The Connection serial port and baud rate selectors now use installed Tonic Menu, matching the user's decision; both prior selectors were not searchable. Keyboard, selection, empty state, disabled state, and focus return have focused regressions. `react-select` was removed from dependencies. Tonic Dropdown can be assessed after the planned `3.0.0-alpha.1` upgrade. P2 remains open for the final keyboard/invalid-submit evidence audit.

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

## Deferred Tonic UI v3 reference

This checkpoint uses the installed Tonic UI v2 API. After all major components have migrated to Tonic UI, upgrade all Tonic UI packages to `3.0.0-alpha.1`. That version provides native semantic color tokens, autocomplete, and dropdown support for light/dark mode. Do not use those v3 APIs before the package upgrade.

- Local v3 source: `/home/cheton/Code/trendmicro-frontend/tonic-ui`
- Color token guide: `/home/cheton/Code/trendmicro-frontend/tonic-ui/packages/react-docs/pages/migrations/migrating-color-tokens-from-v2-to-v3`
- General migration guide: `/home/cheton/Code/trendmicro-frontend/tonic-ui/packages/react-docs/pages/migrations/migrating-from-v2-to-v3`

## 恢復 prompt

```text
請從 docs/superpowers/cncjs-next-tonic-ui-v2-handoff.md 接手。
請以 GPT-6-Sol 當 main conversation；deterministic 或 implementation subagent 使用 GPT-6-Luna extra-high/max。不得 fallback 至 GPT-5.6 models。
先讀 EXECUTION.md、STATUS.md、00-design.md，核對 git status/HEAD（不要 reset 未知差異）。
不要自行 push，除非本次另有授權。
P1 overlays 已完成；P2 controlled forms 進行中。Login、十個 Administration drawers、Macro New/Edit modals 已遷移，九個無 production 使用者的 legacy P2 家族已移除，零匯入回歸測試已加入。Connection 兩個 selector 已改 Tonic Menu；下一步核對剩餘 keyboard/invalid-submit 證據。react-final-form v7 升級排在 P2 後面。所有主要元件完成 Tonic UI migration 後，才升級所有 Tonic UI packages 到 3.0.0-alpha.1，屆時再評估 Dropdown。
G1 留下的可沿用 pattern：單一 frontend hook owner（useConnection()）、useSyncExternalStore 或等價訂閱介面、HTTP server state 走 TanStack Query；Redux 只用於尚未遷移的 widgets。
不可跨越的邊界：src/server/**、CNCJSController、現有 Socket.IO protocol、Redux reducer/saga/action。被否決的 server operation ID / connectionLifecycleMeta / cancellation event 方案不要重提。
開始前記 in_progress；結束同步 STATUS、execution-log、plan checkboxes、本檔。
依實際 evidence 標 completed 或 blocking；保留未完成 diff 與下一個精確步驟。
主控先固定每個 task 的 contract；若使用 subagent，依實際複雜度使用 GPT-6-Luna extra-high/max，記錄選擇理由。
再按四個維度核對實際子任務，勿以整個 widget 固定 effort；調整 task 預設需記理由，父 task 的整合 gate 不變。
架構、ownership、command 語義由 GPT-6-Sol 主控決策；需要第二意見時先暫停 implementation worker。
複雜不等於 blocking；只有明確缺少解阻條件、輸入、環境或可行方案時記 blocker。
主控 review 實際 diff 與驗證證據後才 completed；worker 不改 ledger，不派更多代理。
一個 task 通過後繼續本階段下一個 eligible task，階段完成或遇停止條件就交接。
使用者已授權 local commit checkpoints；不得自行 push。
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
