# BR0 browser baseline

Task / source commit: BR0 / `394b3e24`

Environment:

- OS: Debian Linux
- Browser runner: global Playwright 1.62.1
- Browser: Playwright bundled Chromium (system Chrome channel is not used for screenshots)
- Viewport: 1440×900
- Headless: yes
- DPR: 1
- GPU: software/headless WebGL; application displayed its WebGL fallback
- Backend: `127.0.0.1:8000`
- App: `127.0.0.1:8080`
- Simulator TCP: `8888`
- Serial path: `/tmp/ttyCNCjsMigration`
- G-code SHA256: `e9f23b3146d2ac3d4ad39ed63a0af2f26b61e483ad495a5a4345806bef46517b`
- Watch tree: 4,900 directory files (100 directories × 49 files), plus 3 root fixtures

Observed baseline:

- App loaded at `/#/workspace` with title `CNCjs 2.0.0-dev`.
- Workspace accessible snapshot contains Connection, Console, Grbl, Marlin,
  Smoothie, TinyG, Webcam, Visualizer, Axes, G-code, Macro, Autolevel, Probe,
  Tool, Spindle, and Laser regions.
- Empty-user config entered Workspace without a credential form; no password or
  token was saved.
- WebGL fallback dialog was visible under headless software rendering.
- No uncaught exception or TypeError was observed.
- Console baseline contains existing Tonic deprecation warnings, legacy
  `react-bootstrap-buttons` defaultProps warnings, React lifecycle warnings,
  and a favicon 404. These are recorded, not treated as migration passes.
- Administration/Macros loaded at `/#/administration/macros`; the New Macro
  dialog opened successfully.
- Appearance menu switched to Dark theme and back to Light theme; both theme
  snapshots were captured.

Artifacts:

- `commands.md` — exact setup and browser commands
- `first-run-login-snapshot.yml` — first-run sign-in screen after a clean browser session
- `workspace-console.log` — browser console output
- `workspace-1440x900.png` — full-page screenshot
- `macros-modal-snapshot.yml`, `macro-modal.png` — New Macro dialog
- `theme-dark-snapshot.yml`, `theme-light-snapshot.yml`, `theme-light.png` — theme checks

Remaining BR0 coverage: authenticated workspace accessibility snapshot,
serial connection and Run/Pause/Resume/Stop/jog/disconnect commands, large
fixture load, and the 768×900 viewport remain to be exercised. The clean
browser session reached the sign-in screen; the temporary fixture account was
not accepted after the backend restart, so no credentials or token were saved.
