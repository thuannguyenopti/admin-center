import type {BrandPack} from "../types";

export const fanta: BrandPack = {
	id: "fanta",
	name: "Fanta",
	status: "published",
	description:
		"Fanta's global brand identity — playful, bubbly, and fruit-forward. Covers the 2023 Coca-Cola Global Design/JKR visual refresh across packaging and digital.",
	schema_version: "2.0",
	brand_pack_type: "web",
	identity: {
		name: "Fanta",
		description: "Fanta's global brand identity — playful, bubbly, and fruit-forward.",
		brand_type: "sub_brand",
		parent_brand: "The Coca-Cola Company",
		expiry_date: null,
	},
	source: {
		website_url: "https://www.fanta.com",
		pages_crawled: ["https://www.fanta.com"],
		pdf_files_provided: [],
		pdf_types_detected: [],
		guidelines_found: true,
		guidelines_urls: ["https://www.coca-colacompany.com/media-center"],
		extraction_notes:
			"Color and typography derived from public brand references covering the 2023 JKR-led global redesign. Exact internal guideline values are not publicly published.",
	},
	brand_instruction: {
		brand_identity_summary:
			"Fanta is the playful, fruit-forward soda brand — a 'Pop of Funta' built for consumers who want fun and flavor over seriousness.",
		visual_identity_summary:
			"Fanta uses a bold orange field, a bespoke twisted wordmark, fruit-shaped graphics, and joyful illustration.",
		gradients: "Flat, saturated color fields are preferred. Soft gradients are acceptable only within fruit illustration shading.",
		photography_style: [
			"Bright, high-energy lifestyle shots of friends and flavor.",
			"Bold, saturated color grading — no muted or desaturated looks.",
			"Playful, slightly surreal fruit-forward compositions.",
		],
		photography_categories_present: true,
		compositing: "Composite the approved Fanta wordmark after generation rather than asking the model to redraw it.",
		composition_guidelines: [
			"Leave room for the twisted wordmark and fruit graphics.",
			"Use bold, centered or diagonal compositions.",
			"Keep energy high — avoid static, flat layouts.",
		],
		tone_and_atmosphere: "Playful, energetic, fun, and a little mischievous.",
		what_to_avoid: [
			"Muted or desaturated color grading.",
			"Serious, corporate tone of voice.",
			"Sparse, minimalist layouts that read as flat rather than fun.",
		],
		full_instruction_text: `# Fanta — Brand Instruction

## Brand Identity
Fanta is the playful, fruit-forward soda brand. All visual content must feel **fun, bubbly, and a little mischievous** — never serious or corporate.

## Visual Identity
Lead with bold orange, the twisted bespoke wordmark, and fruit-shaped graphics. Flat saturated color fields; gradients only within fruit illustration shading.

## Color Usage
- **Fanta Orange (#FC8102)**: Primary field color and packaging
- **Endless Sky (#0E4485)**: Secondary accent, contrast against orange
- **Retro Green (#29A24B)**: Flavor variant accent (grape/citrus lines)
- **Full White (#FFFFFF)**: Logo counter-color and contrast fields

## Typography
- **Headings**: Fanta Bespoke Sans (custom Colophon Foundry wordmark face) — bold, twisted, playful
- **Body**: Poppins — friendly geometric sans for supporting copy

## Tone of Voice
Write with playful energy. Short, punchy, fun. Never take yourself too seriously.

## Image Style
- Bright, high-energy lifestyle shots
- Bold saturated color grading
- Playful fruit-forward compositions

## Logo Rule
Do not generate or redraw the logo. Composite approved logo files after generation.`,
		updated_from_schema_at: "2026-06-05",
	},
	colors: [
		{
			cmyk: "C:0 M:60 Y:100 K:0",
			confidence: "high",
			hex: "#FC8102",
			name: "Fanta Orange",
			pms: "Pantone 1495 C",
			role: "primary",
			usage_notes: "The dominant brand field color — packaging, campaign key art, and the wordmark background.",
			web_accessible_hex: "#B85C00",
		},
		{
			cmyk: "C:94 M:69 Y:0 K:0",
			confidence: "medium",
			hex: "#0E4485",
			name: "Endless Sky",
			pms: null,
			role: "secondary",
			usage_notes: "High-contrast secondary color for logo variants and supporting graphics.",
			web_accessible_hex: "#0E4485",
		},
		{
			cmyk: "C:76 M:0 Y:79 K:0",
			confidence: "medium",
			hex: "#29A24B",
			name: "Retro Green",
			pms: null,
			role: "accent",
			usage_notes: "Flavor-variant accent color (e.g. grape, citrus lines) — not used for the core orange SKU.",
			web_accessible_hex: "#1F7A38",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:0",
			confidence: "high",
			hex: "#FFFFFF",
			name: "Full White",
			pms: null,
			role: "neutral",
			usage_notes: "Logo counter-color and contrast fields against Fanta Orange.",
			web_accessible_hex: "#FFFFFF",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:100",
			confidence: "high",
			hex: "#231F20",
			name: "Ink Black",
			pms: null,
			role: "neutral",
			usage_notes: "Body copy and fine print on light backgrounds.",
			web_accessible_hex: "#231F20",
		},
	],
	typography: {heading: "Fanta Bespoke Sans", body: "Poppins"},
	typographyRules: [
		{
			alignment: "centre",
			case_rule: "as-written",
			colour_application: ["Fanta Orange", "Full White"],
			confidence: "high",
			font_family: "Fanta Bespoke Sans",
			notes: "Custom Colophon Foundry-designed wordmark face, extruded and staggered. Reserved for the logotype and top-level campaign headlines.",
			source: "custom",
			usage: "display",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Ink Black", "Full White"],
			confidence: "medium",
			font_family: "Poppins",
			notes: "Friendly geometric sans for headlines that aren't the primary logotype treatment.",
			source: "library",
			usage: "heading",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Ink Black"],
			confidence: "medium",
			font_family: "Poppins",
			notes: "Readable paragraph copy for packaging fine print and digital body text. Pairing is illustrative, not an officially documented body font.",
			source: "web",
			usage: "body",
			weight: "Regular",
		},
		{
			alignment: "left",
			case_rule: "all-caps",
			colour_application: ["Fanta Orange", "Ink Black"],
			confidence: "medium",
			font_family: "Poppins",
			notes: "Short flavor callouts and UI labels.",
			source: "web",
			usage: "caption",
			weight: "Semi-Bold",
		},
	],
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
		sub_brand_logos: ["Fanta Zero", "Fanta Grape", "Fanta Pineapple"],
	},
	photography_categories: [
		{
			name: "Fruit Pop",
			description: "Bright, graphic shots of fruit mid-splash or mid-air, paired with the product.",
			sub_categories: ["Orange", "Grape", "Pineapple"],
			do_rules: ["Use saturated, punchy color.", "Freeze motion at the peak of the splash."],
			dont_rules: ["Avoid muted or desaturated fruit photography."],
		},
		{
			name: "Friends & Fun",
			description: "Groups of friends enjoying Fanta in bright, high-energy social settings.",
			sub_categories: ["Parties", "Outdoors", "Hangouts"],
			do_rules: ["Show genuine laughter and movement.", "Keep the can or bottle clearly visible."],
			dont_rules: ["Avoid posed, static group shots."],
		},
	],
	photography_mood_brief: {
		summary: "Bubbly, bright, and a little surreal — fun as the headline, not an afterthought.",
		lighting: "Bright, high-key lighting with punchy color.",
		colour_treatment: "Fully saturated orange and fruit tones; avoid pastel or muted grading.",
		subject_matter: "Fruit in motion and friends having fun together.",
		what_to_avoid: ["Muted color grading.", "Serious or posed compositions."],
	},
	brand_devices: [
		{
			name: "Twist Shadow",
			description: "The retro-inspired offset shadow effect behind the wordmark letterforms.",
			usage_rules: "Always paired with the wordmark; keep the shadow color a darker tone of the base letter color.",
			usage_restriction: "Wordmark companion only",
		},
	],
	illustration_system: {
		in_use: true,
		hierarchy: "primary",
		style_description:
			"Joyful, hand-drawn fruit illustrations (in the spirit of the 2023 JKR redesign's illustration work) appear throughout packaging and campaign graphics.",
		human_proportions: null,
		skin_tones: null,
		do_rules: ["Keep illustration bright, rounded, and playful.", "Pair illustrated fruit with the twisted wordmark."],
		dont_rules: ["Do not use photorealistic fruit renders alongside the illustration style in the same asset."],
	},
	icon_system: {
		in_use: true,
		style: "Rounded, bubbly iconography matching the wordmark's playful energy.",
		artboard_px: 24,
		gutter_px: 2,
		line_weight_px: 2,
		colour_rules: "Fanta Orange on white backgrounds; white on Fanta Orange backgrounds.",
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
	layout_grid: {
		in_use: true,
		column_count: 12,
		gutter_rules: "20 px",
		margin_rules: "40 px on desktop, 16 px on mobile",
		layout_rules: "Use bold, centered or diagonal compositions. Leave clear space for fruit graphics and the twisted wordmark.",
	},
	data_visualisation: {
		in_use: false,
		approved_chart_types: [],
		prohibited_chart_types: ["pie", "3d chart"],
		gradient_permitted: false,
		style_notes: "Fanta communications rarely use data visualization — favor product and fruit imagery instead.",
	},
	ai_identity: null,
	expression_system: {
		in_use: true,
		summary: "Fanta content moves across two expression levels depending on context.",
		states: [
			{name: "Playful", description: "Everyday packaging and social content — bright, fun, fruit-forward."},
			{name: "Pop", description: "High-energy campaign and event activations with maximum color and motion."},
		],
		rules: ["Never dial back to a muted or serious tone regardless of channel."],
	},
	brand_scalability_system: null,
	brand_codes: {
		in_use: true,
		summary: "Fanta's recurring sensory codes are the fruit splash, the twisted wordmark shadow, and bold flat color fields.",
		key_fields: [
			{label: "Splash", value: "Fruit captured mid-motion, frozen at the peak of the splash."},
			{label: "Twist", value: "The staggered, extruded wordmark letterforms."},
		],
		rules: ["Use codes as playful, energetic cues — never as static decoration."],
	},
	motion_sonic: {
		in_use: false,
		summary: "No motion or sonic identity system is part of this pack.",
		key_fields: [],
		rules: [],
	},
	legal: {
		in_use: true,
		summary: "Standard trademark and health-claim restraint applies.",
		rules: [
			"Mark the logotype as a registered trademark on first use in formal documents.",
			"Do not make explicit health or nutrition claims.",
			"Follow local market regulations for beverage advertising to minors.",
		],
	},
	environmental: null,
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
			name: "Fanta Orange Soda Lineup",
			format: "Social Post",
			channel: "Social",
			thumb: "https://images.unsplash.com/photo-1601751924328-81edaa1b8c87?auto=format&fit=crop&w=900&q=80",
			ratio: "1:1",
		},
		{
			id: "fa2",
			name: "Grab & Go Orange Soda",
			format: "Social Post",
			channel: "Social",
			thumb: "https://images.unsplash.com/photo-1722639096439-7a95b97d6a9f?auto=format&fit=crop&w=900&q=80",
			ratio: "4:5",
		},
		{
			id: "fa3",
			name: "Orange Splash Paid Ad",
			format: "Paid Ad",
			channel: "Paid",
			thumb: "https://images.unsplash.com/photo-1617981292120-3c56b766e2a7?auto=format&fit=crop&w=1200&q=80",
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
	metadata: {
		created_date: "2026-06-05",
		agent_version: "brand_pack_onboarding_v2.1",
		pdf_source_types: [],
		overall_confidence: "medium",
		confidence_notes:
			"Primary orange and logo identity is well documented publicly. Body-copy typeface pairing is an illustrative choice, not an officially published spec.",
		status: "published",
	},
};
