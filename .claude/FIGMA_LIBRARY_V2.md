# Axiom V2 Figma Library Reference

## Files

| File | fileKey | Purpose |
|---|---|---|
| Components V2 — Legacy | `JYy51au6YaA4QZKpQy1ZRg` | All UI components (Button, Input, Badge, etc.) |
| Foundations V2 | `V1Svt6wLb5r22caAEr7bG0` | Color tokens, typography, spacing, radius |
| Axiom Icons | `F1vaZkWrXaCLxM81W5OzkG` | Icon set (node `2:48`) |
| **Opal Components** | `GH25lYLDM34molSm1yhQO3` | Opal-specific components, orb icon, Opal gradients — see Opal section below |
| Opal Components | `GH25lYLDM34molSm1yhQO3` | Opal-specific components, orb icon, Opal gradients |

---

## Color Tokens — Semantic (use these, not hex)

CSS variable pattern: `fg.default` → `--ax-colors-fg-default`  
Light/dark mode: single token resolves both via `[data-theme="dark"]`

### Foreground (fg)

| Token | Light hex | Dark hex |
|---|---|---|
| fg.default | `#2E3442` | `#F5F6FA` |
| fg.secondary | `#4F576E` | `#CACFDC` |
| fg.tertiary | `#66708C` | `#838DA4` |
| fg.disabled | `#838DA4` | `#F9FAFC52` |
| fg.white | `#FFFFFF` | `#FFFFFF` |
| fg.accent | `#0037FF` | `#6A8FFC` |
| fg.error | `#CC1616` | `#FC8B8B` |
| fg.success | `#03A65D` | `#7CD2A7` |
| fg.warning | `#F79008` | `#FFC84B` |
| fg.information | `#2F7AEE` | `#7BAAF4` |
| fg.avatar.neutral | `#4F576E` | `#E9EDF5` |
| fg.avatar.purple | `#412470` | `#E5DCF4` |
| fg.link.default | `#0037FF` | `#2E66F7` |
| fg.link.visited | `#532E8F` | `#693AB6` |

### Background (bg)

| Token | Light hex | Dark hex |
|---|---|---|
| bg.default | `#FFFFFF` | `#1C2029` |
| bg.page | `#F9FAFC` | `#171A23` |
| bg.secondary | `#F5F6FA` | `#1C212B` |
| bg.tertiary | `#DADFEB` | `#4F576E` |
| bg.default.inverse | `#2E3442` | `#E9EDF5` |
| bg.overlay | `#091E4252` | `#F9FAFC52` |
| bg.accent | `#0037FF` | `#2E66F7` |
| bg.accent.light | `#B3C3FF` | `#001666` |
| bg.accent.subtle | `#F0F3FF` | `#000B33` |
| bg.error | `#CC1616` | `#CC1616` |
| bg.error.light | `#FFB4B4` | `#911D1D` |
| bg.error.subtle | `#FFD7D7` | `#601313` |
| bg.success | `#038047` | `#038047` |
| bg.success.light | `#A5E1C3` | `#17492B` |
| bg.success.subtle | `#D1F0E1` | `#082415` |
| bg.warning | `#FFC84B` | `#F79008` |
| bg.warning.light | `#FEDF88` | `#7A2E0D` |
| bg.warning.subtle | `#FEF1C6` | `#4E1D09` |
| bg.information | `#115DD4` | `#115DD4` |
| bg.information.light | `#A1C2F7` | `#09306D` |
| bg.information.subtle | `#C6DBFA` | `#051939` |
| bg.avatar.neutral | `#E9EDF5` | `#2E3442` |
| bg.avatar.purple | `#E5DCF4` | `#412470` |
| bg.default.hovered | `#091E420A` | `#F9FAFC0F` |
| bg.default.pressed | `#091E4214` | `#F9FAFC1F` |

### Border

| Token | Light hex | Dark hex |
|---|---|---|
| border.default | `#CACFDC` | `#66708C` |
| border.secondary | `#DADFEB` | `#4F576E` |
| border.tertiary | `#E9EDF5` | `#2E3442` |
| border.control | `#838DA4` | `#4F576E` |
| border.accent | `#0037FF` | `#6A8FFC` |
| border.focus | `#2E66F7` | `#6A8FFC` |
| border.error | `#CC1616` | `#FFB4B4` |
| border.success | `#03A65D` | `#03A65D` |
| border.warning | `#F79008` | `#F79008` |

---

## Color Palette — Primitives

### Neutral (Gray)
`#FFFFFF` `#F9FAFC` `#F5F6FA` `#E9EDF5` `#DADFEB` `#CACFDC` `#B8BECB` `#838DA4` `#66708C` `#4F576E` `#2E3442` `#1C212B` `#1C2029` `#171A23` `#091E42`

### Brand (Blue)
`#F0F3FF` `#B3C3FF` `#6A8FFC` `#2E66F7` `#0037FF` `#002CCC` `#002894` `#001666` `#000B33`

### Red
`#FFF7F7` `#FFD7D7` `#FFB4B4` `#FC8B8B` `#F64F4F` `#CC1616` `#B21313` `#911D1D` `#601313` `#300A0A`

### Green
`#D1F0E1` `#A5E1C3` `#7CD2A7` `#5AC58A` `#03A65D` `#038047` `#24663E` `#17492B` `#082415`

### Yellow
`#FEF1C6` `#FEDF88` `#FFC84B` `#FDB022` `#F79008` `#DC6903` `#B54707` `#7A2E0D` `#4E1D09`

### Purple
`#E5DCF4` `#693AB6` `#532E8F` `#412470`

---

## Typography Scale

Font family: `InterVariable, system-ui, sans-serif` (`--ax-fontFamily-sans`)  
Mono: `Fira Code Variable, ui-monospace` (`--ax-fontFamily-mono`)

| Scale | fontSize | lineHeight | CSS var prefix |
|---|---|---|---|
| xs | 10px | 14px | `--ax-fontSize-xs-*` |
| sm | 12px | 16px | `--ax-fontSize-sm-*` |
| md | 14px | 20px | `--ax-fontSize-md-*` |
| lg | 16px | 24px | `--ax-fontSize-lg-*` |
| xl | 20px | 28px | `--ax-fontSize-xl-*` |
| 2xl | 24px | 32px | `--ax-fontSize-2xl-*` |
| 3xl | 28px | 40px | `--ax-fontSize-3xl-*` |
| 4xl | 32px | 44px | `--ax-fontSize-4xl-*` |

fontWeight: 400 normal, 500 medium, 600 semibold (no token — use CSS values directly)

---

## Border Radius

| Token | Value | Figma usage |
|---|---|---|
| xs | 2px | `rounded="xs"` |
| sm | 4px | `rounded="sm"` |
| md | 6px | `rounded="md"` |
| lg | 8px | `rounded="lg"` |
| xl | 12px | `rounded="xl"` |
| full | 9999px | `rounded="full"` |

---

## Spacing Tokens

Valid values (px, used directly as prop strings):  
`"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"`

---

## Icons (Axiom Icons, `F1vaZkWrXaCLxM81W5OzkG`, page `2:48`)

Import from `@optimizely/axiom-icons`:
```ts
import { IconPenToSquare, IconArrowsRotate } from '@optimizely/axiom-icons'
```

**Naming:** `kebab-case` in Figma → `Icon` + PascalCase in React  
e.g. `pen-to-square` → `IconPenToSquare`, `circle-plus` → `IconCirclePlus`

**Variants:**
- base — regular weight (default)
- `-thin` suffix — lighter stroke (e.g. `pen-thin` → `IconPenThin`)
- `-solid` suffix — filled (e.g. `circle-check-solid` → `IconCircleCheckSolid`)
- `-regular` suffix — medium weight
- `ax-` prefix — custom Optimizely icons (e.g. `ax-compare` → `IconAxCompare`)

### All 523 icons (page `2:48`, canonical Small 20×16 frame)

```
360-degrees              agent                    align-center
align-justify            align-left               align-right
angle-down               angle-left               angle-right
angle-up                 angles-down              angles-right
arrow-down               arrow-down-a-z           arrow-down-short-wide
arrow-down-wide-short    arrow-down-z-a           arrow-left
arrow-left-from-line     arrow-left-to-line       arrow-right
arrow-right-arrow-left   arrow-right-from-bracket arrow-right-from-line
arrow-right-long         arrow-right-to-bracket   arrow-right-to-line
arrow-rotate-left        arrow-rotate-right       arrow-trend-down
arrow-trend-up           arrow-turn-down-left     arrow-turn-up
arrow-up                 arrow-up-right-from-square arrow-up-thin
arrows-from-dotted-line  arrows-left-right        arrows-maximize
arrows-minimize          arrows-repeat            arrows-rotate
arrows-up-down-left-right asterisk                ax-app-directory
ax-app-push              ax-box-gear              ax-compare
ax-compare-both          ax-compare-left          ax-compare-right
ax-content-width         ax-database-lock         ax-dynamic-folder
ax-font-color            ax-grouped-column        ax-left-right-responsive
ax-link-list             ax-pop-in                ax-pop-out
ax-reorder               ax-responsive-column     ax-right-left-responsive
ax-rotate-device         ax-sort-checked          ax-template
ax-user-arrow-right      ax-web-push              badge-percent
ball-pile                ban                      barcode
bars                     bars-sort                bars-staggered
bell                     bell-slash               bold
bolt                     book                     book-open
bookmark-solid           books                    border-all
border-none              box                      box-archive
box-open                 boxes-stacked            briefcase
browser                  bug                      bullseye-pointer
calendar                 calendar-clock           calendar-days
caret-down-solid         caret-up-solid           cart-circle-check
cart-minus               cart-plus                cart-shopping
cart-shopping-fast       chart-column             chart-line
chart-mixed              check                    check-double
chevron-down             chevron-right            circle
circle-arrow-down        circle-arrow-up          circle-check
circle-check-solid       circle-chevron-down      circle-dollar
circle-dot               circle-exclamation       circle-exclamation-solid
circle-half-stroke-solid circle-info              circle-info-solid
circle-minus             circle-plus              circle-question
circle-question-solid    circle-small-solid       circle-solid
circle-user              circle-xmark             circle-xmark-solid
clipboard                clipboard-check          clock
clock-rotate-left        clone                    code
code-branch              columns-3                comment
comment-plus             comments                 copy
cube                     cubes                    database
diagram-cells            diagram-subtask          diagram-venn
diamond                  display                  dollar-sign
download                 ellipsis-solid           ellipsis-stroke
ellipsis-stroke-vertical envelope                 envelope-open
eraser                   expand                   eye
eye-slash                file                     file-chart-pie
file-exclamation         file-export              file-image
file-import              file-lines               file-pdf
file-pen                 file-plus                file-spreadsheet
file-video               file-word                file-zipper
filter                   filter-slash             flag
flag-pennant             flask                    floppy-disk
folder                   folder-arrow-down        folder-blank
folder-bookmark          folder-image             folder-open
folder-plus              folder-tree              folder-user
folders                  gallery-thumbnails       gauge
gear                     gift                     glasses-round
globe                    grid                     grid-2
grid-2-plus              grip                     grip-lines-vertical
grip-vertical            hand-pointer             hashtag
heading                  highlighter              horizontal-rule
house                    house-blank              image
image-landscape          image-portrait           image-slash
images                   inbox-full               input-numeric
input-pipe               input-text               italic
key                      key-skeleton-left-right  language
laptop-mobile            layer-group              left-to-line
lightbulb                line-height              link
link-horizontal          link-horizontal-slash    link-simple
link-slash               list                     list-check
list-dropdown            list-ol                  list-tree
list-ul                  location-dot             lock
lock-open                magnifying-glass-minus   magnifying-glass-plus
megaphone                memo-pad                 message-lines
microship-ai             mobile                   money-bill
money-check-pen          monitor-waveform         mug-hot
music                    objects-align-bottom     objects-align-center-vertical
objects-align-top        octagon-minus            paint-roller
panorama                 paper-airplane-top       paperclip
paste                    pause                    pen
pen-field                pen-line                 pen-slash
pen-to-square            people-simple            phone
pipe-section             play                     plus
presentation-screen      puzzle-piece             quote-right
rectangle-list           rectangle-wide           reply
right-from-line          robot                    rocket
rss                      scissors                 search
shapes                   share-nodes              shield-check
sitemap                  slider                   sliders
sliders-simple           sort-solid               sparkles
spinner                  split                    square
square-check             square-dashed            square-plus
square-poll-horizontal   square-user              stairs
star                     store                    strikethrough
sub-agent                subscript                sun-bright
superscript              table-cells              table-layout
tablet                   tag                      terminal
text                     thumbs-up                thumbtack
timeline-arrow           toggle-off               toolbox
trash-can                triangle-exclamation     triangle-exclamation-solid
truck                    underline                unify
upload                   user                     user-check
user-group               user-lock                user-pen
user-plus                user-robot               user-slash
user-solid               user-xmark               users
users-solid              vials                    video
wave-pulse               window-restore           xmark
```

**Thin variants** (append `-thin` to base name): align-center, align-left, align-right, arrow-up, arrows-from-dotted-line, ax-compare, ax-grouped-column, ax-left-right-responsive, ax-responsive-column, ax-right-left-responsive, ax-web-push, ball-pile, bell, border-all, border-none, box-archive, browser, calendar, calendar-clock, chart-mixed, circle-check, circle-dot, circle-exclamation, circle-info, circle-question, clock-rotate-left, code, columns-3, comment, cube, download, ellipsis-stroke, ellipsis-stroke-vertical, envelope, file-chart-pie, file-exclamation, file-image, file-pdf, file-spreadsheet, file-video, file-word, file-zipper, filter, flag, flag-pennant, flask, folder, folder-bookmark, folders, gear, globe, grid, house, image, image-slash, input-numeric, input-text, link-horizontal, link-horizontal-slash, link-simple, list, list-dropdown, list-tree, mobile, monitor-waveform, pen, pen-to-square (→ file-pen), pipe-section, play, plus, search, shapes, sitemap, sliders, tag, text, thumbs-up, thumbtack, timeline-arrow, toggle-off, trash-can, triangle-exclamation, upload, user, user-group, user-robot, vials, window-restore, xmark

**Solid variants**: bookmark-solid, caret-down-solid, caret-up-solid, circle-check-solid, circle-exclamation-solid, circle-info-solid, circle-question-solid, circle-small-solid, circle-solid, circle-xmark-solid, ellipsis-solid, sort-solid, square-user (→ user-solid), thumbtack-solid, triangle-exclamation-solid, users-solid

---

## Components (Components V2 — Legacy, `JYy51au6YaA4QZKpQy1ZRg`)

Use `figma.importComponentSetByKeyAsync(componentKey)` in the Plugin API.  
Variant property names are **case-sensitive** — use exact strings below.

### Button
**componentKey:** `3296fc4820c3d0194d963b89c435b3e5b4dcc0ea`

| Figma prop | Values |
|---|---|
| Appearance | Primary / Default / Subtle / Danger / Danger Outline / Inverse / Default Opal / Primary Opal |
| Size | sm / md / lg |
| Loading | true / false |
| Has Icon | true / false |
| Icon Position | start / end |
| State | Default / Hover / Active / Focused / Disabled / Loading |

> **⚠️ Opal appearances (`Default Opal`, `Primary Opal`) are reserved exclusively for actions that directly invoke an AI feature** (e.g. "Ask Opal", "Generate", "Summarize"). Use standard appearances (`Primary`, `Default`, `Subtle`) for all other actions — including toolbar actions, navigation, sharing, and file management.

### Toggle Button
**componentKey:** `d8956657543d7623c4056abc4f6b8a4a98b5b4a7`

| Figma prop | Values |
|---|---|
| Appearance | Default / Subtle |
| Size | sm / md / lg |
| Pressed | true / false |
| State | Default / Hover / Focused / Disabled |

### Input
**componentKey:** `87412b4b78df5711c2906719875b7b9168da2be6`  
⚠️ Minimum size is `md` — `sm` is NOT supported.

| Figma prop | Values |
|---|---|
| Size | md / lg / xl |
| State | Default / Hover / Focused / Disabled / Error / Read Only |
| Invalid | true / false |

### Text Area
**componentKey:** `cd05ef35c0e28cc3e4c1d8586e01fc29991ee60b`

| Figma prop | Values |
|---|---|
| State | Default / Hover / Focused / Disabled / Error / Read Only |
| Resize | none / auto / vertical |

### Alert
**componentSetKey:** `fd2f5d933b6b697eb909b769b17b71f86c0a61cf` ← use with `importComponentSetByKeyAsync`  
Component set node: `1593:19796` in `JYy51au6YaA4QZKpQy1ZRg`  
⚠️ Use `Information` not `Info` for the intent value.

| Figma prop | Values |
|---|---|
| Intent | Neutral / Information / Warning / Danger / Success / Opal |

```js
const alertSet = await figma.importComponentSetByKeyAsync("fd2f5d933b6b697eb909b769b17b71f86c0a61cf");
const variant = alertSet.children.find(c => c.name.includes("Information")) ?? alertSet.defaultVariant;
const instance = variant.createInstance();
parent.appendChild(instance);
instance.layoutSizingHorizontal = "FILL";
// Set text via component TEXT property
for (const [key, def] of Object.entries(instance.componentProperties)) {
  if (def.type === "TEXT") instance.setProperties({ [key]: "Your message here" });
}
```

### Badge
**componentKey:** `d853342dd778628f8f008ef2ceb342957ce3a50f`  
⚠️ Use `Information` not `Info`.

| Figma prop | Values |
|---|---|
| Intent | Information / Success / Warning / Danger / Neutral / Primary |
| Size | xs / sm / md / lg |

### Avatar
**componentKey:** `07a871d4a8a3bfd2d6cd236b0547ee7ec3a31fe4`  
**Avatar Group:** `89f598b1b62c2fac1fae5ab1e2024df0bd92a910`

| Figma prop | Values |
|---|---|
| Size | 2xs / xs / sm / md / lg / xl / 3xl |
| Color Scheme | Purple / Neutral |
| Has Image | true / false |
| Has Name | true / false |

### Tooltip
**componentKey:** `8620b20c2c6850f25f50a7ab83d00e3cdf734ca1`  
**Help Tooltip:** `7b951c89a3489b91e7ecea865efd5b3b4450aa7d`

| Figma prop | Values |
|---|---|
| Side | Top / Bottom / Left / Right |
| Align | Center / Start / End |

### Checkbox
**componentKey:** `832bf13d26272af25bc6385a154108e990a053db`

| Figma prop | Values |
|---|---|
| State | Unchecked / Checked / Indeterminate |
| Disabled | true / false |

### Spinner
**componentKey:** `6663c184ae5339e6a21af419fc95eb8f6326f764`

| Figma prop | Values |
|---|---|
| Appearance | Default / Inverse |
| Size | sm / md / lg |

### LabelMenuButton ⚠️ (filter dropdowns — commonly missed)
**componentKey:** `80b8cd95cfcf2af31af016b6d56effd9986cbbb4`

> **Always use for filter chips** that show "Label  Value ▾". Never substitute a plain Button or Select.  
> In code: `<LabelMenuButton label="Type">All</LabelMenuButton>`

| Figma prop | inspect variant name string |
|---|---|
| State | Default / Hover / Focused / Disabled |

### Search
**componentKey (set):** `421cb252c1f8c991af051195f642d380b3354a4e`  
Figma ref: `JYy51au6YaA4QZKpQy1ZRg` node `814:36172`

| Prop | Values |
|---|---|
| `Variant` | `Text` (has typed value) / `Placeholder` (empty — use this for default state) |
| `Size` | `Medium - 32` (toolbar/compact) / `Large -40` (prominent) |
| `State` | `Default` / `Hover` / `Focus` / `Disabled` |

**Default placeholder text is `"Search"`** — override `Placeholder#…` prop to change it.

Individual variant keys (for `importComponentByKeyAsync` direct):

| Variant | Key |
|---|---|
| Placeholder, Medium - 32, Default | `e46eef6b390b7dd258bed222c49caeb984905d9c` |
| Placeholder, Large -40, Default | `80f3bfa879cfaa191679e85fc992cf72ddfd090b` |
| Text, Large -40, Default | `ea94b49afbc23ba9374c013d7755e4a2edda57db` |
| Text, Medium - 32, Default | `c04c41780c5e5bfb2e6d60a7ab5fb8ea5a9e15c6` |

Usage — toolbar search (empty, medium, default placeholder "Search"):
```js
const searchSet = await figma.importComponentSetByKeyAsync("421cb252c1f8c991af051195f642d380b3354a4e");
const variant = searchSet.children.find(c => c.name === "Variant=Placeholder, Size=Medium - 32, State=Default");
const inst = variant.createInstance();
parent.appendChild(inst);
inst.layoutSizingHorizontal = "FIXED";
inst.resize(220, inst.height); // set desired width after append
// Placeholder text is "Search" by default — override only if different:
// const ph = Object.keys(inst.componentProperties).find(k => k.startsWith("Placeholder#"));
// if (ph) inst.setProperties({ [ph]: "Search artifacts..." });
```

### Tabs
**Tabs wrapper componentKey:** `3d5b3ddd2d93c0a736988bf55b7122f3b6bfd993` (single Component — not a set)  
**Tab Item componentKey (set):** `aa3fd698b0912fa5e0ecc9d769d5a7cb0f410fc9`

> ⚠️ **Tab Item variants are NOT importable** (`importComponentSetByKeyAsync` fails — variants are unpublished in the library). Always use the full `Tabs` wrapper component.

> ⛔ **`TabNav` (key `3b43ff3be2c4c729a9b2bd834a20437a1b822305`) is from "Axiom Components" (V3) — WRONG LIBRARY.** Never use it for V2 builds. Always use `Tabs` (`3d5b3ddd2d93c0a736988bf55b7122f3b6bfd993`) from "Components V2 – Legacy".

**Tab Item structure** (direct children of the `Tabs` instance):
- Property: `IsSelected` = `"true"` / `"false"` (string, not boolean)
- Text node name: `Label` (inside child `Content frame`)
- Hide extra tabs: `tabItems[i].visible = false` for items 2–8

```js
const tabsComp = await figma.importComponentByKeyAsync("3d5b3ddd2d93c0a736988bf55b7122f3b6bfd993");
const inst = tabsComp.createInstance();
parent.appendChild(inst);
inst.layoutSizingHorizontal = "FILL";

const items = inst.children.filter(c => c.name === "Tab Item" && c.type === "INSTANCE");
// Tab 1 — active
items[0].setProperties({ "IsSelected": "true" });
items[0].findOne(n => n.name === "Label" && n.type === "TEXT").characters = "My Artifacts";
// Tab 2 — inactive
items[1].setProperties({ "IsSelected": "false" });
items[1].findOne(n => n.name === "Label" && n.type === "TEXT").characters = "Shared with me";
// Hide extras
for (let i = 2; i < items.length; i++) items[i].visible = false;
```

### Segmented Control
**Segmented Control (set):** `aa3ef4a941928e28f6a1aac81a4084ee275c937f`  
**Segmented Control Item (set):** `fa4d95991a293dc5910526a91588d466b73fc47a`

| Variant name | Use |
|---|---|
| `Variant=2 items` | List/grid toggle |
| `Variant=3 Items` | Three-option selector |

### Table Components ⚠️ (use these keys — old keys were wrong)

> The Table Template set contains internal parts (`Part=Table Header`, `Part=Table`) that look importable but are not the right components to use. Use **Column Header Cell** and **Data Cell** instead.

**Column Header Cell (COMPONENT_SET):** `d473cabd925eb8cd7066d03b3122f7ce01241484`

| Variant | Use |
|---|---|
| `Variant=Text, Hover=false` | Standard text header |
| `Variant=Select All, Hover=false` | Checkbox select-all header |
| `Variant=Numeric, Hover=false` | Right-aligned number header |

**Data Cell (COMPONENT_SET):** `a051c4754e3ea047feb07b5e30ceae244c63b6a2`

| Variant | Use |
|---|---|
| `Type=Row Header, Hover=false` | First column (artifact name) |
| `Type=Text, Hover=false` | String values (type, source) |
| `Type=Date, Hover=false` | Dates — set `Time#5950:76` to `""` to hide second line |
| `Type=Badge, Hover=false` | Status/badge cells |
| `Type=Avatar, Hover=false` | User avatar cells |

**Instance property fixes required after creating Data Cell instances:**
```js
// Hide description row (shows doubled text if left true)
cell.setProperties({ "Show Description#3225:6": false, "User Name#10846:19": false });
// For Date cells — clear Time to get single-line display
cell.setProperties({ "Time#5950:76": "" });
```

**Table Template (internal, do not use directly):** `0f0af50f988ccd85f537da38eab5a2378131b7a3`  
**Sorting indicator (set):** `0b937ddf17778c87c4504cb994361d8ca16fa140`

### Select (full — trigger + open dropdown)
**componentSetKey:** `1c849767fea793e0e8567f9d5fe126e9659fc6a7`

⚠️ **Always use this — never approximate a select/dropdown with a custom frame.** Use whenever a form field, filter, or row action needs a pick-one dropdown.

| Variant | componentKey |
|---|---|
| `Variant=Select, Open=True` | `231c90292aa960cb39e3506b2501c122cee8a8f5` |
| `Variant=Filter, Open=True` | `2b322dea5c63e38885ee19e92a687f3697e39ebb` |

**Structure inside the instance:**
- `Text value` TEXT node — set to the currently selected option (e.g. `"Reuse existing"`)
- `Label` INSTANCE — hide (`visible=false`) when no field label is needed
- `Form note` INSTANCE — hide when no helper text is needed
- Listbox list items: `findAll(n => n.type === "INSTANCE" && n.name.includes("Listitem"))` — set `Label` TEXT to each option label; hide extras with `visible=false`; mark selected item with `setProperties({ "Selected": "True" })`

**Usage pattern:**
```js
const selectComp = await figma.importComponentByKeyAsync("231c90292aa960cb39e3506b2501c122cee8a8f5");
const inst = selectComp.createInstance();
parent.appendChild(inst);
inst.resize(200, inst.height); // resize width to fit context

// Set current value
const valueText = inst.findOne(n => n.type === "TEXT" && n.name === "Text value");
if (valueText) valueText.characters = "Reuse existing";

// Hide label + form note
const labelInst = inst.findOne(n => n.name === "Label" && n.type === "INSTANCE");
if (labelInst) labelInst.visible = false;
const formNote = inst.findOne(n => n.name === "Form note");
if (formNote) formNote.visible = false;

// Set list item labels (show 2, hide the rest)
const listItems = inst.findAll(n => n.type === "INSTANCE" && n.name.includes("Listitem"));
const options = [
  { label: "Reuse existing", selected: true },
  { label: "Create new copy", selected: false },
];
listItems.forEach((item, i) => {
  if (i < options.length) {
    item.visible = true;
    const lbl = item.findOne(n => n.type === "TEXT" && n.name === "Label");
    if (lbl) lbl.characters = options[i].label;
    try { item.setProperties({ "Selected": options[i].selected ? "True" : "False" }); } catch {}
  } else {
    item.visible = false;
  }
});
```

**Select/ Listbox** (dropdown panel only, for custom dropdown UI):
- componentSetKey: `2c1de206fad3b9213a971b6023f4d105e9f8d726`
- `Variant=Label` key: `1c89e9c4549833a4cc9f51c26b3dbdbd8f162cb2`

### Select Trigger (trigger only — closed state)
**componentKey:** `9760ea4ea204b736a54f40b93697fbd0b8885455`

| Figma prop | Values |
|---|---|
| State | Default / Hover / Focused / Disabled |
| Size | md / lg / xl |

### Sidenav Base
**componentKey:** `95186ccb7d62d7bd1afde6ef2a12a49cbce3d298`

### Sidenav Menu Item
**componentKey:** `42e6d60b2bb7bdcc91adfa35eff29e0c27d09750`

### Link
**componentKey:** `75a46d48b18383a18017f4d033cf1c4bb188b5fe`

### Thumbnail
**componentKey:** `76e8a682b1a0e4de9f81e37af79398f6ccd725ba`

---

### Global Bar ⚠️ (app-wide top nav — built from primitives, not a single component)

**Figma reference:** node `4289:4250`, file `JYy51au6YaA4QZKpQy1ZRg`

The Global Bar is NOT a single importable component — it is built from Axiom `Button` (Subtle/md) + `Menu` primitives in code (`app/components/GlobalBar.tsx`). In Figma, construct it manually as follows.

**Frame spec:**
- Height: `48px`, width: FILL (full width)
- Fill: `bg.default`
- Border bottom: 1px `border.tertiary`
- Padding: `pl=8, pr=24`
- Layout: `HORIZONTAL`, `SPACE_BETWEEN`, `CENTER` align

**Left cluster — "Product Switcher"** (`gap=32`, height=48px, `CENTER` align):
1. **Logo container** — 40×40, `pl=10, pr=6`, contains 24×24 Optimizely logo SVG
2. **Account dropdown** — `px=8, py=10, rounded=md`; text 14px/Medium/`fg.default` + `IconAngleDown` (16px, `fg.default`)
3. **Product switcher dropdown** — same spec as account dropdown; label reflects current product (e.g. "Opal")

**Right cluster — "Actions"** (`gap=4`, `CENTER` align):
1. **Theme button** — `Button Subtle/md` with label "System" + device-desktop icon
2. **"Ask Opal" pill** — `h=40, px=12, rounded=12`; text 14px/Medium/`fg.default` + 20×20 Opal orb image (`/opal-orb.png`)
3. **Icon items** — each: `Button Subtle/md` with `Icon Button=True`, swap icon slot using `swapComponent` (never `setProperties` INSTANCE_SWAP):

| Button | Axiom icon name | componentKey |
|---|---|---|
| Search | `magnifying-glass-regular` | `bc585dfd171e7301a658a5fc09f90bd136f9fb51` |
| Notifications | `bell 16` | `1de5afa669027f45f28ce446bfb2aa8207855084` |
| Help | `circle-question 16` | `d733ad5214f664970008b9cf2b03ae767eeeb713` |
| Code | `code 16` | `ff36366d7fa96e047996d8f9e0f3860b6002d47b` |
| User | `user 16` | `f286b22126c5b4145fb34e63b4dedf6c9f075f35` |
| Angle-down (dropdown chevron) | `angle-down 16` | `8dc5a493b96d8e97df1b1ae487cb5a18d2f28c25` |

**How to build in Figma Plugin API:**
```js
// Left dropdown items (Stride, Opal) — custom frames, NOT Button instances
const angleDown = await figma.importComponentByKeyAsync("8dc5a493b96d8e97df1b1ae487cb5a18d2f28c25");
const dropdown = figma.createFrame();
dropdown.layoutMode = "HORIZONTAL";
dropdown.counterAxisAlignItems = "CENTER";
dropdown.itemSpacing = 6;
dropdown.paddingLeft = 8; dropdown.paddingRight = 8;
dropdown.paddingTop = 6; dropdown.paddingBottom = 6;
dropdown.cornerRadius = 6;
dropdown.fills = [];
// add text node (Inter Medium 14px, fg.default) + angleDown.createInstance()

// Right icon buttons — real Button Subtle/md, swap icon slot
const buttonSet = await figma.importComponentSetByKeyAsync("3296fc4820c3d0194d963b89c435b3e5b4dcc0ea");
const subtleMd = buttonSet.children.find(c => {
  const p = Object.fromEntries(c.name.split(', ').map(s => s.split('=')));
  return p["Appearance"] === "Subtle" && p["Size"] === "md";
}) ?? buttonSet.defaultVariant;
const btn = subtleMd.createInstance();
btn.setProperties({ "Icon Button": "True" });
// Find "Icon" slot and swapComponent — never use setProperties for INSTANCE_SWAP
function findIconSlot(node) {
  if (node.type === "INSTANCE" && node.name === "Icon") return node;
  if ('children' in node) for (const c of node.children) { const r = findIconSlot(c); if (r) return r; }
  return null;
}
const iconComp = await figma.importComponentByKeyAsync("bc585dfd171e7301a658a5fc09f90bd136f9fb51"); // e.g. magnifying-glass
findIconSlot(btn)?.swapComponent(iconComp);
```

---

---

---

# Opal Components Library

> **Opal-specific only.** Use this section when building Opal UI pages.
> Color tokens: use **Axiom V2 semantic tokens** for everything EXCEPT the Opal-specific values listed below (gradient and primary purple are not in Axiom V2).

**fileKey:** `GH25lYLDM34molSm1yhQO3`

---

## Opal — Color Exceptions (not in Axiom V2)

| Token | Value | Usage |
|---|---|---|
| Opal primary purple | `#7c3aed` | `Color/Primary/500` — orb tint, active states |
| Opal CTA gradient | `linear-gradient(135deg, #392ecf 10.5%, #7740ec 100%)` | Primary Opal buttons, CTAs |
| Opal input stroke | `linear-gradient(135deg, #7c3aed, #8287ff, #7d04c7)` | Focused prompt input border |
| Opal message bg | `radial-gradient(#f5f3ff 5%, #e5efff 61%, #ddd6fe 85%)` | AI response bubble background |
| Opal suggestion stroke | `linear-gradient(#ddd6fe, rgba(110,97,255,.26), rgba(97,123,255,.26))` | Suggestion chip border |

All other fills → Axiom V2 semantic tokens (`bg.*`, `fg.*`, `border.*`).

---

## Opal — Component Keys

| Component | componentKey | Variant props / notes |
|---|---|---|
| Opal Button | `525fe98efb6aa15e7e304000de23ef57bd7f543f` | Variants: Primary, Secondary, Inside |
| Opal Icon (orb) | `1d6bc2192fd97e0dee5a461b20592962b04b6de3` | The animated Opal orb/sparkle — use as AI avatar and in buttons |
| Prompt Input | `4d0db33515a70401ebf7b9e81d19c7ec3d217736` | Full prompt input area with quick actions |
| Quick Action Button | `1f9a91198e5d0709f48ea763d59038ccf7487846` | Icon-only toolbar buttons inside Prompt Input |
| Body / Opal Message | `b054cdcd14e086eb231cf5b9f2bf09ae6e962f0b` | AI response chat bubble |
| Body / User Message | `48d9e341239c42aed33667c1146bcbd0cfdf0edc` | User message chat bubble |
| Body / Slot | `903e816a8af8cab065fb6a56da14458f53e79c04` | Placeholder — swap with User or Opal message |
| Activity Stream | `3b3b3cb9e1ca894e355f0f0a70a0b1c5e216d120` | AI execution/thinking stream (latest Apr 2026) |
| Activity Stream Step | `5cc4ec126458fcaf1d42fe5007ea129b17c4aa95` | Single step in loader stream |
| Island / Prompt | `27f45a41078752b7a9ab22ed417f98231fdd597b` | Suggested-prompt chip |
| Island / Suggestion | `0fd7a88c62c0a125ac79a16440175ac1dc5b8cf5` | Answer island — insert suggestion into editor |
| Canvas | `2703e54fd0015d278a53f428494dab6a444bbc02` | Canvas artifact/output panel |
| Opal Header | `888703d364f9739382a46f7fcad64a7d3202dcbd` | Main Opal header bar |
| History Header | `6d42624ba866afd591b671171014a007cf6c6bda` | Chat history sidebar header |
| OpalAlert | `0b394e3c11043b2e1bf768c8c548de0df1e4948a` | Alert/notification (latest Dec 2025) |
| Rate Icons | `b250511e91daed0f033d7e8be757928a7291ee01` | Thumbs up/down feedback on messages |
| Progress | `a4c945b04f43eb08e22e624a0b63c0df4f731b28` | Progress bar for AI thinking |
| Task Status | `6497206826b94694b301c4e3ac02ae4016f5408a` | Task execution status indicator |

---

## Opal — Exclusive Icons

> These icons exist **only in the Opal Components file** — NOT in `@optimizely/axiom-icons`.

| Icon | How to use | Notes |
|---|---|---|
| Opal orb | Import component key `1d6bc2192fd97e0dee5a461b20592962b04b6de3` | The AI orb/sparkle — use as AI chat avatar and inside Opal Button |
| Agent | Custom vector ("Subtract" shape) in Figma file | Used in Quick Action buttons — approximate with SVG if needed |
| thumbs-up-light | SVG layer `Opal custom icons/thumbs-up-light` | Thumbs up feedback on messages |
| thumbs-down-light | SVG layer `Opal custom icons/thumbs-down-light` | Thumbs down feedback on messages |
| file-arrow-up-light | SVG layer `Opal custom icons/file-arrow-up-light` | File upload in prompt input — **hidden** when + action is present; fallback: `file-import` from Axiom icons |

---

## Opal — Layout Spec (node `11285:26244`)

Reference node: `https://www.figma.com/design/GH25lYLDM34molSm1yhQO3/Opal-Components?node-id=11285-26244`

### Opal Base shell
- `bg: #F9FAFC`, `border: 1px #dadfeb`, `borderRadius: 8px`, `shadow: -6px 6px 25px rgba(12,16,29,0.08)`
- Flex column, `px: 24, py: 16`, full size
- Children: Header → Body (chats) → Prompt Input

### Header (Opal Base)
- `borderBottom: 1px #e9edf5`, `pb: 8`, flex row, `justifyContent: space-between`
- Left cluster: History toggle (Font Awesome hamburger glyph), New Chat (`IconCirclePlus`)
- Center: "Opal" text (`fontSize: 18, fontWeight: 500, letterSpacing: -0.252px`) + dropdown chevron
- Right cluster: Clear Chat (`IconArrowsMaximize`), More (`IconEllipsisSolid`)
- **Canvas mode**: hide history sidebar button

### Body / User Message
- Right-aligned, `pl: 32`
- Bubble: `bg: #e9edf5` (neutral avatar bg), `px: 16, py: 8`, `borderRadius: 8px`
- Text: `fontSize: 14, lineHeight: 1.6, letterSpacing: -0.21px, color: #080736`
- Avatar `xs` right of bubble, `pt: 10`

### Body / Opal Message — Quick Action Row
After the AI response text, a `gap: 8` flex row:
1. **"Edit in Canvas"** — `Button` subtle sm with `IconPenToSquare` (from Axiom icons)
2. **arrows-rotate** — Quick action icon button (28×28 frame, `p: 2/4`, `borderRadius: 4`)
3. **copy** — same quick action button style
4. **download** — same
5. **thumbs-up** — `Opal custom icons/thumbs-up-light` SVG (16×20 container)
6. **thumbs-down** — `Opal custom icons/thumbs-down-light` SVG (16×20 container)

### Prompt Input
- `bg: white`, `border: 1px #7c3aed` (focused), `borderRadius: 8px`, `pb: 8, pl: 10, pr: 8, pt: 8`, `gap: 12`
- Top: textarea text `fontSize: 14, lineHeight: 1.6, letterSpacing: -0.21px`
- Bottom actions row (`justifyContent: space-between`):
  - **Left — Input actions** (`gap: 4`):
    1. `IconPlus` — Add
    2. Agent custom icon ("Subtract" SVG)
    3. `IconBook` — Catalog
    4. ~~`file-arrow-up-light`~~ — **hidden** (merged into + action)
    5. `IconSlidersSimple` — Settings (has `bg: #f9fafc` background when active)
  - **Right — Send button**: `bg: #6d28d9` (Primary/Dark purple), `px: 4, py: 6`, `borderRadius: 6px`, `IconArrowUp` white
- Disclaimer: `fontSize: 11, lineHeight: 16, letterSpacing: 0.055px, color: #66708c` — "Opal can make mistakes. Double-check its responses."

### Quick Action Button pattern (reusable)
```
width: 28px, padding: 2px 4px, borderRadius: 4px
color: var(--colors/fg/secondary)
hover: bg var(--colors/bg/secondary)
Active state: bg #f9fafc
```

---

---

## Opal Product Page Layout (standard shell for Agents, Context, etc.)

All Opal product pages follow the same layout shell. Use this spec when building any new Opal product page in Figma.

### Frame structure

```
Page frame (1440 × 900, VERTICAL auto-layout)
├── Top Nav Bar           (FILL width, 48px — use Global Bar component)
└── Body row              (FILL width, FILL height, HORIZONTAL)
     ├── Sidenav Base     (56px wide, FILL height)
     └── Content area     (FILL width, FILL height, VERTICAL, px=32 py=24 gap=24)
          ├── Page header  (VERTICAL, gap=8, HUG height)
          │    ├── Heading  (fontSize=24/600, fg.default)
          │    └── Text     (fontSize=14/400, fg.secondary)
          ├── Tabs row     (HORIZONTAL, gap=0, HUG height — use Tabs V2 component)
          └── Content      (FILL width, FILL height — tab-specific content)
```

### Page header spec

| Property | Value |
|---|---|
| Layout | VERTICAL auto-layout, `gap: 8px`, HUG height, FILL width |
| Heading | Inter 24px / Semi-bold 600, `fg.default`, `letterSpacing: -0.336px` |
| Description | Inter 14px / Regular 400, `fg.secondary`, `lineHeight: 1.6` |

### Tabs row spec

Use the **Tabs** component (`3d5b3ddd2d93c0a736988bf55b7122f3b6bfd993`) from V2 Legacy.
- FILL width, HUG height
- Active tab: `fg.default`, 500 weight, 2px bottom border `border.default` (blue `#0069ff`)
- Inactive tab: `fg.secondary`, 400 weight, no border

### Content area padding

| Token | Value |
|---|---|
| `px` (left + right) | 32px |
| `py` (top + bottom) | 24px |
| Gap between sections | 24px |
| Header inner gap | 8px |

### Light mode fills (bind to variables, never hardcode)

| Element | Variable | Hex fallback |
|---|---|---|
| Page background | `bg.page` | `#F9FAFC` |
| Content surface | `bg.default` | `#FFFFFF` |
| Heading text | `fg.default` | `#2E3442` |
| Description text | `fg.secondary` | `#4F576E` |

---

## Rules for Figma Builds

---

### ⛔ Critical Anti-Patterns (do NOT do these)

| Anti-pattern | Correct approach |
|---|---|
| Assuming dark mode for Opal | **Scan the live page first.** Opal Artifacts is light mode. Only apply dark mode when DOM confirms `data-theme="dark"` |
| Using `TabNav` (`3b43ff3be2c4c729a9b2bd834a20437a1b822305`) | That is Axiom V3. Use `Tabs` (`3d5b3ddd2d93c0a736988bf55b7122f3b6bfd993`) from V2 Legacy |
| Using any component from "Axiom Components" library | That library is V3. All V2 builds must use "Components V2 – Legacy" (`JYy51au6YaA4QZKpQy1ZRg`) |
| Hardcoding hex fills (`#FFFFFF`, `#F5F6FA`) | Import semantic variables and use `setBoundVariableForPaint` — then theme-switching is one line |
| Building without scanning the live page | Always run the scan script below before building any frame |
| Applying `Type=Row Header` to body rows in Data Cell | `Type=Row Header` is ONLY for the leftmost name/title column cell. All other body rows use `Type=Text` |
| WRAP layout container with `primaryAxisSizingMode = "AUTO"` | AUTO means all children in one row — use `FIXED` width so the layout knows when to wrap |
| Setting `counterAxisSizingMode = "AUTO"` BEFORE `resize()` | `resize()` resets all sizing modes to FIXED. Always re-set AUTO **after** resize |
| Skipping the 3-property Data Cell fix | Every Data Cell instance must have `Show Description#3225:6: false`, `User Name#10846:19: false` applied |

---

### Step 0 — Scan the live page before building anything

Run this in the browser (via `javascript_tool` or console) before writing a single line of Plugin API code:

```js
({
  theme: document.documentElement.getAttribute('data-theme'),       // 'dark', 'light', or null
  colorScheme: getComputedStyle(document.documentElement).colorScheme, // 'light' or 'dark'
  tabs: [...document.querySelectorAll('[role="tab"]')].map(t => t.textContent.trim()),
  columnHeaders: [...document.querySelectorAll('th')].map(h => h.textContent.trim()),
  segmentedControl: [...document.querySelectorAll('[role="radio"], [role="tab"]')].map(b => b.textContent.trim()),
})
```

Use the results to determine:
- **Variable mode**: Light Mode = `"20:6"`, Dark Mode = `"20:7"` — set on the wrapper frame, not individual nodes
- **Exact tab labels** — don't guess from code; read from DOM
- **Exact column headers** — same
- **Which segmented control item is active**

---

### Color variable bindings (never hardcode hex)

All fills must be bound to semantic variables from Foundations V2 (`V1Svt6wLb5r22caAEr7bG0`). Set the mode once on the wrapper frame — all child instances resolve automatically.

```js
async function bindFill(node, variableKey) {
  const v = await figma.variables.importVariableByKeyAsync(variableKey);
  node.fills = [figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }, "color", v
  )];
  return v;
}

// Apply mode once on the wrapper (propagates to all children):
const v = await figma.variables.importVariableByKeyAsync("35ecda0a306974bb70ea94dc27ea3d0702bb31c5");
const coll = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
wrapperFrame.setExplicitVariableModeForCollection(coll, "20:6"); // Light
// wrapperFrame.setExplicitVariableModeForCollection(coll, "20:7"); // Dark
```

### Key semantic variable keys (Foundations V2 — `V1Svt6wLb5r22caAEr7bG0`)

| Token | Key |
|---|---|
| bg/page | `c9e3f58a7256942fa097b24457f6453ea8e730f6` |
| bg/default | `35ecda0a306974bb70ea94dc27ea3d0702bb31c5` |
| bg/secondary | `66c13b5090fb3e75aa80635175f9c9a6f6454bc7` |
| bg/accent/subtle | `6481fb820e99634e8fb8fae703a3c2509054773c` |
| fg/default | `7abc10201ce52ada8d86efab3c20deb9b5dbb74c` |
| fg/secondary | `004088e1a2861d1a0f6dd1f730d0bc8e50dc2765` |
| fg/tertiary | `d154ff42a348938753f1a184ace8ede7f513b312` |
| fg/accent/base | `bf1dee83142cc476e490f5a0d8e02bf0adc81e3c` |
| border/default | `7e7e0bfb3bdbaa10b80d55b8d9b5a32bdaa94e17` |
| border/secondary | `2946d3b901152b21fb9b102fbea02f382d9430ef` |
| border/tertiary | `2dd99e70b6287384911bc7d343b6b357863b4d50` |

Collection modes: Light Mode = `"20:6"`, Dark Mode = `"20:7"`

---

### Plugin API gotchas

**`resize()` resets all sizing modes to FIXED**  
Always re-set `counterAxisSizingMode = "AUTO"` (or `primaryAxisSizingMode`) AFTER any `resize()` call:
```js
frame.resize(width, 1);              // sets width; height placeholder
frame.primaryAxisSizingMode = "FIXED";   // lock width at set value
frame.counterAxisSizingMode = "AUTO";    // re-set AFTER resize — height HUGs content
```

**WRAP layout requires FIXED primary axis width**  
Setting `primaryAxisSizingMode = "AUTO"` on a HORIZONTAL WRAP frame places all children in one row. Use `FIXED` with an explicit width so rows actually break:
```js
grid.primaryAxisSizingMode = "FIXED";  // cards wrap at this width
grid.resize(contentFrameWidth, 1);
grid.counterAxisSizingMode = "AUTO";   // height expands with rows (set AFTER resize)
```

**Set `layoutSizingHorizontal`/`Vertical` AFTER appending to parent**  
`FILL` and `HUG` throw if set before the node is inside an auto-layout parent.

**`swapComponent` on nested instances**  
Find the target sub-instance first, then swap:
```js
const iconSlot = btn.findOne(n => n.type === "INSTANCE" && n.name === "Icon");
iconSlot.swapComponent(myIconComponent); // pass COMPONENT node, not INSTANCE
```

**`mainComponent` does not exist on COMPONENT nodes**  
`someComponent.mainComponent` throws. Pass the component variant directly to `swapComponent`.

**Page context resets between `use_figma` calls**  
`figma.currentPage` starts on page 1 each call. If targeting a non-first page, always start with:
```js
const targetPage = figma.root.children.find(p => p.name === "My Page");
await figma.setCurrentPageAsync(targetPage);
```

---

### Data Cell fixes (required after every instance creation)
```js
cell.setProperties({
  "Show Description#3225:6": false, // prevents double-text row
  "User Name#10846:19": false,       // prevents extra user row
});
// Date cells only — clear Time to get single-line date:
cell.setProperties({ "Time#5950:76": "" });
```

`Type=Row Header` → **only the first column (artifact/record name)**. All other body cells → `Type=Text`.

---

### General component rules
- **Input min size is `md`** — `sm` is not supported on Input or SearchInput
- **Badge intent is `Information`** — not `Info`
- **Variant props are case-sensitive**: `"Appearance"` not `"appearance"`, `"Default"` not `"default"`
- **`IsSelected`** on V2 Tab Item takes string `"true"` / `"false"`, not boolean
- **Tab Item text node** is named `"Label"` inside `"Content frame"` (not the root text child)

---

## Menu Components

> Full documentation: `.claude/FIGMA_MENU_V2.md`  
> Source: file `JYy51au6YaA4QZKpQy1ZRg`, section node `9797:35525`  
> ⚠️ There is NO importable shell/container — build the panel frame manually (4px padding, 1px `border.default`, `radius-md`, shadow/md).

| Component | Type | componentKey | Key variant props |
|---|---|---|---|
| `Listitem/Menu` | COMPONENT_SET | `da71179c3b4739448f9cc47f5611d0921cf5cb96` | `Variant`: Default/Danger · `State`: Default/Hover/Pressed/Focus/Disabled |
| `Listitem/Single select` | COMPONENT_SET | `06b1bb0cfd6d4a18506235994abda23ae0d4dedc` | `Selected`: False/True · `State`: Default/Hover/Pressed/Focus/Disabled |
| `Listitem/Multiselect` | COMPONENT_SET | `a985d7a693f08c37723b64c9eb1c10695e21dc37` | `State`: Default/Hover/Pressed/Focus/Disabled · `Selected`: False/True |
| `Listitem/User select` | COMPONENT_SET | `248c7ee9f75457666160b11fc36a2c93d00bd865` | `State`: Default/Hover/Pressed/Focus/Disabled · `Selected`: False/True |
| `Listitem/Group header` | COMPONENT | `984fbb4a94f0863f3d139993f934b59a90ac8405` | No variants — single text row, 12px `fg.tertiary` |
| `Listitem/Divider` | COMPONENT | `aa67201939f81ab340758095bc5807ae41e4cc25` | No variants — 1px `border.secondary` line |
| `Listitem/Search` | COMPONENT | `0a53f41ca75868b7e625c342eb43ef3180e0e50d` | No variants — 32px search input with `IconSearch` |
| `Listitem/Footer` | COMPONENT | `90dd3301bde5de37cd3a06b75e1d75329d7807f5` | No variants — Cancel + Confirm button row, top border |
| `Addon After` | COMPONENT_SET | `ba833648828a021119793d4b947cfa838db4a4a6` | `Variant`: Sub menu arrow / Badge |
| `Scroll bar` | COMPONENT | `18f4bed49edbb40531090d9a2cf8d673203b2dc8` | Visual only — 8px bar, `neutral.alpha.light-150` |
| `Listbox/Empty` | COMPONENT | `31d61efd2e0617589ce54af6e633fb870e12a9d8` | No variants — "No results found" with panel shell |
| `Listbox/Loading` | COMPONENT | `c70f0e7e4c051150b447ab8422a06abaa45c3db3` | No variants — Spinner centered with panel shell |

### Default variant keys (most-used states)

| Component | Default variant key |
|---|---|
| Listitem/Menu — Default/Default | `bd1c88fe9ca4a0f39aa1b76f34afc818c48e2974` |
| Listitem/Menu — Danger/Default | `d0fdafe80144c7816be5ad7631b98210b9c7bc3f` |
| Listitem/Single select — False/Default | `121d6af3b3d51f2ca53a6d6515de6bb0164e797a` |
| Listitem/Single select — True/Default | `0f1d473c39b150c6540195d9ca5db857f0293b47` |
| Listitem/Multiselect — False/Default | `e84bdcf5f5729c2a1d34937376a117480dbbef52` |
| Listitem/Multiselect — True/Default | `e1fea18009ac063cefdd340b4a9aa94d39b62a16` |
| Listitem/User select — False/Default | `9be5ef53e007b5656f4e92617f7f2a88ed601516` |
| Listitem/User select — True/Default | `f64ef729ae1249ead64abf3fa1d7462e333eebaa` |
| Addon After — Sub menu arrow | `0102a55afd21e650dc6ef4345745431cd6b5c005` |
| Addon After — Badge | `213937a1126096d0f7a730f3968a3478091ee563` |
