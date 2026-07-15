# Visual Reference Analysis

This is the authority for interpreting screenshots, mockups, prototypes and visual references. A reference is evidence about relationships and quality; it is not permission to copy defects or ignore Axiom.

## Interpretation method

Before implementation, decompose every reference into:

1. **User task and interaction model** — what workflow does the reference imply?
2. **Focal point** — what owns attention and why?
3. **Composition** — dominant, supporting and utility regions; proportions; asymmetry.
4. **Typography** — page, section, body, metadata and specialized styles.
5. **Spacing and density** — where information is concentrated and where space is quiet.
6. **Action architecture** — primary, secondary, tertiary, destructive and repeated actions.
7. **Surface treatment** — open regions, separators, cards, panels, drawers, modals and sticky bars.
8. **Color and imagery** — what communicates meaning versus decoration.
9. **Responsive implications** — what must remain dominant or reachable at narrower widths.
10. **Artifact separation** — what is a product requirement versus a prototype accident.

Preserve the underlying hierarchy, proportions and behavior that support the task. Rebuild raw controls, invalid tokens, tiny text, dead controls, inaccessible behavior and incidental dimensions with Axiom-compliant patterns.

When references conflict, prioritize the user's task, accessibility, Axiom V3 and the strongest production-quality evidence. State the interpretation rather than averaging incompatible layouts.

## Screenshot-specific versus reusable

A reusable rule explains why a relationship works across tasks: “a visual inspection subject needs enough scale to judge.”

A screenshot-specific fact is incidental: “the drawer is exactly 448px,” “the filmstrip is at the bottom,” or “four cards appear per row.” Do not encode it as universal doctrine.

## Evidence set: DAM/CMP review and library

The following lessons were extracted from the five screenshots supplied on 2026-07-14. They are acceptance evidence for composition quality, not layouts to reproduce pixel-for-pixel.

### Negative evidence: LLM version comparison

The surface uses a single-image toggle plus a narrow analysis panel. The large asset and oversized confidence circle compete. Score, recommendation, reasoning and clearance repeat the same conclusion. Small uppercase monospaced labels become the visual voice. The narrow footer compresses and clips three actions while the panel above contains large unused areas.

Rules derived:

- A comparison must reveal change; a score visualization is not a substitute for evidence.
- The decision conclusion needs one clear headline and subordinate evidence.
- Do not compress consequential actions to preserve a generic fixed drawer width.
- Do not use Caption for every AI/analysis section label.
- Rebalance the workspace when one side is globally sparse but locally cramped.

Do not universalize: a toggle is not always wrong. It works when alternatives share alignment/crop and rapid switching reveals change better than side-by-side display.

### Negative evidence: LLM edit submissions

Queue, unequal image comparison and a detailed right drawer are simultaneously active. Current and pending imagery depict different subjects/crops, so the visual comparison is invalid. The panel repeats badges, score, confidence, findings and metadata in small type. Empty space and crowding occur in different regions, and the review flow feels attached to an existing DAM inspector rather than composed as one task.

Rules derived:

- Choose whether queue, comparison or decision owns each workflow step.
- Current and pending media must be comparable in subject, crop and scale.
- Make “what changed?” more prominent than surrounding status chrome.
- Use progressive disclosure instead of shrinking drawer text.
- Design the review workspace as a coherent whole; do not bolt a full decision flow onto a generic detail panel.

Do not universalize: unequal columns and detail panels are valid when their hierarchy expresses the task.

### Positive evidence: hand-designed asset library

The screen uses grid browsing with master-detail inspection. The asset field is primary, card rhythm is consistent, imagery receives most card area, metadata stays quiet and the detail panel is clearly secondary. Toolbar grouping is predictable, borders are subtle and green is selective.

Rules derived:

- Use grids for visual scanning of peer assets.
- Give imagery priority and keep repeated metadata restrained.
- Maintain consistent card rhythm without making the whole page a stack of modules.
- Keep the inspector subordinate to the library.
- Use neutral selected/contextual actions on repeated items.

Do not universalize: column count, card dimensions and panel width depend on viewport and asset type.

### Positive evidence: hand-designed asset focus

One large asset owns the surface. A quiet details region and supporting filmstrip remain subordinate. Meaningful asymmetry gives visual judgment enough space, controls are grouped by purpose, typography is readable and one green creation action is distinct.

Rules derived:

- A visual-inspection task needs one unmistakable, sufficiently large subject.
- Related assets are supporting navigation, not peer focal points.
- Localize metadata density to a quiet region.
- Use asymmetry to express dominance and group controls by purpose.

Do not universalize: a bottom filmstrip is one solution; side rails or contextual grids may fit other tasks.

### Positive evidence: hand-designed workflow

The task/editor area is broad and deliberately quiet while a narrower workflow panel contains localized operational density. Page title and navigation establish hierarchy early. Repeated workflow rows rely on type, indentation, alignment and separators instead of card-per-row containment. Green remains controlled.

Rules derived:

- Dense operational information can coexist with a calm page when density is localized.
- Quiet workspace can be intentional when it represents the task's working state.
- Repeated hierarchy should be carried by type, alignment and indentation before borders/badges.
- Row utilities and selected state stay quiet; green is reserved for meaningful emphasis.

Do not universalize: the exact right-panel ratio and task-specific row structure are not mandatory.

## Acceptance use

For new work, extract a short reference brief:

```text
Task/model:
Dominant region:
Supporting/utility regions:
First three reading stops:
Type hierarchy:
Density strategy:
Action hierarchy:
Surface strategy:
Relationships to preserve:
Artifacts to discard:
```

After rendering, compare those relationships and run the scored visual-quality gate. A close pixel match that preserves tiny type, clipping or the wrong interaction model still fails.
