# Axiom V2 Menu Components

Source: file `JYy51au6YaA4QZKpQy1ZRg`, section node `9797:35525`  
Library fileKey: `JYy51au6YaA4QZKpQy1ZRg`

---

## Overview

The menu system is built entirely from list-item row primitives — there is no single "Menu shell" component to import. You construct a menu by stacking list-item instances inside a frame you create, then add shadow and border yourself. All rows share a 210px (or 224px for User select) width at default.

---

## Menu Shell / Container

There is **no importable shell/container component** in the V2 library. Build the panel frame manually:

```
width: auto (resize to content) or fixed (e.g. 240px)
padding: 4px (all sides)
border: 1px, border.default (#CACFDC light / #66708C dark)
borderRadius: 6px (radius-md)
shadow/md:
  DROP_SHADOW 0,6 radius=18 spread=0   color=neutral.alpha.light-50 (rgba(9,30,66,0.04))
  DROP_SHADOW 0,6 radius=12 spread=-3  color=neutral.alpha.light-75 (rgba(9,30,66,0.08))
  DROP_SHADOW 0,4 radius=4  spread=1   color=neutral.alpha.light-50 (rgba(9,30,66,0.04))
fill: bg.default (white)
layoutMode: VERTICAL
itemSpacing: 0
```

The `Listbox/Empty` and `Listbox/Loading` components include this shell styling — use them for empty/loading states in place of the full list.

---

## Divider

**Component name:** `Listitem/Divider`  
**componentKey:** `aa67201939f81ab340758095bc5807ae41e4cc25`  
**nodeId:** `1031:56868`  
**Dimensions:** 212×9px  
**Type:** Single COMPONENT (no variant set)

**Internals:**
- Container: `px=8, py=4` vertical flex, full-width
- Inner line: `height=1px`, fill `border.secondary` (#DADFEB light / #4F576E dark)

**Usage:**
```js
const divComp = await figma.importComponentByKeyAsync("aa67201939f81ab340758095bc5807ae41e4cc25");
const div = divComp.createInstance();
parent.appendChild(div);
div.layoutSizingHorizontal = "FILL";
```

Do not manually draw a 1px line — always use this component so the color token resolves correctly.

---

## Group Header

**Component name:** `Listitem/Group header`  
**componentKey:** `984fbb4a94f0863f3d139993f934b59a90ac8405`  
**nodeId:** `1031:56872`  
**Dimensions:** 210×32px  
**Type:** Single COMPONENT (no variant set)

**Layout:** `p=8` all sides, horizontal auto-layout  
**Typography:**
- Font: Inter Regular, 12px (`font-size-200`)
- Line height: 16px (`line-height-200`)
- Letter spacing: 0.01px (`ls-200`)
- Color: `fg.tertiary` (#66708C light / #838DA4 dark)

**Text node name:** (unnamed `<p>`) — override with `node.characters = "Section label"`

**Usage:**
```js
const headerComp = await figma.importComponentByKeyAsync("984fbb4a94f0863f3d139993f934b59a90ac8405");
const header = headerComp.createInstance();
parent.appendChild(header);
header.layoutSizingHorizontal = "FILL";
// Set label text
const textNode = header.findOne(n => n.type === "TEXT");
if (textNode) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  textNode.characters = "Recent";
}
```

---

## Listitem — Menu (Default / Danger)

**Component set name:** `Listitem/Menu`  
**COMPONENT_SET key:** `da71179c3b4739448f9cc47f5611d0921cf5cb96`  
**nodeId (set):** `4310:14825`  
**Width:** 210px | **Height:** 40px (Danger) / 56px (Default with description)

### Variant properties

| Property | Values |
|---|---|
| `Variant` | `Default` / `Danger` |
| `State` | `Default` / `Hover` / `Pressed` / `Focus` / `Disabled` |

### Default (Variant=Default) — individual variant keys

| State | componentKey |
|---|---|
| Default | `bd1c88fe9ca4a0f39aa1b76f34afc818c48e2974` |
| Hover | `7b76fb408bb7681b96bbfd8bc93a0c9fd7c7ff4d` |
| Pressed | `0b34f4b47c79dfe45e83eb349a1a7d80e28ce8f1` |
| Focus | `dec2bd57aa2fa5e7ce9cb43e56a1b57b7a589397` |
| Disabled | `fb9187041aedb991c3c3131d19dd3ece8a6a1668` |

### Danger (Variant=Danger) — individual variant keys

| State | componentKey |
|---|---|
| Default | `d0fdafe80144c7816be5ad7631b98210b9c7bc3f` |
| Hover | `4ea72b221e67791b819fd22603986d185a83e1a2` |
| Pressed | `17aec263c3df52d9183ec101efca2ea949dfe553` |
| Focus | `0e99396f5fe2fcc57f610fa7a6b8b403d6c6c574` |
| Disabled | `c61df7cdee25e48901d1ce3a8ece97ff30ff80de` |

### Visual spec (Default variant)

| Property | Value |
|---|---|
| Background (default) | `bg.default` (white) |
| Background (hover) | `bg.states.default-hover` (#F9FAFC) |
| Padding | `p=8` all sides |
| Gap | `8px` horizontal |
| Border radius | `radius-sm` (4px) |
| Label font | Inter Regular, 14px, `fg.default` |
| Description font | Inter Regular, 12px, `fg.tertiary` |
| Label line height | 20px |
| Icon slot width | 20px, top-aligned with `pt=4` |
| Addon After width | 20×16px |

**Text node names:**
- Label: node `1031:56698` — override `characters`
- Description: node `6167:220963` — override `characters` (only visible when `description=true`)

**Props visible via `componentProperties`:**
- `addonBefore` (BOOLEAN) — shows icon slot before label
- `addonAfter` (BOOLEAN) — shows sub-menu arrow after label
- `description` (BOOLEAN) — shows 12px description row below label

**Danger variant:** Label color changes to `fg.feedback.error-base` (#CC1616). No description row. Height reduces to 40px.

### Usage

```js
const menuSet = await figma.importComponentSetByKeyAsync("da71179c3b4739448f9cc47f5611d0921cf5cb96");
const defaultVariant = menuSet.children.find(c => c.name === "Variant=Default, State=Default");
const item = defaultVariant.createInstance();
parent.appendChild(item);
item.layoutSizingHorizontal = "FILL";

// Set label text
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const labelNode = item.findOne(n => n.type === "TEXT" && n.name === "1031:56698") 
  ?? item.findOne(n => n.type === "TEXT");
if (labelNode) labelNode.characters = "Edit";

// Hide icon slot if not needed
item.setProperties({ "addonBefore": false });
```

---

## Listitem — Single Select

**Component set name:** `Listitem/Single select`  
**COMPONENT_SET key:** `06b1bb0cfd6d4a18506235994abda23ae0d4dedc`  
**nodeId (set):** `4310:14826`  
**Width:** 210px | **Height:** 40px

### Variant properties

| Property | Values |
|---|---|
| `Selected` | `False` / `True` |
| `State` | `Default` / `Hover` / `Pressed` / `Focus` / `Disabled` |

### Individual variant keys

| Selected | State | componentKey |
|---|---|---|
| False | Default | `121d6af3b3d51f2ca53a6d6515de6bb0164e797a` |
| False | Hover | `acca939ef1a63cca05e546f857b0ab2b34383cad` |
| False | Pressed | `7f597318dcd4849543ed3ff76b46c4ed7cfeb472` |
| False | Focus | `f0d4ead3414d6cee064f31b667a4b43984ff8477` |
| False | Disabled | `a9833bc21c22157d30cc40f2bc38346c8689c995` |
| True | Default | `0f1d473c39b150c6540195d9ca5db857f0293b47` |
| True | Hover | `4f00fc6b0bd3df197e6f2129938ccb35a5def28a` |
| True | Pressed | `01e95729defb675b3c052e0d91709ac884319e89` |
| True | Focus | `89689e827f4df99bfe30a382585a038b8ff53560` |
| True | Disabled | `209da2359bd431bb7eae4ace81ff83ce6a149d83` |

### Visual spec

- Selected=True: checkmark icon (rendered as inline SVG) appears at right. Background stays `bg.default`.
- Selected=False: no checkmark. Identical layout to Default menu item without description.
- Optional icon slot on left (`addonBefore`). Optional description row (`description`).

### Usage

```js
const singleSet = await figma.importComponentSetByKeyAsync("06b1bb0cfd6d4a18506235994abda23ae0d4dedc");
// Selected item
const selectedVariant = singleSet.children.find(c => c.name === "Selected=True, State=Default");
const selected = selectedVariant.createInstance();
parent.appendChild(selected);
selected.layoutSizingHorizontal = "FILL";
// Unselected item
const unselectedVariant = singleSet.children.find(c => c.name === "Selected=False, State=Default");
const unselected = unselectedVariant.createInstance();
parent.appendChild(unselected);
unselected.layoutSizingHorizontal = "FILL";
```

---

## Listitem — Multiselect (Checkbox)

**Component set name:** `Listitem/Multiselect`  
**COMPONENT_SET key:** `a985d7a693f08c37723b64c9eb1c10695e21dc37`  
**nodeId (set):** `4310:14827`  
**Width:** 210px | **Height:** 40px

### Variant properties

| Property | Values |
|---|---|
| `State` | `Default` / `Hover` / `Pressed` / `Focus` / `Disabled` |
| `Selected` | `False` / `True` |

### Individual variant keys

| State | Selected | componentKey |
|---|---|---|
| Default | False | `e84bdcf5f5729c2a1d34937376a117480dbbef52` |
| Hover | False | `9d23a7347820ae451ba5db28afa32750303d3186` |
| Pressed | False | `22b620699a59399cec09d7771e171e2b2777959b` |
| Focus | False | `f9e4ac318fb3bc6002827b903a3cbf58ca4dbe12` |
| Disabled | False | `86097012e366fb31a18944cb96f90478454c054a` |
| Default | True | `e1fea18009ac063cefdd340b4a9aa94d39b62a16` |
| Hover | True | `37155361ae5e8fef9fa69c454e36604e4ea21dfd` |
| Pressed | True | `9348141ea36b0f81c5dbcfb97a06b1a5f0bc957d` |
| Focus | True | `13b7a409cde6c994630802dd772348b09e2eb120` |
| Disabled | True | `b5c73baf00180bddc879b532f71a6ffaab10eadc` |

### Visual spec

- Contains a real Checkbox component (`componentKey: 832bf13d26272af25bc6385a154108e990a053db`) — do not reconstruct it manually.
- Selected=True: checkbox fill `bg.accent.base` (#0037FF) with white checkmark inside. Label `fg.default`.
- Selected=False: checkbox border `border.control` (#838DA4), white fill.
- Entire row is a `<button>` — it is interactive, not just visual.

### Usage

```js
const multiSet = await figma.importComponentSetByKeyAsync("a985d7a693f08c37723b64c9eb1c10695e21dc37");
const checkedVariant = multiSet.children.find(c => c.name === "State=Default, Selected=True");
const item = checkedVariant.createInstance();
parent.appendChild(item);
item.layoutSizingHorizontal = "FILL";
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const cb = item.findOne(n => n.type === "INSTANCE" && n.name.toLowerCase().includes("checkbox"));
// Set the checkbox label text
const label = item.findOne(n => n.type === "TEXT");
if (label) label.characters = "Option A";
```

---

## Listitem — User Select (with Avatar)

**Component set name:** `Listitem/User select`  
**COMPONENT_SET key:** `248c7ee9f75457666160b11fc36a2c93d00bd865`  
**nodeId (set):** `4310:14828`  
**Width:** 224px | **Height:** 52px (taller than other items — accommodates 32px avatar)

### Variant properties

| Property | Values |
|---|---|
| `State` | `Default` / `Hover` / `Pressed` / `Focus` / `Disabled` |
| `Selected` | `False` / `True` |

### Individual variant keys

| State | Selected | componentKey |
|---|---|---|
| Default | False | `9be5ef53e007b5656f4e92617f7f2a88ed601516` |
| Hover | False | `83fa27fbf4a6db41d446dd9355d2717877587008` |
| Pressed | False | `a6e8d16db0437f11440e326947849f41ed30e12c` |
| Focus | False | `3c748400778f8611ca319eb65345527bf5e000b5` |
| Disabled | False | `44d5f2072a6b22a632269ff7c6a0105f00483b4f` |
| Default | True | `f64ef729ae1249ead64abf3fa1d7462e333eebaa` |
| Hover | True | `9fe864503a7e223f11c1a41829549bba8d4ef9e0` |
| Pressed | True | `8f1913897ad0d984c9d501afbae86e6d46da9e9b` |
| Focus | True | `be0cd358ecbe3eb91e8d29eac188ef40b1b32302` |
| Disabled | True | `dfaafc9ac2eee25dc7df4923d8d791bf9183f3f0` |

### Avatar slot (sub-component)

The Avatar is a 32px circle instance nested inside. Key properties:
- `componentKey (Avatar set)`: `07a871d4a8a3bfd2d6cd236b0547ee7ec3a31fe4`
- Size: `md - 32` (32px)
- Variant: `Initials` (shows "WM" initials)
- Color: `bg-purple` (`#EDE9FE` bg, `#7C3AED` text on light mode)

### Content frame text nodes

| Node name | Description |
|---|---|
| `1031:56827` / `1448:51808` | Name line — "Name Surname" (14px, `fg.default`) |
| `1031:56828` / `1448:51809` | Email line — "email@optimizely.com" (12px, `fg.tertiary`) |

### Selected state differences

- **Selected=False:** Background `bg.default`, no close button. Padding: `pl=12, pr=40, py=8`.
- **Selected=True:** Background `bg.secondary` (#F5F6FA). Padding: `pl=12, pr=8, py=8`. Shows a 24×24 dismiss button (`IconX` / xmark) at right end.

### Usage

```js
const userSet = await figma.importComponentSetByKeyAsync("248c7ee9f75457666160b11fc36a2c93d00bd865");
const variant = userSet.children.find(c => c.name === "State=Default, Selected=False");
const item = variant.createInstance();
parent.appendChild(item);
item.layoutSizingHorizontal = "FILL";

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const textNodes = item.findAll(n => n.type === "TEXT");
// textNodes[0] = Name, textNodes[1] = Email
if (textNodes[0]) textNodes[0].characters = "Alice Smith";
if (textNodes[1]) textNodes[1].characters = "alice.smith@optimizely.com";
```

---

## Search Row

**Component name:** `Listitem/Search`  
**componentKey:** `0a53f41ca75868b7e625c342eb43ef3180e0e50d`  
**nodeId:** `1031:56870`  
**Dimensions:** 202×40px  
**Type:** Single COMPONENT (no variant set)

### Visual spec

- Outer container: `px=4`, 40px tall, vertical centering
- Inner search input: `bg.default`, `border.default`, 1px, `radius-md` (6px), 32px tall, `px=8, py=4`
- Leading icon: `IconSearch` (16px)
- Placeholder text: "Search" — `fg.placeholder` (#66708C), 14px Regular
- Gap: `8px` between icon and text

### Usage

Place as the first item inside the menu frame, before any list items. Full-width with `FILL`.

```js
const searchComp = await figma.importComponentByKeyAsync("0a53f41ca75868b7e625c342eb43ef3180e0e50d");
const search = searchComp.createInstance();
parent.appendChild(search);
search.layoutSizingHorizontal = "FILL";
// Override placeholder text
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const placeholder = search.findOne(n => n.type === "TEXT");
if (placeholder) placeholder.characters = "Search items...";
```

---

## Listitem — Footer

**Component name:** `Listitem/Footer`  
**componentKey:** `90dd3301bde5de37cd3a06b75e1d75329d7807f5`  
**nodeId:** `1534:39050`  
**Dimensions:** 210×80px  
**Type:** Single COMPONENT (no variant set)

### Visual spec

- Top border: 1px `border.secondary` (#DADFEB)
- Background: `bg.default`
- Padding: `px=16, py=20`
- Contains two buttons side-by-side (gap=16):
  - **Cancel:** subtle/ghost button — `fg.default`, no background, `px=12`, 40px tall, `radius-md`
  - **Confirm:** primary button — `bg.accent.base` (#0037FF), `fg.white`, `px=12`, 40px tall, `radius-md`
- Font: Inter Regular, 14px, `line-height-300` (20px)

### Usage

Place as the last item inside the menu frame. Typically used for multi-select menus with an apply/cancel action.

```js
const footerComp = await figma.importComponentByKeyAsync("90dd3301bde5de37cd3a06b75e1d75329d7807f5");
const footer = footerComp.createInstance();
parent.appendChild(footer);
footer.layoutSizingHorizontal = "FILL";
// Override button labels
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const textNodes = footer.findAll(n => n.type === "TEXT");
// textNodes[0] = "Cancel", textNodes[1] = "Confirm"
if (textNodes[0]) textNodes[0].characters = "Cancel";
if (textNodes[1]) textNodes[1].characters = "Apply";
```

---

## Addon After (Sub-menu Arrow / Badge)

**Component set name:** `Addon After`  
**COMPONENT_SET key:** `ba833648828a021119793d4b947cfa838db4a4a6`  
**nodeId (set):** `643:7610`

### Variant properties

| Property | Values |
|---|---|
| `Variant` | `Sub menu arrow` / `Badge` |

### Individual variant keys

| Variant | componentKey | Dimensions |
|---|---|---|
| `Sub menu arrow` | `0102a55afd21e650dc6ef4345745431cd6b5c005` | 20×16px |
| `Badge` | `213937a1126096d0f7a730f3968a3478091ee563` | 20×20px |

### Sub menu arrow spec

- Inline SVG chevron/arrow icon (`arrow-up-right-from-square`) — 10.5×5.25px centered in 20×16 container.
- Used as `addonAfter` slot in any `Listitem/Menu` item that triggers a nested sub-menu.
- Enable by setting `addonAfter=true` on the parent Listitem/Menu instance.

### Badge spec

- Contains a Badge component instance: `bg.accent.base` (#0037FF), `fg.white`, 12px Medium text
- `px=6, py=2`, `radius-xl` (12px), `min-w=20, min-h=20`
- Override the numeric text node `characters` to set the count value

---

## Scroll Bar

**Component name:** `Scroll bar`  
**componentKey:** `18f4bed49edbb40531090d9a2cf8d673203b2dc8`  
**nodeId:** `8891:97617`  
**Dimensions:** 16×250px  

> ⚠️ This is a visual-only component — "Control fill with bottom padding" per Figma description. The bar height is controlled by the frame's `height`, not by auto-layout content.

### Visual spec

- Container: `px=4, pt=8, pb=80`, 250px tall
- Bar: `bg` = `neutral.alpha.light-150` (rgba(9,30,66,0.22)), 8px wide, `radius-full` (999px), full height

---

## Listbox — Empty State

**Component name:** `Listbox/Empty`  
**componentKey:** `31d61efd2e0617589ce54af6e633fb870e12a9d8`  
**nodeId:** `6400:262700`  
**Dimensions:** 218×40px

The complete styled panel (border + shadow) with centered "No results found" text.

- Background: `bg.default`, border: 1px `border.default`, `radius` 6px, shadow/md
- Text: "No results found", 14px Regular, `fg.tertiary`, centered

**Usage:** Insert in place of the list when no items match search.

---

## Listbox — Loading State

**Component name:** `Listbox/Loading`  
**componentKey:** `c70f0e7e4c051150b447ab8422a06abaa45c3db3`  
**nodeId:** `6400:262457`  
**Dimensions:** 218×40px

The complete styled panel with a 24px Spinner centered.

- Same shell as Empty (border + shadow/md)
- Spinner: `componentKey: 6663c184ae5339e6a21af419fc95eb8f6326f764` (Spinner, sm/md appearance)

**Usage:** Insert in place of the list while items are being fetched.

---

## Usage Patterns

### Building a complete menu from scratch

```js
// 1. Create the menu panel frame
const menu = figma.createFrame();
menu.name = "Menu";
menu.layoutMode = "VERTICAL";
menu.itemSpacing = 0;
menu.paddingTop = 4; menu.paddingBottom = 4;
menu.paddingLeft = 4; menu.paddingRight = 4;
menu.cornerRadius = 6;
menu.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
// Border
menu.strokes = [{ type: "SOLID", color: { r: 0.792, g: 0.812, b: 0.863 } }]; // border.default
menu.strokeWeight = 1;
menu.strokeAlign = "INSIDE";
// Shadow/md
menu.effects = [
  { type: "DROP_SHADOW", color: { r: 0.035, g: 0.118, b: 0.259, a: 0.04 }, offset: { x: 0, y: 6 }, radius: 18, spread: 0, visible: true, blendMode: "NORMAL" },
  { type: "DROP_SHADOW", color: { r: 0.035, g: 0.118, b: 0.259, a: 0.08 }, offset: { x: 0, y: 6 }, radius: 12, spread: -3, visible: true, blendMode: "NORMAL" },
  { type: "DROP_SHADOW", color: { r: 0.035, g: 0.118, b: 0.259, a: 0.04 }, offset: { x: 0, y: 4 }, radius: 4, spread: 1, visible: true, blendMode: "NORMAL" },
];

// Position the menu on the canvas (away from origin)
const allNodes = figma.currentPage.children;
const rightmost = allNodes.reduce((max, n) => Math.max(max, n.x + n.width), 0);
menu.x = rightmost + 40;
menu.y = 100;
figma.currentPage.appendChild(menu);

// 2. Add search row
const searchComp = await figma.importComponentByKeyAsync("0a53f41ca75868b7e625c342eb43ef3180e0e50d");
const search = searchComp.createInstance();
menu.appendChild(search);
search.layoutSizingHorizontal = "FILL";

// 3. Add group header
const headerComp = await figma.importComponentByKeyAsync("984fbb4a94f0863f3d139993f934b59a90ac8405");
const header = headerComp.createInstance();
menu.appendChild(header);
header.layoutSizingHorizontal = "FILL";
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
header.findOne(n => n.type === "TEXT").characters = "Recent";

// 4. Add menu items
const menuSet = await figma.importComponentSetByKeyAsync("da71179c3b4739448f9cc47f5611d0921cf5cb96");
const defaultVar = menuSet.children.find(c => c.name === "Variant=Default, State=Default");
const items = ["Edit", "Duplicate", "Archive"];
for (const label of items) {
  const item = defaultVar.createInstance();
  menu.appendChild(item);
  item.layoutSizingHorizontal = "FILL";
  item.setProperties({ addonBefore: false });
  item.findOne(n => n.type === "TEXT" && n.characters === "Label").characters = label;
}

// 5. Add divider before danger action
const divComp = await figma.importComponentByKeyAsync("aa67201939f81ab340758095bc5807ae41e4cc25");
const divider = divComp.createInstance();
menu.appendChild(divider);
divider.layoutSizingHorizontal = "FILL";

// 6. Add danger item
const dangerVar = menuSet.children.find(c => c.name === "Variant=Danger, State=Default");
const dangerItem = dangerVar.createInstance();
menu.appendChild(dangerItem);
dangerItem.layoutSizingHorizontal = "FILL";
dangerItem.setProperties({ addonBefore: false });
dangerItem.findOne(n => n.type === "TEXT").characters = "Delete";

return { menuId: menu.id };
```

### Group header + items

```js
// Standard pattern: group header followed by list items
const header = (await figma.importComponentByKeyAsync("984fbb4a94f0863f3d139993f934b59a90ac8405")).createInstance();
parent.appendChild(header);
header.layoutSizingHorizontal = "FILL";
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
header.findOne(n => n.type === "TEXT").characters = "Settings";

const menuSet = await figma.importComponentSetByKeyAsync("da71179c3b4739448f9cc47f5611d0921cf5cb96");
const v = menuSet.children.find(c => c.name === "Variant=Default, State=Default");
for (const label of ["Account", "Billing", "Sign out"]) {
  const item = v.createInstance();
  parent.appendChild(item);
  item.layoutSizingHorizontal = "FILL";
  item.setProperties({ addonBefore: false });
  item.findOne(n => n.type === "TEXT" && n.characters === "Label").characters = label;
}
```

### Divider usage

```js
// Always use the component — never draw a manual line
const divComp = await figma.importComponentByKeyAsync("aa67201939f81ab340758095bc5807ae41e4cc25");
const divider = divComp.createInstance();
parent.appendChild(divider);
divider.layoutSizingHorizontal = "FILL";
```

### Multi-select menu with footer

```js
// Create panel frame (as above), then:
const multiSet = await figma.importComponentSetByKeyAsync("a985d7a693f08c37723b64c9eb1c10695e21dc37");
const unchecked = multiSet.children.find(c => c.name === "State=Default, Selected=False");
const checked = multiSet.children.find(c => c.name === "State=Default, Selected=True");

for (const [label, isSelected] of [["Option A", true], ["Option B", false], ["Option C", true]]) {
  const variant = isSelected ? checked : unchecked;
  const item = variant.createInstance();
  parent.appendChild(item);
  item.layoutSizingHorizontal = "FILL";
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const labelNode = item.findOne(n => n.type === "TEXT");
  if (labelNode) labelNode.characters = label;
}

// Footer (Cancel + Apply)
const footer = (await figma.importComponentByKeyAsync("90dd3301bde5de37cd3a06b75e1d75329d7807f5")).createInstance();
parent.appendChild(footer);
footer.layoutSizingHorizontal = "FILL";
```

### User select menu (people picker)

```js
const userSet = await figma.importComponentSetByKeyAsync("248c7ee9f75457666160b11fc36a2c93d00bd865");
const unselected = userSet.children.find(c => c.name === "State=Default, Selected=False");
const selected = userSet.children.find(c => c.name === "State=Default, Selected=True");
const users = [
  { name: "Alice Smith", email: "alice@optimizely.com", selected: true },
  { name: "Bob Jones", email: "bob@optimizely.com", selected: false },
];

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
for (const u of users) {
  const item = (u.selected ? selected : unselected).createInstance();
  parent.appendChild(item);
  item.layoutSizingHorizontal = "FILL";
  const texts = item.findAll(n => n.type === "TEXT");
  if (texts[0]) texts[0].characters = u.name;
  if (texts[1]) texts[1].characters = u.email;
}
```

### Badge dropdown (status/priority filter)

When dropdown options represent **status or priority values**, replace `Listitem/Single select` label text with a `Badge` instance. The row is a custom frame — do NOT use `Listitem/Single select` for this pattern.

**Reference:** File `IYw5fvSct4YErcbWc6BfBE`, node `342:4070` (Priority Dropdown)

**Structure:**
```
Frame "Priority Dropdown"         220px wide, AUTO height, cornerRadius=8, shadow, border.secondary stroke
  └── Listitem/Search             FILL width, 40px — real component, key 0a53f41ca75868b7e625c342eb43ef3180e0e50d
  └── Listitem/Divider (hidden)   import but set visible=false when no visual divider is needed
  └── Frame "Item – All"          FILL×32px¹, HORIZONTAL, SPACE_BETWEEN, px=8, py=6
        └── Badge (Neutral)       HUG
  └── Frame "Item – Critical"     FILL×32px¹
        └── Badge (Danger)        HUG
  └── Frame "Item – High"         FILL×32px¹, bg=rgba(245,247,255) (selected tint)
        └── Badge (Warning)       HUG
        └── Text "✓"              fg.information (#0066FF), 13px
  └── Frame "Item – Medium"       FILL×32px¹
        └── Badge (Info)          HUG
  └── Frame "Item – Low"          FILL×32px¹
        └── Badge (Neutral)       HUG

¹ 32px is valid here because these are plain frames, not Listitem instances.
  Listitem components have a minimum height of 40px — never resize them below that.
```

**Priority → Badge intent mapping:**
| Priority | Badge Intent |
|---|---|
| All | Neutral |
| Critical | Danger |
| High | Warning |
| Medium | Info |
| Low | Neutral |

**Key rules:**
- Use `Listitem/Search` (key `0a53f41ca75868b7e625c342eb43ef3180e0e50d`) — never a custom search frame
- Import `Listitem/Divider` but set `visible = false` to preserve spacing without drawing a line
- Item rows are custom 32px frames (not `Listitem/Single select`) — Badge replaces the label
- Selected item: light blue tint fill `{r:0.96, g:0.97, b:1}` + `"✓"` text node in `fg.information` (#0066FF) at right
- Badge text is set via `findOne(n => n.type === "TEXT")` + direct character override

```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// Shell
const panel = figma.createFrame();
panel.name = "Priority Dropdown";
panel.layoutMode = "VERTICAL";
panel.resize(220, 100);               // resize BEFORE setting AUTO
panel.primaryAxisSizingMode = "AUTO"; // HUG height — set AFTER resize
panel.counterAxisSizingMode = "FIXED";
panel.paddingTop = 8; panel.paddingBottom = 8;
panel.paddingLeft = 8; panel.paddingRight = 8;
panel.itemSpacing = 2;
panel.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
panel.cornerRadius = 8;
panel.strokes = [{ type: 'SOLID', color: { r: 0.84, g: 0.87, b: 0.92 } }];
panel.strokeWeight = 1;
panel.effects = [{ type: "DROP_SHADOW", color: { r: 0.18, g: 0.2, b: 0.26, a: 0.12 },
  offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: "NORMAL" }];

// Search — always use real component
const searchComp = await figma.importComponentByKeyAsync("0a53f41ca75868b7e625c342eb43ef3180e0e50d");
const search = searchComp.createInstance();
panel.appendChild(search);
search.layoutSizingHorizontal = "FILL";

// Divider — import but hide
const divComp = await figma.importComponentByKeyAsync("aa67201939f81ab340758095bc5807ae41e4cc25");
const div = divComp.createInstance();
panel.appendChild(div);
div.layoutSizingHorizontal = "FILL";
div.visible = false;

// Badge set
const badgeSet = await figma.importComponentSetByKeyAsync("d853342dd778628f8f008ef2ceb342957ce3a50f");
function badge(intent) {
  return badgeSet.children.find(c => c.name === `Variant=Subtle, Intent=${intent}, Numeric=False`) ?? badgeSet.defaultVariant;
}

const options = [
  { label: "All",      intent: "Neutral",  selected: false },
  { label: "Critical", intent: "Danger",   selected: false },
  { label: "High",     intent: "Warning",  selected: true  },
  { label: "Medium",   intent: "Info",     selected: false },
  { label: "Low",      intent: "Neutral",  selected: false },
];

for (const opt of options) {
  const row = figma.createFrame();
  row.name = `Item – ${opt.label}`;
  row.layoutMode = "HORIZONTAL";
  row.resize(204, 32);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.paddingLeft = 8; row.paddingRight = 8;
  row.paddingTop = 6; row.paddingBottom = 6;
  row.counterAxisAlignItems = "CENTER";
  row.primaryAxisAlignItems = "SPACE_BETWEEN";
  row.cornerRadius = 6;
  row.fills = opt.selected
    ? [{ type: 'SOLID', color: { r: 0.96, g: 0.97, b: 1 } }]
    : [];

  const b = badge(opt.intent).createInstance();
  b.findOne(n => n.type === "TEXT").characters = opt.label;
  row.appendChild(b);
  b.layoutSizingHorizontal = "HUG";
  b.layoutSizingVertical = "HUG";

  if (opt.selected) {
    const check = figma.createText();
    check.fontName = { family: "Inter", style: "Regular" };
    check.characters = "✓";
    check.fontSize = 13;
    check.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 1 } }];
    row.appendChild(check);
  }

  panel.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}
```

---

## Common Mistakes

1. **Creating a manual divider line** — always import `Listitem/Divider` (key `aa67201939f81ab340758095bc5807ae41e4cc25`). Hand-drawn lines skip the color token and will break in dark mode.

2. **Using the wrong width for User select** — `Listitem/User select` is 224px, not 210px like the other item types. Always check the set's default width before resizing.

3. **Setting `layoutSizingHorizontal = "FILL"` before `appendChild`** — always append first, then set FILL/HUG.

4. **Building a shell component** — there is no importable container. Create a `figma.createFrame()` with the specified border, fill, radius, and shadow yourself.

5. **Using `setProperties` for icon swaps** — the icon slots in Listitem/Menu are INSTANCE_SWAP nodes. Use `swapComponent()`, not `setProperties()`.

6. **Forgetting `addonBefore: false`** — Listitem/Menu defaults to `addonBefore=true` (shows a star placeholder icon). Always set this to `false` unless you actually want an icon.

7. **Text node lookup by name** — Figma label text nodes are sometimes named with their nodeId (e.g. `"1031:56698"`). Use `findOne(n => n.type === "TEXT")` or match by `n.characters === "Label"` instead.

8. **Using Listitem/Menu for selectable lists** — use `Listitem/Single select` for radio-style pick-one lists and `Listitem/Multiselect` for checkbox lists. `Listitem/Menu` is for command menus only.

9. **Danger item still has description row** — `Variant=Danger` has no description row and is 40px tall. Never try to enable `description=true` on a Danger variant.

10. **Listitem height below 40px** — all Listitem variants (`Listitem/Menu`, `Listitem/Single select`, `Listitem/Multiselect`, `Listitem/User select`, `Listitem/Search`) have a **minimum height of 40px**. Never resize a listitem row below 40px — doing so clips content and breaks touch targets. Custom badge dropdown rows (which don't use Listitem components directly) may use 32px only because they are plain frames, not Listitem instances.

10. **Using `importComponentSetByKeyAsync` when you only need one variant** — if you always use the same state (e.g. Default/Default), you can use `importComponentByKeyAsync` with the individual variant key for a lighter import.
