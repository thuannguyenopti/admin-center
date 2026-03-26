# app/ — Claude Code Context

> Design system rules, tokens, and components are in **[../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)**.
> This file covers only app-level specifics.

## Local Component Wrappers

`app/components/` contains wrappers like `Button.tsx`, `Input.tsx`, `Text.tsx` that override Axiom defaults for this prototype. Prefer raw `@optiaxiom/react` imports unless the wrapper provides specific defaults you need (e.g., `Input` for `size="lg"`, `Flex` for default row direction).

## Visual Builder Exception

Files in `app/components/vb/blocks/` represent the customer's website preview. Use **raw HTML + Tailwind** here, NOT Axiom components.

## AI Integration

- `app/api/llm/route.js` — proxy for OpenAI completions (text generation, summarization)
- `app/api/chat/route.js` — Visual Builder AI layout generation

## Data Visualization

- Use Axiom UI tokens for product chrome, surfaces, and text
- Use the shared data-viz palette only for charts/legends/heatmaps
- See [DATA_VISUALIZATION_COLORS.md](DATA_VISUALIZATION_COLORS.md) for the canonical palette
