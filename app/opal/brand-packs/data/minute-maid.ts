import type {BrandPack} from "../types";

export const minuteMaid: BrandPack = {
	id: "minute-maid",
	name: "Minute Maid",
	status: "published",
	description:
		"Minute Maid's global brand identity — warm, natural, and fruit-forward. Covers the 2023 JKR/Grey/VMLY&R/Landor & Fitch global identity refresh.",
	sourceUrl: "https://www.minutemaid.com",
	colors: [
		{hex: "#BFD741", name: "June Bud", role: "primary"},
		{hex: "#9EBB37", name: "Android Green", role: "secondary"},
		{hex: "#527A23", name: "Sap Green", role: "accent"},
		{hex: "#231F20", name: "Raisin Black", role: "text"},
		{hex: "#FFFFFF", name: "White", role: "background"},
		{hex: "#F5A623", name: "Ripe Orange", role: "accent"},
	],
	typography: {heading: "Minute Maid Hand", body: "Museo Sans"},
	logo_system: {
		variants: [
			{
				name: "Minute Maid Wordmark",
				colour_versions: ["Sap Green", "White"],
				usage_context: "Primary brand mark on packaging and campaign key art.",
			},
			{
				name: "Minute Maid Compact Mark",
				colour_versions: ["June Bud", "Sap Green"],
				usage_context: "Compact social and avatar contexts.",
			},
		],
		clear_space_rule: "Use at least the height of the letter 'M' on all sides.",
		minimum_size_print: "0.75 in wide",
		minimum_size_screen: "96 px wide",
		placement_zones: ["Top left", "Bottom center"],
		do_not_alter_rules: [
			"Do not redraw or restage the hand-drawn letterforms.",
			"Do not stretch, rotate, or add unapproved effects.",
			"Do not place on low-contrast fruit-illustration backgrounds.",
		],
		sub_brand_logos: null,
	},
	brand_devices: [
		{
			name: "Abstract Fruit Device",
			description: "Airbrush-and-stencil-inspired abstract fruit shapes used across packaging and campaign graphics.",
			usage_rules: "Use to reinforce freshness and flavor variety; pair with the wordmark, not as a standalone logo replacement.",
			usage_restriction: "Supporting device only",
		},
	],
	photography_mood_brief: {
		summary: "Warm, natural, and fruit-forward — the feeling of fresh-squeezed morning goodness.",
		lighting: "Warm, natural morning light.",
		colour_treatment: "Rich, natural fruit tones; avoid artificial neon saturation.",
		subject_matter: "Fresh citrus fruit and everyday morning moments.",
		what_to_avoid: ["Cold, clinical lighting.", "Artificial or neon color grading."],
	},
	tone_of_voice: {
		summary: "Minute Maid sounds warm, natural, and optimistic — the feeling of enjoying something good, fresh, and simple.",
		formality: "Warm and conversational",
		person: "Second person, warm and direct",
		key_traits: ["Warm", "Natural", "Optimistic", "Fresh"],
		recurring_language: ["Feel good", "Fresh-squeezed goodness", "Made from real fruit"],
		what_to_avoid: ["Clinical health-food language", "Corporate jargon", "Overstated nutrition claims"],
		brand_name_rules: "Use Minute Maid in full on first reference. Do not abbreviate the brand name.",
		preferred_terms: [
			{avoid: "beverage", use_instead: "juice", context: "Always name the product directly."},
			{avoid: "consumers", use_instead: "families", context: "Consumer-facing campaign copy."},
		],
	},
	brand_values: {
		target_audience: "Families and individuals looking for a natural, feel-good start to the day.",
		values: [
			{name: "Freshness", description: null},
			{name: "Warmth", description: null},
			{name: "Naturalness", description: null},
			{name: "Optimism", description: null},
		],
	},
	writing_guidelines: {
		style_guide_reference: "American_English",
		sentence_case_headlines: true,
		grammar_rules: [
			"Keep copy warm and conversational.",
			"Avoid clinical nutrition-label language in campaign copy.",
			"Lead with feeling — freshness and warmth — before ingredient detail.",
		],
		approved_descriptors: ["fresh", "warm", "natural", "juicy", "feel-good"],
	},
	channels: ["Social", "Email", "Web"],
	approvedChannelConnections: {
		Social: ["cmp-instagram", "cmp-facebook"],
		Email: ["cmp-marketo"],
		Paid: [],
		Web: ["cmp-opti-cms"],
	},
	toneKeywords: ["Warm", "Natural", "Optimistic", "Fresh"],
	templateCount: 10,
	templates: [
		{
			id: "mm1",
			name: "Minute Maid Brand Mark — Square",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/minute-maid.svg",
			ratio: "1:1",
		},
		{
			id: "mm2",
			name: "Minute Maid Brand Mark — Portrait",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/minute-maid.svg",
			ratio: "4:5",
		},
		{
			id: "mm3",
			name: "Minute Maid Brand Mark — Email Hero",
			format: "Email Hero",
			channel: "Email",
			thumb: "/brand-packs/cards/minute-maid.svg",
			ratio: "16:9",
		},
	],
	assets: [
		{id: "mma1", name: "Minute Maid Logo — Primary", type: "logo", url: "/brand-packs/logos/minute-maid.svg", format: "SVG"},
		{id: "mma2", name: "Minute Maid Logo — Reversed", type: "logo", url: "/brand-packs/logos/minute-maid.svg", format: "SVG"},
		{
			id: "mma3",
			name: "Fresh Orange Juice Glass",
			type: "photo",
			url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "mma4",
			name: "Morning Pour",
			type: "photo",
			url: "https://images.unsplash.com/photo-1719934664950-5bd22f04b8a1?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "mma5",
			name: "Fresh Start",
			type: "photo",
			url: "https://images.unsplash.com/photo-1555766720-1e727844cc8f?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "mma6",
			name: "Orange Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/lemon.svg?color=%23527A23",
			format: "SVG",
		},
		{
			id: "mma7",
			name: "Sun Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/sun.svg?color=%23BFD741",
			format: "SVG",
		},
		{
			id: "mma8",
			name: "June Bud Field",
			type: "background",
			bucket: "style_references",
			url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Crect%20width='1200'%20height='800'%20fill='%23BFD741'/%3E%3C/svg%3E",
			format: "SVG",
		},
	],
	brandBrief: `# Minute Maid — Brand Instruction

## Brand Identity
Minute Maid is the natural, fruit-forward juice brand. All visual content must feel **warm, natural, and optimistic** — never clinical or artificial.

## Color Usage
- **June Bud (#BFD741)**: Primary field color, packaging highlights
- **Android Green (#9EBB37)**: Secondary supporting green
- **Sap Green (#527A23)**: Deep accent for contrast and text
- **Raisin Black (#231F20)**: Body copy and fine print

## Typography
- **Display**: Minute Maid Hand — custom hand-drawn typeface
- **Body**: Museo Sans — warm humanist sans

## Tone of Voice
Write with warmth and natural optimism.

**Good**: "Fresh-squeezed goodness. Feel good."
**Avoid**: "Our juice beverage provides essential daily nutrients."

## Image Style
- Warm, natural lighting evoking fresh fruit and morning light
- Abstract fruit imagery alongside real photography
- Dynamic, asymmetric compositions

## Template Rules
- Always keep the hand-drawn wordmark clearly visible
- CTA buttons use Sap Green background with white text
- Social cards: bold headline, minimal body copy, fruit-forward image`,
	createdBy: "Brand Team",
	createdAt: "2026-06-07",
	updatedAt: "2026-07-05",
};
