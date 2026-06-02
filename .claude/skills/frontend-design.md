# Frontend Design Rule

Design and refine Optimizely product UI with a clean, calm, premium frontend sensibility while staying compliant with Axiom V3 / Optiaxiom React patterns.

This is a rule, not a suggestion. When this skill applies, the agent must behave like a senior frontend product designer using the repo's component library, tokens, typography, sizing, spacing, and interaction patterns. Do not invent a separate visual system.

## When to use this skill

Use this skill when you need to:
- Build or polish Opal, Brand Packs, or other Axiom V3 product screens
- Review UI for visual hierarchy, spacing, typography, and interaction quality
- Convert a rough design into a cleaner product-ready interface
- Fix UI that feels too heavy, cluttered, inverted, generic, or inconsistent
- Keep Claude/Codex aligned on Optimizely product craft for this repo

## Design philosophy

The UI should feel:
- Calm
- Premium
- Intelligent
- Editorial where appropriate
- Enterprise credible
- Fast to scan
- Productized, not decorative

This is not a marketing site, CMS admin clone, or generic dashboard. For Brand Packs and Opal experiences, the target feeling is:

> An AI-native operating system for brand intelligence.

## Required project rules

Before writing UI code:
- Read `DESIGN_SYSTEM.md`
- Read `OPAL_DESIGN_SYSTEM.md` when working in `app/opal/`
- Inspect nearby production-quality screens and reuse their page structure, control sizing, and interaction patterns
- Use `@optiaxiom/react` components whenever an equivalent exists
- Use Axiom V3 / Optiaxiom semantic tokens instead of hardcoded colors
- Use spacing tokens instead of arbitrary pixel spacing
- Prefer `@optimizely/axiom-icons` for product UI icons
- Inspect nearby screens before inventing a new pattern
- Do not extend monolithic files; split large multi-concern files first

If any of these checks fail, stop and fix the violation before continuing.

## Non-negotiable implementation contract

For product UI, these are hard requirements:
- Use Axiom `Button`, `Input`, `Select`, `Textarea`, `Switch`, `Tabs`, `Menu`, `Tooltip`, `Badge`, `Card`, `Box`, `Grid`, `Group`, `Heading`, and `Text` instead of raw equivalents
- Do not use raw `button`, `input`, `select`, or `textarea` unless the native element is unavoidable, such as `input type="color"` or file upload internals
- Do not use hardcoded hex/rgb colors for UI chrome; use semantic tokens or documented CSS variables
- Do not use arbitrary spacing for layout; use the repo spacing scale
- Primary page actions use Axiom `Button appearance="primary"` with `size="md"` or `size="lg"` unless the surrounding existing pattern proves otherwise
- Icon-only actions must use Axiom `Button` and have an accessible label or tooltip
- Never leave dead controls in the UI, including ellipsis menus with no actions
- Never add a Settings tab for one or two controls; move small identity/status controls into the page header or a contextual menu
- Files over 300 lines or with multiple concerns must be split before adding more behavior
- Before finishing, visually verify the changed route at desktop and narrower widths

If a prototype, screenshot, HTML file, or PM mock uses raw controls, tiny CTAs, hardcoded colors, or inconsistent sizing, treat those as prototype artifacts. Extract the product requirements, then rebuild with Axiom V3 components and this repo's visual system.

## Mandatory visual QA

Design work is not complete until the rendered UI is checked visually.

When the user provides a reference image and asks to match it, treat the reference as the acceptance spec, not moodboard inspiration.

After changing product UI:
- Open the changed local route
- Capture a screenshot at the primary desktop width
- Capture a screenshot at a narrower width when the layout is responsive
- Compare the rendered screenshot against the provided reference, screenshot, or stated design intent
- Match the reference's layout proportions, modal width, column balance, control hierarchy, typography scale, and spacing before introducing local reinterpretation
- Check specifically for collapsed controls, broken grids, clipping, overflow, wrong CTA hierarchy, inconsistent pills, unintended scrollbars, and dead whitespace
- Fix visual mismatches before reporting the work done

If screenshot capture or browser verification is unavailable, say that explicitly and do not claim the UI was visually verified. TypeScript, lint, and route `200` checks are necessary but never sufficient for frontend design work.

## Axiom V3 implementation rules

Use Axiom components for common product UI:
- `Button` for actions
- `Tabs` or `SegmentedControl` for view switching
- `SearchInput`, `Select`, `Menu`, and `Popover` for controls
- `Tooltip` for icon-only or unclear actions
- `Badge` only when the label helps the user decide
- `Card` only for repeated items, modals, or genuinely framed tools
- `Box`, `Group`, `Grid`, `Heading`, and `Text` for layout and type

Avoid:
- Raw HTML for product UI
- Hardcoded hex/rgb colors
- Arbitrary spacing values
- Custom button-like divs
- Nested cards
- Decorative blobs, excessive gradients, and noisy surfaces
- Pills or badges that do not carry decision-making value

When a required Axiom component does not support the exact layout prop needed, wrap it in `Box` instead of replacing it with a raw native control.

## Shared micro-patterns

Repeated UI atoms must be consistent across the whole feature, not recreated per file.

Use:
- Axiom `Badge variant="subtle"` for chips, tags, statuses, and short metadata pills
- One shared local wrapper when a repeated badge needs sizing or casing tweaks
- The same chip density, casing, and contrast across overview cards, detail tabs, and editing surfaces
- Axiom `Button` for removable chips or chip actions, with accessible labels

Avoid:
- Custom pill `Box` components when `Badge` works
- Mixing hand-rolled pills with Axiom badges in the same feature
- Making pills longer, taller, greener, or louder just because they are on a different tab
- Treating badges as decoration instead of decision-making metadata

If a screenshot exposes inconsistent chip styling, normalize the component pattern before polishing spacing.

## Visual hierarchy rules

Every section should have:
- One primary focal point
- One obvious primary action
- A clear reading order
- Enough whitespace to breathe

Prefer:
- Alignment over decoration
- Typography over borders
- Fewer metadata items
- Subtle elevation
- Calm neutral surfaces with selective green accents

Avoid:
- Multiple competing CTAs
- Oversized bold text inside compact product panels
- Dense rows of pills
- Loud card shadows
- Overlapping text or images that feel accidental
- Filling empty space just because it exists

## Preferred product density

Use a premium product density profile:
- Compact vertical rhythm inside controls, cards, and metadata
- Generous horizontal breathing room around major content
- Relaxed outer containers and page gutters
- Tight metadata grouping
- Clear section separation without excessive divider lines

Avoid:
- Enterprise table density unless the workflow is truly data-heavy
- Giant empty card interiors
- Overly compressed controls
- Random padding changes between sibling cards
- Layouts that feel either sparse by accident or crowded by default

The best density feels efficient, not cramped.

## Product shell spacing

Use one owner for page spacing. Do not stack route-level padding on top of shell padding.

Default rules:
- Standard app shell page padding: 32px
- Dense secondary product pages inside an existing shell: no extra top padding
- Custom full-page work surfaces that own their shell: 24px top padding
- Header-to-tabs rhythm: 16px
- Tabs-to-content rhythm: 16px for immediate work surfaces, 24px only when the first content module is visually dense
- Major section separation inside content: 24px or 32px

Avoid:
- 64px top offsets in product work surfaces
- Adding a page title, tab row, and content card with separate large gaps between each
- Local scrollbars on tab rows unless tabs truly overflow at the tested width

The active tab content should start quickly and feel connected to the page chrome.

## Surface philosophy

Surfaces should feel lightly layered, soft, and intentional.

Prefer:
- Subtle neutral tints
- Low-contrast borders
- Transparent or tokenized separation
- Ultra-soft shadows
- Gentle elevation changes on hover
- Clear background/content hierarchy

Avoid:
- Hard gray boxes
- Flat white overload
- Heavy dark shadows
- Loud gradient panels
- Multiple bordered containers stacked inside each other
- Card surfaces used as page sections

Use borders and shadows as quiet structure, not decoration.

## Editorial composition

Composition creates the premium feeling more than any single component.

Prefer:
- Asymmetrical balance
- Controlled preview imagery
- Whitespace framing
- Directional eye flow
- One dominant image or object per featured region
- Secondary visuals that support the main focal point

Avoid:
- Giant centered banners
- Accidental image crops
- Equal visual weighting across every element
- Competing focal points
- Full-width poster layouts when the task is product intelligence
- Decorative previews that hide important content

For hero or featured product areas, make the layout feel curated, not filled.

## Editorial product surfaces

Some product screens are not dashboards or settings panels even when they contain editable data. When the subject is inherently visual, such as typography, brand assets, color systems, templates, imagery, or creative rules, design the screen as an editorial product surface first and place management controls second.

Examples:
- Typography should feel like a premium type-foundry specimen embedded in the product, not a settings form
- Brand imagery should feel like a curated visual library, not file storage
- Color palettes should feel like a brand system, not a table of hex values

Use:
- Large specimen moments
- Curated preview panels
- Productive but quiet controls
- Sidebar/category navigation only when it helps browsing
- Detail rows that preview the asset before asking the user to edit metadata

Avoid:
- Repeating card forms for every item
- Leading with inputs before the user understands the asset
- Treating creative-system data like generic admin settings
- Tiny samples that undersell the visual subject

## Typography rules

Use the product font stack and Axiom type patterns.

Guidance:
- Use strong hierarchy, but reduce unnecessary boldness
- Keep compact UI headings compact
- Use labels sparingly and consistently
- Make metadata secondary, not visually equal to titles
- Never allow text clipping, collisions, or awkward wrapping
- For font management UI, show a real specimen: family name, Aa, pangram, uppercase alphabet, lowercase alphabet, numerals, and available weights/styles
- Let users understand whether a font is from the library, uploaded, linked from the web, or name-only metadata
- Match the approved specimen composition. Do not add extra decorative samples, captions, or background artwork when the reference intentionally omits them.
- Use readable spacing between metadata bullets; metadata should feel quiet and precise, not cramped.

If everything is bold, reduce weight until the page has a clear hierarchy again.

## Content restraint

Every metadata item must justify itself.

Before adding a label, pill, icon, stat, timestamp, status, or description, ask:

> Does this help the user decide what to do?

If not, remove it.

Prefer:
- Short labels
- Scannable titles
- Specific descriptions
- Metadata grouped by meaning
- One strong status signal instead of many weak ones

Avoid:
- Repeating the same idea in title, subtitle, badge, and metadata
- Overexplaining obvious actions
- Decorative status labels
- Long helper text in primary work surfaces
- Toolbars crowded with low-frequency actions

## Action architecture

Before finishing a screen, pressure-test the workflow, not only the visuals.

Every product surface should answer:
- What is the primary action?
- What is the secondary action?
- What action happens when a user selects an item?
- Are multiple buttons opening the same workflow?

Prefer:
- One clear add/create action per surface
- Direct selection for list/grid items that open detail editing
- Modal or sheet editing for focused item-level changes
- Contextual actions only where they represent genuinely different workflows
- Page-level create/upload actions use Axiom `Button appearance="primary"` with a plus icon
- Inline secondary add actions inside cards, modals, and chip editors use Axiom `Button appearance="default"` with a plus icon

Avoid:
- Duplicate CTAs that lead to the same modal, sheet, or page
- Repeated edit-icon buttons on every row when the entire row can be selected
- Dead or vague actions such as `Manage`, `More`, or ellipsis menus without a distinct purpose
- Separate settings or management screens for concepts that belong inside item editing
- Page-level save buttons when item-level modals already commit changes

If a screen offers more than three primary ways to act, simplify the action model before polishing the UI. Premium product UX usually reduces workflows to: create, select, edit.

## Color and green usage

Optimizely green is powerful. Use it surgically for:
- Primary actions
- Active states
- Confirmations
- AI/intelligence highlights
- High-value emphasis

Avoid:
- Green everywhere
- Too many green pills
- One-note green layouts
- Low-contrast green text on green backgrounds
- Primary buttons accidentally styled like inverse buttons

The UI should primarily feel neutral, elegant, and controlled, with green as an accent.

## Button and control rules

Primary actions should look primary and have readable contrast.

Check:
- Button appearance matches intended hierarchy
- Primary text is not accidentally white-on-green when the design expects dark-on-green, or vice versa
- Icon-only buttons have tooltips
- Controls align into predictable toolbars
- Search and filters feel like one system, not scattered inputs

Control sizing must feel intentional:
- Main CTAs: `size="md"` or `size="lg"`
- Secondary toolbar actions: usually `size="sm"` only when they sit inside dense product chrome
- Form controls in editing surfaces: use the same size within a row or section
- Do not mix tiny dropdowns, large text fields, and small save buttons in the same editing surface unless a clear hierarchy requires it

## Motion personality

Motion should feel intelligent, soft, responsive, and frictionless.

Prefer:
- 120-180ms transitions for common hover/focus changes
- Subtle opacity fades
- Slight elevation shifts
- Gentle transform changes when they clarify interactivity
- Smooth state changes that reinforce structure

Avoid:
- Bouncy animations
- Dramatic movement
- Slow delayed transitions
- Motion that distracts from work
- Animating too many elements at once

Use motion to reduce cognitive load, not to show off.

## AI product personality

AI should feel embedded into the workflow, not bolted on.

The product should feel:
- Quietly superhuman
- Anticipatory
- Context-aware
- Operational
- Calm under complexity

Avoid:
- Gimmicky AI UI
- Excessive sparkles
- Assistant-like clutter
- Chat-first patterns where a workflow surface is better
- Vague AI badges that do not explain value

AI cues should help the user understand priority, confidence, recommendation, or next action.

## Brand Packs guidance

Brand Packs should feel like brand intelligence, not a template marketplace.

## Stride prototype content rules

For Brand Packs prototype work, the primary fictive brand is `Stride`: an endurance sports / triathlon brand used to test Opal brand intelligence workflows. Treat Stride as a believable product brand, not generic placeholder content.

Stride content should feel:
- Endurance-driven
- High-performance
- Athletic and professional
- Editorial but real
- Focused on triathlon: swimming, cycling, running, transitions, race day, and finish-line energy

Use imagery that shows real athletes in action:
- Open-water swimmers and competitive pool swimmers
- Professional road cyclists, pelotons, time-trial riders, and race climbs
- Runners in races, track starts, road running packs, finish chutes, and endurance moments
- Triathlon transition energy when the athlete is actively competing or preparing to compete
- High-quality sport photography with motion, effort, pace, water, road, track, weather, or race context

Avoid Stride imagery that is merely adjacent to sport:
- Solo product/object shots such as a bike against a wall
- Yoga, stretching, generic gym classes, dumbbells, lifting, or wellness lifestyle content
- Smiling fitness portraits that do not show sport action
- Casual jogging, posed stock-photo workouts, or influencer-style training images
- Broken images, duplicate images, or generic placeholders

For Stride logos and marks:
- Use intentional logo specimens such as white logo on dark surface and black/dark logo on light surface
- Do not use random photography as logo placeholders
- Logo cards should make the mark inspectable and full-bleed or specimen-like, not tiny thumbnails floating in empty space

For Stride templates:
- Use action sport creative, race-day energy, endurance campaign language, and Optimizely/Stride wordmark placement
- Templates should feel like generated brand outputs, not generic marketplace cards
- When creating new template or image placeholders, prefer fewer high-quality examples over many weak examples

When adding fake content, name it as if it came from a real brand library. Bad names: `Image 1`, `Bike photo`, `Hero`. Better names: `Open Water Race Pack`, `Peloton Race Attack`, `Finish Chute Sprint`, `Aero Position Push`.

Hero / active pack:
- Keep the left side informational and scannable
- Keep previews controlled and intentional
- Use overlap only when it feels designed and does not hide important content
- Avoid giant poster crops and loud banners

Pack cards:
- Keep structures consistent
- Lead with the asset preview
- Use a clear name and short descriptor
- Keep metadata minimal
- Use tags only when they help filtering or recognition

## Agentic product cues

Use subtle intelligence labels when they help prioritization:
- `Recommended`
- `AI optimized`
- `Most used`
- `Recently adapted`
- `Performing best`

Do not add AI labels as decoration. They must help the user decide what to do.

## Signals of cheap UI

Treat these as warning signs:
- Excessive pills
- Too many borders
- Inconsistent spacing
- Giant shadows
- Loud gradients
- Oversized icons
- Floating metadata
- Equal visual emphasis everywhere
- Too many CTA colors
- Clipped text
- Crowded toolbars
- Accidental image overlap
- Generic empty states
- Buttons that look visually inverted

When these appear, simplify first. Do not decorate your way out of weak hierarchy.

## Review checklist

Before finishing UI work, check:
- `DESIGN_SYSTEM.md` and `OPAL_DESIGN_SYSTEM.md` were read
- Axiom V3 components and tokens are used wherever available
- No raw product `button`, `input`, `select`, or `textarea` was introduced except unavoidable native internals
- The primary action is visually correct
- Primary CTAs are `md`/`lg`, not tiny
- Spacing follows a consistent 8/12/16/24/32 rhythm
- Metadata and pills are reduced
- Surfaces feel soft, layered, and restrained
- Composition has one clear focal point
- Motion is subtle and useful
- AI cues feel operational, not gimmicky
- Icons are from the product icon system
- Hover, selected, empty, loading, and responsive states are handled
- No overlapping text, clipped labels, nested cards, arbitrary colors, or decorative noise slipped in
- No empty ellipsis menus, decorative controls, or dead settings tabs slipped in
- PM/vibe-coded prototypes were translated into requirements, not copied as UI
- The result looks designed, not assembled
