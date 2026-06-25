export const STRIDE_SB_BASE = "https://stide-mock.vercel.app/storybook/";

export interface DSComponent {
	id: string;
	label: string;
	story: string;
	status: "done" | "gap";
}

export const DS_COMPONENT_LIST: DSComponent[] = [
	// Button variants
	{
		id: "ds-button-primary",
		label: "Button Primary",
		story: "iframe.html?id=ui-button--primary&viewMode=story",
		status: "done",
	},
	{
		id: "ds-button-outline",
		label: "Button Outline",
		story: "iframe.html?id=ui-button--outline&viewMode=story",
		status: "done",
	},
	{
		id: "ds-button-ghost",
		label: "Button Ghost",
		story: "iframe.html?id=ui-button--ghost&viewMode=story",
		status: "done",
	},
	{
		id: "ds-button-danger",
		label: "Button Danger",
		story: "iframe.html?id=ui-button--danger&viewMode=story",
		status: "done",
	},
	// Card variants
	{
		id: "ds-card-default",
		label: "Card Default",
		story: "iframe.html?id=ui-card--default&viewMode=story",
		status: "done",
	},
	{
		id: "ds-card-elevated",
		label: "Card Elevated",
		story: "iframe.html?id=ui-card--elevated&viewMode=story",
		status: "done",
	},
	// Input variants
	{
		id: "ds-input-default",
		label: "Input Default",
		story: "iframe.html?id=ui-input--default&viewMode=story",
		status: "done",
	},
	{
		id: "ds-input-search",
		label: "Input Search",
		story: "iframe.html?id=ui-input--search&viewMode=story",
		status: "done",
	},
	{
		id: "ds-input-error",
		label: "Input Error",
		story: "iframe.html?id=ui-input--error&viewMode=story",
		status: "done",
	},
	// Badge variants
	{
		id: "ds-badge-default",
		label: "Badge Default",
		story: "iframe.html?id=components-badge--default&viewMode=story",
		status: "done",
	},
	{
		id: "ds-badge-subtle",
		label: "Badge Subtle",
		story: "iframe.html?id=components-badge--subtle&viewMode=story",
		status: "done",
	},
	{
		id: "ds-badge-warning",
		label: "Badge Warning",
		story: "iframe.html?id=components-badge--warning&viewMode=story",
		status: "done",
	},
	// Navigation
	{
		id: "ds-nav",
		label: "Navigation",
		story: "iframe.html?id=ui-nav--default&viewMode=story",
		status: "done",
	},
	// Sections
	{
		id: "ds-hero-default",
		label: "Hero Default",
		story: "iframe.html?id=sections-hero--default&viewMode=story",
		status: "gap",
	},
	{
		id: "ds-hero-centered",
		label: "Hero Centered",
		story: "iframe.html?id=sections-hero--centered&viewMode=story",
		status: "gap",
	},
	{
		id: "ds-modal",
		label: "Modal",
		story: "iframe.html?id=components-modal--default&viewMode=story",
		status: "gap",
	},
	{
		id: "ds-footer",
		label: "Footer",
		story: "iframe.html?id=sections-footer--default&viewMode=story",
		status: "done",
	},
];

export const DS_GUIDELINES_MD = `# Stride Design System Guidelines

The Stride design system provides a unified component library and style guide for building consistent web experiences. This document covers usage principles, design tokens, and component conventions.

## Design Principles

1. **Speed-first** — Components are optimised for fast rendering and low layout shift. Avoid patterns that require multiple re-renders to resolve.
2. **Accessible by default** — All components meet WCAG 2.1 AA contrast and keyboard navigation standards out of the box.
3. **Mobile-responsive** — Every component uses a mobile-first breakpoint strategy. Test at 390px before scaling up.
4. **Brand-consistent** — Use Stride typography and color tokens. Never write hex values directly — always reference a CSS custom property.

## Typography

| Token | Value | Usage |
|---|---|---|
| \`--font-display\` | 32px / 700 | Page heroes and major headings |
| \`--font-heading\` | 24px / 600 | Section titles |
| \`--font-body\` | 16px / 400 | Body copy, defaults |
| \`--font-label\` | 13px / 500 | Labels, captions, badges |
| \`--font-mono\` | 13px / 400 | Code, data values |

All text must use the \`stride-sans\` typeface. Do not use \`system-ui\` or fallback stacks without the primary font loaded first.

## Color Tokens

**Brand**
- \`--color-primary\` — Stride lime (#C1F15A) — Primary CTAs and active states only
- \`--color-primary-dark\` — (#0F1810) — Text on lime backgrounds
- \`--color-surface\` — (#FFFFFF) — Default card and panel background
- \`--color-bg\` — (#F4F5F0) — Page background

**Semantic**
- \`--color-success\` — Positive states, confirmation messages
- \`--color-warning\` — Alerts, incomplete states
- \`--color-danger\` — Destructive actions and error states

## Components

### Button

Buttons come in three sizes (sm, md, lg) and four variants (primary, secondary, ghost, danger). **Primary** buttons use \`--color-primary\` background with dark text. They should appear only once per viewport — never stack two primary buttons side by side.

### Input

Inputs support sm, md, and lg sizes. Always pair with a \`<label>\` element — never use placeholder text as a label substitute. Validation states: Default, Error (red border + helper text), Success (green check icon).

### Card

Cards use \`--color-surface\` background with a 1px \`--color-border-default\` border. Avoid nested cards. The hover state lifts with a subtle shadow — do not override this with a custom \`box-shadow\`.

## Spacing Scale

\`4px · 8px · 12px · 16px · 24px · 32px · 48px · 64px · 96px\`

Never use arbitrary pixel values. All spacing must reference this scale.

## Motion

Default transition: \`all 0.15s ease-out\`. Do not use animations longer than 400ms for interactive elements.
`;

export const DS_TOKEN_COLORS = [
	{name: "--color-primary", value: "#C1F15A", label: "Primary (Lime)"},
	{name: "--color-primary-dk", value: "#0F1810", label: "Primary Dark"},
	{name: "--color-bg", value: "#F4F5F0", label: "Background"},
	{name: "--color-surface", value: "#FFFFFF", label: "Surface"},
	{name: "--color-text-1", value: "#1A1A1A", label: "Text Primary"},
	{name: "--color-text-2", value: "#6B7280", label: "Text Secondary"},
	{name: "--color-border", value: "#E5E7EB", label: "Border"},
	{name: "--color-success", value: "#16A34A", label: "Success"},
	{name: "--color-warning", value: "#D97706", label: "Warning"},
	{name: "--color-danger", value: "#DC2626", label: "Danger"},
];

export const DS_TOKEN_TYPE = [
	{token: "--font-display", size: "32px", weight: "700", sample: "Display heading"},
	{token: "--font-h1", size: "28px", weight: "700", sample: "Page title"},
	{token: "--font-h2", size: "24px", weight: "600", sample: "Section heading"},
	{token: "--font-h3", size: "20px", weight: "600", sample: "Sub-heading"},
	{token: "--font-body-lg", size: "18px", weight: "400", sample: "Large body text"},
	{token: "--font-body", size: "16px", weight: "400", sample: "Default body text"},
	{token: "--font-sm", size: "14px", weight: "400", sample: "Small / caption"},
	{token: "--font-label", size: "13px", weight: "500", sample: "Label"},
];

export const DS_TOKEN_SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

export const DS_TOKEN_RADIUS = [
	{token: "--radius-sm", value: "4px"},
	{token: "--radius-md", value: "8px"},
	{token: "--radius-lg", value: "12px"},
	{token: "--radius-xl", value: "16px"},
	{token: "--radius-full", value: "9999px"},
];

export const DS_ROW_STYLES = `
.ds-row { border-radius: 6px; cursor: pointer; }
.ds-row:hover { background: var(--ax-colors-bg-default-hovered); }
.ds-row-sel { background: var(--ax-colors-bg-default-pressed) !important; }
`;
