---
name: frontend-design
description: >
  Design, build, review, or polish Optimizely product UI in CMP, DAM, CMS,
  Opal, and other axiom-play routes. Enforces interaction-model selection,
  strong composition, readable typography, Axiom V3 implementation, and
  rendered visual-quality validation.
---

# Optimizely Frontend Design

Use this skill for every visible product-UI change or review in this repository. It is the authority router: product-design judgment comes first, Axiom implementation second, and rendered verification last.

The target is calm, premium, intelligent, restrained, operational, enterprise credible and recognizably Optimizely. Do not import a generic creative-UI aesthetic, marketing-page novelty or maximalism into product surfaces.

## Mandatory reading

For every visible UI task, read in this order:

1. [`references/interaction-and-composition.md`](references/interaction-and-composition.md) — interaction model, focal point, composition, typography, density, content, actions and surfaces.
2. [`references/visual-quality-gates.md`](references/visual-quality-gates.md) — scored rendered-quality gate, accessibility, responsiveness and automatic failures.

Then read only the references that apply:

- [`references/axiom-v3-implementation.md`](references/axiom-v3-implementation.md) before writing or reviewing product UI code — including its Figma preflight step, which is mandatory (not optional) whenever a Figma node exists or is supplied for the surface being built.
- [`references/editorial-surfaces.md`](references/editorial-surfaces.md) for DAM, Brand Packs, imagery, typography, logos, color systems, templates or other visual subjects.
- [`references/visual-reference-analysis.md`](references/visual-reference-analysis.md) whenever a screenshot, mockup or prototype is supplied.
- [`references/motion-rules.md`](references/motion-rules.md) when motion, transitions, loading, panels, menus or animated state changes are involved.

A Figma link or node ID is a different kind of input than a prose description or a screenshot from an unspecified source: it is fetchable ground truth for exact spacing, typography and component composition, not just interaction intent. When one is supplied, fetch it (`get_design_context`, `get_variable_defs`, `get_screenshot`) before the design brief below, and build to it 1:1 — do not substitute a screenshot-derived approximation or prior judgment call once the actual node is available.

Repository build, CSS extraction, navigation, file architecture and git rules remain authoritative in [`CLAUDE.md`](../../../CLAUDE.md). CMP domain rules and Opal-specific visual layers are additive; they do not override this skill.

## Required design sequence

Do not start with components. Before coding, write a compact internal design brief:

1. **User decision:** what must the user understand, judge or do?
2. **Primary interaction model:** choose queue, grid, table, master-detail, editor, comparison, dashboard, or focused modal/sheet; explain why it fits in one sentence.
3. **Composition:** name the dominant, supporting and utility regions; define the first three stops in the reading order and the purpose of any quiet space.
4. **Content budget:** remove repeated status, metadata and controls; decide what is progressively disclosed.
5. **Type and action hierarchy:** identify readable body copy, limited metadata, and the one primary action for the current scope (or intentionally none).
6. **Surface plan:** choose open space, separators, cards, panels, drawers or modals because of workflow boundaries—not because they are convenient containers.

If these choices are unclear, inspect nearby production-quality screens and the supplied positive references before implementation.

## Product-design contract

- One task owns the surface and one region owns the user's attention.
- Page-level hierarchy is established before component-level styling.
- Typography, alignment and spacing carry hierarchy before badges, borders or color.
- Large work surfaces use readable body type. Never shrink text to make excessive content fit.
- Caption and monospaced uppercase text are specialized styles, not default section labels.
- Density is localized. A dense operational panel may sit beside a quiet workspace; the entire page must not feel equally dense.
- Green is selective: one filled primary action at most per visible decision scope, never repeated bright-green row/card actions, and never as a selected filter treatment.
- Visual inspection surfaces give the subject enough scale to judge. Configuration surfaces favor narrow, predictable form structure.
- A drawer stays secondary and brief. Promote deep comparison or complex review into a workspace with enough width.
- Screenshots provide relationships and quality evidence. Extract requirements; do not copy prototype defects or incidental dimensions.

The detailed rules and positive alternatives live only in the references above. Do not recreate parallel doctrine in feature files or other skills.

## Implementation contract

After the design brief:

- Inspect nearby live routes and reusable components.
- Implement with the Axiom V3 authority and repository rules.
- Preserve semantic tokens, spacing tokens, icon-package rules, form/menu rules, dark mode, accessibility and file boundaries.
- Never leave dead controls or claim behavior that is not implemented.
- Do not extend a monolithic file; split concerns before adding behavior.

## Completion contract

Visible UI work is incomplete until it is rendered at the primary desktop width and at least one narrower width, compared against the design intent/reference, and scored with `visual-quality-gates.md`.

Minimum passing score: **17/20 with no zero and no automatic failure**. TypeScript, lint, route `200`, or component compliance alone never proves visual quality.

If browser or screenshot verification is unavailable, state that explicitly and do not claim the UI is visually verified.
