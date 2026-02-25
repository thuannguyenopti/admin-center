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
	};
	agents: string[]; // Agent IDs
	visibleAt: "Everyone" | "Editors" | "Administrators";
	modified: string;
}

export const availableAgents: Agent[] = [
	// Content category
	{id: "content-model-creation", name: "Content Model Creation", category: "Content"},
	{id: "content-refresh-analysis", name: "Content Refresh Analysis", category: "Content"},
	{id: "content-translation", name: "Content Translation", category: "Content"},
	{id: "content-sentiment", name: "Content Sentiment Analysis", category: "Content"},
	{id: "content-readability", name: "Content Readability Check", category: "Content"},

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
		id: "1",
		name: "GEO",
		enabled: true,
		helpText: "Optimize your content for Generative Engine Optimization",
		locations: {
			toolbar: {
				contextMenu: false,
				improveButton: true,
			},
			assetPanel: false,
		},
		agents: ["geo-recommendations", "geo-schema-optimization"],
		visibleAt: "Everyone",
		modified: "2026-02-20 14:30:00",
	},
	{
		id: "2",
		name: "SEO",
		enabled: true,
		helpText: "Improve search engine rankings",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: true,
			},
			assetPanel: false,
		},
		agents: ["seo-audit", "seo-keyword-research", "seo-meta-optimization"],
		visibleAt: "Editors",
		modified: "2026-02-19 10:15:00",
	},
	{
		id: "3",
		name: "Content Quality",
		enabled: false,
		helpText: "Analyze and improve content quality",
		locations: {
			toolbar: {
				contextMenu: true,
				improveButton: false,
			},
			assetPanel: true,
		},
		agents: ["content-refresh-analysis", "content-sentiment", "content-readability"],
		visibleAt: "Everyone",
		modified: "2026-02-18 16:45:00",
	},
];
