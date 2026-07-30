---
name: dev-server
description: >
  Starts the Axiom Play Next.js dev server. Use this skill whenever the user
  asks to "start the server", "run dev", "preview", "open localhost", or wants
  to see their changes in a browser. Also invoke proactively after making UI
  changes when no server is running. Handles the Corepack/Yarn 4 worktree
  problem automatically — never ask the user to run corepack enable or yarn dev
  manually.
---

# Dev Server

## The Problem

Git worktrees don't have their own `node_modules`. The project uses Yarn 4 via
Corepack, but the user doesn't have sudo access to run `corepack enable`, so
`yarn dev` fails. `node_modules/.bin/next` also fails in worktrees because
`node_modules` only lives in the main repo root.

## The Fix

Always use the `next` binary from the **main repo's** `node_modules`, but run
it **from the current worktree directory** so Next.js picks up that worktree's
source files.

## Steps

### 1. Find the main repo root

The main repo is the git worktree whose `node_modules` directory exists. Walk
up from the current working directory checking for `node_modules/`:

```bash
# From anywhere in a worktree, the main repo is always at:
MAIN_REPO="/Users/pei.chien/Documents/Antigravity - dev/Axiom Play/axiom-play"
NEXT_BIN="$MAIN_REPO/node_modules/.bin/next"
```

If `node_modules` isn't there (e.g. after a fresh clone), tell the user to run
`yarn install` from the main repo first.

### 2. Pick an available port

Start at **3001** (reserve 3000 for the main repo session). Check if the port
is in use, increment until you find a free one:

```bash
PORT=3001
while lsof -i :$PORT &>/dev/null; do PORT=$((PORT + 1)); done
echo "Using port $PORT"
```

### 3. Start the server

Run from the **current worktree directory** (not the main repo):

```bash
"$NEXT_BIN" dev --port $PORT
```

Do **not** cd to the main repo — that would serve the wrong branch's files.

### 4. Update launch.json for the preview tool

So `preview_start` works in future, write/update `.claude/launch.json` in the
current worktree:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "dev",
      "runtimeExecutable": "/Users/pei.chien/Documents/Antigravity - dev/Axiom Play/axiom-play/node_modules/.bin/next",
      "runtimeArgs": ["dev", "--port", "<PORT>"],
      "port": <PORT>
    }
  ]
}
```

Replace `<PORT>` with the chosen port number.

### 5. Report to the user

Once the server is running (look for "Ready" in the output), print:

```
Dev server running at http://localhost:<PORT>
```
