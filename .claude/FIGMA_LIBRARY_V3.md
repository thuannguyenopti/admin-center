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
