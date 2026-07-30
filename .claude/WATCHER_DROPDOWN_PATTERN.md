# Watcher Dropdown — Figma V2 Pattern

Source of truth: file `6FuwvRSw6NyFLRZQrwBMVS`, node `22618:269793`

## Component Overview
A floating dropdown panel used to manage "watchers" (subscribers) on a task/item in Stride. Triggered by clicking the eye icon in the task context bar.

## Panel Frame Spec
- Width: 360px
- Height: HUG (AUTO)
- Background: `bg.default` (#FFFFFF)
- Corner radius: 8px
- Stroke: 1px `border.default` (#CACFDC)
- Drop shadow: `rgba(0,0,0,0.12)`, blur=16, y=4
- **Padding: `paddingTop=8, paddingBottom=12` ONLY — NO horizontal padding on the panel**
- layoutMode: VERTICAL
- itemSpacing: 0

## Internal Structure (top to bottom)

### 1. Header Row
- layoutMode: HORIZONTAL
- `paddingLeft=12, paddingRight=40, paddingTop=8, paddingBottom=8`
- gap: 10
- counterAxisAlignItems: CENTER
- layoutSizingHorizontal: FILL
- Children:
  - Avatar: V2 key `07a871d4a8a3bfd2d6cd236b0547ee7ec3a31fe4`, Size=sm (24px), Initials variant
  - Text: "Start watching" OR "Stop watching" — 14px Inter Regular, color `#0066FF` (primary blue)
  - **NO × button or right-side action**

### 2. Divider
- 1px horizontal line, FILL width
- Fill: `border.secondary` (#DADFEB)

### 3. Section Label
- Text: "Watching" (sentence case — NOT "WATCHERS" or "WATCHING")
- 12px Inter Regular, `fg.tertiary` (#66708C)
- paddingLeft=12, paddingTop=4, paddingBottom=4

### 4. Watcher Rows
- Component: `Listitem/User select`, key `248c7ee9f75457666160b11fc36a2c93d00bd865`
- Variant: `State=Default, Selected=True` (renders × remove button)
- **Row background: `bg.secondary` (#F5F6FA)** ← critical, not white
- layoutSizingHorizontal: FILL
- Email subtitle IS visible (not hidden)
- × button inside component: 24×24, cornerRadius=6, tooltip hidden (hover only)
- Avatar color for different users must use distinct Color Scheme variants:
  - User 1 (Victoria Johnson, "VJ"): Color Scheme=Purple
  - User 2 (Michelle Kurpinski, "MK"): Color Scheme=Purple (darker variant if available)
- Email strings match design exactly: `victoria.johnson@optimizely.com`, `mishee.kurpinski@optimizely.com`

### 5. "Add watcher" Input
- Wrapper: paddingLeft=12, paddingRight=12, paddingTop=8, paddingBottom=8, fills=[], FILL width
- Input component: V2 key `87412b4b78df5711c2906719875b7b9168da2be6`
  - Variant: Size=md, State=Default
  - Height: 40px
  - Placeholder: "Add watcher"
  - **End icon: `IconAngleDown` (chevron-down) — NOT a search icon or plus icon**
  - layoutSizingHorizontal: FILL

## States

| State | Changes from base |
|---|---|
| **Idle** | Base panel as above |
| **Search typed** | Input → State=Focused (blue border), text="nik"; separate suggestion dropdown below panel (y+4) |
| **Stop watching** | Header text → "Stop watching"; add 3rd watcher row |

## Suggestion Dropdown (search state only)
Separate floating frame, positioned below the main panel with 4px gap:
- Same frame style: white bg, cornerRadius=8, 1px border, shadow
- One `Listitem/User select` row: State=Hover, Selected=False
- Show name + email

## Stride Context Bar (when showing in context)
The dropdown is triggered from a Stride task page context bar (dark `#1C2029` bg, 48px):
- Left: "Stride" logo/text
- Right cluster: Share icon + "+12" count, Eye icon button (active `#0066FF`) + count badge (gray pill "3"), "Mark Complete" button (outlined), "···" menu

## Common Mistakes to Avoid
1. Adding horizontal padding to the panel wrapper — each row handles its own
2. Using white background on watcher rows — must be `bg.secondary` (#F5F6FA)
3. Using a search icon on "Add watcher" input — must be `IconAngleDown`
4. ALL-CAPS section label ("WATCHERS") — must be sentence case ("Watching")
5. Adding context bar as part of the panel component frame — they are separate
6. Making "Start watching" header row have a × or close button — no right action
7. Using same avatar color for all users — use distinct Color Scheme variants
