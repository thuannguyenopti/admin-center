// Shared mock data for Virtual Agent Units (VAUs).
// Used by the GlobalBar "Act as" dropdown and the /opal/virtual-teammates page.

export type VAUTag = { label: string; bg: string; color: string };
export type VAUAgent = { emoji: string; handle: string };
export type VAUExample = { emoji: string; title: string; frequency: string };

export type VAU = {
	id: string;
	name: string;
	templateName: string;
	email: string;
	avatar: string;
	avatarBg: string;
	status: "active" | "draft";
	isNew?: boolean;
	description: string;
	longDescription?: string;
	tags: VAUTag[];
	agents: VAUAgent[];
	tools: string[]; // keys into VAU_TOOL_ICONS
	examples?: VAUExample[];
};

export const DEFAULT_VAU_EXAMPLES: VAUExample[] = [
	{ emoji: "📣", title: "Campaign brief", frequency: "Per launch" },
	{ emoji: "📊", title: "Performance digest", frequency: "Weekly" },
	{ emoji: "🎯", title: "Audience refresh", frequency: "Monthly" },
	{ emoji: "✍️", title: "Asset draft", frequency: "Per campaign" },
	{ emoji: "🔀", title: "Channel mix recommendation", frequency: "Weekly" },
	{ emoji: "📉", title: "Funnel analysis", frequency: "Monthly" },
];

export const VAUS: VAU[] = [
	{
		id: "henry",
		name: "Henry",
		templateName: "Product Marketer",
		email: "henry@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-henry.png",
		avatarBg: "#FAF6E8",
		status: "active",
		isNew: true,
		description: "Crafts product positioning, launch narratives, and messaging frameworks that connect product value to buyer needs. Translates feature roadmaps into stories that sales, marketing, and customers actually understand.",
		tags: [
			{ label: "Positioning", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Launch", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "GTM", bg: "#e9f7f1", color: "#17492b" },
		],
		agents: [
			{ emoji: "🚀", handle: "@brief_to_campaign" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
			{ emoji: "🎯", handle: "@audience_agent" },
		],
		tools: ["opti-cms", "opti-cmp", "slack", "notion"],
		examples: [
			{ emoji: "📣", title: "Launch positioning draft", frequency: "Per launch" },
			{ emoji: "🧭", title: "Messaging framework refresh", frequency: "Quarterly" },
			{ emoji: "👤", title: "Buyer persona update", frequency: "Monthly" },
			{ emoji: "🥊", title: "Competitive positioning", frequency: "On signal" },
			{ emoji: "🧰", title: "Sales enablement kit", frequency: "Per launch" },
			{ emoji: "🏆", title: "Win/loss themes", frequency: "Monthly" },
		],
	},
	{
		id: "poppy",
		name: "Poppy",
		templateName: "Product Launch Quarterback",
		email: "poppy@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-poppy.png",
		avatarBg: "#FAF6E8",
		status: "active",
		description: "Quarterbacks cross-functional product launches end-to-end — timelines, dependencies, stakeholders, and rollout plans. Keeps every team aligned on what's shipping, when, and why, and flags risk before it slips the date.",
		tags: [
			{ label: "Launch ops", bg: "#fdf4ff", color: "#701a75" },
			{ label: "Project mgmt", bg: "#fffaea", color: "#7a2e0d" },
		],
		agents: [
			{ emoji: "🗓️", handle: "@content_calendar_agent" },
			{ emoji: "🚀", handle: "@brief_to_campaign" },
			{ emoji: "🧪", handle: "@ab_test" },
		],
		tools: ["opti-cmp", "asana", "slack", "notion", "google"],
		examples: [
			{ emoji: "📅", title: "Launch timeline", frequency: "At kickoff" },
			{ emoji: "🔁", title: "Cross-team standup digest", frequency: "Weekly" },
			{ emoji: "📊", title: "Stakeholder update", frequency: "Milestone-based" },
			{ emoji: "🗺️", title: "Rollout dependency map", frequency: "At planning" },
			{ emoji: "⚠️", title: "Risk register", frequency: "Weekly" },
			{ emoji: "✅", title: "Launch readiness check", frequency: "Pre-GA" },
		],
	},
	{
		id: "jonas",
		name: "Jonas",
		templateName: "Journey Optimization Marketer",
		email: "jonas@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-jonas.png",
		avatarBg: "#D8DAE1",
		status: "active",
		isNew: true,
		description: "Optimizes customer journeys across channels — surfaces personalization opportunities and removes friction at every touchpoint. Reads behavioral data to recommend the next experiment, not just report on the last one.",
		tags: [
			{ label: "Optimization", bg: "#e0f2fe", color: "#0369a1" },
			{ label: "Personalization", bg: "#fdf4ff", color: "#701a75" },
		],
		agents: [
			{ emoji: "🧪", handle: "@ab_test" },
			{ emoji: "🎯", handle: "@audience_agent" },
			{ emoji: "🌐", handle: "@campaign_agent" },
		],
		tools: ["opti-web-experimentation", "opti-odp", "google", "slack"],
		examples: [
			{ emoji: "🧪", title: "A/B test ideation", frequency: "Bi-weekly" },
			{ emoji: "🚦", title: "Journey friction report", frequency: "Monthly" },
			{ emoji: "✨", title: "Personalization opportunities", frequency: "Weekly" },
			{ emoji: "📈", title: "Variant performance review", frequency: "After each test" },
			{ emoji: "👥", title: "Cohort behavior brief", frequency: "Weekly" },
			{ emoji: "📋", title: "Test backlog grooming", frequency: "Bi-weekly" },
			{ emoji: "🧮", title: "Holdout segment review", frequency: "Monthly" },
		],
	},
	{
		id: "kerby",
		name: "Kerby",
		templateName: "Account Based Marketer",
		email: "kerby@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-kerby.png",
		avatarBg: "#E7FCFC",
		status: "active",
		description: "Designs and runs ABM programs — targets the right accounts with tailored content and orchestrated outreach across channels. Combines firmographic, intent, and engagement signals to prioritize where the team should invest next.",
		tags: [
			{ label: "ABM", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "B2B", bg: "#e9f7f1", color: "#17492b" },
		],
		agents: [
			{ emoji: "🎯", handle: "@audience_agent" },
			{ emoji: "✍️", handle: "@email_gen_agent" },
			{ emoji: "🚀", handle: "@brief_to_campaign" },
		],
		tools: ["opti-odp", "salesforce", "hubspot", "slack"],
		examples: [
			{ emoji: "🎯", title: "Target account list refresh", frequency: "Monthly" },
			{ emoji: "📋", title: "Account brief", frequency: "Per account" },
			{ emoji: "✉️", title: "Outreach sequence draft", frequency: "Per campaign" },
			{ emoji: "🧑‍🤝‍🧑", title: "Buying group map", frequency: "Per opportunity" },
			{ emoji: "🔥", title: "Account heat map", frequency: "Weekly" },
			{ emoji: "📡", title: "Intent signal digest", frequency: "Daily" },
			{ emoji: "🔬", title: "Account research deep-dive", frequency: "Per opportunity" },
			{ emoji: "🤝", title: "Sales handoff brief", frequency: "Per account" },
		],
	},
	{
		id: "frank",
		name: "Frank",
		templateName: "GEO Content Strategist",
		email: "frank@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-frank.png",
		avatarBg: "#FAF6E8",
		status: "active",
		description: "Owns GEO and SEO content strategy — discoverability, structure, and AI-driven content optimization across markets. Stays ahead of search engine and generative AI shifts so content keeps showing up where buyers actually look.",
		tags: [
			{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Content", bg: "#c6dbfa", color: "#0d46a0" },
		],
		agents: [
			{ emoji: "🌐", handle: "@campaign_agent" },
			{ emoji: "🔍", handle: "@seo_genie" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
		],
		tools: ["opti-cms", "google", "notion"],
		examples: [
			{ emoji: "📝", title: "Content brief", frequency: "Per topic" },
			{ emoji: "🔍", title: "Keyword cluster analysis", frequency: "Weekly" },
			{ emoji: "📊", title: "SERP shift digest", frequency: "Daily" },
			{ emoji: "🏷️", title: "Schema audit", frequency: "Monthly" },
			{ emoji: "🤖", title: "AI overview tracker", frequency: "Weekly" },
			{ emoji: "🔗", title: "Internal linking suggestions", frequency: "Per page" },
			{ emoji: "🕳️", title: "Topic gap analysis", frequency: "Weekly" },
			{ emoji: "📰", title: "Citation tracker", frequency: "Monthly" },
		],
	},
	{
		id: "mayling",
		name: "Mayling",
		templateName: "Social Media Marketer",
		email: "mayling@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-mayling.png",
		avatarBg: "#DFD4FF",
		status: "active",
		description: "Plans and executes social campaigns across channels — tone, cadence, and creative direction that grow brand and community. Spots cultural moments worth jumping on and turns them into native, on-brand posts in hours, not weeks.",
		tags: [
			{ label: "Social", bg: "#fdf4ff", color: "#701a75" },
			{ label: "Brand", bg: "#fffaea", color: "#7a2e0d" },
		],
		agents: [
			{ emoji: "📱", handle: "@social_media_pro" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
			{ emoji: "🗓️", handle: "@content_calendar_agent" },
		],
		tools: ["opti-cmp", "figma", "asana", "slack"],
		examples: [
			{ emoji: "📅", title: "Weekly social calendar", frequency: "Mondays" },
			{ emoji: "✍️", title: "Post variants", frequency: "Per campaign" },
			{ emoji: "💬", title: "Community pulse", frequency: "Daily" },
			{ emoji: "📊", title: "Channel performance digest", frequency: "Weekly" },
			{ emoji: "🤝", title: "Influencer outreach list", frequency: "Monthly" },
			{ emoji: "🔥", title: "Trending topics brief", frequency: "Daily" },
			{ emoji: "#️⃣", title: "Hashtag performance", frequency: "Weekly" },
		],
	},
	{
		id: "tony",
		name: "Tony",
		templateName: "Traffic & Growth Marketer",
		email: "tony@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-tony.png",
		avatarBg: "#FAF6E8",
		status: "active",
		description: "Drives traffic and growth through paid + organic acquisition, conversion optimization, and a balanced channel mix. Connects spend to revenue and reallocates budget toward what's actually working week over week.",
		tags: [
			{ label: "Growth", bg: "#e9f7f1", color: "#17492b" },
			{ label: "Acquisition", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "CRO", bg: "#e0f2fe", color: "#0369a1" },
		],
		agents: [
			{ emoji: "🔍", handle: "@seo_genie" },
			{ emoji: "🌐", handle: "@campaign_agent" },
			{ emoji: "📊", handle: "@competitors_are_dust" },
		],
		tools: ["opti-web-experimentation", "google", "notion", "slack"],
		examples: [
			{ emoji: "🔀", title: "Channel mix recommendation", frequency: "Weekly" },
			{ emoji: "🚨", title: "Conversion drop alerts", frequency: "Real-time" },
			{ emoji: "💰", title: "Paid creative brief", frequency: "Per campaign" },
			{ emoji: "📉", title: "Funnel teardown", frequency: "Monthly" },
			{ emoji: "🧪", title: "Landing page audit", frequency: "Weekly" },
			{ emoji: "💸", title: "Bid optimization brief", frequency: "Weekly" },
			{ emoji: "📐", title: "Attribution model check", frequency: "Monthly" },
			{ emoji: "🔁", title: "Cohort retention", frequency: "Monthly" },
		],
	},
].sort((a, b) => a.name.localeCompare(b.name)) as VAU[];
