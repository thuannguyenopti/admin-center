import type {BrandPack} from "../types";

export const sprite: BrandPack = {
	id: "sprite",
	name: "Sprite",
	status: "published",
	description:
		"Sprite's global brand identity — clear, refreshing, and citrus-driven. Covers the 2019 Turner Duckworth visual system across packaging and digital.",
	schema_version: "2.0",
	brand_pack_type: "web",
	identity: {
		name: "Sprite",
		description: "Sprite's global brand identity — clear, refreshing, and citrus-driven.",
		brand_type: "sub_brand",
		parent_brand: "The Coca-Cola Company",
		expiry_date: null,
	},
	source: {
		website_url: "https://www.sprite.com",
		pages_crawled: ["https://www.sprite.com"],
		pdf_files_provided: [],
		pdf_types_detected: [],
		guidelines_found: true,
		guidelines_urls: ["https://turnerduckworth.com/work/sprite"],
		extraction_notes:
			"Color and typography derived from public brand references covering the 2019 Turner Duckworth redesign. Exact internal guideline values are not publicly published.",
	},
	brand_instruction: {
		brand_identity_summary:
			"Sprite is the clear, crisp lemon-lime soda brand — refreshment defined by clarity, simplicity, and high-contrast impact.",
		visual_identity_summary:
			"Sprite uses a bold green-and-yellow palette, the custom italicized Refraktiv wordmark, and high-contrast, dimensional lighting.",
		gradients: "Subtle lighting gradients are acceptable to imply dimension and freshness, but flat green remains the dominant field color.",
		photography_style: [
			"High-contrast, crisp product lighting emphasizing coolness and clarity.",
			"Citrus (lemon and lime) featured prominently alongside the product.",
			"Clean, uncluttered compositions with strong directional light.",
		],
		photography_categories_present: true,
		compositing: "Composite the approved Sprite wordmark after generation rather than asking the model to redraw it.",
		composition_guidelines: [
			"Use the italic forward-lean of the wordmark as a compositional cue for motion.",
			"Keep backgrounds clean and uncluttered.",
			"Emphasize clarity — avoid visual noise.",
		],
		tone_and_atmosphere: "Clear, crisp, confident, and refreshingly simple.",
		what_to_avoid: [
			"Cluttered or busy compositions.",
			"Warm, muted color grading.",
			"Overly sweet or saccharine tone of voice.",
		],
		full_instruction_text: `# Sprite — Brand Instruction

## Brand Identity
Sprite is the clear, crisp lemon-lime soda brand. All visual content must feel **clear, confident, and refreshingly simple** — never cluttered or busy.

## Visual Identity
Lead with Sprite Green and Sprite Yellow, the italicized Refraktiv wordmark, and high-contrast, dimensional lighting. Flat green remains the dominant field color.

## Color Usage
- **Sprite Green (#008B47)**: Primary field color and packaging
- **Sprite Yellow (#FFDD00)**: High-energy accent and contrast
- **Full White (#FFFFFF)**: Logo counter-color and clarity fields

## Typography
- **Display**: Refraktiv — custom italic display face for the wordmark and headlines
- **Body**: Aktiv Grotesk — the base family Refraktiv extends, used for supporting copy

## Tone of Voice
Write with clarity and confidence. Short, direct, no filler.

## Image Style
- High-contrast, crisp product lighting
- Citrus (lemon and lime) featured prominently
- Clean, uncluttered compositions

## Logo Rule
Do not generate or redraw the logo. Composite approved logo files after generation.`,
		updated_from_schema_at: "2026-06-03",
	},
	colors: [
		{
			cmyk: "C:87 M:21 Y:97 K:7",
			confidence: "high",
			hex: "#008B47",
			name: "Sprite Green",
			pms: "Pantone 355 C",
			role: "primary",
			usage_notes: "The dominant brand field color — packaging, the wordmark background, and key campaign moments.",
			web_accessible_hex: "#006534",
		},
		{
			cmyk: "C:0 M:13 Y:100 K:0",
			confidence: "high",
			hex: "#FFDD00",
			name: "Sprite Yellow",
			pms: "Pantone Yellow C",
			role: "secondary",
			usage_notes: "High-energy accent color for the spark device and campaign highlights.",
			web_accessible_hex: "#8A7600",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:0",
			confidence: "high",
			hex: "#FFFFFF",
			name: "Full White",
			pms: null,
			role: "neutral",
			usage_notes: "Logo counter-color and clarity/contrast fields against Sprite Green.",
			web_accessible_hex: "#FFFFFF",
		},
		{
			cmyk: "C:0 M:0 Y:0 K:100",
			confidence: "high",
			hex: "#000000",
			name: "Black",
			pms: null,
			role: "neutral",
			usage_notes: "Body copy and fine print on light backgrounds.",
			web_accessible_hex: "#000000",
		},
		{
			cmyk: "C:2 M:0 Y:1 K:13",
			confidence: "medium",
			hex: "#DEDEDF",
			name: "Kawaii Silver",
			pms: null,
			role: "neutral",
			usage_notes: "Dimensional highlight tone used in product-lighting renders.",
			web_accessible_hex: "#6E6E70",
		},
	],
	typography: {heading: "Refraktiv", body: "Aktiv Grotesk"},
	typographyRules: [
		{
			alignment: "left",
			case_rule: "as-written",
			colour_application: ["Sprite Green", "Sprite Yellow"],
			confidence: "high",
			font_family: "Refraktiv",
			notes: "Custom Turner Duckworth display face built on Aktiv Grotesk, with an italic forward lean. Reserved for the wordmark and top-level headlines.",
			source: "custom",
			usage: "display",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Black", "Full White"],
			confidence: "medium",
			font_family: "Refraktiv",
			notes: "Secondary headline usage when the full wordmark treatment isn't appropriate.",
			source: "custom",
			usage: "heading",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: ["Black"],
			confidence: "high",
			font_family: "Aktiv Grotesk",
			notes: "Readable paragraph copy for packaging fine print and digital body text.",
			source: "library",
			usage: "body",
			weight: "Regular",
		},
		{
			alignment: "left",
			case_rule: "all-caps",
			colour_application: ["Sprite Green", "Black"],
			confidence: "medium",
			font_family: "Aktiv Grotesk",
			notes: "Buttons, labels, and interface metadata.",
			source: "library",
			usage: "ui",
			weight: "Medium",
		},
	],
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
		sub_brand_logos: ["Sprite Zero Sugar", "Sprite Cranberry"],
	},
	photography_categories: [
		{
			name: "Citrus Clarity",
			description: "Clean, high-contrast shots of lemon and lime alongside the product.",
			sub_categories: ["Lemon", "Lime", "Water Droplets"],
			do_rules: ["Use crisp, directional lighting.", "Keep compositions clean and uncluttered."],
			dont_rules: ["Avoid warm, muted color grading.", "Avoid cluttered backgrounds."],
		},
		{
			name: "Everyday Cool",
			description: "People enjoying Sprite in refreshing, everyday moments.",
			sub_categories: ["Outdoors", "Sports Breaks", "Hangouts"],
			do_rules: ["Show genuine refreshment moments.", "Keep the can or bottle clearly visible."],
			dont_rules: ["Avoid posed, static shots."],
		},
	],
	photography_mood_brief: {
		summary: "Clear, crisp, and high-contrast — refreshment defined by clarity and simplicity.",
		lighting: "Bright, directional lighting with strong highlights.",
		colour_treatment: "Cool, high-contrast grading; greens and yellows kept vivid.",
		subject_matter: "Citrus, condensation, and everyday refreshment moments.",
		what_to_avoid: ["Warm, muted lighting.", "Cluttered or busy backgrounds."],
	},
	brand_devices: [
		{
			name: "Spark Device",
			description: "The angular spark/flash graphic used as a supporting brand mark.",
			usage_rules: "Use to reinforce energy and freshness; pair with the wordmark, not as a standalone logo replacement.",
			usage_restriction: "Supporting device only",
		},
	],
	illustration_system: {
		in_use: false,
		hierarchy: "fallback",
		style_description: "Illustration is not part of the core Sprite visual language; photography and dimensional lighting carry the brand.",
		human_proportions: null,
		skin_tones: null,
		do_rules: ["Prefer photography and dimensional product renders."],
		dont_rules: ["Do not use illustrated citrus or characters."],
	},
	icon_system: {
		in_use: true,
		style: "Simple, high-contrast linear icons.",
		artboard_px: 24,
		gutter_px: 2,
		line_weight_px: 2,
		colour_rules: "Sprite Green on white backgrounds; white on Sprite Green backgrounds.",
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
	layout_grid: {
		in_use: true,
		column_count: 12,
		gutter_rules: "24 px",
		margin_rules: "48 px on desktop, 16 px on mobile",
		layout_rules: "Use the wordmark's italic lean as a compositional cue. Keep layouts clean with generous negative space.",
	},
	data_visualisation: {
		in_use: false,
		approved_chart_types: [],
		prohibited_chart_types: ["pie", "3d chart"],
		gradient_permitted: false,
		style_notes: "Sprite communications rarely use data visualization — favor product clarity and citrus imagery instead.",
	},
	ai_identity: null,
	expression_system: {
		in_use: true,
		summary: "Sprite content moves across two expression levels depending on context.",
		states: [
			{name: "Clear", description: "Everyday packaging and product content — clean, high-contrast, simple."},
			{name: "Charged", description: "Campaign and cultural-moment activations with bolder color and motion."},
		],
		rules: ["Never let campaign energy compromise the brand's core clarity."],
	},
	brand_scalability_system: null,
	brand_codes: {
		in_use: true,
		summary: "Sprite's recurring sensory codes are citrus (lemon/lime), condensation, and high-contrast dimensional lighting.",
		key_fields: [
			{label: "Citrus", value: "Lemon and lime featured prominently alongside the product."},
			{label: "Clarity", value: "Clean backgrounds and strong directional light."},
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
	environmental: null,
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
	metadata: {
		created_date: "2026-06-03",
		agent_version: "brand_pack_onboarding_v2.1",
		pdf_source_types: [],
		overall_confidence: "medium",
		confidence_notes:
			"Primary green/yellow identity is well documented publicly, though exact hex values are reverse-engineered from logo assets rather than an official published guideline.",
		status: "published",
	},
};
