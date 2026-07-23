import type {BrandPack} from "../types";

export const sprite: BrandPack = {
	id: "sprite",
	name: "Sprite",
	status: "published",
	description:
		"Sprite's global brand identity — clear, refreshing, and citrus-driven. Covers the 2019 Turner Duckworth visual system across packaging and digital.",
	sourceUrl: "https://www.sprite.com",
	colors: [
		{hex: "#008B47", name: "Sprite Green", role: "primary"},
		{hex: "#FFDD00", name: "Sprite Yellow", role: "secondary"},
		{hex: "#FFFFFF", name: "Full White", role: "background"},
		{hex: "#000000", name: "Black", role: "text"},
		{hex: "#DEDEDF", name: "Kawaii Silver", role: "neutral"},
	],
	typography: {heading: "Refraktiv", body: "Aktiv Grotesk"},
	logo_system: {
		variants: [
			{
				name: "Sprite Wordmark",
				colour_versions: ["Sprite Green", "Full White"],
				usage_context: "Primary brand mark on packaging and campaign key art.",
			},
			{
				name: "Sprite Spark Mark",
				colour_versions: ["Sprite Yellow", "Sprite Green"],
				usage_context: "Compact social and avatar contexts.",
			},
		],
		clear_space_rule: "Use at least the height of the letter 'S' on all sides.",
		minimum_size_print: "0.75 in wide",
		minimum_size_screen: "96 px wide",
		placement_zones: ["Top left", "Bottom left"],
		do_not_alter_rules: [
			"Do not redraw or de-italicize the wordmark.",
			"Do not stretch, rotate, or recolor outside approved variants.",
			"Do not place on low-contrast backgrounds.",
		],
		sub_brand_logos: null,
	},
	brand_devices: [
		{
			name: "Spark Device",
			description: "The angular spark/flash graphic used as a supporting brand mark.",
			usage_rules: "Use to reinforce energy and freshness; pair with the wordmark, not as a standalone logo replacement.",
			usage_restriction: "Supporting device only",
		},
	],
	photography_mood_brief: {
		summary: "Clear, crisp, and high-contrast — refreshment defined by clarity and simplicity.",
		lighting: "Bright, directional lighting with strong highlights.",
		colour_treatment: "Cool, high-contrast grading; greens and yellows kept vivid.",
		subject_matter: "Citrus, condensation, and everyday refreshment moments.",
		what_to_avoid: ["Warm, muted lighting.", "Cluttered or busy backgrounds."],
	},
	tone_of_voice: {
		summary: "Sprite sounds clear, confident, and direct — refreshingly simple, never sweet or saccharine.",
		formality: "Direct and confident",
		person: "Second person, direct address",
		key_traits: ["Clear", "Confident", "Crisp", "Direct"],
		recurring_language: ["Obey your thirst", "Clarity, always", "Stay clear"],
		what_to_avoid: ["Saccharine or overly sweet language", "Corporate filler", "Health claims"],
		brand_name_rules: "Use Sprite on first reference. Do not abbreviate the brand name.",
		preferred_terms: [
			{avoid: "soda", use_instead: "Sprite", context: "Always name the product directly."},
			{avoid: "consumers", use_instead: "people", context: "Consumer-facing campaign copy."},
		],
	},
	brand_values: {
		target_audience: "Young, culturally-engaged consumers who value authenticity and clarity over hype.",
		values: [
			{name: "Clarity", description: null},
			{name: "Confidence", description: null},
			{name: "Refreshment", description: null},
			{name: "Simplicity", description: null},
		],
	},
	writing_guidelines: {
		style_guide_reference: "American_English",
		sentence_case_headlines: true,
		grammar_rules: [
			"Keep sentences short and direct.",
			"Avoid superlatives and hard-sell language.",
			"Lead with clarity, not cleverness for its own sake.",
		],
		approved_descriptors: ["clear", "crisp", "refreshing", "confident", "cool"],
	},
	channels: ["Social", "Paid", "Web"],
	approvedChannelConnections: {
		Social: ["cmp-instagram", "cmp-twitter"],
		Email: [],
		Paid: [],
		Web: ["cmp-opti-cms"],
	},
	toneKeywords: ["Clear", "Confident", "Crisp", "Direct"],
	templateCount: 12,
	templates: [
		{
			id: "sp1",
			name: "Sprite Brand Mark — Square",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/sprite.svg",
			ratio: "1:1",
		},
		{
			id: "sp2",
			name: "Sprite Brand Mark — Portrait",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/sprite.svg",
			ratio: "4:5",
		},
		{
			id: "sp3",
			name: "Sprite Brand Mark — Paid Ad",
			format: "Paid Ad",
			channel: "Paid",
			thumb: "/brand-packs/cards/sprite.svg",
			ratio: "16:9",
		},
	],
	assets: [
		{id: "spa1", name: "Sprite Logo — Primary", type: "logo", url: "/brand-packs/logos/sprite.svg", format: "SVG"},
		{id: "spa2", name: "Sprite Logo — Reversed", type: "logo", url: "/brand-packs/logos/sprite.svg", format: "SVG"},
		{
			id: "spa3",
			name: "Sprite & Citrus Still Life",
			type: "photo",
			url: "https://images.unsplash.com/photo-1592243364766-eb1bd3a71709?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "spa4",
			name: "Lemon-Lime Refresh",
			type: "photo",
			url: "https://images.unsplash.com/photo-1624517286326-62fc932dffca?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "spa5",
			name: "Clarity Moment",
			type: "photo",
			url: "https://images.unsplash.com/photo-1632459250869-dff3ea071113?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "spa6",
			name: "Lemon Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/lemon.svg?color=%23008B47",
			format: "SVG",
		},
		{
			id: "spa7",
			name: "Droplet Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/droplet.svg?color=%23008B47",
			format: "SVG",
		},
		{
			id: "spa8",
			name: "Sprite Green Field",
			type: "background",
			bucket: "style_references",
			url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Crect%20width='1200'%20height='800'%20fill='%23008B47'/%3E%3C/svg%3E",
			format: "SVG",
		},
	],
	brandBrief: `# Sprite — Brand Instruction

## Brand Identity
Sprite is the clear, crisp lemon-lime soda brand. All visual content must feel **clear, confident, and refreshingly simple** — never cluttered or busy.

## Color Usage
- **Sprite Green (#008B47)**: Primary field color and packaging
- **Sprite Yellow (#FFDD00)**: High-energy accent and contrast
- **Full White (#FFFFFF)**: Logo counter-color and clarity fields

## Typography
- **Display**: Refraktiv — custom italic display face
- **Body**: Aktiv Grotesk — the base family Refraktiv extends

## Tone of Voice
Write with clarity and confidence. Short, direct, no filler.

**Good**: "Clarity, always. Stay clear."
**Avoid**: "Our beverage offers a uniquely satisfying flavor experience."

## Image Style
- High-contrast, crisp product lighting
- Citrus featured prominently
- Clean, uncluttered compositions

## Template Rules
- Always keep the italic wordmark clearly visible
- CTA buttons use Sprite Green background with white text
- Social cards: bold headline, minimal body copy, citrus-forward image`,
	createdBy: "Brand Team",
	createdAt: "2026-06-03",
	updatedAt: "2026-07-06",
};
