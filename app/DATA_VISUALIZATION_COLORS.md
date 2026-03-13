# Data Visualization Colors

## Purpose
This is the shared data-visualization color reference for Axiom Play. It sits next to the UI token system, but it is not a replacement for UI colors.

Use these colors for:
- charts
- legends
- heatmaps
- dashboards
- workload and planner visualizations
- category-based distinctions in dense data views

Do not use these colors as default replacements for:
- app shell backgrounds
- standard buttons and form controls
- body text
- generic borders and dividers
- destructive or success UI states unless the pattern is explicitly data-driven

## Source
Figma source:
- `Data Visualization Colors`
- `MY9zYxqWYLxLQF0fklJzYj`
- node `4628:3723`

The initial categorical palette below is grounded in the hex values surfaced directly in the Figma metadata.

## Canonical Rule
- `UI colors` remain the default system for product chrome and interaction states.
- `Data viz colors` are a separate token family for information display.
- If a data-viz color is reused in UI, it must be intentionally aliased in code or Figma. It should not quietly become a new UI default.

## Token Names
Code namespace:
- `dataVizCategoricalColors`
- `dataVizCategoricalColorMap`
- `getDataVizCategoricalColor(index)`
- `dataVizSemanticIntents`

Recommended future design-token namespace:
- `dataviz.categorical.*`
- `dataviz.sequential.*`
- `dataviz.diverging.*`
- `dataviz.semantic.*`
- `dataviz.neutral.*`

## Current Shared Palette
The shared code palette now includes:
- categorical colors
- core hue families
- sequential ramps
- diverging ramps
- semantic colors
- neutral ramp

The categorical set below is extracted directly from Figma metadata. The remaining ramps are the promoted Axiom Play v1 implementation aligned to the Figma board direction and intended for shared product use.

### Categorical
These are the 10 approved categorical colors extracted from Figma:

| Token | Hex |
|---|---|
| `dataviz.categorical.blue` | `#3585F5` |
| `dataviz.categorical.orange` | `#FF812D` |
| `dataviz.categorical.green` | `#43A047` |
| `dataviz.categorical.yellow` | `#FFC934` |
| `dataviz.categorical.red` | `#D83734` |
| `dataviz.categorical.purple` | `#AB47BC` |
| `dataviz.categorical.teal` | `#4CD7CA` |
| `dataviz.categorical.pink` | `#FF4B82` |
| `dataviz.categorical.slate` | `#8491B4` |
| `dataviz.categorical.tan` | `#B98B6E` |

## Usage Guidance
### Core Hue Families
Use these as the broad, harmonized ramp families for light and dark mode chart work. They are especially useful when a team needs a stable base system before choosing categorical, sequential, or diverging behavior.

Current core families:
- default
- positive
- negative
- orange
- yellow
- purple
- teal
- pink
- tan
- neutral

### Categorical
Use when the viewer needs to distinguish separate series or categories with no numeric ordering.

Examples:
- department comparison
- campaign breakdown
- asset type legend
- resource owner grouping

### Sequential
Use a single hue family with increasing intensity when the data moves from low to high.

Examples:
- completion intensity
- workload density
- budget usage

### Diverging
Use when a midpoint matters and values can move above or below that midpoint.

Examples:
- underbooked vs overbooked
- below target vs above target
- negative vs positive variance

### Semantic
Use with labels, icons, or both. Do not rely on color alone.

Recommended semantic mapping:
- `good` -> success intent
- `moderate` -> warning intent
- `bad` -> danger intent

## Axiom Play Rules
1. Start with Axiom UI tokens for surfaces, text, borders, and controls.
2. Layer data-viz colors only where the color is encoding information.
3. Prefer data-viz colors for fills, series lines, legends, markers, and scheduler accents.
4. For dark mode, preserve hue identity but adjust surrounding surfaces and contrast, not the meaning of the color.
5. If a component needs both UI and data-viz color, keep them separate in the API.
6. For light and dark mode, document the usable contrast slice of each ramp when text or key labels will sit on top of the color.

Example:
- card surface from `bg.default`
- border from `border.secondary`
- chart series or planner accent from `dataVizCategoricalColors`

## Code Reference
Shared code file:
- [styles/dataVizColors.ts](./styles/dataVizColors.ts)

Live reference page:
- `/data-viz-colors`

Basic example:

```ts
import {
  dataVizCategoricalColors,
  dataVizSequentialPalettes,
  dataVizDivergingPalettes,
  dataVizSemanticColors,
  getDataVizCategoricalColor,
} from "@/app/styles/dataVizColors";

const seriesStroke = getDataVizCategoricalColor(seriesIndex);
const legendSwatch = dataVizCategoricalColors[0].value;
const heatmapRamp = dataVizSequentialPalettes.blue;
const varianceRamp = dataVizDivergingPalettes.greenRed;
const healthColor = dataVizSemanticColors.good.default;
```

## Documentation Strategy
This file is the canonical documentation.

Supporting references:
- [OPTIAXIOM_DESIGN_SYSTEM.md](./OPTIAXIOM_DESIGN_SYSTEM.md) links here from the main design-system guide
- [README.md](../README.md) links here for discoverability

## Next Step
The next improvement is not more documentation. It is usage adoption:
- migrate charts and dashboard prototypes to import these shared sets
- replace ad hoc chart colors with tokenized palette usage
- refine exact ramp values against the Figma board over time if the design team wants tighter parity
