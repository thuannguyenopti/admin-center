<<<<<<< HEAD
# Axiom V3 Design System Reference

> **⚠️ EXPERIMENTAL — ACTIVE DEVELOPMENT**
> The V3 library has real component keys and is usable. All known core components are available. Custom fonts (`VC Nudge`, `Die Grotesk B`) may not be available in all Figma teams — fall back to Inter if needed.
>
> **Figma file:** `https://www.figma.com/design/qs72V79n1s9wYOcZ1TzBwM/Axiom-Design-System`
> **File key:** `qs72V79n1s9wYOcZ1TzBwM`

---

## Brand Identity

V3 introduces a bold green-forward brand palette, replacing the blue-toned V2 scheme.

| Token | Value | Notes |
|---|---|---|
| `Colors/Brand/500 (LFGreen)` | `#abff44` | Primary accent — lime/electric green |
| `Colors/Brand/900 (Mid Fir)` | `#123810` | Deep forest green |

> **Opal-specific gradients** (including the V3 rebrand background gradient) are documented in [`OPAL_DESIGN_SYSTEM.md`](../OPAL_DESIGN_SYSTEM.md) → Gradient tokens.

---

## Color Tokens

V3 uses a **light mode only** palette (no dark mode tokens yet). CSS variables use slash-paths: `var(--colors/fg/default)`.

### Foreground

| Token | Hex | Usage |
|---|---|---|
| `colors/fg/default` | `#202320` | Primary text, icons |
| `colors/fg/secondary` | `#484e46` | Secondary text, nav items (inactive) |
| `colors/fg/tertiary` | `#616755` | Tertiary text, section labels |
| `colors/fg/placeholder` | `#717863` | Input placeholder text |
| `colors/fg/dark` | `#202320` | Same as default — explicit dark override |
| `colors/fg/default-inverse` | `#ffffff` | Text on dark/accent backgrounds |

### Background

| Token | Hex | Usage |
|---|---|---|
| `colors/bg/page bg` | `#f9fcf8` | Page canvas / content area background |
| `colors/bg/default` | `#ffffff` | Card, panel, sidenav backgrounds |
| `colors/bg/secondary` | `#eff5eb` | Active nav item, subtle fills |
| `colors/bg/default/inverse` | `#252825` | Dark inverse panels |
| `colors/bg/accent/base` | `#abff44` | CTA buttons, accented elements (brand green) |
| `colors/bg/states/default-hover` | `#5f931f14` | Hover state overlay (8% opacity green) |
| `colors/bg/states/default-selected` | `#5e8b2729` | Selected state overlay (16% opacity green) |

### Border

| Token | Hex | Usage |
|---|---|---|
| `colors/border/default` | `#d8e4cb` | Default borders, dividers |
| `colors/border/secondary` | `#e4f0da` | Subtle borders — table, subnav left rail |

### Feedback

| Token | Hex | Usage |
|---|---|---|
| `colors/fg/feedback/success-strong` | `#226b1e` | Success text, icons |
| `colors/fg/feedback/warning-strong` | `#b54707` | Warning text, icons |
| `colors/fg/feedback/error-strong` | `#5d2e41` | Error text, icons |
| `colors/bg/feedback/success-subtle` | `#eeffd9` | Success alert background |
| `colors/bg/feedback/warning-subtle` | `#fef1c6` | Warning alert background |
| `colors/bg/feedback/error-subtle` | `#ffdfe8` | Error alert background |

---

## Typography

### Font Families

| Role | Family | Usage |
|---|---|---|
| Body / UI | `Die Grotesk B` | All product UI text, nav, labels |
| Caption / Code | `Roboto Mono` | Section labels (uppercase), code, metadata |
| Headings | `VC Nudge` | Page-level H1 headings only |

### Font Sizes

| Token | Value |
|---|---|
| `font-size/font-size-200` | 12px |
| `font-size/font-size-300` | 14px |
| `font-size/font-size-400` | 16px |
| `h1/h1-font-size` | 50px |

### Font Weights

| Token | Value |
|---|---|
| `font-weight/weight-regular` | 400 |
| `font-weight/weight-medium` | 500 |
| `font-weight/weight-semibold` | 600 |
| `h1/h1-font-weight` | 800 |

### Text Styles

| Style name | Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `Body/Large/Medium` | Die Grotesk B | 16px | 500 | 1.5 (24px) | 0.32px |
| `Body/Large/Bold` | Die Grotesk B | 16px | 600 | 1.5 (24px) | 0.32px |
| `Body/Medium/Medium` | Die Grotesk B | 14px | 500 | 1.43 (20px) | 0.28px |
| `Body/Medium/Regular` | Die Grotesk B | 14px | 400 | 1.43 (20px) | 0.28px |
| `Body/Small/Regular` | Die Grotesk B | 12px | 400 | 1.33 (16px) | 0.24px |
| `Caption/Regular` | Roboto Mono | 12px | 400 | 1.25 (15px) | 0.36px — **always uppercase** |
| `Header/Heading 1` | VC Nudge | 50px | 800 | 1.04 (52px) | 0.5px |

> **Note on letter spacing:** Figma stores letter spacing as `2` (em × 0.01 scale) = 0.02em. Converted to px at each size: 12px → 0.24px, 14px → 0.28px, 16px → 0.32px.

---

## Spacing Tokens

Valid V3 spacing values. Use only these — no arbitrary px values.

| Token | Value |
|---|---|
| `spacing/spacing-0` | 0 |
| `spacing/spacing-2` | 2px |
| `spacing/spacing-4` | 4px |
| `spacing/spacing-6` | 6px |
| `spacing/spacing-8` | 8px |
| `spacing/spacing-12` | 12px |
| `spacing/spacing-16` | 16px |
| `spacing/spacing-20` | 20px |
| `spacing/spacing-24` | 24px |

CSS var pattern: `var(--spacing/spacing-8, 8px)`

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius/radius-sm` | 8px | Nav items, subnav rows, inputs |
| `radius/radius-md` | 12px | Cards, page content area, table |
| `radius/radius-full` | 999px | Pills, badges, avatar circles |
| `radius/radius-xl` | 32px | Large rounded surfaces |

CSS var pattern: `var(--radius/radius-sm, 8px)`

---

## Size Tokens (Component Heights)

| Token | Value | Usage |
|---|---|---|
| `size/sm` | 24px | Small controls |
| `size/lg` | 40px | Standard interactive height — nav items, inputs |
| `size/xl` | 48px | Large buttons, primary inputs |

---

## Layout Constants

These are Figma variables used directly in layout frames — use as reference for spacing when building screens.

| Token | Value | Notes |
|---|---|---|
| `SUB_NAV_WIDTH` | 272px | Secondary nav panel width |
| `MENU_ITEMS_GAP` | 4px | Gap between nav items in a list |
| `PAGE_HEADING_SPACE` | 24px | Gap between page title and content |
| `page_horizontal_padding` | 32px | Left/right padding inside page content area |
| `page_vertical_padding_sm` | 24px | Top padding inside page content area |
| `table/radius` | 16px | Outer border radius on tables |
| `table/border` | `#e4f0da` | = `colors/border/secondary` |

---

## Layout Patterns (from Figma screens)

### Shell Structure

```
┌─────────────────────────────────────────────────────────┐
│ Global Bar — 86px, bg/default (#fff), border-b          │
├──────┬───────────────┬────────────────────────────────── │
│ Side │  Sub Nav      │  Page Content                     │
│ nav  │  272px        │  flex-1                           │
│ 56px │  border-l     │  bg/page-bg (#f9fcf8)             │
│      │  secondary    │  rounded-md (12px)                │
│      │               │  px-32 pt-24 pb-32                │
└──────┴───────────────┴───────────────────────────────────┘
```

### Global Bar
- Height: 86px, `bg/default` (#fff)
- Left: Optimizely logo + product switcher `<Menu>` trigger
- Right: "Ask Opal" `<Button appearance="primary">` (brand green), icon buttons with `<Tooltip>`, `<Avatar>` profile
- Ask Opal button uses `colors/bg/accent/base` (#abff44) fill

### Sidenav (collapsed)
- Width: 56px, `bg/default` (#fff)
- Padding: `py-24 px-8`
- Contains icon-only `<NavItem>` items, gap-4 between items
- Active item: `bg/secondary` fill (#eff5eb)
- Each item: 40×40px, `radius-sm` (8px), centered icon

### Sub Nav
- Width: 272px, `bg/default` (#fff)
- `border-l` using `colors/border/secondary` (#e4f0da)
- Padding: `px-12 py-12`, inner item gap: 4px

**Section label** (category headers):
```
Caption/Regular — Roboto Mono 12px, fg/tertiary (#616755), uppercase
padding: pt-12 px-12, gap-12
```

**Nav item** (inactive):
```
height: 40px
padding: px-12 py-8
gap: 12px
border-radius: radius-sm (8px)
text: Body/Medium/Medium — 14px/500, fg/secondary (#484e46)
```

**Nav item** (active/selected):
```
background: colors/bg/secondary (#eff5eb)
text: Body/Medium/Medium — 14px/500, fg/default (#202320)
```

### Page Content Area
- Background: `colors/bg/page bg` (#f9fcf8)
- Border radius: `radius-md` (12px)
- Padding: `px-32 pt-24 pb-32`
- Page title gap from content: 24px (`PAGE_HEADING_SPACE`)
- Page title: `Header/Heading 1` — VC Nudge 50px/800
- Page description: `Body/Large/Medium` — 16px/500, fg/default

### Table
- Background: `colors/bg/default` (#fff)
- Border: 1px solid `colors/border/secondary` (#e4f0da)
- Outer radius: 16px (`table/radius`)

---

## Components

**Library fileKey:** `qs72V79n1s9wYOcZ1TzBwM`
**Library name:** Axiom Design System

Import pattern (same as V2):
```js
const set = await figma.importComponentSetByKeyAsync("COMPONENT_KEY");
const variant = set.children.find(c => { ... }) ?? set.defaultVariant;
const instance = variant.createInstance();
```

### Component Keys

| Component | componentKey | Type | Notes |
|---|---|---|---|
| **Button** | `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` | component_set | Appearances incl. Primary (#abff44 accent fill) — see Opal note below |
| **Toggle Button** | `6515d66781a16aa9046b018f90dba6276472a513` | component_set | — |
| **Add Button** | `4c52744eec83189c194e8a77d14afb3476217241` | component_set | — |
| **Menu Label Button** | `bed4de19dc3b95439bd0beba3f4a69599ff8eaef` | component_set | Filter trigger w/ label + value |
| **Badge** | `f0a4e90b5415081932a85616bb0dd63dff0ce59b` | component_set | Intents: success / warning / error / neutral |
| **Avatar** | `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9` | component_set | Sizes: 2xs / xs / sm / md / lg / xl |
| **Avatar Group** | `900c960f0ac18a0f87697af2d1d0495d8a5e4a70` | component | — |
| **Input** | `4decd7bcfd6acb679e05999045cc21f50f6561d8` | component_set | Sizes: md / lg / xl; States: Default / Focused / Disabled / Error |
| **Input (bare)** | `95fb058070232fe97e3c93406816c34da9da444f` | component_set | Without field wrapper label |
| **Select Trigger** | `a0442613a565bfab17cd742e6e19e2932785fb4e` | component | — |
| **Tooltip** | `e6203be6017513bd06278ed5acfa83d2ec5da321` | component_set | Sides: Top / Bottom / Left / Right |
| **Help Tooltip** | `becff2a9f29ac15ded0de4781616a68e923758f1` | component_set | Icon + tooltip combined |
| **Data Cell** | `827bab63db023b922abd275f6aa5229f569c4025` | component_set | Table cell types |
| **Column Header Cell** | `d4416d3609964db7a339c7db203f239e462209d8` | component_set | Variant: Text / Numeric / Select All; Hover: true/false |
| **Alert / Block Element** | `6eca0a48e68722063fd508cfda45babfe98dd384` | component_set | Inline alerts; intents: success / warning / error / info |
| **AlertDialog** | `a04de88e011a0d98ce47128088e9d5f72cab1538` | component_set | Modal confirmation dialogs |
| **SubNav** | `66b582356d3aef035f5fcb662e41afda913132f2` | component | Full secondary nav panel |
| **SubNav Back Button** | `2ada666c1f87254404a097d88d0c43dcf952e579` | component | Back nav item |
| **Sidenav Base** | `d902d4aacc11620d63b083878aee026015c5b135` | component_set | Full sidenav shell |
| **Sidenav item (FA icon)** | `2a9c06ac3c1926fbbe2ad8dd0b0d5badab3fb984` | component_set | Icon-only collapsed nav item |
| **Search** | `f8968d7e1f8982a3cb26a26e321cf7c55667a28f` | component_set | Sizes: Large-40 / Medium-32; States: Default / Hover / Focus / Disabled |
| **Text Area** | `2b85f724a64f912bf6049610bdfe47350b12172a` | component_set | States: Default / Hover / Focus / Error / Disabled / Read-only |
| **Checkbox** | `1b51f2a59548085582454116eecc3835d2d5dbc0` | component_set | Checked: off/on; State: Default/Hover/Focus/Disabled; Indeterminate: true/false |
| **Spinner** | `7b7af13ed805bcff4a0401591b07e86f347e1808` | component_set | Sizes: 2xs-16 / sm-24 / md-32 / xl-48; Variant: Default / Invert |
| **Radio Group** | `74a235a38f52e0d51db20c40a0913b791be0b179` | component_set | — |
| **Listitem/Multiselect** | `33931e3f2c022d7fdea60a3d1e730a4f9ae8473a` | component_set | Menu list item with checkbox |
| **Listitem/Footer** | `b59522e9bb7a1cf4b55ef9fd2f22d8cec15ec09c` | component | — |
| **Listitem/Group header** | `b5c30cac14154cea4a33bcc1c501829c64816fd0` | component | Section label row in listbox |
| **Listbox/Loading** | `768ed92ee82f45c0bb43b524a589ab500172e923` | component | Loading state for dropdowns |
| **Listbox/Autocomplete** | `57d4b8c5da2a7e2be4c99213f866c08e6d8fcea7` | component_set | Experimental |

### Not yet in V3

All core components are now available. No known missing components.

### Button — Opal usage rule

> **⚠️ Any button style that invokes an AI feature** (e.g. "Ask Opal", "Generate", "Summarize") should use the **Opal button treatment** (violet `#7c3aed` fill, or the dedicated Opal Button component from the Opal Components library `GH25lYLDM34molSm1yhQO3`).
>
> Use standard V3 appearances (`Primary` = lime green `#abff44`, `Default`, `Subtle`) for all **non-AI actions** — toolbar actions, navigation, sharing, file management, etc.
>
> **Quick rule:** If the button triggers an AI call → Opal style. If it doesn't → standard Axiom.

---

## Icons

V3 icons are **individual component sets** in the library — each icon has `Active=False` and `Active=True` variants. They are separate from V2's FontAwesome-based icons.

**Library fileKey:** `qs72V79n1s9wYOcZ1TzBwM`

### React → V3 Figma icon mapping

| React icon (`@optimizely/axiom-icons`) | V3 Figma name | componentKey |
|---|---|---|
| `IconPlus` / `IconAdd` | Add | `e2575b66fb8cecf2406833db7b9069d1656e4df6` |
| `IconAgent` | Agent | `8ed0147dc31f091f0d7d83f50e6dd12eecdd36ff` |
| `IconArrowDown` | Arrow Down | `e0ac295179da632c998199272d8707bfcf27cb69` |
| `IconArrowUp` | Arrow Up | `838b747d59f89875d511c60dac7a05468d427a3c` |
| `IconArrowUpCircle` | Arrow Up Circle | `db0fc1a808f410c79d0cfa7ca0ed0f779bbc3a9d` |
| `IconCircleCheck` / `IconCheckCircle` | Check Circle | `0b9ee2e7d8dfc1671869fda9897cd988eb0f2716` |
| `IconChevronDown` | Chevron Down | `09cc2cdd78f21507b338db6fe04a50a71a2eda73` |
| `IconXmark` / `IconClose` | Close | `94021c35dea93d114eb2b1c081fecebc71c44c86` |
| `IconCode` | Code | `7612509b44a90d1ae0b1e26be8747b83388d7f16` |
| `IconCopy` | Copy | `4b7758aff2e3c54c11924920c53982fa456645d4` |
| `IconTrashCan` / `IconDelete` | Delete | `0c46fc3bac9527aaa62f5f1d0092ab5d2bfcc54b` |
| `IconDownload` | Download | `213ac8382e332a0bba5f486af1ae588c5edecce0` |
| `IconPenToSquare` / `IconEdit` | Edit | `6ec61b7081745df8ae579a4378f95e6dc2df1a48` |
| `IconEdit` (square variant) | Edit Square | `7c3186aae1f7e50103f350d02948b4f4d5072371` |
| `IconFloppyDisk` | Edit File | `d012f0b9c721146b231fa82ffd2eb28628d607f7` |
| `IconArrowUpRightFromSquare` | External | `7d919b62e7ebe0569038b51961fdc6bafa4b7fa0` |
| `IconClockRotateLeft` / `IconHistory` | History | `d97e050a623235552bb76086c035639a0984f00b` |
| `IconLink` | Link | `5c0af0d7caec43a4f986a68bb32ef4a1d0b23879` |
| `IconEllipsis` / `IconDotsH` | More | `9772d026ef2cddf9714f976244336d90028111d8` |
| `IconEye` | Preview | `5b5f1e2b22d768cd7ef6484b751a4384e097705b` |
| `IconEyeSlash` | Preview Off | `abc864907692b7ae3ae5fd0f2b62af01dedfed0e` |
| `IconArrowsRotate` / `IconRefresh` | Refresh | `2e5a2a9b61e4e6b34e8f44603e0e4f3cc513ca9d` |
| `IconGear` | Settings | `2b2d1ec2379eeb081f438b3b897682cfc7726d59` |
| `IconShare` / `IconShareNodes` | Share | `5e41df41b7547fdc35efef58e30dc8933d6d36be` |
| `IconSparkles` | Sparkles | `f220eb64ed0effd1b315605cad9ea58c988419f0` |
| `IconStar` | Star | `0db37def1d5c5b8ef2b2b27039615da8e010c698` |
| `IconThumbsUp` / `IconThumbsDown` | Thumbs | `8e60b39e782248160cd4a9539aa712209b2de124` |
| `IconUserCheck` | User Check | `772629c6c9977761e4469de86ba1c3af3d0414b9` |
| `IconUserGroup` / `IconUsers` | User Group | `636bcbf1850ad7564ea3ec3b237a99d277a8a3d8` |

> **Finding more icons:** All icons from the full list (360 Degree, Account, Analytics, Calendar, Campaign, Chart, Dashboard, Filter, Flag, Globe, Image, Notification, Search, Send, etc.) are published in the library. Use `search_design_system` with the icon name to get its componentKey.

### How to inject an icon into a V3 Button (Plugin API)

> ⚠️ **`setProperties` with INSTANCE_SWAP does NOT work for remotely-imported components.** Figma rejects remote component node IDs with "Value for instance swap component property is invalid". Use `swapComponent` on the nested icon instance instead.

**Working pattern — `swapComponent` on nested icon child:**

```js
// 1. Import icon and get Active=False variant (a ComponentNode, not an instance)
const iconSet = await figma.importComponentSetByKeyAsync("ICON_COMPONENT_KEY");
const iconComp = iconSet.children.find(c => c.name === "Active=False")
  ?? iconSet.defaultVariant;

// 2. Create button instance
const buttonSet = await figma.importComponentSetByKeyAsync("8bb2661a46f1bb6c35f928e12b5ac0b950eda634");
const buttonVariant = buttonSet.children.find(c => {
  const props = Object.fromEntries(c.name.split(', ').map(p => p.split('=')));
  return props["Appearance"] === "Subtle" && props["Size"] === "sm";
}) ?? buttonSet.defaultVariant;
const buttonInstance = buttonVariant.createInstance();
parentFrame.appendChild(buttonInstance);

// 3. For Button: enable icon slot first via variant property
buttonInstance.setProperties({ "Icon Button": "True" }); // VARIANT property — works fine

// 4. Traverse children to find the nested icon INSTANCE node, then swap
function findInstanceByName(node, names) {
  if (node.type === "INSTANCE" && names.some(n => node.name.includes(n))) return node;
  if ("children" in node) {
    for (const child of node.children) {
      const found = findInstanceByName(child, names);
      if (found) return found;
    }
  }
  return null;
}

// Button icon layer is named "Icon"; ToggleButton may also be named "grid-2 16" or similar
const iconSlot = findInstanceByName(buttonInstance, ["Icon", "grid-2"]);
if (iconSlot) {
  iconSlot.swapComponent(iconComp); // pass the ComponentNode, not an instance
}
```

**Key rules:**
- Always call `swapComponent(componentNode)` — pass the ComponentNode (child of ComponentSet), never an InstanceNode
- **Icon-only Button** (no label): set `"Icon Button": "True"` via `setProperties` before traversing
- **Button with trailing icon** (e.g. "Add to ▾"): set `"Addon after#..."` boolean to `true` — iterate componentProperties and find the key containing `"Addon after"`, set it to `"true"`. Then swap the icon in the addon slot.
- **Button label text**: iterate componentProperties for `type === "TEXT"` and set. If the text node doesn't update via component property, directly set `textNode.characters` on the child text node.
- V3 Button size property values: `"Sm - 24"` (24px), `"Md - 32"` (32px), `"Lg - 40"` (40px) — use `"Md - 32"` for toolbar buttons
- Icon layer name varies: `"Icon"` in Button, `"grid-2 16"` or similar in ToggleButton — search for both with `includes("Icon") || includes("grid")`
- `Active=False` is the default/resting state (use `Active=True` for active/highlighted icons)

---

## CSS Variable Naming Convention

V3 uses forward-slash paths in CSS custom properties (different from V2's dot-notation tokens):

| V2 token (React prop) | V3 CSS variable |
|---|---|
| `fg.default` | `--colors/fg/default` |
| `bg.secondary` | `--colors/bg/secondary` |
| `border.default` | `--colors/border/default` |
| spacing `"8"` | `--spacing/spacing-8` |
| radius `"sm"` | `--radius/radius-sm` |

When applying fills via Plugin API, use hex values directly from the token table above until variable binding is available.

---

## Key Differences from V2

| | V2 | V3 |
|---|---|---|
| Brand color | Blue (`#5557f5`) | Lime green (`#abff44`) |
| Font (body) | System / Inter | Die Grotesk B |
| Font (headings) | — | VC Nudge |
| Dark mode | Full support | Not yet defined |
| Token naming | `fg.default` (dot) | `colors/fg/default` (slash) |
| Page bg | `bg.page` (`#F8F8FB`) | `colors/bg/page bg` (`#f9fcf8`) |
| Sidenav width | 56px | 56px (same) |
| SubNav width | 272px | 272px (same) |
| Component keys | ✓ Documented | ⚠️ In progress |
=======
# Axiom V3 Figma Library Reference

**Purpose:** Authoritative reference for every Figma build agent. Missing keys = wrong output. Always use this file before writing any Figma design code. If a component is not listed here, run `search_design_system` at build time before guessing.

**V3 library fileKey:** `qs72V79n1s9wYOcZ1TzBwM`

---

## Library Keys

| Library | libraryKey |
|---------|-----------|
| Axiom Design System (V3, canonical) | `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7` |
| Axiom Icons | `lk-672f9e4dbac68525814765e8d1b6dfb951c67ecbb58a69f2a57a4b640ec35379558b8110c14682d16409ec6860c173101bd3e4de993e548974f8d8159c613396` |
| Opal Components | `lk-54eb86eabc82c421a6439074f1b99c0fe5d884475ee59279d0120989bdc9b03376fdbaa7a278c1178668776eee2f37e5b855d9ab2070fa93cf9c212b42f268de` |

**Branch rule:** V3 is the default branch. Use V2 (main branch) only when explicitly targeting the main branch.

---

## Components — Axiom Design System (V3)

All `componentKey` values are for use with `importComponentByKeyAsync`. `component_set` means it contains variants; use the property table to pick the right one.

### Interactive Controls

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Button | component_set | `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` | Updated 2026-06-19 |
| Toggle Button | component_set | `6515d66781a16aa9046b018f90dba6276472a513` | |
| Menu Label Button | component_set | `bed4de19dc3b95439bd0beba3f4a69599ff8eaef` | |
| Add Button | component_set | `4c52744eec83189c194e8a77d14afb3476217241` | |
| Checkbox | component_set | `1b51f2a59548085582454116eecc3835d2d5dbc0` | Use this (updated 2026-06-19); older key: `96ff43a8baf590d1c8bfb4ea84c94475e9058ec9` |
| Toggle | component_set | `874be68474689cf5f96831d5029bf55258651f37` | |

### Feedback & Status

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Alert | component_set | `03d2f87e47aab9cca1cf94969454df6a6050c0ee` | Most recently updated (2026-07-02) |
| AlertDialog | component_set | `a04de88e011a0d98ce47128088e9d5f72cab1538` | |
| Badge | component_set | `f0a4e90b5415081932a85616bb0dd63dff0ce59b` | Updated 2026-06-19 |
| Spinner | component_set | `7b7af13ed805bcff4a0401591b07e86f347e1808` | |
| Error | component_set | `181e1c1a70a74124d0f10a2058d84144ccf0fe60` | |
| Tooltip | component_set | `e6203be6017513bd06278ed5acfa83d2ec5da321` | |
| Help Tooltip | component_set | `becff2a9f29ac15ded0de4781616a68e923758f1` | |

### Display

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Avatar | component_set | `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9` | Updated 2026-06-19 |
| Avatar Group | component | `900c960f0ac18a0f87697af2d1d0495d8a5e4a70` | Single component (no variants) |
| Data Cell | component_set | `827bab63db023b922abd275f6aa5229f569c4025` | Updated 2026-06-30 |
| Block Element (Experimental) | component_set | `6eca0a48e68722063fd508cfda45babfe98dd384` | |

### Navigation

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Sidenav Base | component_set | `d902d4aacc11620d63b083878aee026015c5b135` | |
| Sidenav parts/menu item (FA icon) | component_set | `2a9c06ac3c1926fbbe2ad8dd0b0d5badab3fb984` | |
| SubNav items/Back button | component | `2ada666c1f87254404a097d88d0c43dcf952e579` | |
| SubNav items/Menu | component_set | `86ebfdf582eced83a59b7d4146d5e50cb3f7ac09` | |

### Layout / Structural

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Border Clear | component_set | `48f55ec18d9926b1e9a4ca6141c0d0b91fc35eaf` | |
| Separator Padded | component | `55820eee6780e9fd31f45d0ef4242eab3e9ad8b4` | Single component |

---

## Icons — Axiom Design System (V3)

Icons in V3 are individual component sets. Each has `Active=False` and `Active=True` variants. Always use `Active=False` unless the icon needs an active/highlighted state.

Icon imports in code use `@optiaxiom/icons` — NOT `@optimizely/axiom-icons` or `@tabler/icons-react`.

### Icon Component Keys

| Icon name (Figma) | @optiaxiom/icons export | componentKey | Variant to use |
|-------------------|------------------------|-------------|----------------|
| Search | `IconMagnifyingGlass` | `a99cb9a6110356ace11cb57186faba289f76b280` | `Active=False` |
| Chevron Left | `IconChevronLeft` | `e4183bd0df69feefa565118145dd2a2b16edf70d` | `Active=False` |
| Chevron Down | `IconChevronDown` | `09cc2cdd78f21507b338db6fe04a50a71a2eda73` | `Active=False` |
| Notification (Bell) | `IconBell` | `be7a2ac0c0ce8404824c7cbb776c600ecb055d87` | `Active=False` |
| Settings (Gear) | `IconGear` | `2b2d1ec2379eeb081f438b3b897682cfc7726d59` | `Active=False` |
| Book | `IconBook` | `9ce749d063b6f99b338d79e1f71716b5d5cc5d00` | `Active=False` |
| Image Person (Square User) | `IconImagePerson` | `99c2822e94b64bb2d4b9090e97f00af1ee925872` | `Active=False` |
| More (Ellipsis) | `IconEllipsis` | `9772d026ef2cddf9714f976244336d90028111d8` | `Active=False` |
| Sparkles | `IconSparkles` | `f220eb64ed0effd1b315605cad9ea58c988419f0` | `Active=False` |
| Chat (Comments) | `IconChat` | `d7be249c7554372aad9e869fe40e2b11351f773e` | `Active=False` |
| Check Circle | `IconCheckCircle` | `0b9ee2e7d8dfc1671869fda9897cd988eb0f2716` | `Active=False` |
| Refresh (Arrow Rotate) | `IconRefresh` | `2e5a2a9b61e4e6b34e8f44603e0e4f3cc513ca9d` | `Active=False` |
| History (Clock) | `IconHistory` | `d97e050a623235552bb76086c035639a0984f00b` | `Active=False` |
| Arrow Down Circle | `IconArrowDownCircle` | `0b1d812c80a390277ca81b780e9b12640034febc` | `Active=False` |

### Icons not found in "Axiom Design System" — use Axiom Icons library

| Icon | Axiom Icons componentKey | Notes |
|------|--------------------------|-------|
| Xmark / Close | `6824278e82aa2571467fb347e30501ba24e0c328` | From "Axiom Icons" lib; name: `xmark-thin 24` |
| Plus / Add | Not found via MCP — use `search_design_system` query "Plus Axiom Icons" at build time | From `@optiaxiom/icons` as `IconPlus` |

---

## Variables — Axiom Design System (V3)

### Color Variables

**Collection: "1. Colors Semantic"**
variableSetKey: `4e7174112093de5308bde69d85dd83693bca0d16`

#### Border tokens

| Token path | variableKey |
|-----------|-------------|
| `colors/border/default` | `511b503c64e6ac7350fb13ee96eb925897780d27` |
| `colors/border/secondary` | `1a0c9387d66996de165d84cbb597974d68fddf96` |
| `colors/border/light` | `445f9e91e0f5725b1f4b336c1350ff77c275160b` |
| `colors/border/error` | `4786b6c5fb6c8ed4363458dc4e80bae16a3e9a8c` |
| `colors/border/warning` | `9ff088ab38c3d08d10ac989ceb8c3f262e41c4d9` |
| `colors/border/disabled` | `9b9a0cf6cef409404198275111f3d17c7c8838e6` |
| `colors/border/control` | `d71307925315cf4def57a4068e8fe8661b60fc78` |
| `colors/border/control_hover` | `e79f409544d9b06bf8a24fa2e697c1ed902ba449` |

#### Component-level tokens

| Token path | variableKey |
|-----------|-------------|
| `component/Table/border` | `2525b731ea71a4286228bf5dd4a778a059bc6bd9` |
| `component/Avatar/bg-purple` | `f05403a78a33245b53514ce37f4dcf2a26759304` |
| `component/Avatar/fg-purple` | `832603931203c3dacfaf995889a810ac49e3a28b` |
| `component/Avatar/bg-neutral` | `bef7d61ffebcb0b4c9c3d1957b65e6fb8638f953` |
| `component/Avatar/fg-neutral` | `4cb932d35cd48ae685f9198f09c7a70a7cc03f4d` |
| `component/Spinner/bg-default` | `1c35e29be2e0f82fb7363e8854c84c42770a6ff4` |
| `component/Spinner/bg-inverse` | `0507f7caad92c645f54d733d5d492d54e4f9e1fa` |
| `component/Spinner/indicator-default` | `717ada61d507ef8081ebd9aab45cd55c819ffba9` |
| `component/Spinner/indicator-inverse` | `10c86feffc2e6f79a11dcd903d0a5dda95274d42` |

#### Background / foreground semantic tokens (bg.*, fg.*)

These were NOT returned by MCP `search_design_system` queries. At build time, use:
```
search_design_system(query: "bg default background", fileKey: "qs72V79n1s9wYOcZ1TzBwM", includeVariables: true)
```
Then filter results by libraryKey `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7`.

**Collection: "0. Primitives"**
variableSetKey: `898663953f1f93cfe7d6c7523abd376c9c7f26db`

| Token path | variableKey |
|-----------|-------------|
| `Colors/Red/50` | `edf7c04872beb8fc290f233c33d4b97ef8a3fa31` |
| `Colors/Cyan/50` | `cf38825bd15263b0eba7635f4978947e81c03377` |

### Spacing Variables

**Collection: "3. Layout"**
variableSetKey: `703b36cc19b684c896b5122aba71edbd953c31ce`

| Token | variableKey |
|-------|-------------|
| `spacing/spacing-0` | `8425dc327af9919d339814bdb77bc184dd72ae25` |
| `spacing/spacing-2` | `27b2100c40d51c18056901c2964385f2cc6f62d5` |
| `spacing/spacing-4` | `63c84340dc8e051284570a568c79d74d4c3e24af` |
| `spacing/spacing-6` | `64d110ccc1fcb585ec1726b84169bbf5e184df40` |
| `spacing/spacing-8` | `030a92fb19ffb0a6a3d747f0097093ff69ce790a` |
| `spacing/spacing-12` | `e01d2d5d7e8742ce9fbab127d7a6d167d1826cd9` |
| `spacing/spacing-20` | `25d5579b4e90445f7fa386b953c63830d8644f95` |
| `spacing/spacing-24` | `5f02fa75a8c29edaa4f353f20d7572e4093e95d1` |
| `spacing/spacing-32` | `2ef3a35cf11a5faf4e79dd7a5d25bf1edf819513` |
| `spacing/spacing-64` | `3a75c50220d13d5de09404f5ad108524bcbe9842` |
| `spacing/spacing-80` | `e2ccb815e54b350ddcee2003ea4ac74a37b0972a` |

> Note: `spacing/spacing-16` was only found in "Foundations V2 - Legacy" — use `spacing-12` or `spacing-20` from V3, or look up at build time.

### Radius Variables

**Collection: "3. Layout"** (same variableSetKey: `703b36cc19b684c896b5122aba71edbd953c31ce`)

| Token | variableKey |
|-------|-------------|
| `radius/radius-none` | `b97fd17b87362dfc4790597fc89001849dd33c27` |
| `radius/radius-xs` | `99b7222a0df85ab85f168d0836bff64365d6a93f` |
| `radius/radius-sm` | `5456319c38257f333f40ff3b4fe710185ddbe6e4` |
| `radius/radius-md` | `6c68b59b5aaaa67516c6c7d2185451cbd13676e0` |
| `radius/radius-lg` | `d7e29dcfa68d7ed299f296a7c1b4d0f2353df63e` |
| `radius/radius-xl` | `648c3dd74c74bafb3c4d01354ff8c7ca28966a19` |
| `radius/radius-full` | `8f820c7967581a2c06a1628edb30be128ac2a764` |

### Typography

Typography style details (fontSize/fontWeight/lineHeight) were not returned by MCP `search_design_system`. The type scale lives in the "Typography" and "Opticon Typography" libraries (legacy names). At build time, use:
```
search_design_system(query: "heading body label type scale", fileKey: "qs72V79n1s9wYOcZ1TzBwM", includeStyles: true)
```

---

## Opal-Specific Components

These live in the **Opal Components** library, not Axiom Design System.

| Component | assetType | componentKey | Notes |
|-----------|-----------|-------------|-------|
| OpalAlert | component_set | `0b394e3c11043b2e1bf768c8c548de0df1e4948a` | Newest (updated 2025-12-23); older: `d241bae082fe212573c3bb74b000ce8df83d7d8b` |
| Opal Button | component_set | `525fe98efb6aa15e7e304000de23ef57bd7f543f` | |
| Opal Icon | component_set | `1d6bc2192fd97e0dee5a461b20592962b04b6de3` | |
| Quick action button | component | `1f9a91198e5d0709f48ea763d59038ccf7487846` | |

### Opal-Specific Notes

- **Opal avatar image:** Use `/opal-icon-nav.png` — NOT `/opal-orb.png` (old blue/purple sphere) or `/fd-avatar-opal.png` (old colorful orb). Render as plain `<img>` tag, not Next.js `<Image>`, to avoid optimization cache issues.
- **OpalAlert gradient:** The newest OpalAlert component set (key above) includes the gradient variant. Use the most recently updated key.
- **Icon source in code:** All icon imports in `app/opal/` use `@optiaxiom/icons`. Example: `import { IconSparkles } from "@optiaxiom/icons"`. Never use `@optimizely/axiom-icons` or `@tabler/icons-react`.

---

## Components Not Found in Axiom Design System V3

These require a fresh `search_design_system` query at build time — they either don't exist in V3 or search didn't surface them:

| Component | Reason | Recommended query |
|-----------|--------|-------------------|
| Input (standalone) | Only third-party kits returned | `"Input text field Axiom"` |
| Select / Dropdown V3 | Only older "Axiom Components" versions returned | `"Select dropdown Axiom V3"` |
| Plus / Add icon | Not in Axiom Design System results | `"Plus Axiom Icons"` — check Axiom Icons library |

---

## How to Use This File

1. **Before writing any Figma design call:** check this file for the componentKey.
2. **To instantiate a component:** use `importComponentByKeyAsync(componentKey)`.
3. **To apply a variable:** use the `variableKey` with the Figma Variables API.
4. **If the component is missing from this file:** run `search_design_system` with `fileKey: "qs72V79n1s9wYOcZ1TzBwM"` and filter results to libraryKey `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7` (Axiom Design System).
5. **Never hand-roll** a component that Axiom already provides.
6. **Axiom layout props:** use `start`/`end` — never `flex-start`/`space-between`.

---

*Last updated: 2026-07-02 via MCP search_design_system queries against fileKey `qs72V79n1s9wYOcZ1TzBwM`.*
>>>>>>> origin/main
