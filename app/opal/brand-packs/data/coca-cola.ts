import type {BrandPack} from "../types";

export const cocaCola: BrandPack = {
	id: "coca-cola",
	name: "Coca-Cola",
	status: "active",
	description:
		"The primary global brand identity for The Coca-Cola Company. The canonical source of truth for color, type, and tone across every Coca-Cola touchpoint.",
	sourceUrl: "https://www.coca-cola.com",
	colors: [
		{hex: "#F40009", name: "Coca-Cola Red", role: "primary"},
		{hex: "#FFFFFF", name: "Classic White", role: "background"},
		{hex: "#000000", name: "Black", role: "text"},
		{hex: "#A6050B", name: "Deep Red", role: "accent"},
		{hex: "#F2C201", name: "Warm Gold", role: "secondary"},
		{hex: "#B5B5B5", name: "Silver Grey", role: "neutral"},
	],
	typography: {heading: "Trade Gothic Bold Condensed No. 20", body: "Gotham"},
	logo_system: {
		variants: [
			{
				name: "Dynamic Ribbon Logo",
				colour_versions: ["Coca-Cola Red", "Classic White"],
				usage_context: "Primary brand mark for packaging, campaign key art, and digital headers.",
			},
			{
				name: "Script Wordmark",
				colour_versions: ["Classic White", "Black"],
				usage_context: "Stand-alone logotype use without the dynamic ribbon device.",
			},
		],
		clear_space_rule: "Maintain clear space equal to the height of the 'C' in Coca-Cola on all sides.",
		minimum_size_print: "1 in wide",
		minimum_size_screen: "120 px wide",
		placement_zones: ["Top center", "Bottom left", "Centered on pack fronts"],
		do_not_alter_rules: [
			"Do not redraw or recolor the script logotype.",
			"Do not rotate, skew, or apply effects.",
			"Do not place on low-contrast backgrounds.",
		],
		sub_brand_logos: null,
	},
	brand_devices: [
		{
			name: "Dynamic Ribbon",
			description: "The white wave device that underlines the Coca-Cola logo.",
			usage_rules: "Always paired with the logotype; never used as a standalone decorative element.",
			usage_restriction: "Wordmark companion only",
		},
		{
			name: "Contour Bottle Silhouette",
			description: "The iconic contour bottle shape used as a recognizable brand device.",
			usage_rules: "Use as a silhouette in campaign key art and packaging call-outs.",
			usage_restriction: null,
		},
	],
	photography_mood_brief: {
		summary: "Warm, optimistic, and universally human — refreshment as a shared, everyday joy.",
		lighting: "Natural and warm; golden-hour or bright daylight preferred.",
		colour_treatment: "Rich reds preserved at full saturation; skin tones kept natural and warm.",
		subject_matter: "Real people sharing a Coca-Cola together.",
		what_to_avoid: ["Cold, blue-toned lighting.", "Overly polished, artificial-feeling scenes."],
	},
	tone_of_voice: {
		summary: "Coca-Cola sounds warm, optimistic, and inclusive — timeless rather than trendy.",
		formality: "Warm and conversational",
		person: "First person plural for brand commitments, second person for direct invitations",
		key_traits: ["Warm", "Optimistic", "Timeless", "Inclusive"],
		recurring_language: ["Open happiness", "Real magic", "Taste the feeling"],
		what_to_avoid: ["Corporate jargon", "Cynicism or irony", "Explicit health claims"],
		brand_name_rules: "Use Coca-Cola in full on first reference. \"Coke\" is acceptable in informal consumer copy only.",
		preferred_terms: [
			{avoid: "soda", use_instead: "Coca-Cola", context: "Always name the product directly rather than the category."},
			{avoid: "customers", use_instead: "people", context: "Consumer-facing campaign copy."},
		],
	},
	brand_values: {
		target_audience: "Everyone — Coca-Cola is a mass, cross-generational, cross-cultural brand.",
		values: [
			{name: "Joy", description: null},
			{name: "Togetherness", description: null},
			{name: "Optimism", description: null},
			{name: "Authenticity", description: null},
		],
	},
	writing_guidelines: {
		style_guide_reference: "American_English",
		sentence_case_headlines: true,
		grammar_rules: [
			"Keep sentences short and warm.",
			"Avoid superlatives and hard-sell language.",
			"Lead with feeling, not features.",
		],
		approved_descriptors: ["refreshing", "real", "joyful", "timeless", "shared"],
	},
	channels: ["Social", "Email", "Paid", "Web"],
	approvedChannelConnections: {
		Social: ["cmp-linkedin", "cmp-instagram", "cmp-facebook"],
		Email: ["cmp-marketo"],
		Paid: [],
		Web: ["cmp-opti-cms", "cmp-rss"],
	},
	toneKeywords: ["Warm", "Optimistic", "Timeless", "Inclusive"],
	templateCount: 24,
	templates: [
		{
			id: "cc1",
			name: "Coca-Cola Brand Mark — Square",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/coca-cola.svg",
			ratio: "1:1",
		},
		{
			id: "cc2",
			name: "Coca-Cola Brand Mark — Portrait",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/coca-cola.svg",
			ratio: "4:5",
		},
		{
			id: "cc3",
			name: "Coca-Cola Brand Mark — Email Hero",
			format: "Email Hero",
			channel: "Email",
			thumb: "/brand-packs/cards/coca-cola.svg",
			ratio: "16:9",
		},
	],
	assets: [
		{id: "cca1", name: "Coca-Cola Logo — Primary", type: "logo", url: "/brand-packs/logos/coca-cola.svg", format: "SVG"},
		{id: "cca2", name: "Coca-Cola Logo — Reversed", type: "logo", url: "/brand-packs/logos/coca-cola.svg", format: "SVG"},
		{
			id: "cca3",
			name: "Everyday Refreshment — Glass Bottle",
			type: "photo",
			url: "https://images.unsplash.com/photo-1566657817181-c69e4a8eeb1e?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "cca4",
			name: "Share a Coke Moment",
			type: "photo",
			url: "https://images.unsplash.com/photo-1612813408254-de7d1b23c95e?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "cca5",
			name: "Ice Cold Can",
			type: "photo",
			url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "cca6",
			name: "Bottle Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/bottle.svg?color=%23F40009",
			format: "SVG",
		},
		{
			id: "cca7",
			name: "Sparkles Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/sparkles.svg?color=%23F40009",
			format: "SVG",
		},
		{
			id: "cca8",
			name: "Heart Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/heart.svg?color=%23A6050B",
			format: "SVG",
		},
		{
			id: "cca9",
			name: "Coca-Cola Red Field",
			type: "background",
			bucket: "style_references",
			url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Crect%20width='1200'%20height='800'%20fill='%23F40009'/%3E%3C/svg%3E",
			format: "SVG",
		},
		{
			id: "cca10",
			name: "Brand Guidelines.pdf",
			type: "photo",
			bucket: "misc",
			url: "https://placehold.co/600x400/F40009/FFFFFF.png?text=Brand+Guidelines.pdf",
			format: "PDF",
		},
	],
	brandBrief: `# Coca-Cola — Brand Instruction

## Brand Identity
Coca-Cola is the world's most recognized beverage brand. All visual content must feel **warm, optimistic, and timeless** — never cold or corporate.

## Color Usage
- **Coca-Cola Red (#F40009)**: Primary field color, packaging, key brand moments
- **Classic White (#FFFFFF)**: Logo counter-color and contrast fields
- **Black (#000000)**: Body copy on light backgrounds
- **Deep Red (#A6050B)**: Accessible hover/pressed states

## Typography
- **Display**: Spencerian Script — reserved exclusively for the logotype
- **Headings**: Trade Gothic Bold Condensed No. 20 — bold, confident, as-written casing
- **Body**: Gotham Book — clean and legible at every size

## Tone of Voice
Write with warmth and optimism. Lead with feeling, not features.

**Good**: "Open happiness. Share a Coke."
**Avoid**: "Our beverage delivers optimal refreshment performance."

## Image Style
- Real people sharing a Coca-Cola in everyday moments
- Warm, natural lighting; visible condensation on cold product shots
- Avoid cold or clinical studio lighting

## Template Rules
- Always keep the script logotype or dynamic ribbon clearly visible
- CTA buttons use Coca-Cola Red background with white text
- Social cards: bold headline, minimal body copy, strong product image`,
	createdBy: "Brand Team",
	createdAt: "2026-06-01",
	updatedAt: "2026-07-10",
};
