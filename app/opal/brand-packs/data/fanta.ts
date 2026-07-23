import type {BrandPack} from "../types";

export const fanta: BrandPack = {
	id: "fanta",
	name: "Fanta",
	status: "published",
	description:
		"Fanta's global brand identity — playful, bubbly, and fruit-forward. Covers the 2023 Coca-Cola Global Design/JKR visual refresh across packaging and digital.",
	sourceUrl: "https://www.fanta.com",
	colors: [
		{hex: "#FC8102", name: "Fanta Orange", role: "primary"},
		{hex: "#0E4485", name: "Endless Sky", role: "secondary"},
		{hex: "#29A24B", name: "Retro Green", role: "accent"},
		{hex: "#FFFFFF", name: "Full White", role: "background"},
		{hex: "#231F20", name: "Ink Black", role: "text"},
	],
	typography: {heading: "Fanta Bespoke Sans", body: "Poppins"},
	logo_system: {
		variants: [
			{
				name: "Fanta Twisted Wordmark",
				colour_versions: ["Full White", "Endless Sky"],
				usage_context: "Primary brand mark on orange packaging and campaign key art.",
			},
			{
				name: "Fanta Social Mark",
				colour_versions: ["Fanta Orange", "Full White"],
				usage_context: "Compact social and avatar contexts.",
			},
		],
		clear_space_rule: "Use at least the height of the letter 'F' on all sides.",
		minimum_size_print: "0.75 in wide",
		minimum_size_screen: "96 px wide",
		placement_zones: ["Top center", "Bottom left"],
		do_not_alter_rules: [
			"Do not redraw or restage the twisted letterforms.",
			"Do not stretch, rotate, or add drop shadows beyond the approved retro-shadow effect.",
			"Do not place on low-contrast fruit-illustration backgrounds.",
		],
		sub_brand_logos: null,
	},
	brand_devices: [
		{
			name: "Twist Shadow",
			description: "The retro-inspired offset shadow effect behind the wordmark letterforms.",
			usage_rules: "Always paired with the wordmark; keep the shadow color a darker tone of the base letter color.",
			usage_restriction: "Wordmark companion only",
		},
	],
	photography_mood_brief: {
		summary: "Bubbly, bright, and a little surreal — fun as the headline, not an afterthought.",
		lighting: "Bright, high-key lighting with punchy color.",
		colour_treatment: "Fully saturated orange and fruit tones; avoid pastel or muted grading.",
		subject_matter: "Fruit in motion and friends having fun together.",
		what_to_avoid: ["Muted color grading.", "Serious or posed compositions."],
	},
	tone_of_voice: {
		summary: "Fanta sounds playful, energetic, and fun — a brand that doesn't take itself too seriously.",
		formality: "Casual and playful",
		person: "Second person, direct and upbeat",
		key_traits: ["Playful", "Bubbly", "Fun", "Energetic"],
		recurring_language: ["Pop of Funta", "Taste the fun", "Bring the fizz"],
		what_to_avoid: ["Corporate or overly formal language", "Health claims", "Cynical humor"],
		brand_name_rules: "Use Fanta on first reference. Do not abbreviate the brand name.",
		preferred_terms: [
			{avoid: "soft drink", use_instead: "Fanta", context: "Always name the product directly."},
			{avoid: "consumers", use_instead: "fans", context: "Consumer-facing campaign copy."},
		],
	},
	brand_values: {
		target_audience: "Teens and young adults looking for fun, flavor, and a break from the everyday.",
		values: [
			{name: "Fun", description: null},
			{name: "Playfulness", description: null},
			{name: "Flavor", description: null},
			{name: "Self-expression", description: null},
		],
	},
	writing_guidelines: {
		style_guide_reference: "American_English",
		sentence_case_headlines: true,
		grammar_rules: [
			"Keep copy short, punchy, and fun.",
			"Use exclamation points sparingly but confidently.",
			"Avoid corporate jargon entirely.",
		],
		approved_descriptors: ["playful", "bubbly", "fruity", "fun", "bold"],
	},
	channels: ["Social", "Paid", "Web"],
	approvedChannelConnections: {
		Social: ["cmp-instagram", "cmp-twitter"],
		Email: [],
		Paid: [],
		Web: ["cmp-opti-cms"],
	},
	toneKeywords: ["Playful", "Bubbly", "Fun", "Energetic"],
	templateCount: 14,
	templates: [
		{
			id: "fa1",
			name: "Fanta Brand Mark — Square",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/fanta.svg",
			ratio: "1:1",
		},
		{
			id: "fa2",
			name: "Fanta Brand Mark — Portrait",
			format: "Social Post",
			channel: "Social",
			thumb: "/brand-packs/cards/fanta.svg",
			ratio: "4:5",
		},
		{
			id: "fa3",
			name: "Fanta Brand Mark — Paid Ad",
			format: "Paid Ad",
			channel: "Paid",
			thumb: "/brand-packs/cards/fanta.svg",
			ratio: "16:9",
		},
	],
	assets: [
		{id: "faa1", name: "Fanta Logo — Primary", type: "logo", url: "/brand-packs/logos/fanta.svg", format: "SVG"},
		{id: "faa2", name: "Fanta Logo — Reversed", type: "logo", url: "/brand-packs/logos/fanta.svg", format: "SVG"},
		{
			id: "faa3",
			name: "Fanta Orange Soda Lineup",
			type: "photo",
			url: "https://images.unsplash.com/photo-1601751924328-81edaa1b8c87?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "faa4",
			name: "Grab & Go Orange Soda",
			type: "photo",
			url: "https://images.unsplash.com/photo-1722639096439-7a95b97d6a9f?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "faa5",
			name: "Orange Splash",
			type: "photo",
			url: "https://images.unsplash.com/photo-1617981292120-3c56b766e2a7?auto=format&fit=crop&w=1200&q=80",
			format: "JPG",
		},
		{
			id: "faa6",
			name: "Citrus Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/lemon.svg?color=%23FC8102",
			format: "SVG",
		},
		{
			id: "faa7",
			name: "Sparkles Icon",
			type: "icon",
			bucket: "style_references",
			url: "https://api.iconify.design/tabler/sparkles.svg?color=%230E4485",
			format: "SVG",
		},
		{
			id: "faa8",
			name: "Fanta Orange Field",
			type: "background",
			bucket: "style_references",
			url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Crect%20width='1200'%20height='800'%20fill='%23FC8102'/%3E%3C/svg%3E",
			format: "SVG",
		},
	],
	brandBrief: `# Fanta — Brand Instruction

## Brand Identity
Fanta is the playful, fruit-forward soda brand. All visual content must feel **fun, bubbly, and a little mischievous** — never serious or corporate.

## Color Usage
- **Fanta Orange (#FC8102)**: Primary field color and packaging
- **Endless Sky (#0E4485)**: Secondary accent, contrast against orange
- **Retro Green (#29A24B)**: Flavor variant accent
- **Full White (#FFFFFF)**: Logo counter-color and contrast fields

## Typography
- **Headings**: Fanta Bespoke Sans (custom wordmark face) — bold, twisted, playful
- **Body**: Poppins — friendly geometric sans

## Tone of Voice
Write with playful energy. Short, punchy, fun.

**Good**: "Pop of Funta. Taste the fun."
**Avoid**: "Our beverage portfolio offers enhanced flavor experiences."

## Image Style
- Bright, high-energy lifestyle shots
- Bold saturated color grading
- Playful fruit-forward compositions

## Template Rules
- Always keep the twisted wordmark clearly visible
- CTA buttons use Fanta Orange background with white text
- Social cards: bold headline, minimal body copy, fruit-forward image`,
	createdBy: "Brand Team",
	createdAt: "2026-06-05",
	updatedAt: "2026-07-08",
};
