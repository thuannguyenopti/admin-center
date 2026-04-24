---
name: figma-generate-figjam
description: "Generates FigJam diagrams from the Axiom Play app's architecture. Use whenever the user wants to visualize, map, or diagram any part of this Next.js multi-product app — component hierarchies, data flows, navigation structure, context provider trees, page layouts, or product relationships. Trigger for: 'create a FigJam of...', 'diagram the architecture for...', 'map out the data flow in...', 'show the component tree for...', 'visualize how X connects to Y', or any request to produce an architecture diagram, flow chart, or system map in Figma/FigJam."
---

# FigJam Architecture Diagram Generator

**Prerequisite**: You MUST invoke the `figma:figma-use` skill before calling any Figma write tools. Never call Figma write tools directly without loading that skill first.

## What this skill does

Translates parts of the Axiom Play codebase into FigJam diagrams — component trees, data flows, navigation maps, provider hierarchies, page layout diagrams, and cross-product relationship maps.

## Project architecture quick reference

**Products / routes**: `cms`, `cmp`, `opal`, `connect-platform`, `fe-hosting`, `web-experimentation`

**Layout shell** (`app/components/template.tsx`):
- GlobalBar → Sidebar (primary nav, 56–224px) → VT (secondary nav drill-down, up to 4 levels)
- ContentManagerSidebar (CMS only) | OpalPanel (right, AI) | CodePanel | Aside | Footer

**Context provider stack** (outermost → innermost):
`LayoutProvider` → `BrandToneProvider` → `PreflightProvider` → `OpalContextProvider` → `ContentManagerLayoutProvider` (CMS) → `FilterPanelProvider` (CMS)

**Key source files**:
- Nav structure: `app/layout.tsx` (the `structure` object)
- Shell: `app/components/template.tsx`
- Context: `app/context/*.tsx`

## Workflow

### 1. Understand the request
Identify what to diagram. Ask if unclear:
- What system/area? (specific product, a context flow, the whole shell, a page layout)
- What relationship to show? (parent-child hierarchy, data flow, user navigation, provider dependency)
- Target audience? (dev handoff, stakeholder overview, onboarding doc)

### 2. Read the relevant source
Before diagramming, read the actual code to get accurate information:
- For nav structure: read `app/layout.tsx`, find the `structure[productKey]` block
- For component hierarchy: read the relevant page and its imported components
- For data flow: trace the context provider files in `app/context/`
- For layout slots: read `app/components/template.tsx`

Don't guess structure from memory — read the files.

### 3. Plan the diagram

Choose a diagram type:
| Type | When to use |
|---|---|
| **Tree / hierarchy** | Component trees, nav structure, provider nesting |
| **Flow / swimlane** | Data flow, user journey, request/response |
| **Grid / matrix** | Product area comparison, feature coverage |
| **Annotated wireframe** | Page layout with slot labels |

Plan shapes and connections before writing to FigJam. For a typical hierarchy:
- Top-level nodes: large rounded rectangles, product brand color
- Mid-level: medium rectangles, neutral fill
- Leaf nodes: small rectangles or pills
- Arrows: directional connectors with labels for data flow

### 4. Use FigJam tools

Load `figma:figma-use` first, then use `mcp__Figma__get_figjam` to access the target file. Create shapes and connectors that accurately represent what you read from the code.

**FigJam visual conventions for this project:**
- Products use their accent colors (Opal = purple, CMS = blue, CMP = teal, etc.)
- Context providers: dashed borders to indicate "wraps" relationship
- Layout slots: use distinct fill to show structural containers
- Use sticky notes for annotations / "why" explanations, not labels

### 5. Confirm with user

After writing, summarize what was diagrammed and where they can find it in FigJam. If the diagram simplified anything (e.g., collapsed levels), say so.

## Common diagram types and their source

| "Diagram the..." | Read these files |
|---|---|
| Nav / sidebar structure | `app/layout.tsx` → `structure` object |
| Page layout slots | `app/components/template.tsx` |
| Context provider tree | `app/context/*.tsx` + template.tsx provider stack |
| Opal AI data flow | `app/context/OpalContext.tsx`, `OpalGenerationContext.tsx` |
| Component hierarchy for a page | The page file + its imports (trace 1–2 levels deep) |
| Cross-product architecture | `app/layout.tsx` all products + template shell |
