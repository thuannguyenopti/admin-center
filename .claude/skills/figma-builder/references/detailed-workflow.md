## MANDATORY PREREQUISITES

1. Invoke the `figma-use` skill — required before ANY `use_figma` call.
2. Invoke the `figma-generate-design` skill — follow its workflow.
3. Read the correct library reference file:
   - **V2** → `.claude/FIGMA_LIBRARY_V2.md` — has component keys, variant names, full token tables (light + dark), Opal section.
   - **V3 (experimental)** → `.claude/FIGMA_LIBRARY_V3.md` — has foundation tokens AND component keys for all core components (Button, Badge, Avatar, Input, Search, TextArea, Checkbox, Spinner, Tooltip, Data Cell, Column Header Cell, SubNav, Sidenav Base, Sidenav item, Alert, Menu Label Button, etc.). Use real instances for all components. **Library fileKey: `qs72V79n1s9wYOcZ1TzBwM`**

---

## Axiom V2 Component Keys (critical — use exact strings)

| Component | componentKey | Key variant props |
|---|---|---|
| Button | `3296fc4820c3d0194d963b89c435b3e5b4dcc0ea` | Appearance: Primary/Default/Subtle/Danger/Default Opal/Primary Opal; Size: sm/md/lg |
| Toggle Button | `d8956657543d7623c4056abc4f6b8a4a98b5b4a7` | Appearance: Default/Subtle; Size: sm/md/lg; Pressed: true/false |
| Switch | `e52ee25a8593663d155cb6cd10528155d3f6c06d` | Checked: on/off; Size: Default 20; State: Default/Hover/Disabled; Label right: True/False — ⚠️ see Switch pattern below |
| Input | `87412b4b78df5711c2906719875b7b9168da2be6` | Size: md/lg/xl (min md!); State: Default/Focused/Disabled/Error |
| Text Area | `cd05ef35c0e28cc3e4c1d8586e01fc29991ee60b` | State: Default/Focused/Disabled/Error; Resize: none/auto/vertical |
| Badge | `d853342dd778628f8f008ef2ceb342957ce3a50f` | Intent: Information/Success/Warning/Danger/Neutral/Primary |
| Avatar | `07a871d4a8a3bfd2d6cd236b0547ee7ec3a31fe4` | Size: 2xs/xs/sm/md/lg/xl/3xl; Color Scheme: Purple/Neutral |
| Tooltip | `8620b20c2c6850f25f50a7ab83d00e3cdf734ca1` | Side: Top/Bottom/Left/Right |
| Checkbox | `832bf13d26272af25bc6385a154108e990a053db` | State: Unchecked/Checked/Indeterminate |
| Spinner | `6663c184ae5339e6a21af419fc95eb8f6326f764` | Appearance: Default/Inverse; Size: sm/md/lg |
| Sidenav Base | `95186ccb7d62d7bd1afde6ef2a12a49cbce3d298` | ⚠️ MANDATORY — always use this for the sidebar shell, never a custom frame |
| Sidenav item | `42e6d60b2bb7bdcc91adfa35eff29e0c27d09750` | ⚠️ MANDATORY — use for every nav item row, never a custom frame |
| Column Header Cell | `d473cabd925eb8cd7066d03b3122f7ce01241484` | ⚠️ MANDATORY — use for every table header cell; variants: `Variant=Text`, `Variant=Numeric`, `Variant=Select All`; `Hover=false` |
| Data Cell | `a051c4754e3ea047feb07b5e30ceae244c63b6a2` | ⚠️ MANDATORY — use for every table body cell; variants: `Type=Row Header` (name col), `Type=Text`, `Type=Date`, `Type=Badge`, `Type=Avatar`; always fix required props (see below) |
| Menu Label Button | look up in `.claude/FIGMA_LIBRARY_V2.md` | Label (small, fg.secondary above) + selected value + chevron-down; used for toolbar filter chips like "Type / All ▾" |

**Components library fileKey:** `JYy51au6YaA4QZKpQy1ZRg`

## ⛔ NEVER approximate these with custom frames

The sidebar, table, and toolbar are the most commonly mis-built elements. Hard rules:

| Element | Wrong | Right |
|---|---|---|
| Sidebar shell | Custom rectangle/frame | `Sidenav Base` instance (`95186ccb...`) |
| Sidebar nav item | Custom frame with icon + text | `Sidenav item` instance (`42e6d60b...`) per row |
| Table header cell | Text in a rectangle | `Column Header Cell` instance (`d473cabd...`) per column |
| Table body cell | Text/badge in a rectangle | `Data Cell` instance (`a051c4754...`) per cell, correct Type variant |
| Table Type column cell | A dash "—" or empty frame | 32×32 frame, `bg.secondary` fill, `cornerRadius=6`, containing the agent's icon (e.g. `IconAgent`) centered inside |
| Top nav dropdowns ("Stride ▾", "Opal ▾") | Chip frames with fills/border | Plain frame `fills=[] strokes=[] px=8 py=10 gap=8 cornerRadius=6`, text + angle-down icon only |
| Toolbar search box | `Input` component or any plain text field | `Search` component, `Variant=Placeholder, Size=Large-40, State=Default`, key `80f3bfa879cfaa191679e85fc992cf72ddfd090b` — set placeholder text to `"Search..."` |
| Toolbar filter chips ("Type / All ▾") | Button `Variant=Default` or Chip/Pill | `Menu Label Button`, `State=Default`, key `cd23ed933d5012834a7e5f35de20fa6200ddd558` (h=40) — two text nodes: label (10px, e.g. "Type") above value (12px, e.g. "All") |
| Primary action button (e.g. "Add Agent") | Button `Size=Sm-24` or `Sm` | Button `Variant=Primary Size=Lg-40`, key `86a13eae728be1ba4e64a6f5825e1ce9e40d84cd` |
| Active tab underline | All-sides stroke or left border | `strokeBottomWeight=2`, all other weights=0, color = `#0066FF`; inactive tabs `strokes=[]` |
| Switch / Toggle row | V3 Switch, or custom frame | V2 Switch key `e52ee25a8593663d155cb6cd10528155d3f6c06d`, resized to **40×20px** (knob only). **Hide the internal Label text container** (`visible=false`) — it collapses to 1px wide and renders characters stacked vertically. Place a standalone `Text` node beside the instance for the label instead. Set checked state: `setProperties({ "Checked": "on" })`. |
| Select / pick-one dropdown | Custom frame with text + chevron icon | `Select` component, `Variant=Select, Open=True`, key `231c90292aa960cb39e3506b2501c122cee8a8f5`. Set `Text value` TEXT → selected option. Hide `Label` instance + `Form note` when no field label needed. Set list item labels via `findAll(n => n.name.includes("Listitem"))`. Full pattern in `FIGMA_LIBRARY_V2.md` → "Select (full)" section. |

### ✅ Toolbar Pattern — EXACT SPEC (SearchInput + Filters + Primary CTA)

**Reference:** File `FRGZTNaIzrWZ6QZ5oXswjO`, frame `12:75` — this is the canonical Axiom toolbar. Match it exactly.

**Frame:** `name="Toolbar"`, `layoutMode=HORIZONTAL`, `primaryAxisAlignItems=SPACE_BETWEEN`, `counterAxisAlignItems=CENTER`, `h=40`, `fills=[]`, no padding.

**Left group** (`layoutMode=HORIZONTAL`, `gap=8`, HUG both axes):
1. **SearchInput** — `importComponentByKeyAsync("80f3bfa879cfaa191679e85fc992cf72ddfd090b")`, resize to `264×40`, set placeholder text node where `characters==="Placeholder"` → `"Search..."`
2. **Filter buttons** — one `Menu Label Button` per filter, `State=Default`, key `cd23ed933d5012834a7e5f35de20fa6200ddd558`. After creating each instance, find its two TEXT nodes: `fontSize===10` → set to filter label (e.g. `"Type"`), `fontSize===12` → set to `"All"`. Typical filters: Type, Category, Created by.

**Right group:** `Button` Primary Lg-40 — key `86a13eae728be1ba4e64a6f5825e1ce9e40d84cd`. Set label TEXT node `characters==="Button"` → CTA label (e.g. `"Add Agent"`).

```js
// Canonical toolbar build
const toolbar = figma.createFrame();
toolbar.name = "Toolbar";
toolbar.layoutMode = "HORIZONTAL";
toolbar.primaryAxisAlignItems = "SPACE_BETWEEN";
toolbar.counterAxisAlignItems = "CENTER";
toolbar.itemSpacing = 8;
toolbar.fills = [];
toolbar.resize(contentWidth, 40);
contentArea.appendChild(toolbar);
toolbar.layoutSizingHorizontal = "FILL";
toolbar.layoutSizingVertical = "FIXED";

const leftGroup = figma.createFrame();
leftGroup.name = "Toolbar Left";
leftGroup.layoutMode = "HORIZONTAL";
leftGroup.counterAxisAlignItems = "CENTER";
leftGroup.itemSpacing = 8;
leftGroup.fills = [];
toolbar.appendChild(leftGroup);
leftGroup.layoutSizingHorizontal = "HUG";
leftGroup.layoutSizingVertical = "HUG";

// 1. SearchInput
const searchComp = await figma.importComponentByKeyAsync("80f3bfa879cfaa191679e85fc992cf72ddfd090b");
const searchInst = searchComp.createInstance();
leftGroup.appendChild(searchInst);
searchInst.resize(264, 40);
const phText = searchInst.findOne(n => n.type === "TEXT" && n.characters === "Placeholder");
if (phText) phText.characters = "Search...";

// 2. Filter buttons (repeat per filter)
const filterComp = await figma.importComponentByKeyAsync("cd23ed933d5012834a7e5f35de20fa6200ddd558");
for (const { label } of [{ label: "Type" }, { label: "Category" }, { label: "Created by" }]) {
  const inst = filterComp.createInstance();
  leftGroup.appendChild(inst);
  inst.findAll(n => n.type === "TEXT").forEach(t => {
    if (t.fontSize === 10) t.characters = label;
    if (t.fontSize === 12) t.characters = "All";
  });
}

// 3. Primary CTA
const btnComp = await figma.importComponentByKeyAsync("86a13eae728be1ba4e64a6f5825e1ce9e40d84cd");
const btnInst = btnComp.createInstance();
toolbar.appendChild(btnInst);
const btnLabel = btnInst.findOne(n => n.type === "TEXT");
if (btnLabel) btnLabel.characters = "Add Agent";
```

**Data Cell: required property fixes after every instance creation:**
```js
// Without these, cells show doubled text / extra UI
cell.setProperties({
  "Show Description#3225:6": false,
  "User Name#10846:19": false,
});
// For Date cells — clear Time to get single-line display
cell.setProperties({ "Time#5950:76": "" });
```

**Table header row container: NO background fill**
The Column Header Cell component has no background itself. The row container frame wrapping all header cells must also have no fill — set `fills = []`. Never apply `bg.secondary` or any gray fill to the header row container. The header sits directly on the white page background.

## Color tokens — match the screenshot, never hardcode dark mode

⚠️ **Do NOT assume dark mode.** Inspect the `generate_figma_design` screenshot to determine whether the page is light or dark mode, then use the matching hex values below. Most Axiom Play product pages (CMS, CMP, Opal Agents, Web Experimentation) are **light mode**. Only Opal chat UI is dark.

**Light mode hex values:**

| Token | Light hex |
|---|---|
| bg.page | `#F9FAFC` |
| bg.default | `#FFFFFF` |
| bg.secondary | `#F5F6FA` |
| fg.default | `#2E3442` |
| fg.secondary | `#4F576E` |
| fg.tertiary | `#66708C` |
| border.default | `#CACFDC` |
| border.secondary | `#DADFEB` |
| border.tertiary | `#E9EDF5` |

**Dark mode hex values (only when screenshot confirms dark background):**

| Token | Dark hex |
|---|---|
| bg.page | `#171A23` |
| bg.default | `#1C2029` |
| bg.secondary | `#1C212B` |
| fg.default | `#F5F6FA` |
| fg.secondary | `#CACFDC` |
| fg.tertiary | `#838DA4` |
| border.default | `#66708C` |
| border.secondary | `#4F576E` |
| border.tertiary | `#2E3442` |

Full token table (all tokens, light + dark): `.claude/FIGMA_LIBRARY_V2.md`

## Icons — V2

Icon naming: `kebab-case` in Figma → `Icon` + PascalCase in React
e.g. `pen-to-square` → `IconPenToSquare`, `arrows-rotate` → `IconArrowsRotate`
Variants: base (regular), `-thin` (lighter stroke), `-solid` (filled)

## Icons — V3

V3 icons are individual component sets with `Active=False / Active=True` variants.
Full React→Figma name mapping + componentKeys: `.claude/FIGMA_LIBRARY_V3.md` (Icons section).

Key mappings: `IconXmark`→Close, `IconCode`→Code, `IconEye`→Preview, `IconArrowsRotate`→Refresh, `IconClockRotateLeft`→History, `IconUserGroup`→User Group, `IconChevronDown`→Chevron Down, `IconCopy`→Copy, `IconCircleCheck`→Check Circle, `IconShare`→Share, `IconSparkles`→Sparkles, `IconGear`→Settings, `IconPlus`→Add

**⚠️ `setProperties` INSTANCE_SWAP FAILS for remote components — always use `swapComponent`:**
```js
const iconSet = await figma.importComponentSetByKeyAsync("ICON_KEY");
const iconComp = iconSet.children.find(c => c.name === "Active=False") ?? iconSet.defaultVariant;

// Icon-only button: enable icon slot first
buttonInstance.setProperties({ "Icon Button": "True" });

// Button with trailing icon (e.g. "Add to ▾"): enable addon slot
for (const [key, def] of Object.entries(buttonInstance.componentProperties)) {
  if (key.includes("Addon after")) buttonInstance.setProperties({ [key]: "true" });
}

// Set label text (try component property first, then direct node override)
for (const [key, def] of Object.entries(buttonInstance.componentProperties)) {
  if (def.type === "TEXT") buttonInstance.setProperties({ [key]: "Button Label" });
}

// Swap icon — icon layer is "Icon" in Button, "grid-2 16" in ToggleButton
function findIconSlot(node) {
  if (node.type === "INSTANCE" && (node.name.includes("Icon") || node.name.includes("grid"))) return node;
  if ("children" in node) { for (const c of node.children) { const f = findIconSlot(c); if (f) return f; } }
  return null;
}
const slot = findIconSlot(buttonInstance);
if (slot) slot.swapComponent(iconComp);
```
**V3 Button size property values:** `"Sm - 24"`, `"Md - 32"` ← use this for toolbars, `"Lg - 40"`

---

## Dialog / Modal Layout Rules (apply whenever building modals)

**Reference component:** node `22090:1007264`, file `6FuwvRSw6NyFLRZQrwBMVS` — check this first for exact specs.

| Part | Rules |
|---|---|
| Outer frame | `layoutMode=VERTICAL`, `primaryAxisSizingMode=AUTO` (HUG height — **never fixed**), `counterAxisSizingMode=FIXED` (keep width), `cornerRadius=12` |
| DialogHeader | `HORIZONTAL`, `SPACE_BETWEEN`, pad 20/24, title **24px/Medium(500)**, close = real Button Subtle+Md+IconButton+xmark icon |
| Divider | **Only one** — between body and footer. **No divider between header and body.** 1px FILL, `border.default` fill |
| DialogBody | `VERTICAL`, pad 16/24, HUG height, FILL width |
| DialogFooter | `HORIZONTAL`, `primaryAxisAlignItems=MAX` (right-align), pad 20/24, gap=8, `counterAxisSizingMode=AUTO` (HUG height), `primaryAxisSizingMode=FIXED` (FILL width) |
| Footer buttons | `layoutSizingHorizontal=HUG`, `layoutSizingVertical=FIXED` at 40px — never squish |
| Icons | **Never use emoji/text glyphs** (⛓ ⓘ ✕). Always real Axiom icon instances via `importComponentSetByKeyAsync` |

---

## Step 1 — Pixel-perfect capture (BLOCKING — do this first)

Call `generate_figma_design` with `SOURCE_URL`. **Do NOT proceed to any other step until you have the screenshot.**

This rasterized capture is your **primary visual reference** — it overrides the text inventory whenever they conflict. Every section you build must be compared against it. If a built section doesn't match the capture, fix it before moving on.

**Screenshot vs inventory conflict rule:** When the screenshot shows something different from the inventory (e.g. link-style text tags vs. colored pill badges, actual icons vs. placeholder dots, a full top nav bar the inventory omitted), **always trust the screenshot**.

---

## Step 2 — Open / create file + variable discovery (run in PARALLEL)

**A) Open/create file:**
- Figma URL: extract fileKey, confirm with `get_metadata`. Note existing pages.
- "new": use `create_new_file`.

Add a new page named after the screen (e.g. "Opal – Landing").

**B) Variable discovery** — use `search_design_system` with `includeVariables: true` for: "background", "foreground", "border", "space", "radius". Record variable keys for semantic tokens (bg.default, fg.secondary, etc.) so fills can be bound to variables rather than hardcoded hex.

---

## Step 3 — Create root wrapper frame + Top Nav Bar

⚠️ **The wrapper must be VERTICAL, not HORIZONTAL.** The top nav bar spans full page width — it sits ABOVE the sidebar, not beside it:

```
Wrapper (VERTICAL, 1440×900)
  ├── Top Nav Bar   (HORIZONTAL, FILL width, 48px)  ← custom frame, exact spec below
  └── Body Row      (HORIZONTAL, FILL width, FILL height)
       ├── Sidenav Base   (56px wide, FILL height)
       └── Content Area   (FILL width, FILL height, VERTICAL)
```

**Sidenav Base** — goes inside the Body Row, NOT at wrapper root.

### ⚠️ Top Nav Bar — EXACT SPEC (follow precisely, no shortcuts)

The top nav is a **custom frame** — never use plain text nodes for any nav element. Every element is mandatory.

**Frame:** `name="Top Nav"`, HORIZONTAL, **48px height**, `bg.default` (#FFFFFF) fill, 1px stroke-bottom `border.tertiary` (#E9EDF5), `paddingLeft=8 paddingRight=16`, `primaryAxisAlignItems=SPACE_BETWEEN`, `counterAxisAlignItems=CENTER`.

⚠️ **CRITICAL — set FILL width in this exact order:**
```js
topNav.layoutMode = "HORIZONTAL";
topNav.primaryAxisSizingMode = "FIXED";   // must be FIXED, not AUTO
topNav.counterAxisSizingMode = "FIXED";
topNav.resize(1440, 48);                  // set explicit size FIRST
wrapper.appendChild(topNav);              // append BEFORE setting FILL
topNav.layoutSizingHorizontal = "FILL";  // FILL only works after appending
```
If you skip `resize(1440, 48)` before appending, the nav collapses to HUG width (~439px) and never fills.

**Left cluster** (HORIZONTAL frame, `gap=8`, CENTER align, HUG both axes):

1. **Logo mark** — 32×32 frame, `cornerRadius=8`, no children text — gradient fill:
   ```js
   await figma.loadFontAsync({ family: "Inter", style: "Bold" });
   const logoFrame = figma.createFrame();
   logoFrame.name = "Logo";
   logoFrame.resize(32, 32);
   logoFrame.cornerRadius = 8;
   logoFrame.fills = [{
     type: 'GRADIENT_LINEAR',
     gradientTransform: [[0, 1, 0], [-1, 0, 1]],
     gradientStops: [
       { position: 0, color: { r: 0.38, g: 0.40, b: 0.95, a: 1 } },
       { position: 1, color: { r: 0.18, g: 0.51, b: 0.96, a: 1 } },
     ]
   }];
   // White "O" centred inside
   const logoText = figma.createText();
   logoText.characters = "O";
   logoText.fontSize = 18;
   logoText.fontName = { family: "Inter", style: "Bold" };
   logoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
   logoFrame.appendChild(logoText);
   logoText.x = (32 - logoText.width) / 2;
   logoText.y = (32 - logoText.height) / 2;
   ```

2. **"Stride" dropdown chip** — HORIZONTAL frame, `paddingLeft=8 paddingRight=8 paddingTop=4 paddingBottom=4 itemSpacing=6 cornerRadius=6`, `fills=[]`, CENTER align:
   - Text node "Stride": Inter 14px Medium (#2E3442)
   - Chevron: `importComponentByKeyAsync("8dc5a493b96d8e97df1b1ae487cb5a18d2f28c25")` → `createInstance()`, color `#66708C`

3. **"Opal" dropdown chip** — identical structure, text "Opal"

**Spacer** between left and right clusters: `figma.createFrame()`, `fills=[]`, `layoutSizingHorizontal=FILL` (set after appending to nav).

**Right cluster** (HORIZONTAL frame, `gap=4`, CENTER align, HUG both axes) — left to right:

1. **"System" button** — Button instance (key `3296fc4820c3d0194d963b89c435b3e5b4dcc0ea`), Appearance=Subtle, Size=sm, set label text property to "System".

2. **Opal orb** — 28×28 frame, `cornerRadius=14` (full circle):
   ```js
   orb.fills = [{
     type: 'GRADIENT_RADIAL',
     gradientTransform: [[0.8, 0, 0.1], [0, 0.8, 0.1]],
     gradientStops: [
       { position: 0,   color: { r: 0.82, g: 0.65, b: 1.0,  a: 1 } },
       { position: 0.5, color: { r: 0.47, g: 0.58, b: 0.98, a: 1 } },
       { position: 1,   color: { r: 0.29, g: 0.56, b: 0.95, a: 1 } },
     ]
   }];
   ```

3–7. **Icon-only buttons** (Subtle md, `"Icon Button"="True"`, icon via `swapComponent`):

| # | Icon | componentKey |
|---|---|---|
| 3 | Search | `bc585dfd171e7301a658a5fc09f90bd136f9fb51` |
| 4 | Notifications | `1de5afa669027f45f28ce446bfb2aa8207855084` |
| 5 | Help | `d733ad5214f664970008b9cf2b03ae767eeeb713` |
| 6 | Code | `ff36366d7fa96e047996d8f9e0f3860b6002d47b` |
| 7 | User | `f286b22126c5b4145fb34e63b4dedf6c9f075f35` |

```js
// Reusable icon-button factory — import ONCE, call per icon
const btnSet = await figma.importComponentSetByKeyAsync("3296fc4820c3d0194d963b89c435b3e5b4dcc0ea");
const subtleMd = btnSet.children.find(c => {
  const p = Object.fromEntries(c.name.split(', ').map(x => x.split('=')));
  return p["Appearance"] === "Subtle" && p["Size"] === "md";
}) ?? btnSet.defaultVariant;

async function makeIconBtn(iconKey, parent) {
  const btn = subtleMd.createInstance();
  btn.setProperties({ "Icon Button": "True" });
  const icon = await figma.importComponentByKeyAsync(iconKey);
  function findSlot(n) {
    if (n.type === "INSTANCE" && n.name === "Icon") return n;
    if ("children" in n) for (const c of n.children) { const r = findSlot(c); if (r) return r; }
    return null;
  }
  findSlot(btn)?.swapComponent(icon);
  parent.appendChild(btn);
  btn.layoutSizingHorizontal = "HUG";
}
```

### ✅ Top Nav self-check (screenshot after building, fix before proceeding)

Verify ALL present in the screenshot:
- [ ] Gradient blue/purple "O" logo mark (NOT plain "optimizely" text)
- [ ] "Stride" chip with chevron — **separate** from "Opal"
- [ ] "Opal" chip with chevron — **separate** from "Stride"
- [ ] "System" button label visible
- [ ] Opal orb gradient circle
- [ ] 5 icon buttons (search, bell, question, code, user)

### Wrapper scaffold

```js
let maxX = 0;
for (const child of figma.currentPage.children) {
  maxX = Math.max(maxX, child.x + child.width);
}
const wrapper = figma.createFrame();
wrapper.name = "Screen Name";
wrapper.layoutMode = "VERTICAL";
wrapper.resize(1440, 900);
wrapper.itemSpacing = 0;
wrapper.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }]; // bg.page
wrapper.x = maxX + 200;
wrapper.y = 0;

const bodyRow = figma.createFrame();
bodyRow.name = "Body";
bodyRow.layoutMode = "HORIZONTAL";
bodyRow.itemSpacing = 0;
bodyRow.fills = [];
wrapper.appendChild(bodyRow);
bodyRow.layoutSizingHorizontal = "FILL";
bodyRow.layoutSizingVertical = "FILL";

return { wrapperId: wrapper.id, bodyRowId: bodyRow.id };
```

---

## Step 4 — Build sections with real component instances

Build one section per `use_figma` call. Fetch wrapper by ID at the start of each call.

### How to insert a real library component instance (Plugin API)

```js
// Import by componentKey from the Axiom V2 library
const buttonSet = await figma.importComponentSetByKeyAsync("3296fc4820c3d0194d963b89c435b3e5b4dcc0ea");

// Find the right variant — parse the variant name string
const variant = buttonSet.children.find(c => {
  const props = Object.fromEntries(c.name.split(', ').map(p => p.split('=')));
  return props["Appearance"] === "Subtle" && props["Size"] === "sm";
}) ?? buttonSet.defaultVariant;

const instance = variant.createInstance();
parentFrame.appendChild(instance);
instance.layoutSizingHorizontal = "HUG"; // set AFTER appending

// Override text via component properties
const propDefs = instance.componentProperties;
for (const [key, def] of Object.entries(propDefs)) {
  if (def.type === "TEXT") instance.setProperties({ [key]: "Button label" });
}
```

### How to bind design system color variables

```js
const bgVar = await figma.variables.importVariableByKeyAsync("VAR_KEY");
const paint = figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', bgVar
);
frame.fills = [paint];
```

### How to apply text styles

```js
const style = await figma.importStyleByKeyAsync("TEXT_STYLE_KEY");
textNode.textStyleId = style.id;
```

### Layout rules
- Set `layoutSizingHorizontal` / `layoutSizingVertical` **after** appending to parent
- Use `primaryAxisSizingMode = "HUG"` for containers that should wrap content
- Use the `generate_figma_design` capture as the visual reference for proportions

For each section:
1. Create section frame (layoutMode, padding, gap, bg fill bound to variable)
2. Import and instantiate every mapped component by key
3. Set variant properties + text overrides
4. Append to wrapper
5. `get_screenshot` the section — fix issues before next section

---

## Step 5 — Transfer images (if Has Images = yes)

From the `generate_figma_design` capture:
1. Find nodes with `fill.type === "IMAGE"` — collect `imageHash` values
2. Match to corresponding frames in your output by name/position
3. Apply: `frame.fills = [{ type: "IMAGE", imageHash: hash, scaleMode: "FILL" }]`
4. Delete the capture node

---

## Step 6 — Pre-delivery audit (MANDATORY — fix before reporting)

Before taking the final screenshot, run this audit on every frame built. Fix any failure before proceeding.

### Audit checklist

**A. Real components — no custom approximations for these:**
- [ ] Every banner / alert uses a real `Alert` component instance (key `fd2f5d933b6b697eb909b769b17b71f86c0a61cf`) — never a custom Box with a colored fill
- [ ] Every sidebar shell uses `Sidenav Base` (`95186ccb...`) — never a custom frame
- [ ] Every table cell uses `Column Header Cell` / `Data Cell` — never plain text in a rectangle
- [ ] Every toolbar search box uses the `Search` component — never a plain Input or text field

**B. Color tokens — bound to the correct library version:**
- [ ] No node has a raw unbound hex fill (e.g. `#eff6ff`, `#ede9fe`, `#3b82f6`, `#16a34a`)
- [ ] All fills bound to variables use the **correct library for the selected Axiom version**:
  - **V2** → variables must come from **Foundations V2** (collection in fileKey `JYy51au6YaA4QZKpQy1ZRg`). When calling `search_design_system`, always pass `fileKey: "JYy51au6YaA4QZKpQy1ZRg"`. After importing, verify the variable's `variableCollectionId` belongs to this file — reject any variable from the V3 library (`qs72V79n1s9wYOcZ1TzBwM`) or any other library.
  - **V3** → variables must come from the V3 foundation library (`qs72V79n1s9wYOcZ1TzBwM`).
- [ ] Tokens to check: `bg.default`, `bg.secondary`, `bg.page`, `fg.default`, `fg.secondary`, `fg.tertiary`, `border.default`, `border.secondary`, intent tokens (`bg.success.subtle`, `fg.information.default`, etc.)
- ⚠️ **Never mix V2 and V3 variable bindings in the same frame.** If a wrong-library binding is found, re-import the equivalent token from the correct library and rebind.

**C. Spacing — matches spec:**
- [ ] DialogHeader: `paddingLeft=24, paddingRight=16, paddingTop=20, paddingBottom=20`
- [ ] DialogBody: `paddingLeft=24, paddingRight=24, paddingTop=16, paddingBottom=16`, `itemSpacing=16`
- [ ] DialogFooter: `paddingLeft=24, paddingRight=20, paddingTop=16, paddingBottom=16`, `gap=8`
- [ ] Toolbar height = 40px, no extra padding
- [ ] Body section gaps use 16px (major sections) or 8px (within a section)

### How to audit in Plugin API

```js
// Check for hardcoded hex fills on any node
function auditFills(node, path = "") {
  const issues = [];
  if ("fills" in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.type === "SOLID" && !fill.boundVariables?.color) {
        const { r, g, b } = fill.color;
        issues.push({ path: path + "/" + node.name, hex: `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})` });
      }
    }
  }
  if ("children" in node) {
    for (const child of node.children) {
      issues.push(...auditFills(child, path + "/" + node.name));
    }
  }
  return issues;
}
return auditFills(figma.currentPage.selection[0] ?? figma.currentPage);
```

Fix every issue found before taking the final screenshot.

## Step 7 — Visual fidelity comparison (MANDATORY — default behaviour)

⚠️ **Default:** compare the built Figma output against the source to catch divergences. Only skip or flip this to "suggest improvements" if the user explicitly asks to improve on the source.

1. Take a `get_screenshot` of every built frame.
2. Take a `generate_figma_design` capture of the source page/URL (the same one used in Step 1).
3. Compare them side-by-side mentally. For each built frame, identify any element that differs from the source:
   - Wrong text content (label, placeholder, copy)
   - Missing element (icon, section, badge, row)
   - Extra element not in the source
   - Wrong colour, size, or shape
   - Wrong layout direction or alignment
   - Wrong component used (e.g. Toggle Button where a regular Button appears in source)
4. Fix every divergence found. The goal is **pixel-faithful reproduction**, not improvement.
5. After fixes, re-screenshot and confirm all frames match the source before reporting.

**Fidelity rule:** If the source has a bug or awkward spacing, reproduce it faithfully. Do not silently "improve" it — the user can ask for improvements separately.

## Step 8 — Final screenshot and report

`get_screenshot` on the full wrapper frame. Return:
- Figma frame URL
- Screenshot
- Audit result: PASS or list of remaining issues
- Fidelity: list any intentional divergences from source (should be none unless user asked for improvements)

