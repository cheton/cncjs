# BR0 connection attempt — 2026-09-07

## Result

Blocked before the Connection widget could be exercised. The Grbl simulator
path was `/tmp/ttyGRBL` and the simulator reported a running TCP server, but
the CNCjs HTTP server returned `404` for the browser API routes.

## Environment

- Browser: global Playwright 1.62.1 with bundled Chromium, headless.
- Requested serial path: `/tmp/ttyGRBL`.
- Requested manufacturer: `Grbl Simulator`.
- Existing user simulator process: `start-with-cncjs.sh`, TCP port 37335.
- Isolated test backend: `127.0.0.1:8001`.
- Isolated test frontend: `127.0.0.1:8081`.

## Commands

```bash
node grbl-simulator/grbl-server.js 8888
node grbl-simulator/serial-bridge.js 8888 /tmp/ttyGRBL
NODE_ENV=development ./bin/cncjs --host 127.0.0.1 --port 8001 \
  --config /tmp/cncjs-br0-conn.cncrc \
  --watch-directory /tmp/cncjs-migration-watch
WEBPACK_DEV_SERVER_HOST=127.0.0.1 PROXY_TARGET=http://127.0.0.1:8001 \
  yarn start-app-dev --port 8081
playwright cli -s=br0-conn2 open http://127.0.0.1:8081 --browser chromium
```

The simulator and serial bridge could not be duplicated because the user's
`start-with-cncjs.sh` already owned the Grbl simulator and `/tmp/ttyGRBL`.
The isolated backend started successfully, but these checks both returned
404:

```bash
curl http://127.0.0.1:8001/
curl http://127.0.0.1:8001/api/signin
```

The browser therefore remained on `/#/login` with `Authentication failed`.
No Connection widget command, status, or disconnect assertion was recorded.

## Required unblock

Fix or identify the route mount used by `bin/cncjs`/`webappengine` so that the
server exposes `/api/signin` and the frontend proxy reaches it. Then rerun the
same bundled-Chromium flow against `/tmp/ttyGRBL`.

All processes started for this attempt and both browser sessions were stopped.
