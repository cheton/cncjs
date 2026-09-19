# CNCjs next → Tonic UI v2 — 交接入口

本檔是跨 session 的 **bootstrap 起點**。它只放「接手前必須先知道的事實」與讀取順序；完整進度、依賴與 blockers 不在此維護。

## 接手第一步

1. 讀本檔的「現況快照」。
2. 讀 [目前 HANDOFF](plans/2026-09-07-tonic-ui-v2/HANDOFF.md)：最新 checkpoint 與**恢復 prompt**（實際要貼的指令在該檔）。
3. 讀 [STATUS](plans/2026-09-07-tonic-ui-v2/STATUS.md)：唯一 task ledger、依賴與 blockers。
4. 讀 [EXECUTION](plans/2026-09-07-tonic-ui-v2/EXECUTION.md)：領取、驗收、暫停與恢復規則。
5. 讀 [README](plans/2026-09-07-tonic-ui-v2/README.md)、[設計](plans/2026-09-07-tonic-ui-v2/00-design.md)、[inventory](plans/2026-09-07-tonic-ui-v2/inventory.md)：範圍與 source/API 基線。
6. 執行 `git status --short` 與 `git rev-parse HEAD`，與下方快照核對。**不要 reset 未知差異**。

## 現況快照（2026-09-19T20:08:32+08:00；本檔撰寫時的狀態）

| 項目 | 值 |
| --- | --- |
| Branch | `feat/tonic-ui-v2-migration` |
| HEAD（撰寫時） | `fd613f32` |
| 工作樹（撰寫時） | clean |
| 未 push | 4 commits（本 branch 領先 origin） |
| Active task | 無 |
| 已完成最近 task | **G1 Connection**（G1-B01 已解除） |
| 下一步推薦 | **G2 GCode**（G2–G7 共用 U3、Q2-cleanup 前置） |
| Open blockers | 無 |
| BR0 | 使用者明確 `waived`，**不是 passed**；未驗證 browser gates 延後至 R6 |

本表是撰寫當下的事實，**不是當前狀態**。接手時必須自己跑 `git status --short` 與 `git rev-parse HEAD` 重新核對；若與 `STATUS.md` 不一致，一律以 `STATUS.md` 為準。

## 本次交接重點（G1）

原計畫只允許改 `src/app/widgets/Connection/`，但 open/close timeout 與 late-response protection 無法在該範圍內證明。使用者把範圍重新界定為 **frontend-only**，因此交付多出三個新模組：

- `src/app/runtime/connectionRuntime.js`：framework-independent runtime，擁有 timeout、duplicate-request guard、late-event authority、Socket.IO disconnect release。
- `src/app/hooks/useConnection.js`：`useSyncExternalStore` 綁定，唯一公開前端介面。
- `src/app/queries/serialport.js`：TanStack Query 讀取 `getPorts()` / `getBaudRates()`。

**邊界（後續 task 一體適用）：** `src/server/**`、`CNCJSController`、現有 Socket.IO protocol、Redux reducer/saga/action 一律不動。曾被提出的 server operation ID / `connectionLifecycleMeta` / cancellation event 方案已由使用者否決，不要再提。詳見 [G1 前端 runtime 計畫](plans/2026-09-19-connection-frontend-runtime.md)。

## 不要從本檔推定的事

- 不要推定執行授權：授權範圍每次由使用者當面指定。
- 不要推定 HEAD 或下一個 task：以 `git` 實測與 `STATUS.md` 為準。
- 不要以本檔取代 HANDOFF 的恢復 prompt。
- 歷史交接內容看 Git history 與 [execution-log](plans/2026-09-07-tonic-ui-v2/execution-log.md)。