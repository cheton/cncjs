# CNCjs Tonic UI v2 — 持久交接入口

## 現況

- Mode: **implementation paused after F1/FIX-002**。使用者要求第一階段先停下；F1-B01 / FIX-001-B02 已由 app-level cleanup 與本機 host 吸收解除。
- 執行角色原指定為 Terra main loop + Luna implementation subagent。現有 main 為 root session、不是 Terra，這是執行限制；F1 worker 已結束，主控已完成獨立 source review。
- F1 已完成版本、manifest、entrypoint、lint、production build 與 headless login baseline。FIX-001 移除 CNCjs app-level session store；FIX-002 吸收 `/home/cheton/Code/cncjs/webappengine` 的必要 host 行為並移除 dependency。Focused host/app tests pass; browser/frontend regression remains pending.
- 每次派工再按合約明確度、狀態/時序、影響範圍、驗證能力判斷子任務 effort，brief 記一句選擇理由。合約歧義先交 Terra，缺 oracle 先建立驗證，不因失敗一律升 max。**Hard rule:** 所有 browser tests／browser regression／screenshot／accessible snapshot 必須由 `gpt-5.6-luna` / `medium` 執行；主控只審核 evidence 與更新 ledger，不得代跑或改派模型。
- [STATUS](STATUS.md)：F1 為 blocking；其餘 implementation tasks 為 todo。F1 的開始 HEAD `21c288dc`；目前只有本次 blocker checkpoint 的未提交 docs diff，完成後可 local commit。
- [EXECUTION](EXECUTION.md)：領取、blocking、驗收、停止與恢復程序。
- [README](README.md)、[設計](00-design.md)、[inventory](inventory.md)：範圍與 source/API 基線。

## Hard rules / current execution rules

接手 session 必須先讀本節，再讀 [EXECUTION](EXECUTION.md) 的完整規則。

1. **Browser ownership:** 所有 browser tests、browser regression、screenshots、accessible snapshots 與 browser runner 操作，必須由 `gpt-5.6-luna` / `medium` 執行。主控不得代跑或改派模型；只負責 bounded brief、evidence review 與 ledger。Luna medium 不可用時，browser gate 留在 `in_progress` 或記具名 blocker。
2. **Browser environment:** 使用 Playwright bundled Chromium，不用 system Chrome screenshot channel。Browser tests 應以 `SUPPRESS_WEBGL_WARNING=1` 啟動 dev build，使 Linux/headless WebGL fallback 保持 disabled 但不顯示 warning modal；若測試專門驗證 modal，才省略此變數。Production 永遠強制 `0`。未使用 suppression 時，若 modal 出現必須定位 portal 內 enabled `OK`，不能以廣泛 `Close` locator 誤點 disabled `Close G-code file`。
3. **Test config:** browser/simulator tests 唯一的受版本控制 config reference 是 [`docs/testing/configs/browser-test.cncrc`](../../../testing/configs/browser-test.cncrc)。它沒有 `users`，使用 anonymous sign-in；先複製到唯一 `/tmp` runtime path，然後以 `CONFIG_PATH=/tmp/cncjs-browser-test.cncrc SUPPRESS_WEBGL_WARNING=1 yarn dev` 啟動。`scripts/start-server-dev.sh` 只把 `CONFIG_PATH` 傳給 backend `--config`；webpack development config 只讀取 `SUPPRESS_WEBGL_WARNING`。不得以 repo 內檔案或使用者的 `~/.cncrc` 作 active config，也不可提交 token、password、machine-specific config 或 private watch contents。
4. **Simulator:** 從 repo root 只執行 `yarn dev`；它會啟動 simulator、frontend 與 backend。不要另跑 `grbl-simulator/start-with-cncjs.sh`，避免搶占 `/tmp/ttyGRBL`。browser test 結束只停止自己啟動的程序，確認 ports 8000/8080 與 `/tmp/ttyGRBL` 已清理。
5. **Scope and state:** `STATUS.md` 是唯一 task ledger，只有主控能改 STATUS/HANDOFF/execution-log/plan checkboxes。沒有可重跑 evidence 的 browser gate 不得標 completed；不以 chat 或 worker 自評取代 evidence。可建立 local commits；不得自行 push。
6. **Migration intent:** 淘汰不支援 React 16–18 的舊 runtime library，特別是 Bootstrap family。CNCjs Button 只有在整合證據顯示 Tonic 無法保留必要 domain 色票/語意時，才可做成薄的 Tonic-based `src/app/components/Button`；不可保留或 re-export `react-bootstrap-buttons`。
- 計畫更新前觀察 HEAD e09a642c，工作樹乾淨；本次只有 docs 變更，接手時重新檢查實際 HEAD/diff。

## 最新 review 結論

已補持久 ledger、父子 task 對應、避免 regression gate 循環依賴、browser procedure，以及 widget/controller contract 補充。修正不存在的 Tonic Slider；rc-slider 暫留。Tonic Select 是 native select，自訂 option/search 不可直接降級。react-datepicker 掃描未找到 src/app consumer，W3 再全 repo 複核。

未宣稱 build/test/browser 通過。目前只有先前只讀 geometry-baseline.json；F1/H1–H3/R0 必須取得可重跑實證。詳細案例仍要在各 task 的 source baseline 上寫成 tests；不能把計畫範例當成已執行測試。

## 恢復 prompt

```text
請從 docs/superpowers/plans/2026-09-07-tonic-ui-v2/HANDOFF.md 接手。
請以 Terra high 當 main loop，Luna high/max 當 implementation subagent；這次授權執行目前階段。
先讀 EXECUTION.md、STATUS.md、00-design.md 與 AGENTS.md，核對 git status/HEAD。
優先恢復 in_progress；若 blocking 先判斷解阻條件，否則選 Depends on 都 completed 的 todo。
目前若尚未開始，執行 F1。不要重做 completed task，也不要只靠 checkbox 判斷測試通過。
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
