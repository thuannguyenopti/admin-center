# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start development server at http://localhost:3000 (Turbopack)
yarn build        # Production build (runs validate + bundle-sources first)
yarn preview      # Build + serve production bundle locally — mirrors Vercel exactly
yarn start        # Serve a previously built production bundle
yarn lint         # ESLint via Next.js
```

> **`yarn dev` vs `yarn preview`**: `yarn dev` uses Turbopack and may render Axiom styles differently from production. Run `yarn preview` to see exactly what Vercel will serve before pushing.

Package manager is **Yarn 4** (Corepack). Use `yarn` not `npm`. Run `corepack enable` (requires sudo) if `yarn dev` fails. To install with auth-gated registry: `yarn install:auth` (uses `.env`). Fallback without Corepack: `node_modules/.bin/next dev`.

## ⚠️ Critical: Build Script & Webpack Rules

**NEVER add `--webpack` to the `next build` command.** Forcing webpack mode breaks Next.js's internal CSS extraction pipeline for `transpilePackages: ["@optiaxiom/react"]`, causing all Axiom component styles (borders, fills, backgrounds) to be silently stripped from the Vercel production build.

**NEVER add custom `webpack(config)` SVG rule mutations** (pushing to `config.module.rules`, wrapping/excluding asset rules). Mutating the raw webpack rules array breaks the same CSS extraction. For SVG support:
- Dev (Turbopack): use the `turbopack.rules` block in `next.config.ts` — already configured
- Production: SVGs in `public/` are served as static assets; React SVG components in `app/cmp/assets/` use SVGR via import — no extra webpack rule needed

If Axiom component styles (button borders, input fills, etc.) are missing in production but work locally, the root cause is almost always one of the above.

## Architecture

This is a **multi-product UI prototype** built with Next.js 16 (App Router), React 19, TypeScript, and the Optimizely Axiom design system. It renders several independent product areas as a single Next.js app:

| Route prefix | Product |
|---|---|
| `/cms` | Optimizely CMS |
| `/cmp` | Content Marketing Platform |
| `/opal` | Opal AI assistant |
| `/connect-platform` | Connect Platform |
| `/fe-hosting` | Frontend Hosting |

### Navigation & Layout

**`app/layout.tsx`** is a client component that defines the entire sidebar navigation structure for each product as a `structure` object keyed by the first path segment. It passes the matching nav tree to `app/components/template.tsx`.

**`app/components/template.tsx`** renders the shell: primary sidebar (`Sidebar`/`Nav`), optional secondary sidebar (VT drill-down or Content Manager sidebar), a scrollable main content area, an optional footer bar, and the Opal slide-out panel. Pages get `px="32" py="24"` padding and an auto-generated `<Heading>` page title by default.

**`customLayout: true`** on a nav item bypasses the padding and page header — required for full-bleed pages (e.g., Opal chat, CMS Edit). Full-width table pages instead use negative margins: `-m-6 -mt-[72px]`.

**Secondary sidebar drill-down (VT)** — when a nav item has nested `children` objects with a `title` and `children` array, clicking sub-items causes `VT.tsx` to slide in a sub-panel. Up to 4 levels deep (lvl2–lvl4).

### Design System

Full reference: **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — read before writing any UI code.

All UI must use **`@optiaxiom/react`** components. Never use raw HTML elements if an Axiom equivalent exists.

**Exception**: `app/components/vb/blocks/` uses raw HTML + Tailwind (Visual Builder renders customer website content, not product UI).

**Critical rules:**
- Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"` — never arbitrary px
- Semantic color tokens: `fg.*`, `bg.*`, `border.*` — never hex values
- Border radius: `rounded` prop (not `borderRadius`); shadow: `shadow` prop (not `boxShadow`)
- `Input`/`SearchInput` only support `size="md"` (default), `"lg"`, `"xl"` — never `"sm"`
- Wrap inputs with `<Field label="...">` — never manual `<Text>` labels
- Dark mode: use `[data-theme="dark"]` selector — never `@media (prefers-color-scheme: dark)`

### Icons

**ALWAYS use `@optimizely/axiom-icons` — NEVER `@tabler/icons-react` in product UI code.**

- **`@optimizely/axiom-icons`** — the real Axiom icons package (FontAwesome Pro Light). This is the ONLY icon source for all product UI. Import from it normally: `import { IconAgent, IconSparkles } from "@optimizely/axiom-icons"`.
- **`app/lib/axiom-icons.tsx`** — a bridge shim that re-exports the real Axiom icons and provides Tabler fallbacks only for icons not yet in the Axiom package. The shim is aliased via `next.config.ts` so `@optimizely/axiom-icons` always works.
- **`@tabler/icons-react`** — only allowed in `app/lib/axiom-icons.tsx` for fallback mappings. Never import Tabler directly in any other file.
- **CMP custom SVG icons** — in `app/cmp/assets/`, imported as React components (SVGR), use `fill="currentColor"`

**When adding a new icon**: first check if it exists in `@optimizely/axiom-icons`. If not, add a Tabler fallback entry to `app/lib/axiom-icons.tsx`.

### Key Patterns

**`usePersistentState(key, defaultValue)`** — localStorage-backed state at `app/usePersistentState.js`. Returns `[state, setState, isHydrated]`. Always check `isHydrated` before rendering hydration-sensitive UI.

**`useLayout()`** — from `app/context/LayoutContext.tsx`. Exposes `asideContent`, `footerContent`, `hidePageHeader`, `opalPanelControls` (including `launchPrompt`), and `codePanelControls`. Use `setAsideContent` / `setFooterContent` from a page component to inject into the template's aside panel or sticky footer bar.

**`useOpalContext()`** — from `app/context/OpalContext.tsx`. Provides context-aware data (current page, selection, etc.) for the Opal AI panel.

**Providers stack**: `LayoutProvider` → `BrandToneProvider` → `PreflightProvider` → `OpalContextProvider` → `ContentManagerLayoutProvider` (CMS content only) → `FilterPanelProvider` (CMS content only).

### MCP Servers

Configured in `.mcp.json`:
- **`axiom`** (`@optiaxiom/mcp`) — fetch Axiom component docs and valid prop values
- **`figma`** — Figma design context
- **`coda`** — Coda docs integration
- **`optimizely`** — Optimizely project data

### Data Visualization Colors

Use the shared data-viz palette (see `app/DATA_VISUALIZATION_COLORS.md`) for charts, legends, heatmaps. Do not use Axiom UI tokens (`bg.*`, `fg.*`) for data-encoding. Live reference: `/data-viz-colors`.

## No Monolithic Files

Before writing code, check if files you're touching are monolithic (300+ lines, multiple concerns). If so, split them first. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the splitting guide.

## Git & Deployment

**Repo**: `Ben-Holme/axiom-play` | **Live**: https://axiom-play-lac.vercel.app

- **Never push directly to `main`** — always use a PR via `gh pr create`
- **Never merge locally** — merge via GitHub so CI checks run first
- Vercel auto-deploys `main` to production; preview deploys on every PR branch
- Verify build (`yarn build`) before pushing
