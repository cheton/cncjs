# HTTP Query Boundary Baseline

Task / source commit: B0 / `f41faac9`

Command / exit code: `rg -n "from ['\"](@app/)?api|from ['\"]axios|require\(['\"]axios|useFetch|useAsync|api\." src/app --glob '*.{js,jsx}'` / 0.

This inventory records direct imports that can issue HTTP requests. Comments and
the `src/app/api/**` transport implementation are not React consumers.

| File | Symbol / endpoint | Kind | Owner task | Decision |
| --- | --- | --- | --- | --- |
| `lib/user.js` | `api.signin`, `/api/signin` | mutation | B1 | Allowed pure authentication transport/token persistence; React caller moves to session mutation. |
| `sagas/app/bootstrap.js` | axios session/bootstrap requests | bootstrap | B1 | Allowed non-React caller; reuse pure query transport, never a hook. |
| `containers/app/LoginPage.jsx` | axios `GET api/state`; `user.signin` | read + mutation | B1 | Direct React transport; replace with session query/mutation boundary. |
| `widgets/Macro/index.jsx` | axios `GET /api/macros` | read | M1/M3 | Direct React transport via XState; migrate to shared Macro query. |
| `widgets/Macro/modals/NewMacro.jsx` | axios `POST /api/macros` | mutation | M2/M3 | Direct React transport; migrate to Macro mutation. |
| `widgets/Macro/modals/EditMacro.jsx` | axios `PUT/DELETE /api/macros/:id` | mutation | M2/M3 | Direct React transport; migrate to Macro mutations. |
| `widgets/Axes/index.jsx` | `api.mdi.fetch()` | read | A1b | Direct React transport; migrate to widget Query module. |
| `widgets/Axes/Settings/index.jsx` | `api.mdi.bulkUpdate()` | mutation | A1b | Direct React transport; migrate to widget mutation. |
| `widgets/Axes/Settings/MDI/MDI.jsx` | `api.mdi.fetch()` | read | A1b | Direct React transport; migrate with MDI owner. |
| `widgets/Tool/index.jsx` | `api.getToolConfig`, `api.setToolConfig` | read + mutation | A2 | Direct React transport; migrate to Tool query/mutation. |
| `widgets/Autolevel/index.jsx` | `api.loadGCode` | mutation | A3b | Direct React transport; migrate to shared load-GCode mutation. |
| `pages/Workspace/Workspace.jsx` | `api.loadGCode` | mutation | W1 | Direct React transport; migrate to shared load-GCode mutation. |
| `widgets/Visualizer/WatchDirectory.jsx` | `api.watch.getFiles` | read | V1 | Direct React transport; migrate to path-keyed Watch query. |
| `widgets/Visualizer/SecondaryToolbar.jsx` | `api.machines.fetch` | read | V1 | Direct React transport; reuse Machines query cache. |
| `widgets/Visualizer/Dashboard.jsx` | `api.downloadGCode` | browser download | V1 | Allowed browser form/download transport; verify token, metadata, and one trigger. |
| `__deprecated/TopNav.old/TopNav.jsx` | state/version/commands requests | deprecated UI | P0 | No exception. Confirm consumer status, then remove or migrate only if live. |
| `pages/*/queries.js` Administration About/GeneralSettings/Users/WorkspaceSettings/Commands/Events/Machines/Macros | axios resource requests | Query transport | owning page / M1 | Allowed query modules. Macro module moves to shared `src/app/queries/macros.js` in M1. |
| `hooks/useAsync.js`, `hooks/useFetch.js` | generic async/fetch wrapper | generic hook | W3 audit | Not a boundary exception for new server-state flows; retain until consumer audit proves removal is safe. |

## Explicit non-HTTP exceptions

- `controller.command` / `controller.write` and Socket.IO remain realtime
  machine transport; do not put them in Query.
- `api.downloadGCode` is a browser form submit, not cacheable server state.
- Local config, assets, and storage stay with their existing owners.

## Required follow-up checks

1. B1 resolves LoginPage, bootstrap, and authentication storage.
2. M1–M3 resolve all Macro rows, including error paths that currently ignore
   failures.
3. A1b, A2, A3b, V1, and W1 resolve their named owner rows.
4. B3 turns this baseline into AST enforcement with file-specific exceptions.

Remaining untested paths: this is an import/callsite baseline only; no
transport was invoked and no browser or controller behavior is claimed.
