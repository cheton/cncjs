# Test configuration references

`browser-test.cncrc` is the single, version-controlled reference for CNCjs
browser and simulator tests.

- It has no `users` entry. Tests use the anonymous sign-in contract.
- It uses only test paths: `/tmp/cncjs-browser-watch` and `/tmp/ttyGRBL`.
- Its `secret` is an intentionally public test-only value. Do not use it for a
  real CNCjs installation.
- Do not start CNCjs with this file in place. Copy it to a unique `/tmp` path
  first because CNCjs may persist state to its active config file.

For the full development stack, start it with:

```bash
CONFIG_PATH=/tmp/cncjs-browser-test.cncrc yarn dev
```

`scripts/start-server-dev.sh` reads this variable and passes it only to the
backend as `--config`. Webpack does not receive or expose the path.

Never commit a machine-specific `~/.cncrc`, access token, password, or private
watch-directory contents. Update this reference when a test needs a new shared
configuration key.
