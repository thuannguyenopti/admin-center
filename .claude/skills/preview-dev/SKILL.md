---
name: preview-dev
description: "Starts (or reconnects to) the local Next.js dev server for the current git worktree and opens a browser preview. Handles the node_modules path problem that worktrees have. Use whenever the user wants to see their changes locally: 'preview this', 'start the dev server', 'how do I see the changes', '/preview-dev', 'open preview', 'spin up dev server'."
---

# Preview Dev

Finds the right Next.js binary, starts the dev server for the current worktree, and shows a screenshot.

**Usage:** `/preview-dev`

---

## Step 1 — Locate the worktree and Next.js binary

Run these in parallel:

**A) Get the worktree root:**
```bash
git rev-parse --show-toplevel
```
Capture as `WORKTREE_ROOT`. This is the directory the dev server must run from.

**B) Find the Next.js binary:**
Check in order — use the first that exists:
1. `$WORKTREE_ROOT/node_modules/.bin/next` (own node_modules)
2. Walk up from `$WORKTREE_ROOT` looking for `node_modules/.bin/next` — worktrees often live inside the main repo's `.claude/worktrees/` so the parent repo's node_modules may be 2–3 levels up
3. Glob: `find "$WORKTREE_ROOT" -maxdepth 6 -name "next" -path "*/node_modules/.bin/next" 2>/dev/null | head -1`

Capture as `NEXT_BIN`.

**C) Check if a dev server is already running for this worktree:**
```bash
# Find Node processes whose cwd matches WORKTREE_ROOT
lsof -c node 2>/dev/null | grep -F "cwd" | grep -F "$WORKTREE_ROOT" | awk '{print $2}' | sort -u | while read pid; do
  lsof -p "$pid" -a -i TCP 2>/dev/null | grep LISTEN | awk '{print $9}' | sed 's/.*://'
done
```
If a port is found, skip to Step 3 — don't start a second server.

---

## Step 2 — Start the dev server (only if not already running)

### 2a — Pick a free port

```bash
for port in 3001 3002 3003 3004 3005; do
  lsof -i :$port 2>/dev/null | grep -q LISTEN || { echo $port; break; }
done
```
Capture as `DEV_PORT`.

### 2b — Write a wrapper script

Write `/tmp/axiom-preview-dev.sh`:

```bash
#!/bin/bash
# Starts Next.js from an explicit working directory using the full binary path.
# Avoids getcwd failures that occur in sandboxed shell contexts.
export HOME="${HOME:-/Users/$(whoami)}"
cd "WORKTREE_ROOT" && exec "NEXT_BIN" dev --port DEV_PORT
```

Replace `WORKTREE_ROOT`, `NEXT_BIN`, and `DEV_PORT` with the actual values.

```bash
chmod +x /tmp/axiom-preview-dev.sh
```

### 2c — Update `.claude/launch.json`

Write `$WORKTREE_ROOT/.claude/launch.json`:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "axiom-play",
      "runtimeExecutable": "/tmp/axiom-preview-dev.sh",
      "runtimeArgs": [],
      "port": DEV_PORT,
      "autoPort": false
    }
  ]
}
```

### 2d — Start the server

Call `preview_start` with name `"axiom-play"`.

If `preview_start` fails with a `getcwd` error, fall back:
- Run the wrapper script directly in the background via Bash: `/tmp/axiom-preview-dev.sh &`
- Wait up to 30s for the port to open: `until curl -s http://localhost:DEV_PORT > /dev/null 2>&1; do sleep 2; done`

---

## Step 3 — Open the preview

1. Use `preview_start` to connect (or just proceed if the server is confirmed running on `DEV_PORT`).
2. Navigate to `/opal/context` (or whatever route the user was working on — check recent file edits via `git diff --name-only HEAD~1` to infer the route).
3. Take a `preview_screenshot` and show it to the user.
4. Report the URL: `http://localhost:DEV_PORT/<route>`

---

## Failure modes and fixes

| Symptom | Fix |
|---|---|
| `node_modules/.bin/next` not found in worktree | Walk up parent dirs; use `find` fallback |
| `getcwd: cannot access parent directories` in preview_start | Fall back to direct Bash background launch |
| Port already in use | Try next port in 3001–3005 range |
| Server starts but 404 on route | Check `git branch` — confirm server is running from the right worktree path |
| `corepack` / yarn version error from `yarn dev` | Never use `yarn dev` — always call the Next.js binary directly: `"$NEXT_BIN" dev --port $DEV_PORT` |

---

## Output

```
✓ Dev server running at http://localhost:PORT
  Route: /opal/context
  Worktree: WORKTREE_ROOT
```

Plus a screenshot of the page.
