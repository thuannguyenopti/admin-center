# Interaction and Composition

This is the authority for product-design judgment in Optimizely UI: interaction model, composition, typography use, density, content restraint, action hierarchy, green emphasis and surface selection.

## 1. Start with the user's decision

State what the user must understand, judge or do. Design the screen around that task, not around available components or data fields.

Examples:

- “Decide whether the pending asset should replace the live version.”
- “Find an asset visually, then inspect its metadata.”
- “Configure a publishing rule safely.”
- “Understand the next incomplete workflow step and act on it.”

If the task sentence contains several unrelated decisions, split the workflow or choose which step owns the current surface.

## 2. Interaction-model gate

Choose one primary model before styling and explain why it fits in one sentence.

| Model | Use when | Composition consequence |
| --- | --- | --- |
| Queue | Items require triage or sequential decisions | Priority and next action dominate; summaries support sorting, not dashboard theater |
| Grid | Users identify visual peers by scanning | Media dominates repeated cards; metadata stays quiet and consistent |
| Table | Users compare structured attributes across many rows | Columns, alignment and scanning efficiency dominate; imagery is small and functional |
| Master-detail | Users browse a collection while inspecting one selection | Master remains primary or co-primary; detail is stable, contextual and subordinate |
| Editor | Users create or modify one object over time | Work area and save/state model dominate; utilities stay peripheral |
| Comparison | Users judge differences between known alternatives | Matched evidence and changed regions dominate; conclusion and actions stay close |
| Dashboard | Users monitor multiple independent signals over time | Only use when cross-signal overview is itself the task; every metric must drive a decision |
| Focused modal/sheet | A bounded decision must interrupt or temporarily focus work | Scope is narrow, exit is clear and content fits without compression |

Supporting models may appear, but they must not compete for ownership of the same step. A queue may open a comparison workspace; it should not keep stat cards, the full queue, two-up comparison and a deep drawer equally active.

Do not default automatically to equal card grids, dashboards, nested panels, repeated bordered modules, generic right drawers or stat cards.

## 3. Composition brief

Before components, name:

- **Dominant region:** owns the user's current judgment.
- **Supporting region:** provides evidence or context.
- **Utility region:** contains navigation, filters or low-frequency controls.
- **Reading order:** the first three visual stops.
- **Quiet-space purpose:** what the open area frames, separates or prepares.

One region must be visibly dominant through scale, placement, contrast or content—not merely declared primary in code.

### Meaningful asymmetry

Use unequal regions when the task has unequal importance. A large asset preview beside a narrower metadata panel is balanced because the image requires inspection scale. Equal columns are appropriate only when the evidence must be compared as peers.

Avoid equal visual weighting across modules. If every region uses the same card, padding, heading, border and contrast, the result feels mechanically assembled.

### Reading order

The eye should encounter:

1. the object or decision;
2. the evidence or current state;
3. the next action.

Navigation and metadata should not interrupt this sequence.

### Quiet space versus dead space

Quiet space is intentional when it:

- frames a focal object;
- preserves a work area;
- separates decision stages;
- balances a localized dense panel;
- communicates that the next action starts work.

Dead space is accidental when it results from rigid equal columns, an undersized module, missing content ownership or controls compressed into a corner. Test by asking what the empty area is doing for the task.

## 4. Typography and readability

Typography must establish hierarchy at the scale of the rendered surface.

### Product type roles

- Use Axiom headings for page and section hierarchy.
- Use Body/Medium (`md`, 14px) as the normal product body size.
- Use Body/Large (`lg`, 16px) when a broad work surface, important explanation or sustained reading needs more presence.
- Use Body/Small (`sm`, 12px) only for genuinely secondary metadata, timestamps and compact supporting detail.
- Do not use `xs`/10px in this project.

Large interfaces with abundant space should not look miniaturized. Type scale must relate to the viewport and task, not only fit the panel.

### Never solve content excess with small type

When content does not fit:

1. remove repeated information;
2. group related metadata;
3. shorten copy;
4. disclose low-frequency detail;
5. move complex work to a larger surface;
6. adjust the composition.

Reducing font size is not an acceptable seventh step.

### Caption and monospaced restraint

Caption is a distinct 12px uppercase Roboto Mono style. It is appropriate for terse machine-like identifiers, audit markers, compact state labels or technical readouts.

Caption is not appropriate for:

- default section headings or eyebrows;
- field labels;
- explanatory copy;
- primary recommendation or reasoning;
- every label in an AI panel;
- visual decoration.

Use only a few captions in one view. Most section labels should use the product sans face with weight, size and spacing. Monospaced type is appropriate for codes, IDs, immutable values and deliberately machine-readable state—not for making a surface feel “AI.”

### Hierarchy test

Blur or squint at the rendered page. Page title, focal content, section hierarchy, body and metadata should remain distinguishable. If the hierarchy depends on many uppercase labels, pills or divider lines, redesign it with type and space.

## 5. Density and content restraint

Useful density means the information needed for the current decision is close, readable and grouped. Cramped density means content competes, controls compress and the eye cannot identify the next step.

Localize density. A workflow panel may be dense while the editor stays quiet. A grid may show many images while each card carries little metadata.

Before adding a label, badge, icon, score, timestamp, status or description, ask whether it changes a decision. Remove it if it does not.

Do not repeat one state as a badge, heading, score, recommendation and paragraph. Prefer one conclusion, its evidence and the action it enables.

Use progressive disclosure for:

- low-frequency metadata;
- long audit/history detail;
- secondary actions;
- technical explanations;
- optional AI reasoning.

## 6. Action hierarchy and green

Classify actions by scope and consequence.

| Role | Treatment |
| --- | --- |
| Primary | One filled `appearance="primary"` action for the current decision scope; a view may have none |
| Secondary | `appearance="default"` outline actions |
| Tertiary/utility | `appearance="subtle"` or text treatment |
| Destructive | Danger treatment, separated when accidental activation is costly |
| Repeated row/card | Contextual, normally default/subtle; never repeated bright green |
| Selected state | Neutral pressed/selected surface, not primary green |

“One primary” is not a quota. Do not invent a green action if no singular action deserves it. Count what the user sees at once: six green Review buttons are six primary signals, not one component pattern.

Selected filters, tabs, toggles and cards are state, not actions. Use neutral selected styling. Success indicators may use subtle semantic green without competing with the primary action.

If three actions cannot fit at readable sizes without clipping or wrapping, change the action architecture: keep the primary and essential secondary visible, disclose low-frequency utilities, or use a wider/deeper surface.

## 7. Surface selection

Choose boundaries because they communicate workflow.

### Open composition

Use for the primary page structure, editors, large previews and sustained work. Establish regions with grid, spacing, alignment and background hierarchy.

### Separators

Use for repeated rows or adjacent sections that already share context. Separators are usually calmer than wrapping every item in a card.

### Cards

Use for repeated selectable objects, portable summaries or genuinely independent tools. Cards are justified in an asset grid because each asset is a peer object. Do not use cards as generic page sections or nest cards without a workflow reason.

### Panels

Use for a persistent secondary region supporting the main task, such as workflow state or asset metadata. A panel must have a clear relationship to the dominant region and must not compete with it.

### Drawers

Use for brief contextual inspection or edits that preserve the user's place. A drawer is a poor home for deep comparison, long reasoning or several consequential actions. Promote those tasks to a dedicated workspace or sufficiently wide modal/sheet.

### Modals and sheets

Use for bounded decisions with a clear entry and exit. Content and actions must fit at readable sizes. A focused surface should not recreate an entire dashboard inside itself.

### Bordered regions and background changes

Use a border only when the boundary conveys grouping, state or interaction. Use background changes to establish hierarchy between major regions, not to tint every section. Prefer low-contrast separators and neutral surfaces.

### Sticky action bars

Use when actions must remain available through a long task. Reserve sufficient width, keep the action hierarchy stable and never allow clipping. Do not use a sticky bar merely to compensate for an overlong surface.

## 8. Optimizely composition by surface

### DAM review workspace

Use a queue for triage, then let comparison and decision own the review step. Keep changed evidence, recommendation and actions in one coherent workspace. Do not leave queue statistics or the full library equally prominent while deciding.

### Asset library

Use a grid when visual recognition matters. Keep image ratios and card rhythm consistent; prioritize media over metadata. A detail panel may support selection but remains visibly secondary.

### Asset focus or inspection

Give one asset enough scale to judge. Place metadata in a quieter region and related assets in a subordinate filmstrip/grid. Group controls by purpose.

### Detail drawer

Keep it contextual, readable and progressively disclosed. Do not stack many micro-labeled sections or compress a full approval workflow into a narrow fixed width.

### Configuration form

Use a narrow, predictable Flow with visible labels, clear sections and a stable save model. Configuration is operational; lower the editoriality and avoid decorative specimen layouts.

### Version comparison

Show matched subjects and crops at comparable scale. Choose side-by-side, overlay, scrubber or rapid toggle based on which reveals change best. Make changed evidence and conclusion more important than an arbitrary score visualization.

### Task and workflow

Use an open primary workspace and localize dense workflow information. Let typography, indentation, alignment and separators carry repeated hierarchy. Keep row utilities quiet.

## 9. Positive replacements

| Instead of | Use |
| --- | --- |
| Card per section | Open composition, headings, alignment, spacing and separators |
| Badge for every attribute | One status summary plus plain supporting text |
| Stat-card row by default | Compact summary/filter only when counts change priority |
| Generic right drawer | Inline master-detail, focused sheet or dedicated workspace based on task depth |
| Tiny always-visible metadata | Progressive disclosure or a secondary details region |
| Circular AI score as focal point | Plain conclusion plus evidence; visualize a score only when scale and trend matter |
| Equal columns by default | Ratios that express task dominance |
| Repeated bright CTA | Row selection, neutral contextual action or one page-level action |

## Final composition check

Before implementation review, confirm the primary model, focal region, reading order, content budget, type roles, action hierarchy and surface reasons can each be stated in one sentence. If not, the composition is not ready for polish.
