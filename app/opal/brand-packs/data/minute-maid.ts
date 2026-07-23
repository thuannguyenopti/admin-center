import type {BrandPack} from "../types";

export const minuteMaid: BrandPack = {
	id: "minute-maid",
	name: "Minute Maid",
	status: "published",
	description:
		"Minute Maid's global brand identity — warm, natural, and fruit-forward. Covers the 2023 JKR/Grey/VMLY&R/Landor & Fitch global identity refresh.",
	schema_version: "2.0",
	brand_pack_type: "web",
	identity: {
		name: "Minute Maid",
		description: "Minute Maid's global brand identity — warm, natural, and fruit-forward.",
		brand_type: "sub_brand",
		parent_brand: "The Coca-Cola Company",
		expiry_date: null,
	},
	source: {
		website_url: "https://www.minutemaid.com",
		pages_crawled: ["https://www.minutemaid.com"],
		pdf_files_provided: [],
		pdf_types_detected: [],
		guidelines_found: true,
		guidelines_urls: ["https://www.coca-colacompany.com/media-center"],
		extraction_notes:
			"Color and typography derived from public brand references covering the 2023 global identity refresh. Exact internal guideline values are not publicly published.",
	},
	brand_instruction: {
		brand_identity_summary:
			"Minute Maid is the natural, fruit-forward juice brand — warm and inviting, built around the feeling of fresh-squeezed goodness.",
		visual_identity_summary:
			"Minute Maid uses a bright, ripe-fruit-inspired color palette, a soft hand-drawn wordmark, and warm, natural photography.",
		gradients: "Soft, natural-light gradients are acceptable within fruit and juice photography, but should never feel artificial or neon.",
		photography_style: [
			"Warm, natural lighting evoking fresh fruit and morning light.",
			"Abstract fruit imagery (originally airbrush and stencil-inspired) alongside real photography.",
			"Dynamic, asymmetric compositions rather than rigid grids.",
		],
		photography_categories_present: true,
		compositing: "Composite the approved Minute Maid wordmark after generation rather than asking the model to redraw it.",
		composition_guidelines: [
			"Use dynamic, asymmetric layouts rather than centered symmetry.",
			"Leave room for the soft hand-drawn wordmark.",
			"Let fruit color carry the visual energy.",
		],
		tone_and_atmosphere: "Warm, natural, optimistic, and a little playful.",
		what_to_avoid: [
			"Cold, clinical, or artificial-feeling color grading.",
			"Overly corporate or clinical health-food framing.",
			"Rigid, symmetrical layouts.",
		],
		full_instruction_text: `# Minute Maid — Brand Instruction

## Brand Identity
Minute Maid is the natural, fruit-forward juice brand. All visual content must feel **warm, natural, and optimistic** — never clinical or artificial.

## Visual Identity
Lead with the ripe-fruit color palette, the soft hand-drawn wordmark, and warm natural photography. Use dynamic, asymmetric layouts.

## Color Usage
- **June Bud (#BFD741)**: Primary field color, packaging highlights
- **Android Green (#9EBB37)**: Secondary supporting green
- **Sap Green (#527A23)**: Deep accent for contrast and text
- **Raisin Black (#231F20)**: Body copy and fine print

## Typography
- **Display**: Minute Maid Hand — custom hand-drawn typeface from the 2023 global refresh
- **Body**: Museo Sans — warm humanist sans for supporting copy

## Tone of Voice
Write with warmth and natural optimism. Evoke the feeling of fresh-squeezed goodness.

## Image Style
- Warm, natural lighting evoking fresh fruit and morning light
- Abstract fruit imagery alongside real photography
- Dynamic, asymmetric compositions

## Logo Rule
Do not generate or redraw the logo. Composite approved logo files after generation.`,
		updated_from_schema_at: "2026-06-07",
	},
	colors: [
		{
			cmyk: "C:29 M:0 Y:82 K:0",
			confidence: "high",
			hex: "#BFD741",
			name: "June Bud",
			pms: null,
			role: "primary",
			usage_notes: "The dominant brand field color — packaging highlights and key brand moments.",
			web_accessible_hex: "#6E7D1E",
		},
		{
			cmyk: "C:34 M:0 Y:85 K:9",
			confidence: "high",
			hex: "#9EBB37",
			name: "Android Green",
			pms: null,
			role: "secondary",
			usage_notes: "Supporting green for secondary surfaces and packaging variety.",
			web_accessible_hex: "#5C6E1F",
		},
		{
			cmyk: "C:33 M:0 Y:100 K:52",
			confidence: "high",
			hex: "#527A23",
			name: "Sap Green",
			pms: null,
			role: "accent",
			usage_notes: "Deep accent for contrast text and grounded, natural surfaces.",
			web_accessible_hex: "#527A23",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:88",
			confidence: "high",
			hex: "#231F20",
			name: "Raisin Black",
			pms: null,
			role: "neutral",
			usage_notes: "Body copy and fine print — sophisticated grounding neutral.",
			web_accessible_hex: "#231F20",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:0",
			confidence: "high",
			hex: "#FFFFFF",
			name: "White",
			pms: null,
			role: "neutral",
			usage_notes: "Logo counter-color, page backgrounds, and clarity fields.",
			web_accessible_hex: "#FFFFFF",
		},
		{
			cmyk: "C:0 M:45 Y:90 K:0",
			confidence: "medium",
			hex: "#F5A623",
			name: "Ripe Orange",
			pms: null,
			role: "extended",
			usage_notes: "Extended palette accent representing the orange-juice product line specifically.",
			web_accessible_hex: "#8A5300",
		},
	],
	typography: {heading: "Minute Maid Hand", body: "Museo Sans"},
	typographyRules: [
		{
			alignment: "left",
			case_rule: "as-written",
			colour_application: ["Sap Green", "White"],
			confidence: "medium",
			font_family: "Minute Maid Hand",
			notes: "Custom hand-drawn type family created with lettering artist Erik Marinovich for the 2023 global refresh. Reserved for the wordmark and top-level headlines.",
			source: "custom",
			usage: "display",
			weight: "Regular",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Raisin Black", "Sap Green"],
			confidence: "medium",
			font_family: "Museo Sans",
			notes: "Warm humanist sans for headlines that aren't the primary hand-drawn wordmark treatment.",
			source: "web",
			usage: "heading",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Raisin Black"],
			confidence: "medium",
			font_family: "Museo Sans",
			notes: "Readable paragraph copy for packaging fine print and digital body text. Pairing is illustrative, not an officially documented body font.",
			source: "web",
			usage: "body",
			weight: "Regular",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Sap Green", "Raisin Black"],
			confidence: "medium",
			font_family: "Museo Sans",
			notes: "Buttons, labels, and interface metadata.",
			source: "web",
			usage: "ui",
			weight: "Medium",
		},
	],
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
		sub_brand_logos: ["Minute Maid Zero Sugar", "Minute Maid Fruit Punch", "Minute Maid Lemonade"],
	},
	photography_categories: [
		{
			name: "Fresh Fruit",
			description: "Warm, natural shots of oranges and citrus, often mid-motion or freshly cut.",
			sub_categories: ["Oranges", "Citrus Slices", "Juice Pour"],
			do_rules: ["Use warm, natural morning light.", "Show visible juiciness and freshness."],
			dont_rules: ["Avoid cold, clinical studio lighting.", "Avoid artificial neon color grading."],
		},
		{
			name: "Everyday Morning",
			description: "Real families and individuals enjoying Minute Maid as part of an everyday morning routine.",
			sub_categories: ["Breakfast Table", "Family Moments", "On-the-go"],
			do_rules: ["Show genuine, warm morning moments.", "Keep the product clearly visible."],
			dont_rules: ["Avoid staged, overly polished lifestyle photography."],
		},
	],
	photography_mood_brief: {
		summary: "Warm, natural, and fruit-forward — the feeling of fresh-squeezed morning goodness.",
		lighting: "Warm, natural morning light.",
		colour_treatment: "Rich, natural fruit tones; avoid artificial neon saturation.",
		subject_matter: "Fresh citrus fruit and everyday morning moments.",
		what_to_avoid: ["Cold, clinical lighting.", "Artificial or neon color grading."],
	},
	brand_devices: [
		{
			name: "Abstract Fruit Device",
			description: "Airbrush-and-stencil-inspired abstract fruit shapes used across packaging and campaign graphics.",
			usage_rules: "Use to reinforce freshness and flavor variety; pair with the wordmark, not as a standalone logo replacement.",
			usage_restriction: "Supporting device only",
		},
	],
	illustration_system: {
		in_use: true,
		hierarchy: "secondary",
		style_description: "Abstract, painterly fruit illustration (airbrush and stencil-inspired) supports packaging and campaign graphics alongside real photography.",
		human_proportions: null,
		skin_tones: null,
		do_rules: ["Keep fruit illustration warm, abstract, and painterly.", "Pair with real fruit photography, not in isolation."],
		dont_rules: ["Do not use cartoon or childish illustration styles."],
	},
	icon_system: {
		in_use: true,
		style: "Soft, rounded iconography matching the hand-drawn wordmark's warmth.",
		artboard_px: 24,
		gutter_px: 2,
		line_weight_px: 2,
		colour_rules: "Sap Green on white backgrounds; white on June Bud or Sap Green backgrounds.",
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
	layout_grid: {
		in_use: true,
		column_count: 12,
		gutter_rules: "24 px",
		margin_rules: "48 px on desktop, 16 px on mobile",
		layout_rules: "Use dynamic, asymmetric layouts rather than rigid symmetry. Leave room for the hand-drawn wordmark and abstract fruit devices.",
	},
	data_visualisation: {
		in_use: false,
		approved_chart_types: [],
		prohibited_chart_types: ["pie", "3d chart"],
		gradient_permitted: false,
		style_notes: "Minute Maid communications rarely use data visualization — favor fruit and lifestyle imagery instead.",
	},
	ai_identity: null,
	expression_system: {
		in_use: true,
		summary: "Minute Maid content moves across two expression levels depending on context.",
		states: [
			{name: "Everyday", description: "Packaging and everyday morning content — warm, simple, and natural."},
			{name: "Campaign", description: "Seasonal or platform campaigns with bolder fruit graphics and color."},
		],
		rules: ["Never let campaign energy tip into artificial or neon color treatment."],
	},
	brand_scalability_system: null,
	brand_codes: {
		in_use: true,
		summary: "Minute Maid's recurring sensory codes are fresh citrus, morning light, and the abstract fruit device.",
		key_fields: [
			{label: "Citrus", value: "Oranges and citrus slices featured prominently."},
			{label: "Morning Light", value: "Warm, natural lighting evoking a fresh start to the day."},
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
		summary: "Standard trademark and health-claim restraint applies, with extra care around juice-specific nutrition claims.",
		rules: [
			"Mark the logotype as a registered trademark on first use in formal documents.",
			"Do not make explicit health or nutrition claims beyond verified product facts.",
			"Follow local market regulations for juice-beverage advertising to families and children.",
		],
	},
	environmental: null,
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
	metadata: {
		created_date: "2026-06-07",
		agent_version: "brand_pack_onboarding_v2.1",
		pdf_source_types: [],
		overall_confidence: "medium",
		confidence_notes:
			"Primary green palette and hand-drawn wordmark concept are well documented publicly. Body-copy typeface pairing is an illustrative choice, not an officially published spec.",
		status: "published",
	},
};
