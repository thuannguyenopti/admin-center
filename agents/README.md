# Axiom Dev Agents

Five Claude Code slash commands for the Axiom Play design-to-code workflow.

## Install

This repo is private — use the GitHub CLI to install (it handles auth automatically):

```bash
gh api repos/episerver/axiom-play/contents/agents/install.sh \
  --header "Accept: application/vnd.github.raw+json" | bash
```

Or open [agents/install.sh](https://github.com/episerver/axiom-play/blob/main/agents/install.sh) on GitHub, copy the script, and run it locally.

This pulls the latest command files from GitHub and installs them into `~/.claude/commands/` — available globally across all Claude Code sessions.

---

## Requirements

- [Claude Code](https://claude.ai/code) installed
- `gh` CLI installed and authenticated — required for install and `/push-dev` / `/merge-pr`
  ```bash
  gh auth login
  ```
- Figma MCP connected (for `/build-dev` and `/figma-builder`)
- Axiom MCP connected — `@optiaxiom/mcp` (for `/build-dev` and `/audit-axiom`)
- `yarn` available in the project (for `/push-dev` preview)

---

## Commands

### `/build-dev`
**Figma → Axiom TSX → compliance review**

Paste a Figma frame URL. The agent fetches the design, scans your codebase for existing components to reuse, then generates or adapts an Axiom-compliant TSX component. A compliance reviewer checks the output and loops up to 2× to fix violations automatically.

### `/audit-axiom`
**Audit or auto-fix Axiom design system violations**

Point it at a file path, type `current` to check all files changed on the branch, or pick a product area (`cms`, `cmp`, `opal`, etc.). Checks for icon imports, spacing tokens, color tokens, input sizes, raw HTML, Field labels, inline styles, and dark mode selectors — validated against the live Axiom MCP spec. Optionally auto-fixes violations in place.

### `/push-dev`
**Full pre-push pipeline**

Runs in sequence:
1. Axiom compliance gate on changed files (or a product area)
2. Starts dev server, takes a preview screenshot
3. Asks for your approval
4. Commits, pushes the branch, and optionally opens a PR via `gh pr create`

### `/figma-builder`
**App page → Figma frame with live library instances**

Paste a page URL (`http://localhost:3000/opal/agents`), app route, or file path. The agent scans your source code, maps each Axiom component to its matching Figma library component, then builds a Figma frame using real library instances — not recreated shapes.

### `/merge-pr`
**Verify CI/Vercel checks → squash-merge PR**

Checks that all CI and Vercel preview checks pass, confirms with you, then squash-merges the PR via `gh pr merge --squash`. Optionally deletes the branch after merge.

---

## Axiom Compliance Rules

All commands validate against the **live Axiom MCP spec** (tokens and component props fetched at runtime), plus these structural rules:

| # | Rule |
|---|------|
| 1 | Icons from `@optimizely/axiom-icons` only — never `@tabler/icons-react` directly |
| 2 | Spacing tokens only: `0 2 4 6 8 10 12 16 20 24 32 40 48 56 64 80` |
| 3 | Semantic color tokens: `fg.*`, `bg.*`, `border.*` — no hex values |
| 4 | Input/SearchInput size: `md`, `lg`, `xl` only — never `sm` |
| 5 | No raw HTML (`div`, `span`, `button`, etc.) when an Axiom component exists |
| 6 | Inputs wrapped in `<Field label="...">` — no manual labels |
| 7 | `rounded` and `shadow` props — never `style={{ borderRadius, boxShadow }}` |
| 8 | Dark mode via `[data-theme="dark"]` — never `@media (prefers-color-scheme: dark)` |
