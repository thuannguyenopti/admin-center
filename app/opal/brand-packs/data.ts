import type {BrandPack, CmpOrgChannel} from "./types";

/**
 * The org's connected CMP publishing channels.
 * Mirrors what you'd see in CMP → Settings → Integrations → Website, CMS & Feed
 * plus the social accounts the team has connected.
 * In production this would be fetched from the CMP API.
 */
export const orgCmpChannels: CmpOrgChannel[] = [
	// Social
	{
		id: "cmp-linkedin",
		name: "LinkedIn",
		platform: "linkedin",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-twitter",
		name: "Twitter / X",
		platform: "twitter",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-instagram",
		name: "Instagram",
		platform: "instagram",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-facebook",
		name: "Facebook",
		platform: "facebook",
		type: "social",
		connected: false,
		channelCategory: "Social",
	},
	// Web / Feed / CMS
	{
		id: "cmp-opti-cms",
		name: "Optimizely CMS 12",
		platform: "cms",
		type: "webhook",
		connected: true,
		channelCategory: "Web",
	},
	{
		id: "cmp-rss",
		name: "sample",
		platform: "rss",
		type: "feed",
		connected: true,
		channelCategory: "Web",
	},
	{
		id: "cmp-wordpress",
		name: "WordPress",
		platform: "wordpress",
		type: "feed",
		connected: false,
		channelCategory: "Web",
	},
	// Email
	{
		id: "cmp-marketo",
		name: "Marketo",
		platform: "marketo",
		type: "email",
		connected: true,
		channelCategory: "Email",
	},
	{
		id: "cmp-hubspot",
		name: "HubSpot",
		platform: "hubspot",
		type: "email",
		connected: false,
		channelCategory: "Email",
	},
	// Events (email can also route to events comms)
	{
		id: "cmp-events-marketo",
		name: "Marketo (Events)",
		platform: "marketo",
		type: "email",
		connected: true,
		channelCategory: "Events",
	},
];

export const brandPacks: BrandPack[] = [
	{
		id: "stride-core",
		name: "Stride Core Brand",
		status: "active",
		description:
			"Primary brand identity for all Stride endurance products. The canonical source of truth for color, type, and tone.",
		schema_version: "2.0",
		brand_pack_type: "pdf_and_web",
		identity: {
			name: "Stride Core Brand",
			description:
				"Primary brand identity for all Stride endurance products. The canonical source of truth for color, type, and tone.",
			brand_type: "master_brand",
			parent_brand: null,
			expiry_date: null,
		},
		source: {
			website_url: "https://stride.com",
			pages_crawled: [
				"https://stride.com",
				"https://stride.com/training",
				"https://stride.com/events",
			],
			pdf_files_provided: ["stride-core-brand-guidelines.pdf"],
			pdf_types_detected: ["complete_identity"],
			guidelines_found: true,
			guidelines_urls: ["https://stride.com/brand"],
			extraction_notes:
				"Website and PDF agreed on core color values. Typography came from the Figma template library and brand PDF.",
		},
		brand_instruction: {
			brand_identity_summary:
				"Stride is an endurance sports brand for athletes and teams who want confident, high-performance training content.",
			visual_identity_summary:
				"Stride uses electric lime, deep forest neutrals, confident sans-serif typography, and action-led athletic photography.",
			gradients:
				"Gradients are not part of the core brand system. Use flat color fields and strong contrast instead.",
			photography_style: [
				"Action photography with athletes in motion.",
				"Natural light or crisp outdoor race-day lighting.",
				"High contrast, slightly warm grading, and visible effort.",
				"Compositions should feel fast, structured, and uncluttered.",
			],
			photography_categories_present: true,
			compositing:
				"Logo files should be composited after generation. Do not ask the model to recreate the Stride wordmark.",
			composition_guidelines: [
				"Reserve negative space for short headlines.",
				"Use strong left alignment for copy-heavy formats.",
				"Keep a clear athletic focal point.",
			],
			tone_and_atmosphere: "Bold, energetic, authentic, and performance-driven.",
			what_to_avoid: [
				"Corporate office stock photography.",
				"Soft pastel palettes.",
				"Decorative gradients, lens flares, or generic fitness clichés.",
			],
			full_instruction_text: `# Stride Core Brand — Brand Instruction

## Brand Identity
Stride is Optimizely's endurance sports brand. All visual content must feel **bold, energetic, and authentic** — never corporate or stiff.

## Visual Identity
Use electric lime, deep forest neutrals, sharp contrast, and simple structured layouts. Avoid decorative gradients.

## Color Usage
- **Lime Active (#ABFF44)**: Primary CTA backgrounds, key highlights, active states
- **Deep Forest (#202320)**: Primary text, dark backgrounds
- **Paper White (#F9FCF8)**: Page backgrounds, light surfaces
- **Forest Dark (#347300)**: Hover states, secondary accents

## Typography
- **Headings**: Inter Bold — large, confident, sentence case
- **Body**: Inter Regular — clear and readable
- **Mono**: JetBrains Mono — code and performance metrics

## Tone of Voice
Write in the **second person** ("you", "your"). Lead with the outcome, not the feature. Use short sentences. Avoid jargon.

## Image Style
- Action photography: athletes in motion, natural light
- No stock-photo poses — real effort, real sweat
- Color grade: slightly warm, high contrast
- Avoid cluttered backgrounds

## Logo Rule
Do not generate or redraw the logo. Composite approved logo files after generation.`,
			updated_from_schema_at: "2026-05-20",
		},
		colors: [
			{
				cmyk: "C:33 M:0 Y:73 K:0",
				confidence: "high",
				hex: "#ABFF44",
				name: "Lime Active",
				pms: "Pantone 375 C",
				role: "primary",
				usage_notes:
					"Primary CTA backgrounds, active states, and signature highlight moments.",
				web_accessible_hex: "#347300",
			},
			{
				cmyk: "C:9 M:0 Y:9 K:86",
				confidence: "high",
				hex: "#202320",
				name: "Deep Forest",
				pms: "Pantone Black 3 C",
				role: "neutral",
				usage_notes: "Primary text, dark backgrounds, and high-contrast brand fields.",
				web_accessible_hex: "#202320",
			},
			{
				cmyk: "C:1 M:0 Y:2 K:1",
				confidence: "high",
				hex: "#F9FCF8",
				name: "Paper White",
				pms: null,
				role: "neutral",
				usage_notes: "Default page and template background for clean, breathable layouts.",
				web_accessible_hex: "#F9FCF8",
			},
			{
				cmyk: "C:55 M:0 Y:100 K:55",
				confidence: "high",
				hex: "#347300",
				name: "Forest Dark",
				pms: "Pantone 356 C",
				role: "accent",
				usage_notes:
					"Accessible lime alternative for links, hover states, and dense information surfaces.",
				web_accessible_hex: "#347300",
			},
			{
				cmyk: "C:47 M:0 Y:75 K:19",
				confidence: "medium",
				hex: "#6FCF35",
				name: "Meadow",
				pms: null,
				role: "secondary",
				usage_notes: "Supporting charts, secondary accents, and campaign pacing.",
				web_accessible_hex: "#347300",
			},
			{
				cmyk: "C:11 M:0 Y:30 K:1",
				confidence: "medium",
				hex: "#DFFCB3",
				name: "Soft Lime",
				pms: null,
				role: "neutral",
				usage_notes: "Tints, quiet surfaces, and low-emphasis backgrounds.",
				web_accessible_hex: "#347300",
			},
		],
		typography: {heading: "Inter", body: "Inter", mono: "JetBrains Mono"},
		typographyRules: [
			{
				alignment: "left",
				case_rule: "sentence",
				colour_application: ["Deep Forest", "Paper White"],
				confidence: "high",
				font_family: "Inter",
				notes: "Large, confident headlines. Avoid decorative display treatments.",
				source: "figma",
				usage: "heading",
				weight: "Bold",
			},
			{
				alignment: "left",
				case_rule: "sentence",
				colour_application: ["Deep Forest"],
				confidence: "high",
				font_family: "Inter",
				notes: "Readable paragraph copy for documents, cards, and image captions.",
				source: "figma",
				usage: "body",
				weight: "Regular",
			},
			{
				alignment: "left",
				case_rule: "as-written",
				colour_application: ["Deep Forest", "Forest Dark"],
				confidence: "medium",
				font_family: "Inter",
				notes: "Buttons, chips, labels, and UI metadata.",
				source: "figma",
				usage: "ui",
				weight: "Semi-Bold",
			},
			{
				alignment: "left",
				case_rule: "all-caps",
				colour_application: ["Forest Dark", "Lime Active"],
				confidence: "medium",
				font_family: "Inter Tight",
				notes: "Short campaign labels and performance callouts only.",
				source: "web",
				usage: "caption",
				weight: "Semi-Bold",
			},
			{
				alignment: "left",
				case_rule: "as-written",
				colour_application: ["Deep Forest"],
				confidence: "high",
				font_family: "JetBrains Mono",
				notes: "Code snippets, data tokens, and technical metric displays.",
				source: "library",
				usage: "mono",
				weight: "Regular",
			},
		],
		logo_system: {
			variants: [
				{
					name: "Stride Wordmark",
					colour_versions: ["Deep Forest", "Paper White"],
					usage_context:
						"Primary brand mark for generated assets, email headers, and documents.",
				},
				{
					name: "Stride Social Mark",
					colour_versions: ["Lime Active", "Deep Forest"],
					usage_context: "Compact social and avatar contexts.",
				},
			],
			clear_space_rule: "Use at least the cap-height of the S on all sides.",
			minimum_size_print: "0.75 in wide",
			minimum_size_screen: "96 px wide",
			placement_zones: ["Top left", "Bottom left", "Top right for social templates"],
			do_not_alter_rules: [
				"Do not redraw the wordmark.",
				"Do not stretch, rotate, outline, or add effects.",
				"Do not place on low-contrast imagery.",
			],
			sub_brand_logos: null,
		},
		photography_categories: [
			{
				name: "Race Action",
				description: "Athletes moving through training, race day, and finish-line moments.",
				sub_categories: ["Cycling", "Open water", "Running", "Transition"],
				do_rules: [
					"Show visible momentum.",
					"Keep the athlete as the focal point.",
					"Use natural race-day environments.",
				],
				dont_rules: [
					"Avoid posed gym portraits.",
					"Avoid generic corporate wellness scenes.",
				],
			},
			{
				name: "Performance Detail",
				description:
					"Close-ups of gear, metrics, hands, wheels, water, and equipment that imply training precision.",
				sub_categories: ["Gear", "Metrics", "Preparation"],
				do_rules: ["Crop tightly.", "Use strong contrast.", "Leave room for short copy."],
				dont_rules: ["Avoid cluttered tabletop scenes.", "Avoid low-energy still lifes."],
			},
		],
		brand_devices: [
			{
				name: "Lime Velocity Bar",
				description:
					"A sharp rectangular lime accent bar used to imply motion and direction.",
				usage_rules: "Use sparingly near headlines, metrics, or CTAs.",
				usage_restriction: "Decorative background pattern",
			},
		],
		illustration_system: {
			in_use: false,
			hierarchy: "fallback",
			style_description:
				"Illustration is not part of the core Stride visual language except for simple technical diagrams.",
			human_proportions: null,
			skin_tones: null,
			do_rules: ["Prefer photography when people or motion are needed."],
			dont_rules: [
				"Do not use cartoon athlete illustrations.",
				"Do not mix illustration with race photography.",
			],
		},
		icon_system: {
			in_use: true,
			style: "Simple linear icons with rounded joins, used for product UI and metadata labels.",
			artboard_px: 24,
			gutter_px: 2,
			line_weight_px: 2,
			colour_rules:
				"Use Deep Forest on light backgrounds and Paper White on dark backgrounds. Lime Active only for active states.",
		},
		tone_of_voice: {
			summary:
				"Stride sounds bold, energetic, authentic, and performance-driven. It is direct without becoming harsh.",
			formality: "Conversational and expert",
			person: "Second person for guidance, first person plural for brand commitments",
			key_traits: ["Bold", "Energetic", "Authentic", "Performance-driven"],
			recurring_language: ["Train smarter", "Race faster", "Built for the long game"],
			what_to_avoid: [
				"Corporate filler",
				"Inflated AI claims",
				"Passive constructions",
				"Overly technical training jargon",
			],
			brand_name_rules: "Use Stride on first reference. Do not abbreviate the brand name.",
			preferred_terms: [
				{
					avoid: "users",
					use_instead: "athletes",
					context: "Campaign and social copy.",
				},
				{
					avoid: "optimize your schedule",
					use_instead: "train smarter",
					context: "Performance benefit language.",
				},
				{
					avoid: "fitness journey",
					use_instead: "training block",
					context: "Avoid generic wellness language.",
				},
			],
		},
		brand_values: {
			target_audience:
				"Endurance athletes, coaches, and sports marketers creating high-energy training and race content.",
			values: [
				{name: "Performance", description: null},
				{name: "Authenticity", description: null},
				{name: "Momentum", description: null},
				{name: "Clarity", description: null},
			],
		},
		writing_guidelines: {
			style_guide_reference: "British_English",
			sentence_case_headlines: true,
			grammar_rules: [
				"Use sentence case for headlines and body copy.",
				"Write short, active sentences.",
				"Lead with the athlete outcome before product detail.",
			],
			approved_descriptors: [
				"bold",
				"energetic",
				"authentic",
				"performance-driven",
				"race-ready",
			],
		},
		layout_grid: {
			in_use: true,
			column_count: 12,
			gutter_rules: "24 px",
			margin_rules: "48 px on desktop, 16 px on mobile",
			layout_rules:
				"Use strong left alignment for copy-heavy templates. Reserve one clear logo placement zone. Keep the athlete or performance object as the primary focal point.",
		},
		data_visualisation: {
			in_use: true,
			approved_chart_types: [
				"bar",
				"line",
				"progress ring",
				"split comparison",
				"metric tile",
			],
			prohibited_chart_types: ["pie", "3d chart"],
			gradient_permitted: false,
			style_notes:
				"No decorative gradients in chart fills. Keep labels short and high contrast. Avoid more than four series in social-sized graphics.",
		},
		ai_identity: null,
		expression_system: {
			in_use: true,
			summary:
				"Stride uses a simple three-level expression scale so content can move from functional product education to high-energy campaign work.",
			states: [
				{
					name: "Clear",
					description:
						"Functional layouts, restrained accents, direct copy, best for product and educational assets.",
				},
				{
					name: "Charged",
					description:
						"More lime, stronger crops, performance metrics, best for social and paid campaign assets.",
				},
				{
					name: "Race day",
					description:
						"Maximum motion, bold contrast, short urgent headlines, best for events and launches.",
				},
			],
			rules: [
				"Do not use Race day expression for dense educational content.",
				"Keep typography readable at every level.",
			],
		},
		brand_scalability_system: null,
		brand_codes: {
			in_use: true,
			summary:
				"Stride's recurring sensory codes are speed, sweat, carbon, water, and race infrastructure.",
			key_fields: [
				{label: "Speed", value: "Motion blur, directional crops, and velocity accents."},
				{label: "Carbon", value: "Bike frames, technical gear, matte dark surfaces."},
				{label: "Water", value: "Open-water textures and transition moments."},
			],
			rules: ["Use codes as subject matter anchors, not as decorative texture overlays."],
		},
		motion_sonic: {
			in_use: true,
			summary:
				"Motion should feel fast, crisp, and controlled. Sonic identity is not documented.",
			key_fields: [
				{
					label: "Motion",
					value: "Short directional wipes, progress fills, and metric count-ups.",
				},
				{label: "Easing", value: "Quick ease-out, no bounce or elastic motion."},
			],
			rules: ["Motion supports performance clarity; avoid decorative loops."],
		},
		legal: {
			in_use: true,
			summary:
				"No regulated claims framework is documented, but athlete safety and claim restraint are required.",
			rules: [
				"Do not promise guaranteed race outcomes.",
				"Show safe road, swim, and transition behavior.",
				"Use helmets in cycling imagery.",
			],
		},
		environmental: null,
		channels: ["Social", "Email", "Paid", "Web"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter", "cmp-instagram"],
			Email: ["cmp-marketo"],
			Paid: [],
			Web: ["cmp-opti-cms", "cmp-rss"],
		},
		toneKeywords: ["Bold", "Energetic", "Authentic", "Performance-driven"],
		templateCount: 30,
		templates: [
			{
				id: "t1",
				name: "AI Instructions Blog",
				format: "Blog",
				channel: "Social",
				thumb: "/brand-packs/templates/ai-instructions-sq.png",
				ratio: "1:1",
			},
			{
				id: "t2",
				name: "AI Benchmarking Report",
				format: "Infographic",
				channel: "Paid",
				thumb: "/brand-packs/templates/benchmarking-sq.png",
				ratio: "1:1",
			},
			{
				id: "t3",
				name: "Hype to Hero Series",
				format: "Social Post",
				channel: "Social",
				thumb: "/brand-packs/templates/hype-hero-sq.png",
				ratio: "1:1",
			},
			{
				id: "t4",
				name: "Gartner MQ 2025",
				format: "Social Post",
				channel: "Paid",
				thumb: "/brand-packs/templates/gartner-sq.png",
				ratio: "1:1",
			},
			{
				id: "t5",
				name: "Webinar & Event Post",
				format: "Social Post",
				channel: "Social",
				thumb: "/brand-packs/templates/webinar-event-sq.png",
				ratio: "1:1",
			},
			{
				id: "t6",
				name: "Email Content Banner",
				format: "Email Hero",
				channel: "Email",
				thumb: "/brand-packs/templates/email-banner.png",
				ratio: "16:9",
			},
		],
		assets: [
			{
				id: "a1",
				name: "Stride Logo – White",
				type: "logo",
				url: "/stride-wordmark.svg",
				format: "SVG",
			},
			{
				id: "a2",
				name: "Stride Logo – Black",
				type: "logo",
				url: "/stride-wordmark.svg",
				format: "SVG",
			},
			{
				id: "a3",
				name: "Open Water Race Pack",
				type: "photo",
				url: "https://images.unsplash.com/photo-1658748721978-68fc04f3739b?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a4",
				name: "Mass Swim Breakout",
				type: "photo",
				url: "https://images.unsplash.com/photo-1660717328578-12f11e8473bf?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a5",
				name: "Freestyle Race Surge",
				type: "photo",
				url: "https://images.unsplash.com/photo-1533049426476-9a889e21ece5?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a6",
				name: "Open Water Drive",
				type: "photo",
				url: "https://images.unsplash.com/photo-1538992409240-dc1a2ae11e7b?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a7",
				name: "Peloton Race Attack",
				type: "photo",
				url: "https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a8",
				name: "Time Trial Formation",
				type: "photo",
				url: "https://images.unsplash.com/photo-1628689529124-3e0db67e984c?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a9",
				name: "Road Race Chase",
				type: "photo",
				url: "https://images.unsplash.com/photo-1533547477463-bcffb9ef386d?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a10",
				name: "Aero Position Push",
				type: "photo",
				url: "https://images.unsplash.com/photo-1580748386343-376c85dd4887?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a11",
				name: "Finish Chute Sprint",
				type: "photo",
				url: "https://images.unsplash.com/photo-1720423753777-d40550822d63?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a12",
				name: "Race Pack Run",
				type: "photo",
				url: "https://images.unsplash.com/photo-1716462420479-5a6ae7436425?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a13",
				name: "Crowd Line Kick",
				type: "photo",
				url: "https://images.unsplash.com/photo-1633114078244-353b1ce7b096?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a14",
				name: "Triathlon Run Segment",
				type: "photo",
				url: "https://images.unsplash.com/photo-1728454994678-21be5481e249?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a15",
				name: "Wetsuit Transition Start",
				type: "photo",
				url: "https://images.unsplash.com/photo-1695808403904-a43973fb42a6?auto=format&fit=crop&w=1200&q=80",
				format: "JPG",
			},
			{
				id: "a16",
				name: "Run Icon",
				type: "icon",
				bucket: "style_references",
				url: "https://api.iconify.design/tabler/run.svg?color=%23347300",
				format: "SVG",
			},
			{
				id: "a17",
				name: "Cycling Icon",
				type: "icon",
				bucket: "style_references",
				url: "https://api.iconify.design/tabler/bike.svg?color=%23347300",
				format: "SVG",
			},
			{
				id: "a18",
				name: "Open Water Icon",
				type: "icon",
				bucket: "style_references",
				url: "https://api.iconify.design/tabler/swimming.svg?color=%23347300",
				format: "SVG",
			},
			{
				id: "a19",
				name: "Race Clock Icon",
				type: "icon",
				bucket: "style_references",
				url: "https://api.iconify.design/tabler/stopwatch.svg?color=%23347300",
				format: "SVG",
			},
			{
				id: "a20",
				name: "Podium Icon",
				type: "icon",
				bucket: "style_references",
				url: "https://api.iconify.design/tabler/medal.svg?color=%23347300",
				format: "SVG",
			},
			{
				id: "a21",
				name: "Victory Moment",
				type: "illustration",
				bucket: "style_references",
				url: "https://illustrations.popsy.co/green/success.svg",
				format: "SVG",
			},
			{
				id: "a22",
				name: "Momentum",
				type: "illustration",
				bucket: "style_references",
				url: "https://illustrations.popsy.co/green/man-riding-a-rocket.svg",
				format: "SVG",
			},
			{
				id: "a23",
				name: "Focused Athlete",
				type: "illustration",
				bucket: "style_references",
				url: "https://illustrations.popsy.co/green/freelancer.svg",
				format: "SVG",
			},
			{
				id: "a24",
				name: "Race Day Prep",
				type: "illustration",
				bucket: "style_references",
				url: "https://illustrations.popsy.co/green/work-from-home.svg",
				format: "SVG",
			},
			{
				id: "a25",
				name: "Lime Energy Gradient",
				type: "background",
				bucket: "style_references",
				url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%23ABFF44'/%3E%3Cstop%20offset='1'%20stop-color='%23347300'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='1200'%20height='800'%20fill='url(%23g)'/%3E%3C/svg%3E",
				format: "SVG",
			},
			{
				id: "a26",
				name: "Deep Forest Fade",
				type: "background",
				bucket: "style_references",
				url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%23347300'/%3E%3Cstop%20offset='1'%20stop-color='%23202320'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='1200'%20height='800'%20fill='url(%23g)'/%3E%3C/svg%3E",
				format: "SVG",
			},
			{
				id: "a27",
				name: "Paper Soft Wash",
				type: "background",
				bucket: "style_references",
				url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%23F9FCF8'/%3E%3Cstop%20offset='1'%20stop-color='%23DFFCB3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='1200'%20height='800'%20fill='url(%23g)'/%3E%3C/svg%3E",
				format: "SVG",
			},
			{
				id: "a28",
				name: "Brand Guidelines.pdf",
				type: "photo",
				bucket: "misc",
				url: "https://placehold.co/600x400/202320/ABFF44.png?text=Brand+Guidelines.pdf",
				format: "PDF",
			},
			{
				id: "a29",
				name: "Sponsor Deck.pdf",
				type: "photo",
				bucket: "misc",
				url: "https://placehold.co/600x400/347300/F9FCF8.png?text=Sponsor+Deck.pdf",
				format: "PDF",
			},
			{
				id: "a30",
				name: "Event Assets.zip",
				type: "photo",
				bucket: "misc",
				url: "https://placehold.co/600x400/6FCF35/202320.png?text=Assets.zip",
				format: "ZIP",
			},
		],
		brandBrief: `# Stride Core Brand — Brand Instruction

## Brand Identity
Stride is Optimizely's endurance sports brand. All visual content must feel **bold, energetic, and authentic** — never corporate or stiff.

## Color Usage
- **Lime Active (#ABFF44)**: Primary CTA backgrounds, key highlights, active states
- **Deep Forest (#202320)**: Primary text, dark backgrounds
- **Paper White (#F9FCF8)**: Page backgrounds, light surfaces
- **Forest Dark (#347300)**: Hover states, secondary accents

## Typography
- **Headings**: Inter Bold — large, confident, never decorative
- **Body**: Inter Regular — clear, readable at all sizes
- **Accents**: Use uppercase tracking for labels and tags

## Tone of Voice
Write in the **second person** ("you", "your"). Lead with the outcome, not the feature. Use short sentences. Avoid jargon.

**Good**: "Train smarter. Race faster."
**Avoid**: "Our AI-powered platform optimizes your training schedule."

## Image Style
- Action photography: athletes in motion, natural light
- No stock-photo poses — real effort, real sweat
- Color grade: slightly warm, high contrast
- Avoid cluttered backgrounds

## Template Rules
- Always include the Stride wordmark in the top-left
- CTA buttons use Lime Active background with Deep Forest text
- Social cards: bold headline, minimal body copy, strong image`,
		createdBy: "Neil Mullarkey",
		createdAt: "2026-03-12",
		updatedAt: "2026-05-20",
		sourceFigma: "https://figma.com/design/7iAEJtBjGiWTQ5Te7hGX",
		metadata: {
			created_date: "2026-03-12",
			agent_version: "brand_pack_onboarding_v2.1",
			pdf_source_types: ["complete_identity"],
			overall_confidence: "high",
			confidence_notes:
				"Core identity came from matching website, PDF guideline, and Figma template signals. Typography accent role has medium confidence because it was inferred from template usage.",
			status: "active",
		},
	},
	{
		id: "stride-social",
		name: "Stride Social Pack",
		status: "published",
		description:
			"Optimised for Instagram, LinkedIn, and TikTok. Warmer palette with stronger contrast for thumb-stopping performance.",
		colors: [
			{hex: "#FF6B35", name: "Track Orange", role: "primary"},
			{hex: "#1A1A2E", name: "Night Start", role: "neutral"},
			{hex: "#FFF5F0", name: "Warm White", role: "neutral"},
			{hex: "#FF9A5C", name: "Dusk Run", role: "secondary"},
			{hex: "#8B3A0F", name: "Ember", role: "accent"},
			{hex: "#FFE0CC", name: "Mist", role: "neutral"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Social", "Paid"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter", "cmp-instagram", "cmp-facebook"],
			Paid: [],
		},
		toneKeywords: ["Punchy", "Visual", "Conversational", "Bold"],
		templateCount: 18,
		templates: [
			{
				id: "s1",
				name: "Race Week Countdown",
				format: "Story",
				channel: "Social",
				thumb: "/brand-packs/templates/ai-instructions-port.png",
				ratio: "4:5",
			},
			{
				id: "s2",
				name: "Athlete Spotlight",
				format: "Feed Post",
				channel: "Social",
				thumb: "/brand-packs/templates/hype-hero-sq.png",
				ratio: "1:1",
			},
			{
				id: "s3",
				name: "Performance Stat Card",
				format: "LinkedIn",
				channel: "Social",
				thumb: "/brand-packs/templates/paid-ad-port.png",
				ratio: "4:5",
			},
		],
		assets: [
			{
				id: "s-a1",
				name: "Social Logo Mark",
				type: "logo",
				url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=200&q=70",
				format: "PNG",
			},
		],
		brandBrief: `# Stride Social Pack — Brand Instruction\n\n## Purpose\nBuilt for social feeds. Every asset must stop the scroll within 1 second.\n\n## Color\nLead with Track Orange. Night Start for text. Keep it high contrast.`,
		createdBy: "Sabbir Siddiqui",
		createdAt: "2026-04-01",
		updatedAt: "2026-05-15",
		sourceUrl: "https://stride.com",
	},
	{
		id: "stride-events",
		name: "Events Series",
		status: "published",
		description:
			"Live events, sponsorships, and race-day activations. Deep purple energy — built to own physical spaces.",
		colors: [
			{hex: "#7B2FBE", name: "Race Purple", role: "primary"},
			{hex: "#1A0533", name: "Deep Night", role: "neutral"},
			{hex: "#F8F0FF", name: "Lavender Mist", role: "neutral"},
			{hex: "#C77DFF", name: "Sprint Violet", role: "secondary"},
			{hex: "#E0AAFF", name: "Soft Violet", role: "neutral"},
			{hex: "#4A0080", name: "Deep Purple", role: "accent"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Events", "OOH", "Social"],
		approvedChannelConnections: {
			Events: ["cmp-events-marketo"],
			OOH: [],
			Social: ["cmp-linkedin", "cmp-instagram"],
		},
		toneKeywords: ["Electric", "Immersive", "Premium", "Exciting"],
		templateCount: 14,
		templates: [
			{
				id: "e1",
				name: "Event Poster",
				format: "Print",
				channel: "Events",
				thumb: "/brand-packs/templates/webinar-event-sq.png",
				ratio: "1:1",
			},
			{
				id: "e2",
				name: "Lobby Screen",
				format: "Digital OOH",
				channel: "Events",
				thumb: "/brand-packs/templates/ai-instructions-port.png",
				ratio: "4:5",
			},
			{
				id: "e3",
				name: "Event Email Banner",
				format: "Email",
				channel: "Events",
				thumb: "/brand-packs/templates/email-banner.png",
				ratio: "16:9",
			},
		],
		assets: [],
		brandBrief: `# Events Series — Brand Instruction\n\n## Purpose\nPhysical and digital event presence. Bold, premium, immediately recognisable at scale.`,
		createdBy: "Neil Mullarkey",
		createdAt: "2026-04-18",
		updatedAt: "2026-05-08",
	},
	{
		id: "stride-paid",
		name: "Paid Ads Pack",
		status: "published",
		description:
			"Performance marketing across Google, Meta, and LinkedIn. Conversion-focused layouts with strong CTAs.",
		colors: [
			{hex: "#0066CC", name: "Trust Blue", role: "primary"},
			{hex: "#001A33", name: "Navy Deep", role: "neutral"},
			{hex: "#E8F4FD", name: "Sky Tint", role: "neutral"},
			{hex: "#3399FF", name: "Bright Blue", role: "secondary"},
			{hex: "#CCE5FF", name: "Mist Blue", role: "neutral"},
			{hex: "#004080", name: "Ocean", role: "accent"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Paid", "Display", "SEM"],
		approvedChannelConnections: {Paid: [], Display: [], SEM: []},
		toneKeywords: ["Direct", "Credible", "Clear", "Action-oriented"],
		templateCount: 22,
		templates: [
			{
				id: "p1",
				name: "Google Display Banner",
				format: "Display",
				channel: "Paid",
				thumb: "/brand-packs/templates/email-banner.png",
				ratio: "16:9",
			},
			{
				id: "p2",
				name: "Meta Feed Ad",
				format: "Feed Ad",
				channel: "Paid",
				thumb: "/brand-packs/templates/gartner-sq.png",
				ratio: "1:1",
			},
			{
				id: "p3",
				name: "LinkedIn Sponsored",
				format: "Sponsored Content",
				channel: "Paid",
				thumb: "/brand-packs/templates/paid-ad-port.png",
				ratio: "4:5",
			},
		],
		assets: [],
		brandBrief: `# Paid Ads Pack — Brand Instruction\n\n## Purpose\nConversion-first. Every frame must communicate the offer clearly within 3 seconds.`,
		createdBy: "Neil Mullarkey",
		createdAt: "2026-03-28",
		updatedAt: "2026-04-30",
	},
	{
		id: "summer-2026",
		name: "Summer 2026 Campaign",
		status: "draft",
		description:
			"Seasonal push for summer race season. Work in progress — awaiting final color approval from brand team.",
		colors: [
			{hex: "#FF3366", name: "Coral Sprint", role: "primary"},
			{hex: "#1A0010", name: "Deep Berry", role: "neutral"},
			{hex: "#FFF0F5", name: "Blush", role: "neutral"},
			{hex: "#FF6699", name: "Flamingo", role: "secondary"},
			{hex: "#FFB3CC", name: "Petal", role: "neutral"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Social", "Email"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-instagram"],
			Email: ["cmp-marketo"],
		},
		toneKeywords: ["Fresh", "Fun", "Seasonal", "Upbeat"],
		templateCount: 7,
		templates: [
			{
				id: "su1",
				name: "Summer Kickoff",
				format: "Story",
				channel: "Social",
				thumb: "/brand-packs/templates/ai-instructions-sq.png",
				ratio: "1:1",
			},
			{
				id: "su2",
				name: "Race Day Email",
				format: "Email",
				channel: "Email",
				thumb: "/brand-packs/templates/email-banner.png",
				ratio: "16:9",
			},
		],
		assets: [],
		brandBrief: `# Summer 2026 Campaign — Brand Instruction\n\n## Status\nDraft — pending brand approval. Do not use in production.`,
		createdBy: "Sabbir Siddiqui",
		createdAt: "2026-05-10",
		updatedAt: "2026-05-19",
		sourceUrl: "https://stride.com/summer",
	},
	{
		id: "q1-rebrand",
		name: "Q1 Rebrand (Legacy)",
		status: "archived",
		description:
			"Previous brand identity from Q1. Archived after the V3 rebrand. Retained for historical reference only.",
		colors: [
			{hex: "#595959", name: "Slate", role: "primary"},
			{hex: "#1A1A1A", name: "Charcoal", role: "neutral"},
			{hex: "#F5F5F5", name: "Off White", role: "neutral"},
			{hex: "#888888", name: "Mid Gray", role: "secondary"},
			{hex: "#BBBBBB", name: "Light Gray", role: "neutral"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Social", "Email", "Web"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter"],
			Email: ["cmp-marketo", "cmp-hubspot"],
			Web: ["cmp-opti-cms", "cmp-rss", "cmp-wordpress"],
		},
		toneKeywords: ["Professional", "Clean", "Structured"],
		templateCount: 12,
		templates: [],
		assets: [],
		brandBrief: `# Q1 Rebrand — Brand Instruction\n\n## Status\nArchived. Superseded by Stride Core Brand (V3). Do not use.`,
		createdBy: "Neil Mullarkey",
		createdAt: "2026-01-08",
		updatedAt: "2026-03-11",
	},
	{
		id: "tdf-2026",
		name: "Tour de France 2026",
		status: "published",
		description:
			"Official campaign assets for the Stride Tour de France 2026 partnership. Yellow-first palette built for maximum visibility across digital and OOH.",
		colors: [
			{hex: "#F9D900", name: "TDF Yellow", role: "primary"},
			{hex: "#1A1A1A", name: "Peloton Black", role: "neutral"},
			{hex: "#FFFFFF", name: "Alpine White", role: "neutral"},
			{hex: "#FFE566", name: "Jersey Yellow", role: "secondary"},
			{hex: "#FFF4B0", name: "Pale Yellow", role: "neutral"},
			{hex: "#B39800", name: "Gold Stage", role: "accent"},
		],
		typography: {heading: "Inter", body: "Inter"},
		channels: ["Social", "Paid", "Events", "OOH"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter", "cmp-instagram"],
			Paid: [],
			Events: ["cmp-events-marketo"],
			OOH: [],
		},
		toneKeywords: ["Iconic", "Epic", "Bold", "Championship"],
		templateCount: 12,
		templates: [
			{
				id: "tdf1",
				name: "Engineered for the Long Game",
				format: "Display Ad",
				channel: "Paid",
				thumb: "/brand-packs/templates/tdf-engineered-wide.png",
				ratio: "16:9",
			},
			{
				id: "tdf2",
				name: "Upcoming Race – Register Now",
				format: "Feed Post",
				channel: "Social",
				thumb: "/brand-packs/templates/tdf-stride-race-sq.png",
				ratio: "1:1",
			},
			{
				id: "tdf3",
				name: "Stage Victory – Race Finish",
				format: "Social Post",
				channel: "Social",
				thumb: "/brand-packs/templates/tdf-finish-port.png",
				ratio: "4:5",
			},
			{
				id: "tdf4",
				name: "Summit Champion",
				format: "Feed Post",
				channel: "Social",
				thumb: "/brand-packs/templates/tdf-cyclist-mountain-sq.png",
				ratio: "1:1",
			},
			{
				id: "tdf5",
				name: "Race Registration Story",
				format: "Story",
				channel: "Social",
				thumb: "/brand-packs/templates/tdf-race-register-port.png",
				ratio: "4:5",
			},
			{
				id: "tdf6",
				name: "Mountain Stage Wide",
				format: "Banner",
				channel: "Paid",
				thumb: "/brand-packs/templates/tdf-cyclist-road-wide.png",
				ratio: "16:9",
			},
		],
		assets: [],
		brandBrief: `# Tour de France 2026 — Brand Instruction\n\n## Purpose\nStride's TDF partnership campaign. Yellow is the hero — every asset must lead with TDF Yellow (#F9D900) and feel podium-worthy.\n\n## Color\nTDF Yellow on black. High contrast. No pastels. Gold Stage for accent.\n\n## Tone\n"Engineered for the Long Game." Heroic, athletic, championship energy.`,
		createdBy: "Neil Mullarkey",
		createdAt: "2026-05-01",
		updatedAt: "2026-05-26",
		sourceFigma: "https://figma.com/design/tTfVt7im2cBdVBmnorJ1rl/Image-Gen-II-Master-",
	},
];

export function getBrandPackById(id: string): BrandPack | undefined {
	return brandPacks.find((pack) => pack.id === id);
}

export const activePack = brandPacks.find((p) => p.status === "active")!;
