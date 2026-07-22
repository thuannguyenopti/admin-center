export type BrandPackStatus = "active" | "published" | "draft" | "archived";

export type BrandPackConfidence = "high" | "medium" | "low";

export type BrandPackType = "web" | "pdf" | "figma" | "pdf_and_web" | "manual" | "mixed";

export type BrandIdentity = {
	name: string;
	description: string;
	brand_type: "master_brand" | "sub_brand" | "campaign";
	parent_brand: string | null;
	expiry_date: string | null;
};

export type BrandSource = {
	website_url: string | null;
	pages_crawled: string[];
	pdf_files_provided: string[];
	pdf_types_detected: Array<"complete_identity" | "specialist_supplement" | "campaign" | string>;
	guidelines_found: boolean;
	guidelines_urls: string[];
	extraction_notes: string;
};

export type BrandInstruction = {
	brand_identity_summary: string;
	visual_identity_summary: string;
	gradients: string;
	photography_style: string[];
	photography_categories_present: boolean;
	compositing: string | null;
	composition_guidelines: string[];
	tone_and_atmosphere: string;
	what_to_avoid: string[];
	full_instruction_text: string;
	updated_from_schema_at?: string;
};

export type CmpPlatform =
	| "linkedin"
	| "twitter"
	| "facebook"
	| "instagram"
	| "rss"
	| "cms"
	| "wordpress"
	| "marketo"
	| "hubspot"
	| "custom";

export type CmpConnectionType = "social" | "feed" | "webhook" | "email" | "ads";

/** An actual publishing connection in the org's CMP account */
export type CmpOrgChannel = {
	id: string;
	name: string;
	platform: CmpPlatform;
	type: CmpConnectionType;
	connected: boolean;
	/** Which brand-pack channel category this connection belongs to */
	channelCategory: string;
};

export type BrandColor = {
	cmyk?: string | null;
	confidence?: BrandPackConfidence;
	hex: string;
	name: string;
	pms?: string | null;
	role: "primary" | "secondary" | "accent" | "neutral" | "extended" | "do_not_use";
	usage_notes?: string;
	/** Additive UI field (not in schema v2): semantic contexts this colour is applied to. */
	used_for?: string[];
	web_accessible_hex?: string | null;
};

export type BrandTypography = {
	heading: string;
	body: string;
	mono?: string;
};

export type BrandTypographyRule = {
	usage: "heading" | "body" | "caption" | "ui" | "mono" | "display" | "accent";
	font_family: string;
	weight: string;
	colour_application: string[] | null;
	case_rule: "sentence" | "title" | "all-caps" | "as-written" | null;
	alignment: "left" | "centre" | "right" | null;
	notes: string;
	confidence: BrandPackConfidence;
	source?: "library" | "upload" | "web" | "figma" | "custom";
};

export type LogoSystem = {
	variants: Array<{
		name: string;
		colour_versions: string[];
		usage_context: string;
	}>;
	clear_space_rule: string | null;
	minimum_size_print: string | null;
	minimum_size_screen: string | null;
	placement_zones: string[];
	do_not_alter_rules: string[];
	sub_brand_logos: string[] | null;
};

export type PhotographyCategory = {
	name: string;
	description: string;
	sub_categories: string[];
	do_rules: string[];
	dont_rules: string[];
};

/** Schema v2 `photography.mood_brief`. */
export type PhotographyMoodBrief = {
	summary: string;
	lighting: string | null;
	colour_treatment: string | null;
	subject_matter: string | null;
	what_to_avoid: string[];
};

export type BrandDevice = {
	name: string;
	description: string;
	usage_rules: string;
	/** Schema v2: contexts where the device is explicitly prohibited ("never use as"). */
	usage_restriction: string | null;
};

export type IllustrationSystem = {
	in_use: boolean;
	hierarchy: "primary" | "secondary" | "fallback" | null;
	style_description: string | null;
	human_proportions: Record<string, string> | null;
	skin_tones: Array<{ label: string; hex: string }> | null;
	do_rules: string[];
	dont_rules: string[];
};

export type IconSystem = {
	in_use: boolean;
	style: string | null;
	artboard_px: number | null;
	gutter_px: number | null;
	line_weight_px: number | null;
	colour_rules: string | null;
};

export type ToneOfVoice = {
	summary: string | null;
	formality: string | null;
	person: string | null;
	key_traits: string[];
	recurring_language: string[];
	what_to_avoid: string[];
	brand_name_rules: string | null;
	preferred_terms: Array<{
		avoid: string;
		use_instead: string;
		context: string | null;
	}>;
};

export type BrandTemplate = {
	id: string;
	name: string;
	format: string;
	channel: string;
	thumb: string;
	ratio: string;
	mode?: string;
	sourceFrame?: string;
};

export type BrandTemplateMetadata = {
	figma_file_url: string;
	pages_imported: string[];
	taxonomy_mode: "PAGE_MODE" | "PREFIX_MODE";
	template_count: number;
	channels: string[];
	formats: string[];
	modes: string[];
	import_notes: string;
	items: BrandTemplate[];
};

export type BrandAsset = {
	id: string;
	name: string;
	type: "logo" | "photo" | "icon" | "illustration" | "background";
	url: string;
	format: string;
	bucket?: "logos" | "style_references" | "approved_starting_points" | "misc";
	llmGuidance?: string;
	photographyCategoryIds?: string[];
	variant?: string;
};

export type BrandAssetBuckets = {
	logos: BrandAsset[];
	style_references: BrandAsset[];
	approved_starting_points: BrandAsset[];
	misc: BrandAsset[];
};

export type BrandMetadata = {
	created_date: string;
	agent_version: string;
	pdf_source_types: string[];
	overall_confidence: BrandPackConfidence;
	confidence_notes: string;
	status: BrandPackStatus;
};

export type BrandValues = {
	target_audience: string | null;
	values: Array<{
		name: string;
		description: string | null;
	}>;
};

export type BrandWritingGuidelines = {
	style_guide_reference: "AP" | "British_English" | "American_English" | "custom" | null;
	sentence_case_headlines: boolean;
	grammar_rules: string[];
	approved_descriptors: string[];
};

export type BrandLayoutGrid = {
	in_use: boolean;
	column_count: number | null;
	gutter_rules: string | null;
	margin_rules: string | null;
	/** Additive UI field (not in schema v2): free-text compositional guidance. */
	layout_rules: string | null;
};

export type BrandDataVisualisation = {
	in_use: boolean;
	approved_chart_types: string[];
	prohibited_chart_types: string[];
	gradient_permitted: boolean;
	style_notes: string | null;
};

export type BrandSpecialistSystem = {
	in_use: boolean;
	summary: string;
	key_fields?: Array<{
		label: string;
		value: string;
	}>;
	rules?: string[];
	states?: Array<{
		name: string;
		description: string;
	}>;
};

export type BrandPack = {
	id: string;
	schema_version?: "1.0" | "2.0";
	brand_pack_type?: BrandPackType;
	name: string;
	status: BrandPackStatus;
	description: string;
	identity?: BrandIdentity;
	source?: BrandSource;
	brand_instruction?: BrandInstruction;
	colors: BrandColor[];
	typography: BrandTypography;
	typographyRules?: BrandTypographyRule[];
	logo_system?: LogoSystem | null;
	photography_categories?: PhotographyCategory[] | null;
	photography_mood_brief?: PhotographyMoodBrief | null;
	brand_devices?: BrandDevice[] | null;
	illustration_system?: IllustrationSystem | null;
	icon_system?: IconSystem | null;
	tone_of_voice?: ToneOfVoice;
	brand_values?: BrandValues | null;
	writing_guidelines?: BrandWritingGuidelines | null;
	layout_grid?: BrandLayoutGrid | null;
	data_visualisation?: BrandDataVisualisation | null;
	ai_identity?: BrandSpecialistSystem | null;
	expression_system?: BrandSpecialistSystem | null;
	brand_scalability_system?: BrandSpecialistSystem | null;
	brand_codes?: BrandSpecialistSystem | null;
	motion_sonic?: BrandSpecialistSystem | null;
	legal?: BrandSpecialistSystem | null;
	environmental?: BrandSpecialistSystem | null;
	channels: string[];
	/** Maps each channel category to the org's CMP connection IDs approved for this pack */
	approvedChannelConnections?: Record<string, string[]>;
	toneKeywords: string[];
	templateCount: number;
	templates: BrandTemplate[];
	template_metadata?: BrandTemplateMetadata;
	assets: BrandAsset[];
	asset_buckets?: BrandAssetBuckets;
	brandBrief: string;
	sourceUrl?: string;
	sourceFigma?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	metadata?: BrandMetadata;
};
