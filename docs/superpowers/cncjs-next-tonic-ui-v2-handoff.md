# CNCjs next → Tonic UI v2 — 交接入口

Current visual checkpoint (2026-10-06): **V3-V completed**. GPT-6-Luna xhigh performed browser operations; root independently reviewed screenshots, assertions and owned cleanup. Theme matrix7, UI routes15/15, filename/badge2 and all four controller light/dark8cases/32gates pass. Source fixes f050804e/fbea2042 and latest-source production/four-platform CI pass. See [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) and [final evidence](plans/2026-09-07-tonic-ui-v2/artifacts/browser/v3-20261003-luna/README.md).

本檔是**唯一**的跨 session 交接入口：bootstrap、現況、hard rules、恢復 prompt 都在這裡。

舊路徑 `docs/superpowers/plans/2026-09-07-tonic-ui-v2/HANDOFF.md` 已移除，內容併入本檔；歷史 checkpoint 保留在 [execution-log](plans/2026-09-07-tonic-ui-v2/execution-log.md) 與 Git history。

Latest source follow-up (2026-10-06): **V3-GV completed and user accepted for commit**. React/React DOM ranges enforce 18.3; eight deprecated focus groups use native CSS pseudo selectors in `sx` without data-state aliases, and four outside-interaction props use `closeOnInteractOutside`. Semantic surfaces, status colors and fixed-mode previews follow the official guide. Existing frontend 78 suites / 505 tests, lint 0 errors / 4 existing warnings, guard 0 violations / 68 fixtures and immutable offline install pass. Fresh visual evidence and owned cleanup are in the [V3-GV report](plans/2026-09-07-tonic-ui-v2/artifacts/browser/v3-guide-20261006-luna/report.json); [root acceptance](plans/2026-09-07-tonic-ui-v2/artifacts/browser/v3-guide-20261006-luna/root-acceptance.json) records the final alias-only adjustment, exact source hashes and remaining focus/console-warning limitations. Inter/DM Mono loading remains outside this slice.

## 接手第一步

1. 讀本檔全部（快照、本輪重點、hard rules）。
2. 讀 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md)：唯一 task ledger、依賴與 blockers。
3. 讀 [EXECUTION](plans/2026-09-07-tonic-ui-v2/EXECUTION.md)：領取、驗收、暫停與恢復的完整規則。
4. 讀 [README](plans/2026-09-07-tonic-ui-v2/README.md)、[設計](plans/2026-09-07-tonic-ui-v2/00-design.md)、[inventory](plans/2026-09-07-tonic-ui-v2/inventory.md)：範圍與 source/API 基線。
5. 實測並核對：`git status --short`、`git rev-parse HEAD`、`git log --oneline origin/feat/tonic-ui-v2-migration..HEAD`。**不要 reset 未知差異。**
6. 貼上下方「恢復 prompt」開始工作。

## 現況快照（2026-10-07）

| 項目 | 撰寫時的值 |
| --- | --- |
| Branch | `feat/tonic-ui-v2-migration` |
| Validated source | `83dcb3d7` is pushed to `origin/feat/tonic-ui-v2-migration`; the macro-dropdown follow-up below is uncommitted. |
| 工作樹 | Uncommitted V3-UI-C direct Tonic UI action migration plus Dropdown default-sizing cleanup. Integrated frontend 78/507; focused final-source 3 suites/50 tests; targeted ESLint 0 errors/9 warnings; Widget Stylint clean. |
| Delivery | User authorized commit and push of these follow-ups to `origin/feat/tonic-ui-v2-migration`. Check Git for the resulting commit and push state. |
| Active task | V3-UI-C completed with bounded GPT-6-Luna xhigh browser evidence; V3-T, FIX-003, and FIX-004 remain in_progress on their pre-existing visual gates. No prior authenticated browser pass is inferred. |
| 最近完成 | V3-UI-C：15 個 widget 動作控制改為原生 Tonic Button／Dropdown，刪除本地 Widget Button/DropdownButton/DropdownMenuItem、exports、舊封裝測試與無用 CSS；保留 Widget 版面殼與 camera/iframe/preview/repeat 行為。Macro 變數選單改用 `renderToggle`／`onChange`（滑鼠與鍵盤皆可插入）並加 `portalled` 修正 Modal 裁切。Luna 以 Chromium 153 實測：26 項選單、360px 預設高度可捲動、入口不被 ModalBody 裁切、末項可捲到並插入、Escape 關閉且焦點回到 modal、無頁面錯誤與 API 寫入。 |
| 下一步推薦 | 使用者目視確認：1439px 側欄收合、workspace primary/secondary pane scrollbar、MiniNav hover flyout、Connection refresh spacing、quiet light theme，以及 Axes keypad/header layout；之後關閉對應 ledger gates，再回 icon migration I1（I1–I6 延後清單）。 |
| Open gaps | V3-T, FIX-003, FIX-004 visual checks and V3-DS-F user confirmation remain pending; local browser reached sign-in only. Retain inherited 768-pane clipping, disabled/static dark SVG contrast, headless/replay limitations, and no full R6 performance/hardware rerun. |
| BR0 | 使用者明確 `waived`，**不是 passed**；未驗證 browser gates 延後至 R6 |

本表是撰寫當下的事實，**不是當前狀態**——本檔與後續 doc commit 都會推進 HEAD。接手時一律自行實測；若與 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md) 不一致，以 STATUS 為準。

## R6 completed — 2026-10-02

- GPT-6-Luna extra-high completed browser execution; root reviewed evidence and final source checks. R6 is completed, P3 deferred browser gate completed, W3 remains todo. R6 changes are included in the user-authorized delivery commit; no production build.
- Durable evidence: [R6 artifacts README](plans/2026-09-07-tonic-ui-v2/artifacts/browser/r6-20261001-luna/README.md). Both viewports/themes, all16widget views, native reorder/fork/remove/settings, Console/Webcam, simulator workflow/jog, controller replay, Administration CRUD/auth, large WatchDirectory, geometry/camera/pivot/visibility/probe and real WebGL fallback pass. Historical failed runs remain preserved; focused trusted-click visibility rerun passes without source changes, exact earlier race cause unproven.
- Matched performance uses Chromium153/SwiftShader, identical100k fixture and648×284 canvas: load-to-first-render median+10.45%, renderer-call median unchanged, native input-to-render+2.53%. No new long-stall class observed; five-load p95+25.7% and nonisolated upload diagnostics are recorded limitations. Post-fix20cycles plateau251geometries/188textures/6listeners/0RAF/1canvas;20actual route teardown cycles clean owned resources.
- Latest validation: frontend78suites/501tests, lint0errors/4existingwarnings, guard361files/18domainclasses/0violations, development compilation and final diff/protected-boundary checks pass. Node20suites/635tests pass with SocketConnection exclusion/forceExit;112inherited simulator intervals mean clean Node shutdown is not proven.
- Console patterns classified against baseline; Macro nested-button/keyboard and Webcam provider/live-settings regressions fixed test-first and browser-verified. All synthetic users/machines/commands/events/macros removed, owned R6 processes stopped, ports8000/8080/8082 closed. All17locales retain only9required Machines keys beyond HEAD.
- Auto-review originally rejected broad /tmp deletion. The user subsequently authorized cleanup: all reviewed R6 temporary config/auth/log/fixture files, baseline checkout and temporary Playwright caches are now deleted; repository evidence remains.

## V3 current execution — 2026-10-03

User authorized Tonic UI3 alpha and semantic color tokens. All seven Tonic packages resolve3.0.0-alpha.1; existing exports retained. JSX/Stylus semantic roles migrated, legacy app colorStyle removed, native CSS variable/provider API corrected. Explicit domain palettes/diagrams/camera/WebGL colors preserved. Alpha icons peers and riskLevel gradient paths corrected in scoped configuration. Local frontend78/504, Node22/641 natural exit (prior SocketConnection exclusion), lint0errors/4warnings, guard68fixtures/0violations, immutable/dev compile pass. CI-only production/package passes on c82280d9 (run37116468021); downloaded artifact confirms Spinner/semantic CSS/entrypoints. V3 completed; separate platform workflow still running at snapshot, no new V3 browser execution claimed. See [V3 plan/evidence](plans/2026-09-07-tonic-ui-v2/10-tonic-ui-v3-alpha.md).

## W3 current execution — 2026-10-02

Four retired direct dependencies/CSS removed; waits use Tonic Spinner including bootstrap SSR, determinate values Tonic LinearProgress. Production vendor excludes test harness imports after a red/green regression. Immutable install, guard68tests/0violations, frontend78/501, lint0errors/4warnings, Node22/641 with natural exit (prior local SocketConnection exclusion) pass. R6 browser evidence retained. CI-only production/package checks pass on b0612c79 (run37020168380); all four platform full checks pass (run37020178338). Scoped ResourceLists30s total-case budget resolves Intel macOS runner timeouts while preserving interactions/assertions/query deadlines. Windows binaries pass; remaining platform binary packaging is still running at snapshot and is not claimed complete. See [W3 reconciliation](plans/2026-09-07-tonic-ui-v2/w3-final-reconciliation.md).

## 下一個可執行項目

P1 已通過零匯入 gate。**P2 已於 2026-09-24 完成**：legacy family 零匯入、`react-select` 移除、rc-slider 按設計保留，且每個表單都有鍵盤操作與無效提交的具體證據。Browser evidence 延後至 R6。

| 可執行 task | Depends on | 性質 | 需要 browser？ |
| --- | --- | --- | --- |
| **R6** [browser/performance validation](plans/2026-09-07-tonic-ui-v2/09-regression-gates.md) | B3、R4、R5 ✅ | 補齊 deferred browser/performance evidence | **Completed：2026-10-02；W3 亦已完成** |
| **W3** [dependency cleanup and final gate](plans/2026-09-07-tonic-ui-v2/08-workspace-and-cleanup.md) | R6 ✅ | 最終依賴／production／CI gate | **Completed：2026-10-02；CI production/package 與四平台完整檢查 pass** |

P1 migrated the modal, menu, tooltip, action, link, and notification consumers to Tonic UI v2. All P1 legacy families are deleted. Widget Button uses Tonic `LinkButton`/`ButtonLink` and `sx`; Keypad uses direct Tonic `Button size="sm"`. The exact source import and family-file scans are empty, and the direct `react-bootstrap-buttons` and `rc-trigger` dependencies are removed. The final frontend suite passed 62 suites / 379 tests; changed-file ESLint and diff checks passed. The zero-consumer legacy `Paginations` family and deprecated Administration pagination file were also deleted; active `TablePagination` remains for P4. Browser, simulator, and build evidence remain deferred to R6.

P2 forms should pair `react-final-form` ownership with the installed Tonic UI v2 `FormControl` family. The current lock has `react-final-form` 6.5.9 and `final-form` 4.20.10. The user placed any v7 upgrade after P2 form migration; it is not a P2 prerequisite. If one becomes necessary, assess the [official v6→v7 guide](https://github.com/final-form/react-final-form/blob/main/MIGRATION_V7.md) as a separate dependency slice.

The first P2 slice (`5322f77b`) migrates Login from legacy `FormGroup`/`InlineError` to Tonic `FormControl`, `FormLabel`, `FormInput`, and `FormErrorMessage` while retaining `react-final-form`. Its new regression was RED on the missing accessible labels, then passed with linked required errors and invalid-submit suppression. Full frontend passed 62 suites / 380 tests; targeted ESLint and diff checks passed. P2 remains in progress because other family consumers remain.

The second P2 slice (`bf369a2b`) migrates all ten Administration create/update drawers and shared FieldInput/FieldTextarea to Tonic form controls while retaining React Final Form ownership and submit-failed error timing. The representative Create Command regression was RED on the inaccessible label, then passed with linked errors and invalid-submit suppression. Fresh full frontend passed 62 suites / 381 tests; targeted ESLint and diff checks passed.

The third P2 slice (`425271c0`) migrates Macro New/Edit modal fields to Tonic form controls while retaining React Final Form. Two regressions were RED on missing accessible labels, then passed with linked errors and invalid-submit suppression. Fresh full frontend passed 62 suites / 383 tests; targeted ESLint and diff checks passed.

Fresh inventory found no production imports of the nine legacy P2 families, so the unused modules were removed in `b117c4c3` and a source import regression was added. Fresh full frontend passed 63 suites / 384 tests.

The Connection serial port and baud rate selectors now use installed Tonic Menu (`9f56e397`), matching the user's decision; both prior selectors were not searchable. Keyboard, selection, empty state, disabled state, and focus return have focused regressions. `react-select` was removed from dependencies. Tonic Dropdown can be assessed after the planned `3.0.0-alpha.1` upgrade.

**P2 keyboard/invalid-submit audit (2026-09-24, `924007e4`) closed the task.** The audit extended the Administration drawer table so all ten create/update drawers prove keyboard-only entry, primary-button activation, linked errors, and mutation suppression; it also fixed three drawers whose validators targeted `name`/`data` while their fields are `title`/`commands`. It found and closed two real production gaps test-first: the Webcam settings modal still rendered a native `<label><input type="radio">` pair and an unnamed native `<select>` (now Tonic `Radio`/`Select` with accessible names), and the Spindle speed input had no accessible name (now `aria-label`, deliberately not a hard-coded `id` because forkable widgets can mount duplicates). Connection socket Host/Port gained `aria-label` values; the Laser `rc-slider` test mock was deleted so the real slider is exercised; Webcam, Autolevel, Probe, Tool, Custom settings, and the previously untested GeneralSettings form gained keyboard-only and invalid-gate regressions. Production source now has no native `input`/`select`/`label`; rc-slider stays in exactly five audited consumers. Fresh full frontend 64 suites / 421 tests, ESLint 0 errors / 7 pre-existing warnings, `git diff --check` clean. Browser evidence remains deferred to R6.

## P3 implementation checkpoint — 2026-10-01

- Removed all 13 P3 families and their dedicated styles/barrels/contexts after alias/relative source inspection. `context.jsx` no longer mounts GridSystem/Card providers. Existing active Workspace/widget layout props and styles are preserved; no active consumer required breakpoint translation in this checkout.
- Axes Settings now uses controlled Tonic Tabs/TabList/Tab/TabPanels/TabPanel. Inactive children still unmount; the Settings owner retains edited drafts; tab changes trigger neither mutation nor config writes. The new keyboard regression was RED on missing legacy tab roles, then passed after migration.
- Axes DisplayPanel and Spindle use direct Tonic Image. Existing SVGs remain; Axes dimensions use numeric pixel props; Spindle retains 16px coolant fans and conditionally driven 2s rotation through Emotion keyframes and `sx`.
- Zero-consumer TopNav.old was deleted as an early P6 cleanup, releasing its remaining P3 consumers. Obsolete family mocks were removed from six consumer test files. `legacyLayoutImports.test.js` checks absent family directories and alias/relative source references.
- Validation: full frontend 65 suites / 423 tests; lint 0 errors / 7 existing warnings; development webpack compiled with an existing warning; `git diff --check` clean. No server/controller/Redux store, dependency manifest/lock, or Prettier-config changes. No browser tooling, simulator, production build, or push.
- **P3 remains in_progress**: light/dark and 1440×900 / 768×900 browser checks are deferred to R6. The subsequent user instruction “go next” authorized P4 implementation to proceed while this browser gate stays pending. Next exact gate: when the user authorizes the R6 model, collect the deferred theme/viewport evidence before closing P3; retain the pending gate until then.

## P4 complete — 2026-10-01

- User said “go next” after P3's deferred-browser checkpoint; P4 proceeded on the completed implementation/import gates. This does not mark P3 completed or waive its pending browser checks.
- Commands, Events, Machines, Macros and Users render Tonic Table/Pagination directly. TanStack model/selection/expansion and measured column allocation live in domain hooks/pure helpers; loading/error/retry/empty presentation belongs to the resource pages. All P4 family directories/imports are absent; Paginations was already deleted earlier.
- Axes MDI uses direct Tonic Table, retaining sticky header/300px scrolling, record order/movement boundaries, callbacks, fractions and command truncation. Tests use the actual consumer and Tonic controls.
- Tests uncovered Users' copied Commands endpoints/cache and bogus shell-command form fields. Frontend requests now use the existing Users routes; create sends name/password, update sends enabled/name while preserving the password through existing server defaults. Machine update fields now match its create form's name/data shape. No server changes.
- Full frontend **68 suites / 455 tests**, lint **0 errors / 5 existing warnings**, development webpack compiled, diff check clean. P4's tests use isolated HTTP fixtures, not a live backend/browser; end-to-end evidence remains R6. No browser tooling, simulator, production build or push.
- Next eligible implementation task: **P5** (CodePreview/I18n/Iframe/RenderBlock/RepeatableButton/Webcam/Widget/withRouter). Re-inventory its actual consumers before editing; retain only tested domain logic. P3's theme/viewport browser evidence stays pending for the user-authorized R6 model.

## P5 complete — 2026-10-01

- User said “Go P5”. Retained tested domain families render Tonic directly: CodePreview, Iframe, RepeatableButton, Webcam and Widget. Iframe native listeners, camera streams and hold timers belong to function owner hooks.
- Real G-code escaping/line/empty and JSON previews pass. Iframe URL/error/current callbacks/StrictMode cleanup and camera stale-request/device-change/error/unmount cleanup pass. CNC holds keep 500ms delay, 66ms interval and final normal release; keyboard/cancel/blur/disabled/unmount and synthesized-click suppression are tested. Existing controller command oracles pass.
- I18n/withMemo had zero consumers and are deleted; Macro RenderBlock is inline. WorkspaceRoot uses useLocation directly; withRouter is deleted. Four duplicate hold adapters and react-repeatable are removed, with an immutable lockfile install passing.
- Final frontend **71 suites / 477 tests**, lint **0 errors / 4 existing warnings**, development webpack and diff checks pass. No server/controller/Redux edits, browser tooling, simulator, production build or push.
- Next eligible task **P6**. P3 stays in_progress only for deferred theme/viewport browser evidence at R6; P5 completion does not pass that gate.

## P6 complete — 2026-10-01

- [Final reconciliation](plans/2026-09-07-tonic-ui-v2/p6-reconciliation.md) covers every original class path, five retained domain families and 18 named non-React classes. AST snapshot: 360 production files, zero React classes/factories. ConsoleWidget, the last React class, is now a function; its Clear button now reaches the existing terminal owner and has a failing-first regression.
- Remaining Axes styled labels/buttons/Keypad text use direct Tonic Box/Button. Unused visual adapters/mocks and styled-components manifest/lock entries are removed. Targeted Console.test.jsx ESLint passes after the user-requested formatting correction.
- Frontend **71 suites / 478 tests**, lint **0 errors / 4 existing warnings**, development webpack, immutable install and diff checks pass. Node **19 suites / 571 tests** pass with SocketConnection excluded; diagnostic forceExit is needed for inherited simulator planner intervals, so clean shutdown remains final-validation carry-forward.
- No server/controller/Redux/simulator edits, browser tooling, production build or push. P3 browser gate remains deferred to R6. Next eligible task **B3**, which creates the executable static CLI; P6's AST/manual audit does not claim B3 completed.

## B3 complete — 2026-10-01

- Executable `yarn check:ui-migration` scans **359 files / 18 domain classes / 0 violations**. [Usage](../../scripts/UI-MIGRATION.md) and [named policy](../../scripts/ui-migration-allowlist.json) cover exact HTTP owners, class/family permissions, alias/relative/barrel/CommonJS tracing, legacy/instance APIs and React inheritance. CI runs fixtures and gate before existing Node tests.
- **64 fixture/CLI tests** pass, including illegal component mutation, class alias/factory/allowlist misuse, raw HTTP disguised as a hook, restricted download, legal Query options/controller commands and direct queryFn/eager-read rejection. Every B0 row is reconciled in the [final baseline](plans/2026-09-07-tonic-ui-v2/query-boundary-baseline.md).
- Last Login state GET moves to a Query hook with failure/analytics/connection coverage. Unused useFetch/useAsync and react-foreach/react-infinite-tree are removed. Full frontend **71 suites / 480 tests**, lint **0 errors / 4 existing warnings**, development webpack, immutable install and diff checks pass.
- User explicitly authorized “Then commit and push”; publish B3 and the four pending P3–P6 checkpoints on feat/tonic-ui-v2-migration. Verify HEAD/remote rather than inferring push state from this pre-commit snapshot. No browser/production build or protected server/controller/Redux changes.
- Next **R6** remains deferred until user-selected model. P3's browser gate and W3 final delivery remain incomplete; B3 static success does not claim browser/performance validation.

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

1. **R6 browser authorized：** 2026-10-01 使用者指示 “Go R6” 並指定 GPT-6-Luna extra-high；先前 browser deferral 對 R6 已解除。未執行的 gate 仍不得宣稱 passed。
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
- [ ] **I2 — Axes:** replace raw icons in `DisplayPanel.jsx`, `Keypad.jsx`, `KeypadOverlay.jsx`, `components/PositionInput.jsx`. Preserve rotation, spinning, and fixed-width behavior in the component props or `sx`; assess circular-arrow icons individually rather than substituting a non-equivalent arrow.
- [ ] **I3 — Tool:** replace raw widget header controls and action icons in `index.jsx` and `Tool.jsx`; cover refresh's pending/spinning state as well as menu/collapse behavior.
- [ ] **I4 — controller widgets:** replace raw icons in Grbl (`index.jsx`, `modals/ControllerModal.jsx`), Marlin (`index.jsx`, `Controller.jsx`, `Marlin.jsx`), Smoothie (`index.jsx`, `Controller.jsx`), and TinyG (`index.jsx`, `TinyG.jsx`, `Overrides.jsx`). Treat controller command grids, refresh, status, and battery indicators as distinct behavior contracts.
- [ ] **I5 — Visualizer:** replace raw icons in `Loading.jsx`, `PrimaryToolbar.jsx`, `Rendering.jsx`, `WatchDirectory.jsx`, `WorkflowControl.jsx`, and the legacy renderer tree. Preserve busy/spinner state, file-tree icon semantics, toggles, and workflow action meaning.
- [ ] **I6 — existing Font Awesome widget header controls:** audit the currently migrated string-based `FontAwesomeIcon` use in Axes, Connection, Console, Custom, GCode, Grbl, Laser, Macro, Marlin, Probe, Smoothie, Spindle, TinyG, and Webcam. Convert Tonic-equivalent menu/more/chevron/close icons; retain direct Font Awesome definitions only where no Tonic equivalent exists. Do not assume the app-root icon library is mounted in widget tests.

Static inventory date: 2026-09-21. The raw-markup scan is limited to `src/app/widgets/**/*.jsx`; re-run it before each slice because source may change. Browser evidence remains deferred to R6.

## Deferred Tonic UI v3 reference

The original v2 checkpoint deferred v3 APIs until all major components migrated. V3 dependency/semantic-token migration completed on2026-10-03 using `3.0.0-alpha.1`. Native Dropdown/Autocomplete consumer substitutions can now be assessed as separate slices.

- Local v3 source: `/home/cheton/Code/trendmicro-frontend/tonic-ui`
- Color token guide: `/home/cheton/Code/trendmicro-frontend/tonic-ui/packages/react-docs/pages/migrations/migrating-color-tokens-from-v2-to-v3`
- General migration guide: `/home/cheton/Code/trendmicro-frontend/tonic-ui/packages/react-docs/pages/migrations/migrating-from-v2-to-v3`

## 恢復 prompt

```text
請從 docs/superpowers/cncjs-next-tonic-ui-v2-handoff.md 接手。
請以 GPT-6-Sol 當 main conversation；deterministic 或 implementation subagent 使用 GPT-6-Luna extra-high/max。不得 fallback 至 GPT-5.6 models。
先讀 EXECUTION.md、STATUS.md、00-design.md，核對 git status/HEAD（不要 reset 未知差異）。
不要自行 push，除非本次另有授權。
P1–P6、B3、R6、W3 已完成。V3 已將七個 Tonic 套件升級至 3.0.0-alpha.1，並遷移 UI semantic color tokens；frontend78/504、Node22/641、lint/guard/immutable/dev compile 與 CI production/package gate 通過。尚未重跑 V3 browser visual validation；完整平台打包在最後 snapshot 仍執行中。後續評估 Dropdown／Autocomplete consumers；react-final-form v7 維持獨立升級。
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
