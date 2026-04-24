# Figma Builder

Converts an Axiom Play page into a Figma design using real Axiom V2 library component instances.

**Usage:** `/figma-builder`

The full V2 reference (components, color tokens, typography, icons) is at `.claude/FIGMA_LIBRARY_V2.md` — **read this file before any Figma work**. It contains exact hex values for all semantic tokens in both light and dark mode, component keys, and variant property strings.

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask all three questions at once:
1. **Source** — a running page URL (e.g. `http://localhost:3000/opal`), app route (e.g. `/opal`), or file path (e.g. `app/opal/page.tsx`). If URL, dev server must be running.
2. **Figma destination** — a Figma file URL to add a new page to, or "new" to create a new file
3. **Axiom version** — Axiom v2 or Axiom v3 (v2 = Components V2 Legacy, fileKey `JYy51au6YaA4QZKpQy1ZRg`)

---

## Agent 1 — Page Scanner

Spawn a sub-agent (fill in `SOURCE`):

> Scan this source and extract a complete UI inventory.
>
> **Source:** `SOURCE`
>
> - File path: read directly + follow imports into `app/components/`
> - Page URL (`http://...`): extract path → `app/[path]/page.tsx`, follow imports
> - App route (`/...`): map to `app/[route]/page.tsx`, follow imports
>
> Extract:
> - Every `@optiaxiom/react` component with all props and values
> - Layout: flex/grid direction, gap, padding, alignment, nesting
> - Spacing tokens (e.g. `p="16"`, `gap="8"`)
> - Color tokens (e.g. `color="fg.secondary"`)
> - Typography: fontWeight, fontSize, as-element overrides
> - Text content: labels, headings, placeholders
> - Icons from `@optimizely/axiom-icons`
> - Custom inline styles (hex colors, px values not from tokens)
>
> Return a **Page Inventory**:
> ```
> ## Layout
> [top-level structure]
>
> ## Components
> - Button: appearance="subtle" size="sm" icon=IconPlus — "Add"
> - Textarea: placeholder="Ask Opal" — in OpalInput
> [etc.]
>
> ## Spacing & Colors
> [gap/padding values, color tokens used]
>
> ## Custom Styles
> [any hardcoded hex/px not from tokens]
>
> ## Has Images
> yes/no — img tags, background images, avatar src URLs
> ```

Capture as `PAGE_INVENTORY`.

---

## Agent 2 — Figma Builder

**This agent builds the Figma screen using the Figma Plugin API.**

Spawn a sub-agent (fill in `PAGE_INVENTORY`, `SOURCE_URL`, `FIGMA_DESTINATION`, `AXIOM_VERSION`):

> Build a Figma screen for this Axiom Play page using real library component instances from the Axiom V2 library.
>
> **Page inventory:** `PAGE_INVENTORY`
> **Source URL:** `SOURCE_URL`
> **Figma destination:** `FIGMA_DESTINATION`
> **Axiom version:** `AXIOM_VERSION`
>
> ---
>
> ## MANDATORY PREREQUISITES
>
> 1. Invoke the `figma-use` skill — required before ANY `use_figma` call.
> 2. Invoke the `figma-generate-design` skill — follow its workflow.
> 3. Read `.claude/FIGMA_LIBRARY_V2.md` — this has every component key and exact variant property names for Axiom V2. Do NOT search the library from scratch.
>
> ---
>
> ## Axiom V2 Component Keys (critical — use exact strings)
>
> | Component | componentKey | Key variant props |
> |---|---|---|
> | Button | `3296fc4820c3d0194d963b89c435b3e5b4dcc0ea` | Appearance: Primary/Default/Subtle/Danger/Default Opal/Primary Opal; Size: sm/md/lg |
> | Toggle Button | `d8956657543d7623c4056abc4f6b8a4a98b5b4a7` | Appearance: Default/Subtle; Size: sm/md/lg; Pressed: true/false |
> | Input | `87412b4b78df5711c2906719875b7b9168da2be6` | Size: md/lg/xl (min md!); State: Default/Focused/Disabled/Error |
> | Text Area | `cd05ef35c0e28cc3e4c1d8586e01fc29991ee60b` | State: Default/Focused/Disabled/Error; Resize: none/auto/vertical |
> | Badge | `d853342dd778628f8f008ef2ceb342957ce3a50f` | Intent: Information/Success/Warning/Danger/Neutral/Primary |
> | Avatar | `07a871d4a8a3bfd2d6cd236b0547ee7ec3a31fe4` | Size: 2xs/xs/sm/md/lg/xl/3xl; Color Scheme: Purple/Neutral |
> | Tooltip | `8620b20c2c6850f25f50a7ab83d00e3cdf734ca1` | Side: Top/Bottom/Left/Right |
> | Checkbox | `832bf13d26272af25bc6385a154108e990a053db` | State: Unchecked/Checked/Indeterminate |
> | Spinner | `6663c184ae5339e6a21af419fc95eb8f6326f764` | Appearance: Default/Inverse; Size: sm/md/lg |
> | Sidenav Base | `95186ccb7d62d7bd1afde6ef2a12a49cbce3d298` | — |
> | Sidenav item | `42e6d60b2bb7bdcc91adfa35eff29e0c27d09750` | — |
>
> **Components library fileKey:** `JYy51au6YaA4QZKpQy1ZRg`
>
> ## Color tokens — use semantic names, never hardcode hex
>
> Opal UI is **always dark mode**. Use these dark hex values directly for fills:
>
> | Token | Dark hex |
> |---|---|
> | bg.page | `#171A23` |
> | bg.default | `#1C2029` |
> | bg.secondary | `#1C212B` |
> | fg.default | `#F5F6FA` |
> | fg.secondary | `#CACFDC` |
> | fg.tertiary | `#838DA4` |
> | border.default | `#66708C` |
> | border.secondary | `#4F576E` |
> | border.tertiary | `#2E3442` |
>
> Full token table (all tokens, light + dark): `.claude/FIGMA_LIBRARY_V2.md`
>
> ## Icons
>
> Icon naming: `kebab-case` in Figma → `Icon` + PascalCase in React  
> e.g. `pen-to-square` → `IconPenToSquare`, `arrows-rotate` → `IconArrowsRotate`  
> Variants: base (regular), `-thin` (lighter stroke), `-solid` (filled)
>
> ---
>
> ## Step 1 — Open / create file
>
> - Figma URL: extract fileKey, confirm with `get_metadata`. Note existing pages.
> - "new": use `create_new_file`.
>
> Add a new page named after the screen (e.g. "Opal – Landing").
>
> ---
>
> ## Step 2 — Run in PARALLEL
>
> **A) Pixel-perfect capture** — call `generate_figma_design` with `SOURCE_URL`. This rasterizes the live page — use it as the exact layout/spacing reference and as the image hash source.
>
> **B) Variable discovery** — use `search_design_system` with `includeVariables: true` for: "background", "foreground", "border", "space", "radius". Record variable keys for semantic tokens (bg.default, fg.secondary, etc.) so fills can be bound to variables rather than hardcoded hex.
>
> ---
>
> ## Step 3 — Create root wrapper frame
>
> Use `use_figma` Plugin API:
>
> ```js
> let maxX = 0;
> for (const child of figma.currentPage.children) {
>   maxX = Math.max(maxX, child.x + child.width);
> }
> const wrapper = figma.createFrame();
> wrapper.name = "Screen Name";
> wrapper.layoutMode = "HORIZONTAL"; // or VERTICAL
> wrapper.resize(1440, 900);
> wrapper.layoutSizingHorizontal = "FIXED";
> wrapper.x = maxX + 200;
> wrapper.y = 0;
> return { wrapperId: wrapper.id };
> ```
>
> ---
>
> ## Step 4 — Build sections with real component instances
>
> Build one section per `use_figma` call. Fetch wrapper by ID at the start of each call.
>
> ### How to insert a real library component instance (Plugin API)
>
> ```js
> // Import by componentKey from the Axiom V2 library
> const buttonSet = await figma.importComponentSetByKeyAsync("3296fc4820c3d0194d963b89c435b3e5b4dcc0ea");
>
> // Find the right variant — parse the variant name string
> const variant = buttonSet.children.find(c => {
>   const props = Object.fromEntries(c.name.split(', ').map(p => p.split('=')));
>   return props["Appearance"] === "Subtle" && props["Size"] === "sm";
> }) ?? buttonSet.defaultVariant;
>
> const instance = variant.createInstance();
> parentFrame.appendChild(instance);
> instance.layoutSizingHorizontal = "HUG"; // set AFTER appending
>
> // Override text via component properties
> const propDefs = instance.componentProperties;
> for (const [key, def] of Object.entries(propDefs)) {
>   if (def.type === "TEXT") instance.setProperties({ [key]: "Button label" });
> }
> ```
>
> ### How to bind design system color variables
>
> ```js
> const bgVar = await figma.variables.importVariableByKeyAsync("VAR_KEY");
> const paint = figma.variables.setBoundVariableForPaint(
>   { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', bgVar
> );
> frame.fills = [paint];
> ```
>
> ### How to apply text styles
>
> ```js
> const style = await figma.importStyleByKeyAsync("TEXT_STYLE_KEY");
> textNode.textStyleId = style.id;
> ```
>
> ### Layout rules
> - Set `layoutSizingHorizontal` / `layoutSizingVertical` **after** appending to parent
> - Use `primaryAxisSizingMode = "HUG"` for containers that should wrap content
> - Use the `generate_figma_design` capture as the visual reference for proportions
>
> For each section:
> 1. Create section frame (layoutMode, padding, gap, bg fill bound to variable)
> 2. Import and instantiate every mapped component by key
> 3. Set variant properties + text overrides
> 4. Append to wrapper
> 5. `get_screenshot` the section — fix issues before next section
>
> ---
>
> ## Step 5 — Transfer images (if Has Images = yes)
>
> From the `generate_figma_design` capture:
> 1. Find nodes with `fill.type === "IMAGE"` — collect `imageHash` values
> 2. Match to corresponding frames in your output by name/position
> 3. Apply: `frame.fills = [{ type: "IMAGE", imageHash: hash, scaleMode: "FILL" }]`
> 4. Delete the capture node
>
> ---
>
> ## Step 6 — Final screenshot and report
>
> `get_screenshot` on the full wrapper frame. Return:
> - Figma frame URL
> - Screenshot
> - Tally: N real component instances vs M approximated shapes

---

## Output

```
✓ Scanned: [source]
✓ Library: Axiom V2 — JYy51au6YaA4QZKpQy1ZRg
✓ Real instances: N
✓ Approximated: M
✓ Frame: https://figma.com/design/...

[screenshot]
```
