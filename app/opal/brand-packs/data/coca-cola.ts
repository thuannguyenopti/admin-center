import type {BrandPack} from "../types";

export const cocaCola: BrandPack = {
	id: "coca-cola",
	name: "Coca-Cola",
	status: "active",
	description:
		"The primary global brand identity for The Coca-Cola Company. The canonical source of truth for color, type, and tone across every Coca-Cola touchpoint.",
	schema_version: "2.0",
	brand_pack_type: "pdf_and_web",
	identity: {
		name: "Coca-Cola",
		description:
			"The primary global brand identity for The Coca-Cola Company. The canonical source of truth for color, type, and tone.",
		brand_type: "master_brand",
		parent_brand: null,
		expiry_date: null,
	},
	source: {
		website_url: "https://www.coca-cola.com",
		pages_crawled: [
			"https://www.coca-cola.com",
			"https://www.coca-cola.com/us/en/brands/coca-cola",
			"https://www.coca-colacompany.com",
		],
		pdf_files_provided: [],
		pdf_types_detected: [],
		guidelines_found: true,
		guidelines_urls: ["https://www.coca-colacompany.com/media-center"],
		extraction_notes:
			"Color and typography derived from public brand references; The Coca-Cola Company's full internal style guide is not publicly published, so exact Pantone/CMYK conversions here are approximate.",
	},
	brand_instruction: {
		brand_identity_summary:
			"Coca-Cola is the world's most recognized beverage brand — warm, optimistic, and built on more than a century of shared, everyday moments.",
		visual_identity_summary:
			"Coca-Cola Red anchors every touchpoint, paired with the Spencerian script logotype, the white dynamic ribbon, and warm, candid photography of real people.",
		gradients:
			"Gradients are not part of the core brand system. Use flat Coca-Cola Red fields and high-contrast white/black type instead.",
		photography_style: [
			"Real people sharing a Coca-Cola in everyday moments — meals, gatherings, celebrations.",
			"Warm, natural lighting; golden-hour or bright daylight preferred.",
			"Crisp studio product shots with visible condensation for cold refreshment.",
			"Avoid cold, clinical, or overly polished corporate lighting.",
		],
		photography_categories_present: true,
		compositing:
			"Logo files should be composited after generation. Do not ask the model to recreate the Coca-Cola script logotype or dynamic ribbon.",
		composition_guidelines: [
			"Keep the product or logo as a clear, dominant focal point.",
			"Reserve generous negative space around the dynamic ribbon.",
			"Use centered or left-aligned layouts for campaign headlines.",
		],
		tone_and_atmosphere: "Warm, optimistic, timeless, and inclusive.",
		what_to_avoid: [
			"Cold, blue-toned lighting.",
			"Cynical or ironic copy.",
			"Explicit health or nutrition claims.",
			"Generic corporate stock photography.",
		],
		full_instruction_text: `# Coca-Cola — Brand Instruction

## Brand Identity
Coca-Cola is the world's most recognized beverage brand. All visual content must feel **warm, optimistic, and timeless** — never cold or corporate.

## Visual Identity
Lead with Coca-Cola Red, the Spencerian script logotype, and the white dynamic ribbon. Use flat color fields and strong contrast; avoid decorative gradients.

## Color Usage
- **Coca-Cola Red (#F40009)**: Primary field color, packaging, and key brand moments
- **Classic White (#FFFFFF)**: Logo counter-color and contrast fields
- **Black (#000000)**: Body copy on light backgrounds
- **Deep Red (#A6050B)**: Accessible hover/pressed states on light backgrounds

## Typography
- **Display**: Spencerian Script — reserved exclusively for the logotype itself
- **Headings**: Trade Gothic Bold Condensed No. 20 — bold, confident, as-written casing
- **Body**: Gotham Book — clean and legible

## Tone of Voice
Write with warmth and optimism. Lead with feeling, not features. Keep sentences short.

## Image Style
- Real people sharing a Coca-Cola in everyday moments
- Warm, natural lighting; visible condensation on cold product shots
- Avoid cold or clinical studio lighting

## Logo Rule
Do not generate or redraw the logo. Composite approved logo files after generation.`,
		updated_from_schema_at: "2026-06-01",
	},
	colors: [
		{
			cmyk: "C:0 M:96 Y:100 K:0",
			confidence: "high",
			hex: "#F40009",
			name: "Coca-Cola Red",
			pms: "Pantone 484 C",
			role: "primary",
			usage_notes:
				"The dominant brand field color — packaging, the disc/ribbon device, and key campaign moments. Never used as a body-text color.",
			web_accessible_hex: "#A6050B",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:0",
			confidence: "high",
			hex: "#FFFFFF",
			name: "Classic White",
			pms: null,
			role: "neutral",
			usage_notes: "Logo counter-color, page backgrounds, and contrast fields against Coca-Cola Red.",
			web_accessible_hex: "#FFFFFF",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:100",
			confidence: "high",
			hex: "#000000",
			name: "Black",
			pms: "Pantone Black C",
			role: "neutral",
			usage_notes: "Body copy on white or light backgrounds and high-contrast typographic treatments.",
			web_accessible_hex: "#000000",
		},
		{
			cmyk: "C:16 M:98 Y:96 K:6",
			confidence: "medium",
			hex: "#A6050B",
			name: "Deep Red",
			pms: null,
			role: "accent",
			usage_notes: "Accessible hover/pressed-state alternative to Coca-Cola Red on light backgrounds.",
			web_accessible_hex: "#A6050B",
		},
		{
			cmyk: "C:2 M:20 Y:96 K:0",
			confidence: "medium",
			hex: "#F2C201",
			name: "Warm Gold",
			pms: null,
			role: "secondary",
			usage_notes: "Used sparingly in seasonal and heritage campaign accents; never a primary brand color.",
			web_accessible_hex: "#8A6E00",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:29",
			confidence: "medium",
			hex: "#B5B5B5",
			name: "Silver Grey",
			pms: null,
			role: "neutral",
			usage_notes: "Secondary neutral for fine print, dividers, and quiet UI surfaces.",
			web_accessible_hex: "#6E6E6E",
		},
	],
	typography: {heading: "Trade Gothic Bold Condensed No. 20", body: "Gotham"},
	typographyRules: [
		{
			alignment: "centre",
			case_rule: "as-written",
			colour_application: ["Classic White"],
			confidence: "high",
			font_family: "Spencerian Script (Coca-Cola Script)",
			notes:
				"Reserved exclusively for the Coca-Cola logotype itself — never used as a general display font for other headlines.",
			source: "custom",
			usage: "display",
			weight: "Regular",
		},
		{
			alignment: "left",
			case_rule: "as-written",
			colour_application: ["Coca-Cola Red", "Classic White"],
			confidence: "high",
			font_family: "Trade Gothic Bold Condensed No. 20",
			notes: "Bold condensed display type for headlines and campaign taglines.",
			source: "library",
			usage: "heading",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Black"],
			confidence: "high",
			font_family: "Gotham",
			notes: "Clean geometric sans for packaging fine print, digital body copy, and documents.",
			source: "library",
			usage: "body",
			weight: "Book",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Black", "Coca-Cola Red"],
			confidence: "medium",
			font_family: "Gotham",
			notes: "Buttons, labels, and interface metadata.",
			source: "library",
			usage: "ui",
			weight: "Medium",
		},
	],
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
		sub_brand_logos: ["Diet Coke", "Coca-Cola Zero Sugar", "Coca-Cola Spiced"],
	},
	photography_categories: [
		{
			name: "Everyday Refreshment",
			description: "People sharing a Coca-Cola in real, ordinary moments — meals, gatherings, celebrations.",
			sub_categories: ["Meals", "Friends & Family", "Celebrations"],
			do_rules: [
				"Show genuine, warm interactions.",
				"Keep the bottle or can clearly in frame.",
				"Use natural, optimistic lighting.",
			],
			dont_rules: ["Avoid staged corporate stock-photo poses.", "Avoid cold or clinical studio lighting."],
		},
		{
			name: "Product Beauty",
			description: "Clean, iconic studio shots of the contour bottle and can.",
			sub_categories: ["Contour Bottle", "Can", "Condensation & Ice"],
			do_rules: ["Use crisp product lighting with visible condensation.", "Keep Coca-Cola Red dominant in frame."],
			dont_rules: ["Avoid busy backgrounds that compete with the product."],
		},
	],
	photography_mood_brief: {
		summary: "Warm, optimistic, and universally human — refreshment as a shared, everyday joy.",
		lighting: "Natural and warm; golden-hour or bright daylight preferred.",
		colour_treatment: "Rich reds preserved at full saturation; skin tones kept natural and warm.",
		subject_matter: "Real people sharing a Coca-Cola together.",
		what_to_avoid: ["Cold, blue-toned lighting.", "Overly polished, artificial-feeling scenes."],
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
	illustration_system: {
		in_use: false,
		hierarchy: "fallback",
		style_description:
			"Illustration is used sparingly, mainly in heritage and holiday campaigns (e.g. the Coca-Cola polar bears and Santa artwork).",
		human_proportions: null,
		skin_tones: null,
		do_rules: ["Prefer real photography for everyday brand communications."],
		dont_rules: ["Do not use illustration as the default style — reserve for heritage/seasonal campaigns only."],
	},
	icon_system: {
		in_use: true,
		style: "Minimal, rounded-corner iconography for digital touchpoints.",
		artboard_px: 24,
		gutter_px: 2,
		line_weight_px: 2,
		colour_rules: "Coca-Cola Red on white backgrounds; white on Coca-Cola Red backgrounds.",
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
	layout_grid: {
		in_use: true,
		column_count: 12,
		gutter_rules: "24 px",
		margin_rules: "48 px on desktop, 16 px on mobile",
		layout_rules:
			"Center the product or logo as the visual anchor. Reserve generous white space around the dynamic ribbon.",
	},
	data_visualisation: {
		in_use: true,
		approved_chart_types: ["bar", "line", "metric tile"],
		prohibited_chart_types: ["pie", "3d chart"],
		gradient_permitted: false,
		style_notes: "Keep data visuals minimal and secondary — Coca-Cola communications lead with product and people, not charts.",
	},
	ai_identity: null,
	expression_system: {
		in_use: true,
		summary: "Coca-Cola content moves across three expression levels depending on context.",
		states: [
			{name: "Classic", description: "Timeless, heritage-forward — script logo, red field, minimal copy."},
			{name: "Everyday", description: "Real-life refreshment moments, warm and candid."},
			{name: "Campaign", description: "Bold seasonal or platform campaigns with elevated production value."},
		],
		rules: ["Never mix Classic heritage assets with high-energy Campaign styling in the same piece."],
	},
	brand_scalability_system: null,
	brand_codes: {
		in_use: true,
		summary: "Coca-Cola's recurring sensory codes are the contour bottle, the dynamic ribbon, condensation and ice, and the color red itself.",
		key_fields: [
			{label: "Red", value: "Used as a dominant field color, not just an accent."},
			{label: "Condensation", value: "Ice and water droplets signal cold refreshment."},
			{label: "Contour", value: "The bottle silhouette is recognizable even without the logo."},
		],
		rules: ["Use codes as authentic product cues, not decorative texture."],
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
	environmental: {
		in_use: true,
		summary: "Packaging and campaign content should reflect Coca-Cola's public sustainability commitments accurately.",
		key_fields: [{label: "Packaging", value: "Reference recyclable packaging messaging accurately; do not overstate."}],
		rules: ["Do not make unverified environmental claims."],
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
	metadata: {
		created_date: "2026-06-01",
		agent_version: "brand_pack_onboarding_v2.1",
		pdf_source_types: [],
		overall_confidence: "high",
		confidence_notes:
			"Core color and typography identity is well documented publicly. Exact internal Pantone/CMYK conversions are approximate since Coca-Cola's full internal style guide is not public.",
		status: "active",
	},
};
