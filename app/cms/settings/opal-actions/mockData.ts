export interface Agent {
	id: string;
	name: string;
	category: string;
}

export interface OpalAction {
	id: string;
	name: string;
	enabled: boolean;
	helpText?: string;
	locations: {
		toolbar: {
			contextMenu: boolean;
			improveButton: boolean;
		};
		assetPanel: boolean;
		propertyEditor: {
			enabled: boolean;
			propertyTypes: PropertyType[];
		};
	};
	agents: string[]; // Agent IDs
	visibleAt: "Everyone" | "Editors" | "Administrators";
	modified: string;
}

export type PropertyType =
	| "String"
	| "LongString"
	| "XhtmlString"
	| "Int"
	| "Double"
	| "Boolean"
	| "DateTime"
	| "ContentReference"
	| "PageReference"
	| "ImageReference"
	| "VideoReference"
	| "Url"
	| "SelectOne"
	| "SelectMany"
	| "ContentArea"
	| "LinkItemCollection";

export const availableAgents: Agent[] = [
	// Quality category
	{id: "preflight-audit", name: "Preflight Audit", category: "Quality"},

	// Content category
	{id: "content-model-creation", name: "Content Model Creation", category: "Content"},
	{id: "content-refresh-analysis", name: "Content Refresh Analysis", category: "Content"},
	{id: "content-translation", name: "Content Translation", category: "Content"},
	{id: "brand-tone-audit", name: "Brand Tone of Voice Audit", category: "Content"},

	// GEO category
	{id: "geo-recommendations", name: "GEO Recommendations", category: "GEO"},
	{id: "geo-schema-optimization", name: "GEO Schema Optimization", category: "GEO"},
	{id: "geo-local-search", name: "GEO Local Search Optimization", category: "GEO"},

	// SEO category
	{id: "seo-audit", name: "SEO Audit", category: "SEO"},
	{id: "seo-keyword-research", name: "SEO Keyword Research", category: "SEO"},
	{id: "seo-meta-optimization", name: "SEO Meta Optimization", category: "SEO"},

	// Accessibility category
	{id: "a11y-wcag-audit", name: "WCAG Compliance Audit", category: "Accessibility"},
	{id: "a11y-aria-check", name: "ARIA Labels Check", category: "Accessibility"},

	// Analytics category
	{id: "ga4-traffic-report", name: "GA4 Web Traffic Report", category: "Analytics"},
	{id: "conversion-analysis", name: "Conversion Analysis", category: "Analytics"},
];

export const opalActions: OpalAction[] = [
	{
		id: "0",
		name: "Preflight Audit",
		enabled: true,
		helpText: "Run all pre-publish checks to ensure content quality",
		locations: {
			toolbar: {
				contextMenu: false,
				improveButton: true,
			},
			assetPanel: false,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["preflight-audit"],
		visibleAt: "Everyone",
		modified: "2026-03-04 10:00:00",
	},
	{
		id: "1",
		name: "GEO",
		enabled: true,
		helpText: "Optimize your content for Generative Engine Optimization",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: true,
			},
			assetPanel: false,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["geo-recommendations", "geo-schema-optimization"],
		visibleAt: "Everyone",
		modified: "2026-02-20 14:30:00",
	},
	{
		id: "2",
		name: "SEO",
		enabled: true,
		helpText: "Improve search engine rankings and visibility",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: true,
			},
			assetPanel: false,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["seo-audit", "seo-keyword-research", "seo-meta-optimization"],
		visibleAt: "Everyone",
		modified: "2026-02-19 10:15:00",
	},
	{
		id: "3",
		name: "Accessibility",
		enabled: true,
		helpText: "Ensure content is accessible to all users",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: true,
			},
			assetPanel: false,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["a11y-wcag-audit", "a11y-aria-check"],
		visibleAt: "Everyone",
		modified: "2026-02-21 09:00:00",
	},
	{
		id: "4",
		name: "Translate",
		enabled: true,
		helpText: "Translate content to other languages",
		locations: {
			toolbar: {
				contextMenu: false,
				improveButton: true,
			},
			assetPanel: true,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["content-translation"],
		visibleAt: "Editors",
		modified: "2026-02-20 11:20:00",
	},
	{
		id: "5",
		name: "Content Quality",
		enabled: true,
		helpText: "Analyze and improve content quality and readability",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: true,
			},
			assetPanel: true,
			propertyEditor: {
				enabled: true,
				propertyTypes: ["String", "LongString", "XhtmlString"],
			},
		},
		agents: ["content-refresh-analysis", "brand-tone-audit"],
		visibleAt: "Everyone",
		modified: "2026-02-18 16:45:00",
	},
	{
		id: "6",
		name: "Analytics",
		enabled: false,
		helpText: "Generate performance reports and insights",
		locations: {
			toolbar: {
				contextMenu: false,
				improveButton: false,
			},
			assetPanel: true,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
		},
		agents: ["ga4-traffic-report", "conversion-analysis"],
		visibleAt: "Administrators",
		modified: "2026-02-17 14:00:00",
	},
];
