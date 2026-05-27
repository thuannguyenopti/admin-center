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
	type: "logo" | "photo" | "icon" | "illustration";
	url: string;
	format: string;
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
	brandBrief: string;
	sourceUrl?: string;
	sourceFigma?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
};
