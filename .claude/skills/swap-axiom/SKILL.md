---
name: swap-axiom
description: >
  Swap the installed Axiom version between V2 (for main) and V3 (for
  main-rebrand / V3 branches). Use whenever the user asks to "switch to V2",
  "switch to V3", "swap axiom", "install V2", "install V3", or invokes
  /swap-axiom V2|V3. Handles the gotcha where Yarn 4 leaves leftover V3
  globals on a V2 install (and vice versa), which causes lime-green V3 colors
  to bleed into V2 components.
---

# Swap Axiom

## Why this skill exists

`@optiaxiom/react` and `@optiaxiom/globals` must match.

- `react` ships components that *reference* CSS variables like
  `var(--ax-colors-bg-accent)`.
- `globals` defines the *values* of those variables.

V2 react + V3 globals = V2 components rendering with V3 colors (e.g. lime
buttons on the "V2" home page). Yarn 4 does NOT replace `node_modules/@optiaxiom/globals` on a version downgrade — the old directory stays put. So a plain
`yarn install` after editing `package.json` is not enough; the directory must
be deleted first.

## Versions

| Package | V2 | V3 |
|---|---|---|
| `@optiaxiom/react` | `^1.9.1` | `3.0.0-next.3` |
| `@optiaxiom/globals` | `^1.1.12` (pin explicitly) | transitive (3.0.0-next.x) |
| `@optiaxiom/icons` | `^1.1.2` | `^1.1.2` |
| `@optiaxiom/proteus` | `^0.2.11` | `^0.2.11` |

`icons` and `proteus` are the same in both — leave alone.

## Usage

- `/swap-axiom V2` — install V2 (for `main` branch work)
- `/swap-axiom V3` — install V3 (for `main-rebrand` / V3 work)
- `/swap-axiom` (no arg) — detect current version, infer target from branch, and **always confirm with the user before swapping**

## Steps

### 1. Read current state and report

Always run this first, regardless of args:

```bash
cat node_modules/@optiaxiom/react/package.json | grep version
cat node_modules/@optiaxiom/globals/package.json | grep version
git branch --show-current
```

Determine the currently installed version family:
- `react@1.x` + `globals@1.x` → currently on **V2**
- `react@3.0.0-next.x` + `globals@3.0.0-next.x` → currently on **V3**
- mismatched → **mixed/broken state**

### 2. Confirm with the user before swapping

Tell the user:
- What version is currently installed (e.g. "Currently on **V2** — `react@1.9.37` + `globals@1.1.12`")
- What branch they're on
- What the inferred target is (V2 for `main`-family branches, V3 for `main-rebrand` / `v3` / `rebrand`)
- Ask them to confirm: "Swap to V3?" — use AskUserQuestion with Yes / No / Cancel options

**Do not proceed past this point without explicit user confirmation**, even when an arg like `V2` or `V3` was passed — confirm the swap intent.

If the current version already matches the requested/inferred target, report "Already on V2/V3 — nothing to do" and exit without prompting.

### 3. Stop the dev server

```bash
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs -r kill 2>/dev/null
```

### 4. Update `package.json`

For **V2**:
- `"@optiaxiom/react": "^1.9.1"`
- `"@optiaxiom/globals": "^1.1.12"` (add explicit pin — prevents V3 globals from being kept)

For **V3**:
- `"@optiaxiom/react": "3.0.0-next.3"`
- Remove the `@optiaxiom/globals` line so the V3 transitive version is used (or set it to `3.0.0-next.2`).

Use Edit, not Bash, to modify `package.json`.

### 5. Delete the affected node_modules directories

This is the critical step. Yarn 4 won't replace these on its own.

```bash
rm -rf node_modules/@optiaxiom/react node_modules/@optiaxiom/globals
```

### 6. Reinstall

```bash
npx --yes @yarnpkg/cli-dist install
```

(Use `yarn install` if Corepack is enabled, but in this repo it usually isn't.)

### 7. Verify

```bash
cat node_modules/@optiaxiom/react/package.json | grep version
cat node_modules/@optiaxiom/globals/package.json | grep version
```

Both must match the target version family. If not, repeat steps 5 and 6.

### 8. Clear Next.js cache

Turbopack caches compiled CSS, so without this the old colors may stick:

```bash
rm -rf .next
```

### 9. Restart the dev server

Use the `dev-server` skill or run directly:

```bash
"$PWD/node_modules/.bin/next" dev --port 3001
```

Wait for "Ready in", then report the URL to the user.

## Reporting

After the swap, tell the user:
- Target version (V2 or V3) and the actual `react` + `globals` versions installed
- Dev server URL
- Reminder to hard-refresh (`Cmd+Shift+R`) to drop cached CSS
