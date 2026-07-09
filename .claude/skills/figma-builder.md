---
name: figma-builder
description: "Converts an Axiom Play app page into a Figma design using real Axiom V3 library component instances (not drawn shapes). Use when the user wants to build a Figma screen from a running page, translate an app route or file into Figma, or produce a design using real Axiom components. Triggers: 'build a Figma for...', 'create a Figma design from...', '/figma-builder', 'translate this page to Figma'."
---

# Figma Builder

Converts an Axiom Play page into a Figma design using real Axiom V3 library component instances.

Library reference — **read before any Figma work**:
- **`.claude/FIGMA_LIBRARY_V3.md`** — Axiom V3 component keys, color/spacing/radius variables, **full typography table** (heading + body styles with confirmed keys). All core components available. Library fileKey: `qs72V79n1s9wYOcZ1TzBwM`

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask both questions at once:
1. **Source** — a running page URL (e.g. `http://localhost:3000/opal`), app route (e.g. `/opal`), or file path (e.g. `app/opal/page.tsx`). If URL, dev server must be running.
2. **Figma destination** — a Figma file URL to add a new page to, or "new" to create a new file

> **Axiom version is always V3.** Library: "Axiom Design System", fileKey `qs72V79n1s9wYOcZ1TzBwM`. Never use V2 keys or the "Components V2 - Legacy" library.

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
> **⚠️ ALWAYS also read `app/components/template.tsx` and `app/layout.tsx`** — these define the full page shell: top navigation bar, left sidebar icons, secondary nav panel, and overall layout structure. Every page is rendered inside this shell. Include all shell components in the inventory.
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

> Build a Figma screen for this Axiom Play page using real library component instances.
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
> 3. Read `.claude/FIGMA_LIBRARY_V3.md` — V3 component keys, variable keys, **confirmed typography table** (heading + body styles). Library: **"Axiom Design System"**, fileKey: `qs72V79n1s9wYOcZ1TzBwM`
> 4. **⛔ V3 verification:** After creating any component instance, verify it shows **"Axiom Design System"** as the library name in Figma's inspector. If you see **"Components V2 - Legacy"**, you used a V2 key — stop immediately and replace it with the correct V3 key from `FIGMA_LIBRARY_V3.md`.
>
> ## Pre-build Setup — run this as the FIRST `use_figma` call, before any content
>
> This single call loads all fonts and caches variable keys so every subsequent call can bind fills and apply text styles without extra round-trips. **Do not skip this.**
>
> ```js
> // ── 1. Load fonts V3 uses ─────────────────────────────────────────────────
> // ⚠️ Do NOT loadFontAsync for "VC Nudge" — the actual Figma font name is
> //    "Nudge SemiNormal" and it's only available via library text styles.
> //    Always use importStyleByKeyAsync → textStyleId for any heading text.
> //    Only load Die Grotesk B (body) + Inter (nav chips, status bar only).
> await Promise.all([
>   figma.loadFontAsync({ family: "DI Grotesk B", style: "Regular" }),
>   figma.loadFontAsync({ family: "DI Grotesk B", style: "Medium" }),
>   figma.loadFontAsync({ family: "DI Grotesk B", style: "Bold" }),
>   figma.loadFontAsync({ family: "Roboto Mono", style: "Regular" }),
>   figma.loadFontAsync({ family: "Inter", style: "Regular" }),      // nav chips only
>   figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
> ]);
>
> // ── 2. Pre-import the most-used V3 semantic variables ─────────────────────
> // Keys from .claude/FIGMA_LIBRARY_V3.md → Variables section
> // At build time, also search_design_system for any token not listed here.
> const V3_VAR_KEYS = {
>   // Backgrounds
>   'bg.default':     'YOUR_KEY', // look up in FIGMA_LIBRARY_V3.md or search_design_system
>   'bg.secondary':   'YOUR_KEY',
>   'bg.page':        'YOUR_KEY',
>   // Foregrounds
>   'fg.default':     'YOUR_KEY',
>   'fg.secondary':   'YOUR_KEY',
>   'fg.tertiary':    'YOUR_KEY',
>   // Borders
>   'border.default': 'YOUR_KEY',
>   'border.secondary':'YOUR_KEY',
>   // Avatar tokens (confirmed keys)
>   'avatar.bg-purple':  'f05403a78a33245b53514ce37f4dcf2a26759304',
>   'avatar.fg-purple':  '832603931203c3dacfaf995889a810ac49e3a28b',
>   'avatar.bg-neutral': 'bef7d61ffebcb0b4c9c3d1957b65e6fb8638f953',
>   'avatar.fg-neutral': '4cb932d35cd48ae685f9198f09c7a70a7cc03f4d',
> };
> // Store variable objects for reuse across calls
> const cache = {};
> for (const [name, key] of Object.entries(V3_VAR_KEYS)) {
>   if (key && key !== 'YOUR_KEY') {
>     try { cache[name] = await figma.variables.importVariableByKeyAsync(key); } catch(e) {}
>   }
> }
> // Store cache on root so other calls can retrieve it
> figma.root.setPluginData('varCache', JSON.stringify(
>   Object.fromEntries(Object.entries(cache).map(([k, v]) => [k, v.id]))
> ));
> return { fontsLoaded: true, cachedVars: Object.keys(cache) };
> ```
>
> **bg/fg/border variable keys**: Look them up via `search_design_system` in Step 2B and fill in `V3_VAR_KEYS` before continuing. The avatar keys are already confirmed above.
>
> ### Helper: bind a fill to a variable (use everywhere)
> ```js
> async function bindFill(node, variableId) {
>   const variable = await figma.variables.getVariableByIdAsync(variableId)
>     || await figma.variables.importVariableByKeyAsync(variableId);
>   let fills = JSON.parse(JSON.stringify(node.fills));
>   if (!fills.length) fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
>   fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', variable);
>   node.fills = fills;
> }
> ```
>
> ### Helper: apply a V3 text style — USE THIS ON EVERY TEXT NODE YOU CREATE
> ```js
> // ⚠️ MANDATORY for ALL text nodes — never set fontName/fontSize directly.
> //    The heading font "Nudge SemiNormal" is only available via library styles.
> //    Setting fontName = { family: "Nudge SemiNormal", ... } causes "Missing font".
> async function applyTextStyle(textNode, styleKey) {
>   const style = await figma.importStyleByKeyAsync(styleKey);
>   textNode.textStyleId = style.id;
>   // After textStyleId is set, load the font from the node itself (safe — no hardcoding)
>   await figma.loadFontAsync(textNode.fontName);
> }
> // Keys by role:
> const TEXT_STYLES = {
>   h1:        'a09b6330732317550f89995464841bc6221ee0d4', // 50px Nudge SemiNormal ExtraBold
>   h2:        '0f390bdbab1aa2567e514a688a2720f921f484c5', // 28px Nudge SemiNormal ExtraBold
>   h3:        '65d1ad725186853c5e927203afbd64f0b01aefa1', // 20px Nudge SemiNormal SemiBold
>   h4:        '961be639091acbc4478c68e8a9804df7eed2774d', // 16px Nudge SemiNormal SemiBold
>   bodyLgBold:'7d1aedb043b4fe329944270d8e182d8df5c26532', // 16px Die Grotesk B Bold
>   bodyMdBold:'863bb50b204bcd99ea43f23de1b0db2b8240d2e7', // 14px Die Grotesk B Medium
>   bodyMd:    'c20d5252d9eb7abd7184fe5e9e63188d8bb67cb6', // 14px Die Grotesk B Regular
>   bodySmBold:'61679cba9e57f2ad9d079be913a0bb301504c825', // 12px Die Grotesk B Medium
>   bodySm:    '20dcc541d8693a94f49c64b86cbceb90bd35b82e', // 12px Die Grotesk B Regular
> };
> // Usage: await applyTextStyle(node, TEXT_STYLES.h1); node.characters = "Notification Center";
> ```
>
> ---
>
> ## ⚠️ V3 API Gotchas — read before writing any plugin code
>
> These are real failures that occur silently or with cryptic errors. Burn these in:
>
> **1. Page switching** — `figma.currentPage = page` throws. Always use:
> ```js
> const page = figma.root.children.find(p => p.name === "Opal Mobile");
> await figma.setCurrentPageAsync(page);
> ```
>
> **2. Text style discovery** — `figma.teamLibrary.getAvailableLibraryTextStylesAsync()` does NOT exist in the plugin API. Use confirmed keys from `.claude/FIGMA_LIBRARY_V3.md` directly. Never attempt runtime discovery for text styles.
>
> **3. Variable fill binding** — `node.setBoundVariable('fills', variable)` throws "fills must be set on paints directly". Correct pattern:
> ```js
> const variable = await figma.variables.importVariableByKeyAsync(variableKey);
> let fills = JSON.parse(JSON.stringify(node.fills));
> if (fills.length === 0) fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
> fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', variable);
> node.fills = fills;
> ```
>
> **4. Font loading before text edits** — For body/UI text (Die Grotesk B), pre-load in setup. For heading text (Nudge SemiNormal), use `applyTextStyle()` which loads the font from the node automatically. Never `loadFontAsync({ family: "VC Nudge", ... })` or `loadFontAsync({ family: "Nudge SemiNormal", ... })` directly — the font name varies by style and the font is only reliably available via `importStyleByKeyAsync`:
> ```js
> // ✅ Correct pattern for any text node
> const node = figma.createText();
> await applyTextStyle(node, TEXT_STYLES.h1);  // imports style, loads correct font
> node.characters = "Notification Center";
>
> // ❌ Wrong — causes "Missing font: Nudge SemiNormal" dialog
> await figma.loadFontAsync({ family: "VC Nudge", style: "SemiNormal ExtraBold" });
> node.fontName = { family: "Nudge SemiNormal", style: "ExtraBold" };
> node.characters = "Notification Center";
> ```
>
> **5. `setProperties` with wrong variant value throws** — always inspect variant names first:
> ```js
> const comp = await figma.importComponentSetByKeyAsync(KEY);
> const variantNames = comp.children.map(c => c.name);
> // e.g. ["Variant=Subtle, Intent=Info, Numeric=False", ...] — NOT "Information", it's "Info"
> ```
> Then use exact strings from the names array. Never guess intent/variant values.
>
> **6. Resizing frames inside auto-layout** — `node.resize()` has no effect until sizing mode is set to FIXED:
> ```js
> node.layoutSizingHorizontal = 'FIXED';
> node.layoutSizingVertical = 'FIXED';
> node.resize(targetW, targetH);
> ```
>
> **7. `teamLibrary` has only two methods** — `getAvailableLibraryVariableCollectionsAsync()` and `getVariablesInLibraryCollectionAsync()`. Nothing else. No text styles, no component search.
>
> ---
>
> ## Axiom V3 Component Keys (critical — use exact strings)
>
> All keys are from the **"Axiom Design System"** library (fileKey `qs72V79n1s9wYOcZ1TzBwM`). See `.claude/FIGMA_LIBRARY_V3.md` for the full list.
>
> | Component | componentKey | Key variant props |
> |---|---|---|
> | Button | `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` | Appearance: Primary/Default/Subtle/Danger; Size: Sm - 24/Md - 32/Lg - 40 |
> | Badge | `f0a4e90b5415081932a85616bb0dd63dff0ce59b` | Intent: Info/Success/Warning/Danger/Neutral/Primary (NOT "Information") |
> | Avatar | `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9` | Size: xs/sm/md/lg |
> | Checkbox | `1b51f2a59548085582454116eecc3835d2d5dbc0` | State: Unchecked/Checked/Indeterminate |
> | Sidenav Base | `d902d4aacc11620d63b083878aee026015c5b135` | ⚠️ MANDATORY — always use this for the sidebar shell, never a custom frame |
> | Sidenav item | `2a9c06ac3c1926fbbe2ad8dd0b0d5badab3fb984` | ⚠️ MANDATORY — use for every nav item row, never a custom frame |
> | Data Cell | `827bab63db023b922abd275f6aa5229f569c4025` | ⚠️ MANDATORY — use for every table body cell |
> | Menu Label Button | `bed4de19dc3b95439bd0beba3f4a69599ff8eaef` | Label above + selected value + chevron-down; toolbar filter chips like "Type / All ▾" |
>
> For any component not in this table, run `search_design_system` before building — never approximate with a custom frame.
>
> ## ⛔ NEVER approximate these with custom frames
>
> The sidebar, table, and toolbar are the most commonly mis-built elements. Hard rules:
>
> | Element | Wrong | Right |
> |---|---|---|
> | Sidebar shell | Custom rectangle/frame | `Sidenav Base` instance (`d902d4aacc11...`) |
> | Sidebar nav item | Custom frame with icon + text | `Sidenav item` instance (`2a9c06ac3c19...`) per row |
> | Table body cell | Text/badge in a rectangle | `Data Cell` instance (`827bab63db02...`) per cell, correct Type variant |
> | Table Type column cell | A dash "—" or empty frame | 32×32 frame, `bg.secondary` fill, `cornerRadius=6`, containing the agent's icon (e.g. `IconAgent`) centered inside |
> | Top nav dropdowns ("Stride ▾", "Opal ▾") | Chip frames with fills/border | Plain frame `fills=[] strokes=[] px=8 py=10 gap=8 cornerRadius=6`, text + angle-down icon only |
> | Toolbar search box | `Input` component or any plain text field | Use `search_design_system "Search"` to get V3 Search key — set placeholder to `"Search..."` |
> | Toolbar filter chips ("Type / All ▾") | Button `Variant=Default` or Chip/Pill | `Menu Label Button`, `State=Default`, key `bed4de19dc3b95439bd0beba3f4a69599ff8eaef` — two text nodes: label above value |
> | Primary action button (e.g. "Add Agent") | Small button or custom frame | Button `Appearance=Primary Size=Lg-40`, key `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` |
> | Active tab underline | All-sides stroke or left border | `strokeBottomWeight=2`, all other weights=0, color = `var(--ax-colors-fg-default)`; inactive tabs `strokes=[]` |
> | Switch / Toggle row | Custom frame | V3 Toggle, key `874be68474689cf5f96831d5029bf55258651f37` |
> | Select / pick-one dropdown | Custom frame with text + chevron icon | Use `search_design_system "Select"` to get V3 Select key |
>
> ### ✅ Toolbar Pattern — EXACT SPEC (SearchInput + Filters + Primary CTA)
>
> **Frame:** `name="Toolbar"`, `layoutMode=HORIZONTAL`, `primaryAxisAlignItems=SPACE_BETWEEN`, `counterAxisAlignItems=CENTER`, `h=40`, `fills=[]`, no padding.
>
> **Left group** (`layoutMode=HORIZONTAL`, `gap=8`, HUG both axes):
> 1. **SearchInput** — use `search_design_system "Search V3"` to get the V3 Search component key, resize to `264×40`, set placeholder text node → `"Search..."`
> 2. **Filter buttons** — one `Menu Label Button` per filter, `State=Default`, key `bed4de19dc3b95439bd0beba3f4a69599ff8eaef`. After creating each instance, find its two TEXT nodes: the smaller one → filter label (e.g. `"Type"`), the larger → `"All"`. Typical filters: Type, Category, Created by.
>
> **Right group:** `Button` Appearance=Primary, Size=Lg-40 — key `8bb2661a46f1bb6c35f928e12b5ac0b950eda634`. Set label TEXT node → CTA label (e.g. `"Add Agent"`).
>
> ```js
> // Canonical V3 toolbar build
> const toolbar = figma.createFrame();
> toolbar.name = "Toolbar";
> toolbar.layoutMode = "HORIZONTAL";
> toolbar.primaryAxisAlignItems = "SPACE_BETWEEN";
> toolbar.counterAxisAlignItems = "CENTER";
> toolbar.itemSpacing = 8;
> toolbar.fills = [];
> toolbar.resize(contentWidth, 40);
> contentArea.appendChild(toolbar);
> toolbar.layoutSizingHorizontal = "FILL";
> toolbar.layoutSizingVertical = "FIXED";
>
> const leftGroup = figma.createFrame();
> leftGroup.name = "Toolbar Left";
> leftGroup.layoutMode = "HORIZONTAL";
> leftGroup.counterAxisAlignItems = "CENTER";
> leftGroup.itemSpacing = 8;
> leftGroup.fills = [];
> toolbar.appendChild(leftGroup);
> leftGroup.layoutSizingHorizontal = "HUG";
> leftGroup.layoutSizingVertical = "HUG";
>
> // 1. SearchInput — look up V3 Search key via search_design_system first
> // const searchComp = await figma.importComponentByKeyAsync("V3_SEARCH_KEY");
> // const searchInst = searchComp.createInstance();
> // leftGroup.appendChild(searchInst);
> // searchInst.resize(264, 40);
>
> // 2. Filter buttons (repeat per filter)
> const filterComp = await figma.importComponentByKeyAsync("bed4de19dc3b95439bd0beba3f4a69599ff8eaef");
> for (const { label } of [{ label: "Type" }, { label: "Category" }, { label: "Created by" }]) {
>   const inst = filterComp.createInstance();
>   leftGroup.appendChild(inst);
>   const textNodes = inst.findAll(n => n.type === "TEXT");
>   textNodes.forEach(t => {
>     if (t.fontSize <= 11) t.characters = label;
>     else t.characters = "All";
>   });
> }
>
> // 3. Primary CTA — V3 Button Lg-40
> const btnComp = await figma.importComponentSetByKeyAsync("8bb2661a46f1bb6c35f928e12b5ac0b950eda634");
> const primaryVariant = btnComp.children.find(c => c.name.includes("Appearance=Primary") && c.name.includes("Lg - 40")) ?? btnComp.defaultVariant;
> const btnInst = primaryVariant.createInstance();
> toolbar.appendChild(btnInst);
> const btnLabel = btnInst.findOne(n => n.type === "TEXT");
> if (btnLabel) btnLabel.characters = "Add Agent";
> ```
>
> **Table header row container: NO background fill**
> The header row container frame wrapping all header cells must have no fill — set `fills = []`. Never apply `bg.secondary` or any gray fill to the header row container.
>
> ## Color tokens — match the screenshot, never hardcode dark mode
>
> ⚠️ **Do NOT assume dark mode.** Inspect the `generate_figma_design` screenshot to determine whether the page is light or dark mode, then use the matching hex values below. Most Axiom Play product pages (CMS, CMP, Opal Agents, Web Experimentation) are **light mode**. Only Opal chat UI is dark.
>
> **Light mode hex values:**
>
> | Token | Light hex |
> |---|---|
> | bg.page | `#F9FAFC` |
> | bg.default | `#FFFFFF` |
> | bg.secondary | `#F5F6FA` |
> | fg.default | `#2E3442` |
> | fg.secondary | `#4F576E` |
> | fg.tertiary | `#66708C` |
> | border.default | `#CACFDC` |
> | border.secondary | `#DADFEB` |
> | border.tertiary | `#E9EDF5` |
>
> **Dark mode hex values (only when screenshot confirms dark background):**
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
> Full token table (all tokens, light + dark): `.claude/FIGMA_LIBRARY_V3.md`
>
> ## Icons
>
> V3 icons are individual component sets with `Active=False / Active=True` variants.
> Full React→Figma name mapping + componentKeys: `.claude/FIGMA_LIBRARY_V3.md` (Icons section).
>
> Key mappings: `IconXmark`→Close, `IconCode`→Code, `IconEye`→Preview, `IconArrowsRotate`→Refresh, `IconClockRotateLeft`→History, `IconUserGroup`→User Group, `IconChevronDown`→Chevron Down, `IconCopy`→Copy, `IconCircleCheck`→Check Circle, `IconShare`→Share, `IconSparkles`→Sparkles, `IconGear`→Settings, `IconPlus`→Add
>
> **⚠️ `setProperties` INSTANCE_SWAP FAILS for remote components — always use `swapComponent`:**
> ```js
> const iconSet = await figma.importComponentSetByKeyAsync("ICON_KEY");
> const iconComp = iconSet.children.find(c => c.name === "Active=False") ?? iconSet.defaultVariant;
>
> // Icon-only button: enable icon slot first
> buttonInstance.setProperties({ "Icon Button": "True" });
>
> // Button with trailing icon (e.g. "Add to ▾"): enable addon slot
> for (const [key, def] of Object.entries(buttonInstance.componentProperties)) {
>   if (key.includes("Addon after")) buttonInstance.setProperties({ [key]: "true" });
> }
>
> // Set label text (try component property first, then direct node override)
> for (const [key, def] of Object.entries(buttonInstance.componentProperties)) {
>   if (def.type === "TEXT") buttonInstance.setProperties({ [key]: "Button Label" });
> }
>
> // Swap icon — icon layer is "Icon" in Button, "grid-2 16" in ToggleButton
> function findIconSlot(node) {
>   if (node.type === "INSTANCE" && (node.name.includes("Icon") || node.name.includes("grid"))) return node;
>   if ("children" in node) { for (const c of node.children) { const f = findIconSlot(c); if (f) return f; } }
>   return null;
> }
> const slot = findIconSlot(buttonInstance);
> if (slot) slot.swapComponent(iconComp);
> ```
> **V3 Button size property values:** `"Sm - 24"`, `"Md - 32"` ← use this for toolbars, `"Lg - 40"`
>
> ## V3 Typography — confirmed keys (use directly, no runtime discovery needed)
>
> V3 has **two** font families — headings are NOT Die Grotesk B:
>
> | Style name | key | Font | Size |
> |---|---|---|---|
> | `Header/Heading 1` | `a09b6330732317550f89995464841bc6221ee0d4` | VC Nudge ExtraBold | 50px |
> | `Header/Heading 2` | `0f390bdbab1aa2567e514a688a2720f921f484c5` | VC Nudge ExtraBold | 28px |
> | `Header/Heading 3` | `65d1ad725186853c5e927203afbd64f0b01aefa1` | VC Nudge SemiBold | 20px |
> | `Header/Heading 4` | `961be639091acbc4478c68e8a9804df7eed2774d` | VC Nudge SemiBold | 16px |
> | `Body/Large/Bold` | `7d1aedb043b4fe329944270d8e182d8df5c26532` | Die Grotesk B Bold | 16px |
> | `Body/Medium/Bold` | `863bb50b204bcd99ea43f23de1b0db2b8240d2e7` | Die Grotesk B Medium | 14px |
> | `Body/Medium/Regular` | `c20d5252d9eb7abd7184fe5e9e63188d8bb67cb6` | Die Grotesk B Regular | 14px |
> | `Body/Small/Regular` | `20dcc541d8693a94f49c64b86cbceb90bd35b82e` | Die Grotesk B Regular | 12px |
> | `Body/Small/Bold` | `61679cba9e57f2ad9d079be913a0bb301504c825` | Die Grotesk B Medium | 12px |
>
> Role mapping: screen/section title → H3 or H4 (H1 at 50px is too large for product UI, H2 at 28px for top-level headers). Row titles → `Body/Medium/Bold`. Body → `Body/Medium/Regular`. Timestamps → `Body/Small/Regular`.
>
> Apply: `const style = await figma.importStyleByKeyAsync(KEY); textNode.textStyleId = style.id;`
>
> ⚠️ Never hardcode `fontFamily` — always apply via style key.
>
> ## V3 Badge — correct intent values and font loading
>
> componentKey: `f0a4e90b5415081932a85616bb0dd63dff0ce59b`
>
> Intent values: `Info` (NOT `Information`), `Success`, `Warning`, `Danger`, `Neutral`, `Primary`
> Variant format: `Variant=Subtle, Intent=Info, Numeric=False`
>
> ```js
> // Always load fonts first — Badge uses Roboto Mono internally
> await figma.loadFontAsync({ family: "Roboto Mono", style: "Regular" });
> await figma.loadFontAsync({ family: "Die Grotesk B", style: "Medium" });
>
> const badgeSet = await figma.importComponentSetByKeyAsync("f0a4e90b5415081932a85616bb0dd63dff0ce59b");
> const variant = badgeSet.children.find(c => c.name === "Variant=Subtle, Intent=Info, Numeric=False")
>   ?? badgeSet.defaultVariant;
> const inst = variant.createInstance();
> parent.appendChild(inst);
> // Set label by finding the first TEXT node (setProperties with Label key also works)
> const labelNode = inst.findOne(n => n.type === 'TEXT');
> if (labelNode) labelNode.characters = "Needs input";
> ```
>
> ## V3 Avatar — color token binding
>
> componentKey: `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9`
>
> For custom initials circles (when not using the Avatar component directly), bind fills to V3 tokens:
> - `component/Avatar/bg-purple` → `f05403a78a33245b53514ce37f4dcf2a26759304` (blue/purple avatars)
> - `component/Avatar/fg-purple` → `832603931203c3dacfaf995889a810ac49e3a28b`
> - `component/Avatar/bg-neutral` → `bef7d61ffebcb0b4c9c3d1957b65e6fb8638f953` (all other colors)
> - `component/Avatar/fg-neutral` → `4cb932d35cd48ae685f9198f09c7a70a7cc03f4d`
>
> Use `setBoundVariableForPaint` (see API Gotchas #3 above). Always bind both bg fill and fg text fill.
>
> ## Fixing pill-shaped avatar frames
>
> Pill shapes occur when a frame has `width ≠ height` with a large `cornerRadius`. Fix:
> ```js
> const size = 36; // or 44 for larger slots
> node.layoutSizingHorizontal = 'FIXED';
> node.layoutSizingVertical = 'FIXED';
> node.resize(size, size);
> node.cornerRadius = size / 2;
> // Re-center child (text initial or emoji)
> if ('children' in node && node.children[0]) {
>   const child = node.children[0];
>   child.x = (size - child.width) / 2;
>   child.y = (size - child.height) / 2;
> }
> ```
>
> ---
>
> ## Dialog / Modal Layout Rules (apply whenever building modals)
>
> **Reference component:** node `22090:1007264`, file `6FuwvRSw6NyFLRZQrwBMVS` — check this first for exact specs.
>
> | Part | Rules |
> |---|---|
> | Outer frame | `layoutMode=VERTICAL`, `primaryAxisSizingMode=AUTO` (HUG height — **never fixed**), `counterAxisSizingMode=FIXED` (keep width), `cornerRadius=12` |
> | DialogHeader | `HORIZONTAL`, `SPACE_BETWEEN`, pad 20/24, title **24px/Medium(500)**, close = real Button Subtle+Md+IconButton+xmark icon |
> | Divider | **Only one** — between body and footer. **No divider between header and body.** 1px FILL, `border.default` fill |
> | DialogBody | `VERTICAL`, pad 16/24, HUG height, FILL width |
> | DialogFooter | `HORIZONTAL`, `primaryAxisAlignItems=MAX` (right-align), pad 20/24, gap=8, `counterAxisSizingMode=AUTO` (HUG height), `primaryAxisSizingMode=FIXED` (FILL width) |
> | Footer buttons | `layoutSizingHorizontal=HUG`, `layoutSizingVertical=FIXED` at 40px — never squish |
> | Icons | **Never use emoji/text glyphs** (⛓ ⓘ ✕). Always real Axiom icon instances via `importComponentSetByKeyAsync` |
>
> ---
>
> ## Step 1 — Pixel-perfect capture (BLOCKING — do this first)
>
> Call `generate_figma_design` with `SOURCE_URL`. **Do NOT proceed to any other step until you have the screenshot.**
>
> This rasterized capture is your **primary visual reference** — it overrides the text inventory whenever they conflict. Every section you build must be compared against it. If a built section doesn't match the capture, fix it before moving on.
>
> **Screenshot vs inventory conflict rule:** When the screenshot shows something different from the inventory (e.g. link-style text tags vs. colored pill badges, actual icons vs. placeholder dots, a full top nav bar the inventory omitted), **always trust the screenshot**.
>
> ---
>
> ## Step 2 — Open / create file + variable discovery (run in PARALLEL)
>
> **A) Open/create file:**
> - Figma URL: extract fileKey, confirm with `get_metadata`. Note existing pages.
> - "new": use `create_new_file`.
>
> Add a new page named after the screen (e.g. "Opal – Landing").
>
> **B) Variable discovery** — use `search_design_system` with `includeVariables: true` for: "background", "foreground", "border", "space", "radius". Record variable keys for semantic tokens (bg.default, fg.secondary, etc.) so fills can be bound to variables rather than hardcoded hex.
>
> ---
>
> ## Step 3 — Create root wrapper frame + Top Nav Bar
>
> ⚠️ **The wrapper must be VERTICAL, not HORIZONTAL.** The top nav bar spans full page width — it sits ABOVE the sidebar, not beside it:
>
> ```
> Wrapper (VERTICAL, 1440×900)
>   ├── Top Nav Bar   (HORIZONTAL, FILL width, 48px)  ← custom frame, exact spec below
>   └── Body Row      (HORIZONTAL, FILL width, FILL height)
>        ├── Sidenav Base   (56px wide, FILL height)
>        └── Content Area   (FILL width, FILL height, VERTICAL)
> ```
>
> **Sidenav Base** — goes inside the Body Row, NOT at wrapper root.
>
> ### ⚠️ Top Nav Bar — EXACT SPEC (follow precisely, no shortcuts)
>
> The top nav is a **custom frame** — never use plain text nodes for any nav element. Every element is mandatory.
>
> **Frame:** `name="Top Nav"`, HORIZONTAL, **48px height**, `bg.default` (#FFFFFF) fill, 1px stroke-bottom `border.tertiary` (#E9EDF5), `paddingLeft=8 paddingRight=16`, `primaryAxisAlignItems=SPACE_BETWEEN`, `counterAxisAlignItems=CENTER`.
>
> ⚠️ **CRITICAL — set FILL width in this exact order:**
> ```js
> topNav.layoutMode = "HORIZONTAL";
> topNav.primaryAxisSizingMode = "FIXED";   // must be FIXED, not AUTO
> topNav.counterAxisSizingMode = "FIXED";
> topNav.resize(1440, 48);                  // set explicit size FIRST
> wrapper.appendChild(topNav);              // append BEFORE setting FILL
> topNav.layoutSizingHorizontal = "FILL";  // FILL only works after appending
> ```
> If you skip `resize(1440, 48)` before appending, the nav collapses to HUG width (~439px) and never fills.
>
> **Left cluster** (HORIZONTAL frame, `gap=8`, CENTER align, HUG both axes):
>
> 1. **Logo mark** — 32×32 frame, `cornerRadius=8`, no children text — gradient fill:
>    ```js
>    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
>    const logoFrame = figma.createFrame();
>    logoFrame.name = "Logo";
>    logoFrame.resize(32, 32);
>    logoFrame.cornerRadius = 8;
>    logoFrame.fills = [{
>      type: 'GRADIENT_LINEAR',
>      gradientTransform: [[0, 1, 0], [-1, 0, 1]],
>      gradientStops: [
>        { position: 0, color: { r: 0.38, g: 0.40, b: 0.95, a: 1 } },
>        { position: 1, color: { r: 0.18, g: 0.51, b: 0.96, a: 1 } },
>      ]
>    }];
>    // White "O" centred inside
>    const logoText = figma.createText();
>    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
>    logoText.fontName = { family: "Inter", style: "Bold" };
>    logoText.fontSize = 18;
>    logoText.characters = "O";
>    logoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
>    logoFrame.appendChild(logoText);
>    logoText.x = (32 - logoText.width) / 2;
>    logoText.y = (32 - logoText.height) / 2;
>    ```
>
> 2. **"Stride" dropdown chip** — HORIZONTAL frame, `paddingLeft=8 paddingRight=8 paddingTop=4 paddingBottom=4 itemSpacing=6 cornerRadius=6`, `fills=[]`, CENTER align:
>    - Text node "Stride": Inter 14px Medium (#2E3442) — Inter is pre-loaded in setup, safe to set fontName directly
>    - Chevron: `importComponentByKeyAsync("8dc5a493b96d8e97df1b1ae487cb5a18d2f28c25")` → `createInstance()`, color `#66708C`
>
> 3. **"Opal" dropdown chip** — identical structure, text "Opal"
>
> **Spacer** between left and right clusters: `figma.createFrame()`, `fills=[]`, `layoutSizingHorizontal=FILL` (set after appending to nav).
>
> **Right cluster** (HORIZONTAL frame, `gap=4`, CENTER align, HUG both axes) — left to right:
>
> 1. **"System" button** — V3 Button instance (key `8bb2661a46f1bb6c35f928e12b5ac0b950eda634`), Appearance=Subtle, Size=Md - 32, set label text to "System".
>
> 2. **Opal orb** — 28×28 frame, `cornerRadius=14` (full circle):
>    ```js
>    orb.fills = [{
>      type: 'GRADIENT_RADIAL',
>      gradientTransform: [[0.8, 0, 0.1], [0, 0.8, 0.1]],
>      gradientStops: [
>        { position: 0,   color: { r: 0.82, g: 0.65, b: 1.0,  a: 1 } },
>        { position: 0.5, color: { r: 0.47, g: 0.58, b: 0.98, a: 1 } },
>        { position: 1,   color: { r: 0.29, g: 0.56, b: 0.95, a: 1 } },
>      ]
>    }];
>    ```
>
> 3–7. **Icon-only buttons** (Subtle Md-32, `"Icon Button"="True"`, icon via `swapComponent`):
> Use `search_design_system` to look up V3 icon keys for Search, Notifications, Help, Code, and User. The V3 icon component set keys are in `.claude/FIGMA_LIBRARY_V3.md` (Icons section).
>
> ```js
> // Reusable V3 icon-button factory — import ONCE, call per icon
> const btnSet = await figma.importComponentSetByKeyAsync("8bb2661a46f1bb6c35f928e12b5ac0b950eda634");
> const subtleMd = btnSet.children.find(c => {
>   const p = Object.fromEntries(c.name.split(', ').map(x => x.split('=')));
>   return p["Appearance"] === "Subtle" && p["Size"] === "Md - 32";
> }) ?? btnSet.defaultVariant;
>
> async function makeIconBtn(iconKey, parent) {
>   const btn = subtleMd.createInstance();
>   btn.setProperties({ "Icon Button": "True" });
>   const icon = await figma.importComponentByKeyAsync(iconKey);
>   function findSlot(n) {
>     if (n.type === "INSTANCE" && n.name === "Icon") return n;
>     if ("children" in n) for (const c of n.children) { const r = findSlot(c); if (r) return r; }
>     return null;
>   }
>   findSlot(btn)?.swapComponent(icon);
>   parent.appendChild(btn);
>   btn.layoutSizingHorizontal = "HUG";
> }
> ```
>
> ### ✅ Top Nav self-check (screenshot after building, fix before proceeding)
>
> Verify ALL present in the screenshot:
> - [ ] Gradient blue/purple "O" logo mark (NOT plain "optimizely" text)
> - [ ] "Stride" chip with chevron — **separate** from "Opal"
> - [ ] "Opal" chip with chevron — **separate** from "Stride"
> - [ ] "System" button label visible
> - [ ] Opal orb gradient circle
> - [ ] 5 icon buttons (search, bell, question, code, user)
>
> ### Wrapper scaffold
>
> ```js
> let maxX = 0;
> for (const child of figma.currentPage.children) {
>   maxX = Math.max(maxX, child.x + child.width);
> }
> const wrapper = figma.createFrame();
> wrapper.name = "Screen Name";
> wrapper.layoutMode = "VERTICAL";
> wrapper.resize(1440, 900);
> wrapper.itemSpacing = 0;
> wrapper.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }]; // bg.page
> wrapper.x = maxX + 200;
> wrapper.y = 0;
>
> const bodyRow = figma.createFrame();
> bodyRow.name = "Body";
> bodyRow.layoutMode = "HORIZONTAL";
> bodyRow.itemSpacing = 0;
> bodyRow.fills = [];
> wrapper.appendChild(bodyRow);
> bodyRow.layoutSizingHorizontal = "FILL";
> bodyRow.layoutSizingVertical = "FILL";
>
> return { wrapperId: wrapper.id, bodyRowId: bodyRow.id };
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
> // Import by componentKey from the Axiom V3 library ("Axiom Design System", fileKey qs72V79n1s9wYOcZ1TzBwM)
> const buttonSet = await figma.importComponentSetByKeyAsync("8bb2661a46f1bb6c35f928e12b5ac0b950eda634");
>
> // Find the right variant — parse the variant name string
> const variant = buttonSet.children.find(c => {
>   const props = Object.fromEntries(c.name.split(', ').map(p => p.split('=')));
>   return props["Appearance"] === "Subtle" && props["Size"] === "Md - 32";
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
> ### V3 UI element → component decision table
>
> Before building any element, look it up here. If it's in this table, use the component — never a custom frame.
>
> | UI element | V3 component | Key | Notes |
> |---|---|---|---|
> | Status / intent label | Badge | `f0a4e90b5415081932a85616bb0dd63dff0ce59b` | Intent: Info/Success/Warning/Danger/Neutral/Primary; Variant: Subtle |
> | Person avatar | Avatar | `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9` | Size: xs/sm/md/lg; set Name prop for initials |
> | Notification / system alert | Alert | `03d2f87e47aab9cca1cf94969454df6a6050c0ee` | Use this, never a custom colored frame |
> | Primary action | Button `Lg-40` | `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` | Appearance=Primary |
> | Secondary / ghost action | Button `Md-32` or `Sm-24` | same | Appearance=Default or Subtle |
> | Text input | Input | look up via `search_design_system "Input text field"` | Size: md/lg/xl only |
> | Dropdown / select | Select | look up via `search_design_system "Select dropdown V3"` | |
> | Search field | Search (SearchInput) | look up via `search_design_system "Search"` | |
> | Sidebar shell | Sidenav Base | `d902d4aacc11620d63b083878aee026015c5b135` | MANDATORY — never custom frame |
> | Sidebar nav item | Sidenav item (FA icon) | `2a9c06ac3c1926fbbe2ad8dd0b0d5badab3fb984` | MANDATORY per row |
> | Loading state | Spinner | `7b7af13ed805bcff4a0401591b07e86f347e1808` | |
> | Checkbox | Checkbox | `1b51f2a59548085582454116eecc3835d2d5dbc0` | |
> | Toggle/switch | Toggle | `874be68474689cf5f96831d5029bf55258651f37` | |
>
> **If a component isn't in this table:** run `search_design_system` before building — never approximate with a custom frame.
>
> ### Typography decision table — apply to EVERY text node
>
> | Text role | Style key |
> |---|---|
> | Screen / page title | H3 `65d1ad725186853c5e927203afbd64f0b01aefa1` |
> | Section heading, dialog title | H4 `961be639091acbc4478c68e8a9804df7eed2774d` |
> | Large card title | Body/Large/Bold `7d1aedb043b4fe329944270d8e182d8df5c26532` |
> | Row name / item title | Body/Medium/Bold `863bb50b204bcd99ea43f23de1b0db2b8240d2e7` |
> | Body / description | Body/Medium/Regular `c20d5252d9eb7abd7184fe5e9e63188d8bb67cb6` |
> | Secondary / preview text | Body/Small/Regular `20dcc541d8693a94f49c64b86cbceb90bd35b82e` |
> | Timestamp / label / tag | Body/Small/Bold `61679cba9e57f2ad9d079be913a0bb301504c825` |
>
> Apply with `applyTextStyle(node, key)` (helper defined in Pre-build Setup). Every text node must have a `textStyleId` — the audit will catch any without one.
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
> ## Step 6 — Executable Compliance Audit (MANDATORY GATE — 0 issues required)
>
> **Do NOT proceed to Step 7 until this script returns `{ issues: [] }`.**
> Run → fix all reported issues → run again → repeat until clean.
>
> Run this as a `use_figma` call on the root wrapper frame:
>
> ```js
> // ── Full V3 Compliance Audit ──────────────────────────────────────────────
> // Replace ROOT_ID with the id returned when you created the wrapper frame.
> const root = figma.getNodeById('ROOT_ID') ?? figma.currentPage;
> const issues = [];
>
> // Nodes whose unbound fills are intentional (gradients, images, transparent)
> function isFillExempt(fill) {
>   if (fill.type !== 'SOLID') return true;                         // gradients, images: ok
>   const { r, g, b, a } = fill.color;
>   if ((a ?? fill.opacity ?? 1) === 0) return true;               // transparent: ok
>   if (r === 1 && g === 1 && b === 1) return true;                // pure white bg: ok
>   return false;
> }
>
> root.findAll(n => {
>   // ── A: Unbound solid fills ───────────────────────────────────────────────
>   if ('fills' in n && Array.isArray(n.fills)) {
>     for (const fill of n.fills) {
>       if (!isFillExempt(fill) && !fill.boundVariables?.color) {
>         const {r,g,b} = fill.color;
>         issues.push({ rule:'unbound-fill', id:n.id, node:n.name,
>           color:`rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})` });
>       }
>     }
>   }
>
>   // ── B: Text nodes without a V3 text style ───────────────────────────────
>   if (n.type === 'TEXT') {
>     if (!n.textStyleId || n.textStyleId === '') {
>       issues.push({ rule:'missing-text-style', id:n.id, text:n.characters.slice(0,30),
>         font:`${n.fontName?.family} ${n.fontName?.style}` });
>     }
>     // Flag Inter in product text (status bar time strings are exempt)
>     if (n.fontName?.family === 'Inter' && !['9:41','StatusBar'].includes(n.parent?.name)) {
>       issues.push({ rule:'wrong-font-inter', id:n.id, text:n.characters.slice(0,30) });
>     }
>   }
>
>   return false; // findAll: visit all nodes
> });
>
> // Summary by rule
> const byRule = issues.reduce((acc, i) => {
>   acc[i.rule] = (acc[i.rule] || 0) + 1; return acc;
> }, {});
>
> return { totalIssues: issues.length, byRule, issues: issues.slice(0, 30) };
> ```
>
> ### Interpreting results and fixing
>
> | Rule | What to fix |
> |---|---|
> | `unbound-fill` | Find node by id, import the matching V3 semantic variable, call `setBoundVariableForPaint` |
> | `missing-text-style` | Find text node by id, call `applyTextStyle(node, TEXT_STYLES.bodyMd)` (pick role by size) |
> | `wrong-font-inter` | Apply the correct V3 text style key — never set fontName directly |
>
> **Acceptable exemptions** (do not try to fix these):
> - Gradient fills (type ≠ SOLID) — logo marks, Opal orb, chip gradients
> - Image fills — avatars with real photo src
> - Pure white fills on icon containers where no semantic token exists
> - Status bar time text ("9:41") uses Inter — intentional, ignore
>
> ⚠️ **Never mix V2 and V3 variable bindings in the same frame.** V3 builds must only use variables from `qs72V79n1s9wYOcZ1TzBwM`.
>
> ### Spacing reference (Axiom tokens → px)
>
> | Axiom token | px | Use for |
> |---|---|---|
> | `spacing-4` | 4px | Tight gaps, icon padding |
> | `spacing-8` | 8px | Component-internal gaps |
> | `spacing-12` | 12px | Row vertical padding |
> | `spacing-16` | 16px | Section padding, major gaps |
> | `spacing-20` | 20px | Dialog header/footer vertical pad |
> | `spacing-24` | 24px | Dialog body horizontal pad |
> | `spacing-32` | 32px | Section separation |
>
> Dialog spec: Header `pad=20/24`, Body `pad=16/24 gap=16`, Footer `pad=16/20 gap=8`.
>
> ## Step 7 — Visual fidelity comparison (MANDATORY — default behaviour)
>
> ⚠️ **Default:** compare the built Figma output against the source to catch divergences. Only skip or flip this to "suggest improvements" if the user explicitly asks to improve on the source.
>
> 1. Take a `get_screenshot` of every built frame.
> 2. Take a `generate_figma_design` capture of the source page/URL (the same one used in Step 1).
> 3. Compare them side-by-side mentally. For each built frame, identify any element that differs from the source:
>    - Wrong text content (label, placeholder, copy)
>    - Missing element (icon, section, badge, row)
>    - Extra element not in the source
>    - Wrong colour, size, or shape
>    - Wrong layout direction or alignment
>    - Wrong component used (e.g. Toggle Button where a regular Button appears in source)
> 4. Fix every divergence found. The goal is **pixel-faithful reproduction**, not improvement.
> 5. After fixes, re-screenshot and confirm all frames match the source before reporting.
>
> **Fidelity rule:** If the source has a bug or awkward spacing, reproduce it faithfully. Do not silently "improve" it — the user can ask for improvements separately.
>
> ## Step 8 — Final screenshot and report
>
> `get_screenshot` on the full wrapper frame. Return:
> - Figma frame URL
> - Screenshot
> - Audit result: PASS or list of remaining issues
> - Fidelity: list any intentional divergences from source (should be none unless user asked for improvements)

---

## Output

```
✓ Scanned: [source]
✓ Library: Axiom V3 — "Axiom Design System" (qs72V79n1s9wYOcZ1TzBwM)
✓ Real instances: N components
✓ Typography: VC Nudge headings / Die Grotesk B body
✓ Color tokens: all fills bound to V3 variables
✓ Audit: PASS (or list issues)
✓ Frame: https://figma.com/design/...

[screenshot]
```
