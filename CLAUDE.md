# Axiom Play — AI Assistant Instructions

## Design System (MANDATORY)

Read **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** before writing any UI code. It contains all tokens, components, colors, and rules for the Optiaxiom design system. Everything in one place.

**Quick rules:**
- Always use `@optiaxiom/react` components — never raw HTML for product UI
- Always use spacing tokens (`p="16"`, `gap="12"`) — never arbitrary px
- Always use semantic color tokens (`bg.default`, `fg.secondary`) — never hex
- Exception: `app/components/vb/blocks/` uses raw HTML + Tailwind (customer website, not CMS UI)
- Use `[data-theme="dark"]` for dark mode — never `@media (prefers-color-scheme: dark)`

## MCP Tools

An **Axiom MCP server** (`@optiaxiom/mcp`) is available. Use it to look up component props, examples, and API details when the docs in DESIGN_SYSTEM.md aren't enough.

## Tech Stack

- **Framework**: Next.js (App Router), TypeScript, React
- **Package manager**: Yarn (`corepack enable` if missing)
- **Dev server**: `yarn dev`
- **State**: `app/usePersistentState.js` for localStorage-backed prototype state. Check `isHydrated` before rendering.
- **Icons**: `@tabler/icons-react` (primary), `@fortawesome` (secondary)

## Project Structure

```
app/
├── components/     # Shared components (wrappers around Axiom)
├── cmp/            # Content Marketing Platform pages
├── cms/            # CMS (content management) pages
├── opal/           # AI agent interfaces
├── components/vb/  # Visual Builder (uses raw HTML, NOT Axiom)
├── context/        # React contexts (Layout, Opal, etc.)
├── hooks/          # Custom hooks (useTheme, useOpalState, etc.)
└── db/             # Mock data (initialData.ts, mockData.ts)
```

## No Monolithic Files (MANDATORY)

**On every new conversation**, before writing code:
1. Check if the files you're about to touch are monolithic (300+ lines, multiple concerns in one file)
2. If so, **split them first**, then make your changes in the correct new file

Never create or extend monolithic files. See the full splitting guide in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#code-architecture-no-monoliths).

## Layout

The shared `app/components/template.tsx` provides the sidebar + content grid. Pages access layout controls via `useLayout()` from `app/context/LayoutContext`.

## Git & Deployment Workflow

**Repo**: `Ben-Holme/axiom-play` on GitHub
**Hosting**: Vercel (auto-deploys from GitHub)
**Live URL**: https://axiom-play-lac.vercel.app

### How to ship changes:
1. **Commit** to your feature branch
2. **Push** to `origin`
3. **Create a PR** against `main` using `gh pr create`
4. **GitHub runs checks** — wait for them to pass
5. **Merge via GitHub** (not locally) — Vercel auto-deploys to production on merge to `main`
6. Preview deploys happen automatically for every PR branch

### Rules:
- **Never push directly to `main`** — always go through a PR
- **Never merge locally** — merge via GitHub so checks run first
- **Always verify build** (`yarn build` or `npx next build`) before pushing
- The team reviews PRs on GitHub; Vercel deploys the preview automatically per branch
