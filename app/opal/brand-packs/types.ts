export type BrandPackStatus = "active" | "published" | "draft" | "archived";

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
	hex: string;
	name: string;
	role: "primary" | "secondary" | "accent" | "neutral" | "background" | "text";
};

export type BrandTypography = {
	heading: string;
	body: string;
	mono?: string;
};

export type BrandTemplate = {
	id: string;
	name: string;
	format: string;
	channel: string;
	thumb: string;
	ratio: string;
};

export type BrandAsset = {
	id: string;
	name: string;
	type: "logo" | "photo" | "icon" | "illustration" | "background";
	url: string;
	format: string;
	bucket?: "logos" | "style_references" | "approved_starting_points" | "misc";
	llmGuidance?: string;
};

export type BrandDevice = {
	name: string;
	description: string;
	usage_rules: string;
	usage_restriction: string | null;
};

export type LogoVariant = {
	name: string;
	colour_versions: string[];
	usage_context: string;
};

export type LogoSystem = {
	variants: LogoVariant[];
	clear_space_rule: string;
	minimum_size_print: string;
	minimum_size_screen: string;
	placement_zones: string[];
	do_not_alter_rules: string[];
	sub_brand_logos: null;
};

export type PhotographyMoodBrief = {
	summary: string;
	lighting: string | null;
	colour_treatment: string | null;
	subject_matter: string | null;
	what_to_avoid: string[];
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

export type BrandValues = {
	target_audience: string | null;
	values: Array<{ name: string; description: string | null }>;
};

export type BrandWritingGuidelines = {
	style_guide_reference: "AP" | "British_English" | "American_English" | "custom" | null;
	sentence_case_headlines: boolean;
	grammar_rules: string[];
	approved_descriptors: string[];
};

export type BrandPack = {
	id: string;
	name: string;
	status: BrandPackStatus;
	description: string;
	colors: BrandColor[];
	typography: BrandTypography;
	channels: string[];
	/** Maps each channel category to the org's CMP connection IDs approved for this pack */
	approvedChannelConnections?: Record<string, string[]>;
	toneKeywords: string[];
	templateCount: number;
	templates: BrandTemplate[];
	assets: BrandAsset[];
	logo_system?: LogoSystem | null;
	brand_devices?: BrandDevice[] | null;
	photography_mood_brief?: PhotographyMoodBrief | null;
	tone_of_voice?: ToneOfVoice;
	brand_values?: BrandValues | null;
	writing_guidelines?: BrandWritingGuidelines | null;
	brandBrief: string;
	sourceUrl?: string;
	sourceFigma?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
};
