# Axiom Play — GitHub Copilot Instructions

## Design System (MANDATORY)

Read **DESIGN_SYSTEM.md** at the repo root before writing any UI code. It is the single source of truth for all tokens, components, colors, spacing, and patterns.

**Non-negotiable rules:**
- Always use `@optiaxiom/react` components — never raw HTML for product UI
- Always use spacing tokens (`p="16"`, `gap="12"`) — never arbitrary px
- Always use semantic color tokens (`bg.default`, `fg.secondary`) — never hex
- Exception: `app/components/vb/blocks/` uses raw HTML + Tailwind (customer website, not CMS UI)
- Use `[data-theme="dark"]` for dark mode — never `@media (prefers-color-scheme: dark)`

## Tech Stack

- **Framework**: Next.js (App Router), TypeScript, React
- **Package manager**: Yarn
- **State**: `app/usePersistentState.js` for localStorage-backed prototype state. Check `isHydrated` before rendering.
- **Icons**: `@tabler/icons-react` (primary), `@fortawesome` (secondary)

## Project Structure

- `app/cmp/` — Content Marketing Platform pages
- `app/cms/` — CMS content management pages
- `app/opal/` — AI agent interfaces
- `app/components/vb/` — Visual Builder (raw HTML, NOT Axiom)
- `app/components/` — Shared wrappers around Axiom components
- `app/db/` — Mock data (`initialData.ts`, `mockData.ts`)

## No Monolithic Files (MANDATORY)

On every new conversation, check if the files you're about to touch are monolithic (300+ lines, multiple concerns). If so, split them first. Never create or extend monolithic files. See full guide in `DESIGN_SYSTEM.md`.

## Key Patterns

- The shared `app/components/template.tsx` provides sidebar + content layout
- `useLayout()` from `app/context/LayoutContext` for layout controls
- `useTheme()` from `app/hooks/useTheme.tsx` for theme management
- Local wrappers in `app/components/` override Axiom defaults — prefer raw `@optiaxiom/react` unless the wrapper's defaults are needed
