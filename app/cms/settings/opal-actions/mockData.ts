import {Agent, OpalConfiguration, OpalAction} from "./types";

export const availableAgents: Agent[] = [
	// System category (for built-in actions)
	{id: "page-generator", name: "Page Generator", category: "System"},

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
	// System Actions (provided by default, can only be enabled/disabled)
	{
		id: "system-page-generator",
		name: "Generate Page With Opal",
		enabled: true,
		helpText: "AI-powered page generation with custom instructions and file uploads",
		locations: {
			toolbar: {
				contextMenu: false,
				improveButton: false,
			},
			assetPanel: false,
			propertyEditor: {
				enabled: false,
				propertyTypes: [],
			},
			pageCreation: true,
		},
		agents: ["page-generator"],
		visibleAt: "Everyone",
		modified: "2026-03-16 10:00:00",
		isSystemAction: true,
	},
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

// Default OpalConfiguration (new data model)
// This represents the migrated state of the opalActions above
export const defaultOpalConfiguration: OpalConfiguration = {
	version: 1,
	locations: [
		{
			id: "toolbar-improve",
			name: "Toolbar Improve Button",
			description: "Actions shown in the Improve dropdown button",
			enabled: true,
			groups: [
				{
					id: "toolbar-improve-0",
					name: "Preflight Audit",
					agents: ["preflight-audit"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Run all pre-publish checks to ensure content quality",
					order: 0,
				},
				{
					id: "toolbar-improve-1",
					name: "GEO",
					agents: ["geo-recommendations", "geo-schema-optimization"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Optimize your content for Generative Engine Optimization",
					order: 1,
				},
				{
					id: "toolbar-improve-2",
					name: "SEO",
					agents: ["seo-audit", "seo-keyword-research", "seo-meta-optimization"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Improve search engine rankings and visibility",
					order: 2,
				},
				{
					id: "toolbar-improve-3",
					name: "Accessibility",
					agents: ["a11y-wcag-audit", "a11y-aria-check"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Ensure content is accessible to all users",
					order: 3,
				},
				{
					id: "toolbar-improve-4",
					name: "Translate",
					agents: ["content-translation"],
					enabled: true,
					visibleAt: "Editors",
					helpText: "Translate content to other languages",
					order: 4,
				},
				{
					id: "toolbar-improve-5",
					name: "Content Quality",
					agents: ["content-refresh-analysis", "brand-tone-audit"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Analyze and improve content quality and readability",
					order: 5,
				},
			],
		},
		{
			id: "toolbar-context",
			name: "Toolbar Context Menu",
			description: "Actions shown in the toolbar context menu (three dots)",
			enabled: true,
			groups: [
				{
					id: "toolbar-context-0",
					name: "GEO",
					agents: ["geo-recommendations", "geo-schema-optimization"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Optimize your content for Generative Engine Optimization",
					order: 0,
				},
				{
					id: "toolbar-context-1",
					name: "SEO",
					agents: ["seo-audit", "seo-keyword-research", "seo-meta-optimization"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Improve search engine rankings and visibility",
					order: 1,
				},
				{
					id: "toolbar-context-2",
					name: "Accessibility",
					agents: ["a11y-wcag-audit", "a11y-aria-check"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Ensure content is accessible to all users",
					order: 2,
				},
				{
					id: "toolbar-context-3",
					name: "Content Quality",
					agents: ["content-refresh-analysis", "brand-tone-audit"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Analyze and improve content quality and readability",
					order: 3,
				},
			],
		},
		{
			id: "asset-panel",
			name: "Asset Panel",
			description: "Actions shown in the asset panel",
			enabled: true,
			groups: [
				{
					id: "asset-panel-0",
					name: "Translate",
					agents: ["content-translation"],
					enabled: true,
					visibleAt: "Editors",
					helpText: "Translate content to other languages",
					order: 0,
				},
				{
					id: "asset-panel-1",
					name: "Content Quality",
					agents: ["content-refresh-analysis", "brand-tone-audit"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Analyze and improve content quality and readability",
					order: 1,
				},
				{
					id: "asset-panel-2",
					name: "Analytics",
					agents: ["ga4-traffic-report", "conversion-analysis"],
					enabled: false,
					visibleAt: "Administrators",
					helpText: "Generate performance reports and insights",
					order: 2,
				},
			],
		},
		{
			id: "property-editor",
			name: "Property Editor",
			description: "Actions shown when editing properties",
			enabled: true,
			propertyTypes: ["String", "LongString", "XhtmlString"],
			groups: [
				{
					id: "property-editor-0",
					name: "Content Quality",
					agents: ["content-refresh-analysis", "brand-tone-audit"],
					enabled: true,
					visibleAt: "Everyone",
					helpText: "Analyze and improve content quality and readability",
					order: 0,
				},
			],
		},
	],
	systemAgents: [
		{
			id: "generate-page-with-opal",
			name: "Generate Page With Opal",
			description: "AI-powered page generation with custom instructions and file uploads",
			enabled: true,
			category: "page-generation",
		},
	],
	appCompanion: [
		{
			id: "autocomplete",
			name: "Auto-complete",
			description: "AI-powered content suggestions as you type",
			enabled: true,
			category: "editor",
		},
		{
			id: "smart-paste",
			name: "Smart Paste",
			description: "Automatically format pasted content",
			enabled: false,
			category: "editor",
		},
		{
			id: "content-suggestions",
			name: "Content Suggestions",
			description: "Get AI suggestions for improving your content",
			enabled: true,
			category: "productivity",
		},
	],
	modified: "2026-03-16T10:00:00.000Z",
};
