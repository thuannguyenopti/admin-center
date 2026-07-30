# Visual Quality Gates

This is the completion authority for visible Optimizely product UI. Score the rendered surface, not the source code or design intention.

## Required evidence

Before scoring:

1. Render the changed route at its primary desktop width.
2. Render at least one narrower width appropriate to the route.
3. Exercise reachable hover, focus, selected, loading, empty, error, disabled, modal/drawer and action states that changed.
4. Capture screenshots.
5. Compare them with the stated design brief and any supplied reference.
6. Fix visible problems, then score the revised result.

TypeScript, lint, build and route `200` checks are required where relevant but do not count as visual evidence.

If browser or screenshot tooling is unavailable, say so and do not claim the surface passed visual QA.

## Scorecard

Score each category `0`, `1` or `2`.

- `0` — fails, missing or actively harms the task.
- `1` — usable but unresolved, generic or inconsistent.
- `2` — strong, intentional and appropriate to the task.

| Category | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Interaction-model fit | Wrong/competing models obscure the task | Model is usable but includes unnecessary competing patterns | One primary model clearly fits; support models remain subordinate |
| Focal point and reading order | No clear owner or several competing focal points | Main region exists but evidence/action order is weak | Dominant region and first three visual stops are immediate |
| Typography and readability | Tiny, clipped or role-confused text | Readable but hierarchy relies on weight/badges or too much small metadata | Confident page/body/metadata hierarchy at rendered scale |
| Composition and spatial balance | Cramped, accidental dead space or arbitrary columns | Functional but mechanical or weakly balanced | Dominant/supporting/utility regions and quiet space feel deliberate |
| Content restraint | Repeated status/metadata/controls obscure the decision | Some redundancy remains | Only decision-relevant content is visible; low-frequency detail is disclosed |
| Action hierarchy | Competing, clipped, repeated-primary or unsafe actions | Primary/secondary mostly clear but scope or placement is inconsistent | One clear scope-appropriate primary (or intentionally none); secondary/tertiary/destructive roles are precise |
| Surface discipline | Nested cards, excessive borders or generic drawer/card assembly | Boundaries work but are heavier than necessary | Open space, separators, cards, panels and overlays each express workflow |
| Axiom and Optimizely brand fit | Raw/invalid components or generic/non-Optimizely aesthetic | Mostly compliant but visually generic or over-accented | Axiom-correct, calm, premium, selective green, operational and recognizable |
| Accessibility and operability | Keyboard, labels, focus, contrast or live behavior fails | Baseline works with minor unresolved friction | Clear labels/focus/contrast, keyboard support and safe semantic behavior |
| Browser and responsive quality | Broken/clipped at a tested width or not verified | Main state works but edge/responsive states need polish | Verified desktop/narrow states preserve hierarchy and reachable actions |

### Passing threshold

Require **17/20**, no category scored `0`, and no automatic failure. Record the score and any intentional tradeoff in the task handoff.

Do not inflate scores because the code is compliant. A technically correct surface can score poorly in interaction fit, composition, content or typography.

## Automatic failures

Any of these blocks completion regardless of score:

- clipped, obscured or unreachable actions;
- unreadably small typography or use of `xs`/10px product text;
- body/explanatory content rendered as Caption or repeated monospaced uppercase labels;
- repeated bright-green row/card actions;
- nested cards without a workflow reason;
- no clear focal point;
- current/pending imagery that depicts different subjects or incompatible crops in a visual comparison;
- dead controls, empty menus, fake filters or tabs with no content;
- broken keyboard interaction, focus visibility or essential contrast;
- broken responsive layout or horizontal clipping at the tested width;
- unverified rendered screenshots;
- raw controls or hardcoded product chrome where Axiom/semantic tokens exist.

## Gate details

### Interaction and composition gate

- The primary interaction model can be named and justified.
- One region owns the task.
- Supporting and utility regions are visibly subordinate.
- The first three reading stops follow object/decision → evidence/state → action.
- Quiet space has a purpose; dense information is localized.
- Images are intentionally cropped and scaled for the judgment task.

### Typography gate

- Main body and decision text use readable Body/Medium or larger roles.
- Body/Small is limited to secondary metadata.
- Caption/mono use is rare and semantic.
- Text does not clip, collide or wrap awkwardly in controls.
- Hierarchy survives a squint test without relying on borders and badges.

### Content gate

- Status is not repeated across badge, title, score and description.
- Labels, metrics and timestamps each change a decision.
- Helper text prevents real error or is removed/disclosed.
- Button labels state what happens.
- Placeholder/faux content has been replaced with credible product content when available.

### Action gate

- Primary, secondary, tertiary and destructive actions have distinct roles.
- Repeated actions remain neutral/contextual.
- Selected states do not use primary green.
- Low-frequency actions do not crowd the main toolbar/footer.
- Action placement remains stable through loading/selection and narrow widths.

### Surface gate

- Cards represent peer objects or independent tools, not arbitrary page sections.
- Repeated rows prefer alignment and separators over card-per-row containment.
- Drawers remain secondary and brief.
- A deep review/comparison has enough width and does not feel bolted onto another panel.
- Borders, backgrounds and shadows communicate hierarchy rather than decoration.

### Accessibility and operability gate

- Icon-only controls have accessible labels and tooltips where needed.
- Focus is visible and logical.
- Color is not the only carrier of state.
- Muted text remains readable on tinted surfaces.
- Forms have visible labels, field-level errors and recovery paths.
- Destructive actions are visually and semantically distinct.
- Keyboard use does not trigger distracting motion.
- Reduced-motion preferences are respected where motion exists.

### Responsive/browser gate

- Major regions collapse intentionally, not merely stack in DOM order.
- The focal point and action remain reachable.
- Fixed panels, drawers and sticky bars fit the viewport.
- No unintended scrollbars, truncated tabs or compressed CTAs appear.
- Image grids, tables and comparison surfaces have an explicit narrow-width behavior.

## Anti-generic scan with positive replacements

Fix these tells before adding polish:

| Tell | Replacement |
| --- | --- |
| Three or more equal cards with identical hierarchy | Establish a dominant region or use a grid/table only when the items are true peers |
| Icon tile over heading repeated across modules | Use direct headings, alignment and relevant content |
| Tiny uppercase label over every section | Use sans headings/body roles and spacing; reserve Caption for machine-like metadata |
| Pill/badge for every attribute | Use one status signal plus plain grouped metadata |
| Stat cards that do not change decisions | Use a compact summary/filter or remove them |
| Nested bordered boxes | Use open layout and separators |
| Loud gradients, glass, blobs or heavy shadows | Use neutral Axiom surfaces and selective semantic emphasis |
| Generic right drawer for deep work | Use a task-appropriate master-detail, sheet or workspace |
| AI score as visual centerpiece | Lead with conclusion and evidence; subordinate or remove the score |
| Marketing/AI copy in operational UI | Use direct product nouns and action labels |

## Reference comparison

When a reference exists, compare:

- interaction model;
- focal point and region proportions;
- type hierarchy and readable scale;
- content density and disclosure;
- action hierarchy;
- surface boundaries;
- image treatment;
- responsive behavior.

Do not compare by pixel similarity alone. Use `visual-reference-analysis.md` to distinguish durable relationships from screenshot-specific artifacts.

## Completion record

Report:

- tested routes and viewport widths;
- screenshot evidence;
- score by category and total;
- automatic-failure check;
- fixes made after the first rendered pass;
- anything unverified.

Work is complete only after the rendered result passes, not when the first implementation compiles.
