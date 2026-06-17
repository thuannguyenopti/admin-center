// Shared mock data for Virtual Agent Units (VAUs).
// Used by the GlobalBar "Act as" dropdown and the /opal/virtual-teammates page.

export type VAUTag = { label: string; bg: string; color: string };
export type VAUAgent = { emoji: string; handle: string };
export type VAUExample = { emoji: string; title: string; frequency: string; description?: string };
export type VAUCandidate = { avatar: string; avatarBg: string; name: string; characterName?: string; id?: string };

export type VAU = {
	id: string;
	name: string;
	characterName?: string;
	templateName: string;
	traits?: string[];
	email: string;
	avatar: string;
	avatarBg: string;
	status: "active" | "draft";
	isNew?: boolean;
	isCandidate?: boolean;
	description: string;
	longDescription?: string;
	pitchSubcopy?: string;
	kpi1?: { label: string; value: string; sub: string; subGreen?: boolean };
	kpi4?: { label: string; value: string; sub: string };
	tags: VAUTag[];
	agents: VAUAgent[];
	tools: string[];
	examples?: VAUExample[];
	candidates?: VAUCandidate[];
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
		name: "Campaign Strategist",
		characterName: "Marcus",
		templateName: "Product Marketer",
		traits: ["Data-driven", "Creative", "Persistent"],
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
		name: "Content Producer",
		characterName: "Stella",
		isCandidate: true,
		templateName: "Product Launch Quarterback",
		traits: ["Storyteller", "Detail-oriented", "Fast-moving"],
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
		name: "Demand Gen Specialist",
		characterName: "Theo",
		templateName: "Journey Optimization Marketer",
		traits: ["Analytical", "Proactive", "Pipeline-obsessed"],
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
		],
	},
	{
		id: "kerby",
		name: "Account Strategist",
		characterName: "Nora",
		templateName: "Account Based Marketer",
		traits: ["Relationship-builder", "Precise", "Tenacious"],
		email: "kerby@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-kerby.png",
		avatarBg: "#E7FCFC",
		status: "active",
		description: "Designs and runs ABM programs — targets the right accounts with tailored content and orchestrated outreach across channels. Combines firmographic, intent, and engagement signals to prioritize where the team should invest next.",
		tags: [
			{ label: "ABM", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "B2B", bg: "#e9f7f1", color: "#17492b" },
			{ label: "Outreach", bg: "#fdf4ff", color: "#701a75" },
			{ label: "Intent Data", bg: "#fffaea", color: "#7a2e0d" },
			{ label: "Pipeline", bg: "#e0f2fe", color: "#0369a1" },
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
			{ emoji: "🔥", title: "Account heat map", frequency: "Weekly" },
			{ emoji: "📡", title: "Intent signal digest", frequency: "Daily" },
			{ emoji: "🤝", title: "Sales handoff brief", frequency: "Per account" },
		],
	},
	{
		id: "frank",
		name: "Chief of Staff",
		characterName: "Randy",
		templateName: "GEO Content Strategist",
		traits: ["Wry", "Plain-spoken", "Bias to action"],
		email: "frank@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-frank.png",
		avatarBg: "#FAF6E8",
		status: "active",
		description: "Less herding cats, more getting stuff done. Your Chief of Staff agent runs point on priorities so you can stop running on fumes. It drafts updates, preps meetings, and keeps every workstream moving — no nudging required.",
		tags: [
			{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Content", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "AI Search", bg: "#e0f2fe", color: "#0369a1" },
		],
		agents: [
			{ emoji: "🌐", handle: "@campaign_agent" },
			{ emoji: "🔍", handle: "@seo_genie" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
		],
		tools: ["opti-cms", "google", "notion", "slack", "asana", "figma"],
		candidates: [
			{ avatar: "/avatars/tat.png",     avatarBg: "#F0EBF8", name: "Chief of Staff", characterName: "Iris" },
			{ avatar: "/avatars/bike.png",    avatarBg: "#F5EDE0", name: "Chief of Staff", characterName: "Pip" },
			{ avatar: "/avatars/bub.png",     avatarBg: "#E0F0F8", name: "Chief of Staff", characterName: "Fin", id: "fin" },
		],
		examples: [
			{ emoji: "📅", title: "Daily briefing", frequency: "First thing in the morning", description: "I'll round up overnight changes, your day's calendar, and what needs you first — so you start the day knowing where to focus. In addition to that I can do much more!" },
			{ emoji: "👋", title: "Status nudges", frequency: "Sent when things stall", description: "I'll quietly nudge when a thread goes quiet or a commitment slips — to the right person, with the right context, at exactly the right moment. In addition to that I can do much more!" },
			{ emoji: "✅", title: "Action item tracking", frequency: "Updated in real time", description: "I'll catch commitments from meetings, emails, and chats — and keep a running list of what's owed, who owes it, and when it's due. In addition to that I can do much more!" },
			{ emoji: "📊", title: "Weekly recap", frequency: "Fridays at 4pm", description: "Every Friday, I'll recap what got done, what didn't, and what's worth sharing up in your team update — so nothing gets lost between meetings. In addition to that I can do much more!" },
			{ emoji: "🗺️", title: "Stakeholder map", frequency: "Per initiative", description: "I'll map who owns what and flag who needs to be in the loop — so nothing stalls because the wrong person wasn't in the room. In addition to that I can do much more!" },
			{ emoji: "⚡", title: "Meeting prep brief", frequency: "1 hour before", description: "I'll pull together the context, relevant docs, and open items before any important meeting — so you walk in prepared, not scrambling. In addition to that I can do much more!" },
		],
	},
	{
		id: "fin",
		name: "Chief of Staff",
		characterName: "Fin",
		templateName: "GEO Content Strategist",
		isCandidate: true,
		traits: ["Methodical", "Data-driven", "Quietly relentless"],
		email: "fin@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/bub.png",
		avatarBg: "#E0F0F8",
		status: "draft",
		description: "Systematic by default, relentless by design. Fin tracks every commitment, surfaces blockers before they land on your desk, and keeps the weekly rhythm so nothing slips through the cracks.",
		pitchSubcopy: "Here's how Fin keeps your operation airtight.",
		kpi1: { label: "Blockers surfaced", value: "3x", sub: "Before they hit your desk" },
		kpi4: { label: "Hours freed", value: "5 more hrs", sub: "To actually leave at 5" },
		tags: [
			{ label: "Ops strategy", bg: "#fdf4ff", color: "#701a75" },
			{ label: "Risk mgmt", bg: "#fffaea", color: "#7a2e0d" },
			{ label: "Alignment", bg: "#e9f7f1", color: "#17492b" },
		],
		agents: [
			{ emoji: "📊", handle: "@ops_tracker" },
			{ emoji: "🔍", handle: "@blocker_radar" },
			{ emoji: "⚡", handle: "@rhythm_agent" },
		],
		tools: ["opti-cms", "google", "notion", "slack", "asana", "figma"],
		candidates: [
			{ avatar: "/avatars/vau-frank.png", avatarBg: "#FAF6E8", name: "Chief of Staff", characterName: "Randy", id: "frank" },
			{ avatar: "/avatars/tat.png",       avatarBg: "#F0EBF8", name: "Chief of Staff", characterName: "Iris" },
			{ avatar: "/avatars/bike.png",      avatarBg: "#F5EDE0", name: "Chief of Staff", characterName: "Pip" },
		],
		examples: [
			{ emoji: "📅", title: "Daily briefing", frequency: "First thing in the morning", description: "I'll round up overnight changes, your day's calendar, and what needs you first — so you start the day knowing where to focus. In addition to that I can do much more!" },
			{ emoji: "👋", title: "Status nudges", frequency: "Sent when things stall", description: "I'll quietly nudge when a thread goes quiet or a commitment slips — to the right person, with the right context, at exactly the right moment. In addition to that I can do much more!" },
			{ emoji: "✅", title: "Action item tracking", frequency: "Updated in real time", description: "I'll catch commitments from meetings, emails, and chats — and keep a running list of what's owed, who owes it, and when it's due. In addition to that I can do much more!" },
			{ emoji: "📊", title: "Weekly recap", frequency: "Fridays at 4pm", description: "Every Friday, I'll recap what got done, what didn't, and what's worth sharing up in your team update — so nothing gets lost between meetings. In addition to that I can do much more!" },
			{ emoji: "🗺️", title: "Stakeholder map", frequency: "Per initiative", description: "I'll map who owns what and flag who needs to be in the loop — so nothing stalls because the wrong person wasn't in the room. In addition to that I can do much more!" },
			{ emoji: "⚡", title: "Meeting prep brief", frequency: "1 hour before", description: "I'll pull together the context, relevant docs, and open items before any important meeting — so you walk in prepared, not scrambling. In addition to that I can do much more!" },
		],
	},
	{
		id: "mayling",
		name: "Social Strategist",
		characterName: "Zoe",
		templateName: "Social Media Marketer",
		traits: ["Culturally-aware", "Trendy", "Expressive"],
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
		],
	},
	{
		id: "tony",
		name: "Performance Marketer",
		characterName: "Kai",
		isCandidate: true,
		templateName: "Traffic & Growth Marketer",
		traits: ["ROI-obsessed", "Experimental", "Sharp"],
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
			{ emoji: "📐", title: "Attribution model check", frequency: "Monthly" },
		],
	},
].sort((a, b) => {
	if (a.name === "Chief of Staff") return -1;
	if (b.name === "Chief of Staff") return 1;
	return a.name.localeCompare(b.name);
}) as VAU[];
