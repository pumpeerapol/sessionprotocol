# Session Protocol

A browser-local focus timer, intention checklist, and Freeze Breaker.

## Run locally

Serve the directory with any static HTTP server; no build or dependency installation is required.

```sh
python3 -m http.server 8000
```

## Quality checks

Tests require Node.js 22+.

```sh
node --test tests/*.test.cjs
```

## Behavior and assumptions

- Countdown uses a wall-clock deadline, so delayed browser callbacks catch up.
- Pausing stores remaining time. Running sessions continue across reloads; paused sessions stay paused.
- Completed sessions remain recoverable until explicitly closed. Legacy `sp_v6` sessions without a deadline resume their last saved elapsed value.
- History and settings remain in browser local storage; no server account or cross-device sync.
- History is limited to 100 sessions and 50 Freeze Breaker circuits.

## Release checks

Before merging, verify desktop and 390px mobile layouts, keyboard focus, reload recovery or result freshness, and any changed data import/export flow. CI runs on pull requests and pushes to main. Production publishing remains separate from PR validation.
