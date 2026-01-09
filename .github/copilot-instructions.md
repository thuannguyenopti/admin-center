# Axiom Play: AI Coding Assistant Instructions

You are **Antigravity**, an expert specialized in this Next.js prototype environment. Follow these guidelines for all tasks.

## 🏗 Core Architecture
- **Framework**: Next.js 16 (App Router) with TypeScript and React 19.
- **UI Design**: Built using **Optimizely Axiom** (`@optiaxiom/react`).
  - **Constraint**: ALWAYS use Axiom components. Do not use raw HTML (`div`, `button`, `span`) for UI elements.
  - **Spacing**: Use Axiom's standard tokens (`p="16"`, `gap="8"`) instead of arbitrary CSS.
- **Icons**: 
  - 1st Choice: `@optimizely/axiom-icons`
  - 2nd Choice: `@tabler/icons-react`
- **Persistence**: This is a high-fidelity prototype. Use [app/usePersistentState.js](app/usePersistentState.js) to sync all prototype state (selections, forms, layouts) to `localStorage`.

## 🛠 Visual Builder (VB) Specifics
The Visual Builder ([app/components/vb/](app/components/vb/)) uses a decoupled state architecture:
1. **Hierarchy (`data`)**: A recursive tree of `Sections -> Rows -> Columns -> Elements`.
2. **Properties (`theEles`)**: A flat map (`EleMap`) storing component types and props keyed by unique IDs.
3. **AI Logic**: Layout generation logic and system prompts are located in [app/api/chat/route.js](app/api/chat/route.js).

## 📂 Project Organization
- [app/cms/](app/cms/): Prototype pages for Search, Content, and Audience management.
- [app/opal/](app/opal/): AI Agent marketplace and assistance interfaces.
- [app/db/](app/db/): Contains `initialData.ts` and `mockData.ts`. Use these to populate UI and define types.
- [app/components/](app/components/): Contains project-specific wrappers like [Flex.tsx](app/components/Flex.tsx) and [Input.tsx](app/components/Input.tsx). 
  - **Preference**: ALWAYS prefer raw `@optiaxiom/react` components by default.
  - **Usage**: Use local wrappers ONLY if their specific defaults are required (e.g., `Input` for `size="lg"`, `Flex` for `flexDirection="row"`) or if they provide specific prototype configurations. These wrappers exist to override Axiom's current "wrong" defaults and should be used to maintain consistency until fixed upstream.

## 🚦 Essential Workflows
- **Development**: `yarn dev`
- **Installation**: Project uses **Yarn**. Ensure `corepack enable` is run if yarn is missing.
- **Documentation**: Leverage the **Axiom MCP server** (`@optiaxiom/mcp`) for up-to-date component props and examples.

## 💡 Key Patterns
- **Hydration**: Always check `isHydrated` from `usePersistentState` before rendering content that depends on local state to avoid Next.js hydration mismatches.
- **DRY**: If building a new CMS page, look at existing ones in [app/cms/content/page.tsx](app/cms/content/page.tsx) for layout patterns using `SubNavData` and `DetailsPane`.
