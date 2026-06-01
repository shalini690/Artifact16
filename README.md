# Artifact16

A minimal Node.js tutorial server built with Express.js, exposing two `GET` endpoints that return static greeting strings.

## Requirements

- Node.js — a supported LTS release only: Node 22.x (Maintenance LTS) or Node 24.x (Active LTS, recommended). This is enforced via `engines.node` (`>=22 <23 || >=24 <25`), which excludes end-of-life lines such as Node 18 and 20.
- npm (bundled with Node.js)

## Install

```bash
npm install
```

## Run

```bash
npm start
# or run the entry point directly:
node server.js
```

The server listens on the port from the `PORT` environment variable, defaulting to `3000`.

## Endpoints

| Method | Path            | Response       |
| ------ | --------------- | -------------- |
| GET    | `/`             | `Hello world`  |
| GET    | `/good-evening` | `Good evening` |

```bash
curl http://localhost:3000/             # -> Hello world
curl http://localhost:3000/good-evening # -> Good evening
```

## Security notes

- The `x-powered-by` response header is disabled to reduce framework fingerprinting.
- Dependencies are pinned and locked via `package-lock.json`; run `npm audit` to verify (expected: 0 vulnerabilities).
