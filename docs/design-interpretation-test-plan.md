# Design Interpretation: Social Proof on PDP Test Plan

## Overview

This document provides a comprehensive interpretation of the Figma design for the "Social Proof on PDP" test plan interface, which integrates the Opal AI assistant for experimentation workflows.

## Layout Structure

The design consists of a two-panel layout:

```
┌────────────────────────────────────────┬──────────────────────────┐
│  Main Canvas (1044px)                  │  Opal Panel (396px)      │
│  ────────────────────────────────      │  ──────────────────      │
│                                        │                          │
│  ┌──────────────────────────────────┐  │  ┌────────────────────┐  │
│  │ Toolbar (tool bar)               │  │  │ Header             │  │
│  │ - Close/Code/View toggles (left) │  │  │ - Menu button      │  │
│  │ - Action buttons (right)         │  │  │ - "Opal" title     │  │
│  │   • Undo/Redo                    │  │  │ - Action buttons   │  │
│  │   • Copy                         │  │  └────────────────────┘  │
│  │   • Download                     │  │                          │
│  │   • Export (primary)             │  │  ┌────────────────────┐  │
│  └──────────────────────────────────┘  │  │ Chat Messages      │  │
│                                        │  │ ────────────────   │  │
│  ┌──────────────────────────────────┐  │  │ • User message     │  │
│  │ Header                           │  │  │ • Assistant reply  │  │
│  │ - "Social Proof on PDP" [Draft]  │  │  │ • Disclosures      │  │
│  │ - Description                    │  │  │ • Content cards    │  │
│  └──────────────────────────────────┘  │  │ • Suggestions      │  │
│                                        │  │                    │  │
│  ┌──────────────────────────────────┐  │  │ (Scrollable)       │  │
│  │ Info Cards Row (4 columns)       │  │  └────────────────────┘  │
│  │ ┌─────┬─────┬─────┬──────────┐   │  │                          │
│  │ │Owner│Test │Est. │Traffic   │   │  │  ┌────────────────────┐  │
│  │ │     │Type │Dur. │Alloc.    │   │  │  │ Input Area         │  │
│  │ └─────┴─────┴─────┴──────────┘   │  │  │ - Textarea         │  │
│  └──────────────────────────────────┘  │  │ - Action buttons   │  │
│                                        │  │ - Disclaimer       │  │
│  ┌───────────┬──────────────────────┐  │  └────────────────────┘  │
│  │ Side Col  │ Main Column          │  │                          │
│  │ (250px)   │ (632px)              │  │  ┌────────────────────┐  │
│  │           │                      │  │  │ Resize Handle      │  │
│  │ • Score   │ • Hypothesis         │  │  └────────────────────┘  │
│  │ • Samples │ • Targeting          │  │                          │
│  │ • PIE     │ • Variations         │  │                          │
│  └───────────┴──────────────────────┘  │                          │
└────────────────────────────────────────┴──────────────────────────┘
```

### Panel Dimensions

- **Total Width**: 1440px
- **Canvas**: 1044px (72.5%)
- **Opal Panel**: 396px (27.5%)
- **Background**: `#f9fafc` (neutral.50)

## Section Breakdown

### 1. Toolbar (node: n_2744d)

**Layout**: Horizontal row with gap: 40px
**Height**: ~56px
**Content**:
- Left: Close + Code toggles (icons)
- Right: Undo, Redo, Copy, Download, Export button

### 2. Test Plan Header (node: n_0782f)

**Layout**: Vertical column, gap: 4px
**Content**:
- Title row: "Social Proof on PDP" + "Draft" badge
- Description text

### 3. Info Cards Row (node: n_74b12)

**Layout**: 4-column grid
**Gap**: 8px (between cards)
**Cards**:
1. Owner → Growth Team
2. Test Type → A/B Test
3. Estimated Duration → 14 days
4. Traffic Allocation → 100%

### 4. Main Content Area (node: n_314d6)

**Layout**: Two-column layout
**Gap**: 16px

#### Side Column (node: n_cbd0a) - ~250px

Contains 3 callout cards:

1. **Prioritization Score** (node: n_2dd63)
   - Icon: star
   - Circular progress: 50
   - Background: white card

2. **Sample Size Estimates** (node: n_0b4a0)
   - Icon: calendar-time
   - Stats table with 6 rows:
     - Baseline Conversion Rate: 5.5%
     - Daily Visitors: 1,000
     - Minimum Detectable Effect: 10%
     - Significance Level: 95%
     - Variants: 2
     - Sample Size per Variant: 4,653

3. **PIE Framework** (node: n_63206)
   - Icon: chart-bar
   - Label "Potential" with score "8"
   - Blue progress bar (148px width)
   - Description text

#### Main Column (node: n_8752a) - ~632px

Contains 3 callout cards:

1. **Hypothesis** (node: n_3b095)
   - Icon: lightbulb
   - Long-form text explanation

2. **Targeting** (node: n_c9b5a)
   - Icon: bullseye
   - Stats table with 4 rows:
     - Pages: Product Detail Page
     - Regions: All Regions
     - Devices: Desktop, Mobile, Tablet
     - Browsers: All Browsers
   - Gap between label/value: 32px

3. **Variations** (node: n_788bb)
   - Icon: vials
   - Control header: "Control (A)" + "50%"
   - Screenshot image (552x209px)

### 5. Opal Panel (node: n_323d6)

**Width**: 396px
**Border**: Left border 1px solid #e9edf5
**Shadow**: -6px 6px 25px rgba(12, 16, 29, 0.08)

#### Header (node: n_b4376)
- Menu button (left)
- "Opal" title with dropdown
- 4 action buttons (right)

#### Chat Body (node: n_b3b9f)
**Gap**: 24px between messages

Messages include:
- User message: "Draft a test plan" with avatar
- Assistant reply
- Disclosure: "About your test plan" (V1)
- Disclosure: "Completed" (with gradient text)
- Assistant message with quick actions (4 icon buttons)
- Content card with blue ring shadow
- Suggestions list

#### Input Area (node: n_02601)
- Textarea with placeholder "Ask Opal"
- Action buttons (@ and microphone icons)
- Disclaimer text

## Typography

### Font Families
- Primary: Inter (weights: 400, 500, 600, 700)
- Icons: Font Awesome 6 Pro (weight: 300)

### Text Styles

| Element | Size | Weight | Spacing | Color |
|---------|------|--------|---------|-------|
| Page Title | 24px | 700 | -0.60px | #2e3442 |
| Section Heading | 16px | 600 | -0.20px | #2e3442 |
| Body Text | 16px | 400 | -0.20px | #2e3442 |
| Body Small | 14px | 400 | -0.21px | #262b37 |
| Label | 16px | 400 | -0.20px | #66708c |
| Value | 16px | 600 | -0.20px | #2e3442 |
| Badge | 12px | 500 | 0.01px | #2e3442 |
| Score Large | 28px | 700 | -0.60px | #2e3442 |
| Caption | 12px | 400 | 0.01px | #4f576e |
| Tiny | 11px | 400 | 0.06px | #626a81 |

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| gap-xs | 4px | Title container |
| gap-sm | 8px | Cards, rows |
| gap-md | 12px | Toolbar sections, buttons |
| gap-lg | 16px | Major sections |
| gap-xl | 24px | Chat messages |
| gap-2xl | 32px | Stat label-value pairs |
| gap-3xl | 40px | Toolbar left-right |

## Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 6px |
| Cards/Callouts | 6px (implicit) |
| Content Card | 12px |
| Input | 8px |
| Avatar | 999px (circle) |
| Handle | 4px |

## Shadows

| Element | Shadow |
|---------|--------|
| Opal Panel | -6px 6px 25px rgba(12, 16, 29, 0.08) |
| Content Card | 0px 0px 0px 3px #2e66f7, 0px 0px 0px 1px #ffffff |

## Interactive Elements

### Icons (Font Awesome 6 Pro)
- star (Prioritization Score)
- calendar-time (Sample Size)
- chart-bar (PIE Framework)
- lightbulb (Hypothesis)
- bullseye (Targeting)
- vials (Variations)
- file-lines (Content card)
- microphone (Voice input)

### Quick Action Buttons (4 icons in chat)
- Refresh/Reload
- Copy
- Thumbs up
- Thumbs down

### Disclosures
- Expandable sections with chevron icons
- "About your test plan" and "Completed" states

## Key Measurements

### Canvas Content
- Max width: 980px (with 32px padding on sides)
- Top level info cards: 4 equal-width columns
- Side column width: ~250px
- Main column width: ~632px
- Gap between columns: 16px

### Opal Panel
- Header height: ~56px
- Input area height: ~108px
- Chat messages: flexible height, scrollable

### Circular Progress
- Diameter: ~130px (estimated)
- Stroke width: ~12px
- Score: 50 (50% filled)

### Progress Bar (PIE)
- Width: 148px
- Height: 8px
- Color: #0037ff (brand.500)

## Responsive Considerations

**Breakpoints to consider:**
- Desktop: 1440px+ (current design)
- Laptop: 1024-1439px (may need to adjust panel widths)
- Tablet: 768-1023px (stack panels or use drawer)
- Mobile: <768px (full-width, drawer for Opal)

**Priority:**
1. Maintain readability of stats tables
2. Preserve circular progress chart
3. Ensure chat usability on smaller screens

## Accessibility Notes

1. **Color Contrast**: Some tertiary text (#66708c on #ffffff) has ~4.5:1 ratio - acceptable for WCAG AA
2. **Icon Labels**: Font Awesome icons need aria-labels
3. **Interactive States**: Need focus indicators for all buttons
4. **Disclosure States**: Need aria-expanded attributes
5. **Chat Messages**: Need proper ARIA roles for conversation

## Assets Required

See separate assets list in component assessment document.
