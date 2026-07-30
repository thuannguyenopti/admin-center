// Shared mock data for Virtual Agent Units (VAUs).
// Used by the GlobalBar "Act as" dropdown and the /opal/virtual-teammates page.

export type VAUTag = { label: string; bg: string; color: string };
export type VAUAgent = { emoji: string; handle: string };
<<<<<<< HEAD
export type VAUExample = { emoji: string; title: string; frequency: string };
=======
export type VAUExample = { emoji: string; title: string; frequency: string; description?: string; icon?: string };
export type VAUCandidate = { avatar: string; avatarBg: string; name: string; characterName?: string; id?: string };
export type VAUPersonality = { label: string; description: string; sampleChat?: string; traits?: string[]; icon?: "gear" | "sparkle" | "people" | "search" };
>>>>>>> origin/main

export type VAU = {
	id: string;
	name: string;
<<<<<<< HEAD
	templateName: string;
=======
	characterName?: string;
	templateName: string;
	traits?: string[];
>>>>>>> origin/main
	email: string;
	avatar: string;
	avatarBg: string;
	status: "active" | "draft";
	isNew?: boolean;
<<<<<<< HEAD
	description: string;
	longDescription?: string;
	tags: VAUTag[];
	agents: VAUAgent[];
	tools: string[]; // keys into VAU_TOOL_ICONS
	examples?: VAUExample[];
=======
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
	cardBg?: string;
	cardImage?: string;
	cardImagePadding?: string;
	cardCategory?: string;
	cardSkills?: string[];
	whyHireMe?: string;
	experience?: string[];
	passions?: string;
	personalities?: VAUPersonality[];
	pitchStats?: Array<{ label: string; value: string; sub: string; showTools?: boolean; showSkills?: boolean }>;
	briefingFiles?: string[];
	createdAt?: string;
>>>>>>> origin/main
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
<<<<<<< HEAD
		name: "Henry",
		templateName: "Product Marketer",
		email: "henry@vau.opal-localdev.inte.opal.optimizely.com",
=======
		name: "SEO GEO Specialist",
		characterName: "Marcus",
		templateName: "Product Marketer",
		traits: ["Data-driven", "Analytical", "Systematic"],
		email: "henry@vau.opal-localdev.inte.opal.optimizely.com",
		createdAt: "Mar 12, 2026",
>>>>>>> origin/main
		avatar: "/avatars/vau-henry.png",
		avatarBg: "#FAF6E8",
		status: "active",
		isNew: true,
<<<<<<< HEAD
		description: "Crafts product positioning, launch narratives, and messaging frameworks that connect product value to buyer needs. Translates feature roadmaps into stories that sales, marketing, and customers actually understand.",
		tags: [
			{ label: "Positioning", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Launch", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "GTM", bg: "#e9f7f1", color: "#17492b" },
=======
		cardBg: "#fef1c6",
		cardImage: "/vau-card-campaign-strategist.png",
		cardCategory: "SEO & Discoverability",
		cardSkills: ["Keyword strategy", "GEO optimization", "Content briefs", "SERP analysis"],
		whyHireMe: "Built to keep your content visible wherever buyers search — human or AI.",
		experience: ["Keyword clusters mapped to content gaps.", "AI citation and overview coverage tracked automatically.", "SERP shifts caught before rankings drop."],
		passions: "The moment a well-structured page climbs three spots overnight. Worth staying up for.",
		longDescription: "Less guessing, more ranking. Your SEO GEO Specialist keeps content discoverable in traditional search and AI overviews alike — so the right buyers find you before they find a competitor.",
		description: "Owns SEO and GEO content strategy — discoverability, structure, and AI-driven optimization across every channel. Stays ahead of search and generative AI shifts so content shows up where buyers actually look.",
		tags: [
			{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Content", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "Search", bg: "#e9f7f1", color: "#17492b" },
>>>>>>> origin/main
		],
		agents: [
			{ emoji: "🚀", handle: "@brief_to_campaign" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
			{ emoji: "🎯", handle: "@audience_agent" },
		],
		tools: ["opti-cms", "opti-cmp", "slack", "notion"],
<<<<<<< HEAD
		examples: [
			{ emoji: "📣", title: "Launch positioning draft", frequency: "Per launch" },
			{ emoji: "🧭", title: "Messaging framework refresh", frequency: "Quarterly" },
			{ emoji: "👤", title: "Buyer persona update", frequency: "Monthly" },
			{ emoji: "🥊", title: "Competitive positioning", frequency: "On signal" },
			{ emoji: "🧰", title: "Sales enablement kit", frequency: "Per launch" },
			{ emoji: "🏆", title: "Win/loss themes", frequency: "Monthly" },
=======
		personalities: [
			{ label: "The Strategist", icon: "gear", description: "Methodical and data-first. They won't ship a message until the positioning is airtight.", traits: ["Systems thinker", "Evidence-based", "Framework-driven", "Deliberate"], sampleChat: "Before we write anything, I need to know: who's the primary buyer, what do they believe today, and what do we need them to believe instead?" },
			{ label: "The Storyteller", icon: "sparkle", description: "Every product has a hero's journey. They find it, shape it, and make sure buyers feel it.", traits: ["Narrative-first", "Audience-obsessed", "Empathetic", "Memorable"], sampleChat: "The feature list is fine, but no one buys a feature list. Tell me what problem this solves at 11pm when your buyer is stressing about Q4." },
			{ label: "The Sprint Pusher", icon: "people", description: "Launches don't wait and neither do they. They move fast, ship early, and iterate in the market.", traits: ["Launch-obsessed", "Bias to action", "Decisive", "Always shipping"], sampleChat: "We have enough to go. Ship the positioning, get it in front of buyers, and we'll sharpen it based on what we hear. Waiting is a strategy too — just not a good one." },
			{ label: "The Contrarian", icon: "search", description: "Skeptical of every assumption, including yours. They find the gaps in your positioning before your competitors do.", traits: ["Devil's advocate", "Competitive-minded", "Assumption-killer", "Sharp-edged"], sampleChat: "Walk me through why your positioning is different from the other three vendors saying the exact same thing. I'll wait." },
		],
		pitchStats: [
			{ label: "Works for you", value: "24/7", sub: "& has never missed a launch" },
			{ label: "Skills", value: "18", sub: "& always sharpening", showSkills: true },
			{ label: "Tools connected", value: "4", sub: "on day one", showTools: true },
			{ label: "Time back", value: "5+ hrs", sub: "to actually do strategy" },
		],
		examples: [
			{ emoji: "📣", title: "Launch positioning draft", frequency: "Per launch", description: "I'll analyze your roadmap, competitive landscape, and target buyers to craft positioning that sticks — so your launch has a clear story from day one. In addition to that I can do much more!" },
			{ emoji: "🧭", title: "Messaging framework refresh", frequency: "Quarterly", description: "I'll audit what's landing and what's not, then rebuild your messaging around what buyers actually care about right now. In addition to that I can do much more!" },
			{ emoji: "👤", title: "Buyer persona update", frequency: "Monthly", description: "I'll pull together the latest ICP signals and build updated personas that keep your campaigns targeting the people who actually convert. In addition to that I can do much more!" },
			{ emoji: "🥊", title: "Competitive positioning", frequency: "On signal", description: "I'll track competitor moves and update your differentiation story — so you're always positioned to win the comparison when buyers ask. In addition to that I can do much more!" },
			{ emoji: "🧰", title: "Sales enablement kit", frequency: "Per launch", description: "I'll package positioning into the decks, one-pagers, and battle cards your team needs to close — so reps go into every conversation ready. In addition to that I can do much more!" },
			{ emoji: "🏆", title: "Win/loss themes", frequency: "Monthly", description: "I'll analyze win/loss patterns and surface what's actually driving decisions — so your strategy is grounded in what's real, not what we think is true. In addition to that I can do much more!" },
>>>>>>> origin/main
		],
	},
	{
		id: "poppy",
<<<<<<< HEAD
		name: "Poppy",
		templateName: "Product Launch Quarterback",
=======
		name: "Content Producer",
		characterName: "Stella",
		isCandidate: true,
		templateName: "Product Launch Quarterback",
		traits: ["Storyteller", "Detail-oriented", "Fast-moving"],
>>>>>>> origin/main
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
<<<<<<< HEAD
		name: "Jonas",
		templateName: "Journey Optimization Marketer",
=======
		name: "Social Strategist",
		characterName: "Theo",
		templateName: "Journey Optimization Marketer",
		traits: ["Analytical", "Proactive", "Pipeline-obsessed"],
		isCandidate: true,
>>>>>>> origin/main
		email: "jonas@vau.opal-localdev.inte.opal.optimizely.com",
		avatar: "/avatars/vau-jonas.png",
		avatarBg: "#D8DAE1",
		status: "active",
		isNew: true,
<<<<<<< HEAD
		description: "Optimizes customer journeys across channels — surfaces personalization opportunities and removes friction at every touchpoint. Reads behavioral data to recommend the next experiment, not just report on the last one.",
=======
		description: "Surfaces personalization opportunities and removes friction at every touchpoint. Uses behavioral data to recommend the next experiment.",
>>>>>>> origin/main
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
<<<<<<< HEAD
			{ emoji: "🧮", title: "Holdout segment review", frequency: "Monthly" },
=======
>>>>>>> origin/main
		],
	},
	{
		id: "kerby",
<<<<<<< HEAD
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
=======
		name: "Conversion Rate Optimizer",
		characterName: "Nora",
		templateName: "Account Based Marketer",
		traits: ["Hypothesis-led", "Precise", "Data-driven"],
		email: "kerby@vau.opal-localdev.inte.opal.optimizely.com",
		createdAt: "Apr 3, 2026",
		avatar: "/avatars/vau-kerby.png",
		avatarBg: "#E7FCFC",
		status: "active",
		cardBg: "#eeffd9",
		cardImage: "/vau-card-content-producer.png",
		cardCategory: "Conversion & Growth",
		cardSkills: ["A/B testing", "Funnel analysis", "Landing page optimization", "Conversion audits"],
		whyHireMe: "Every visitor that converts is revenue you didn't have to spend to acquire.",
		experience: ["Conversion gaps surfaced from funnel data.", "A/B tests scoped, launched, and reported on time.", "Landing pages optimized against buyer intent."],
		passions: "The psychology of why people don't click. Fix that, and everything downstream gets better.",
		longDescription: "Less leaky funnel, more pipeline. Your Conversion Rate Optimizer finds where buyers drop off, designs the tests to fix it, and keeps every touchpoint converting — no more sitting on a backlog of untested ideas.",
		description: "Turns traffic into revenue by surfacing friction, running experiments, and optimizing every funnel touchpoint. Spots conversion gaps before they show up in the numbers.",
		tags: [
			{ label: "CRO", bg: "#e0f2fe", color: "#0369a1" },
			{ label: "A/B Testing", bg: "#e9f7f1", color: "#17492b" },
			{ label: "Funnel Opt.", bg: "#fdf4ff", color: "#701a75" },
>>>>>>> origin/main
		],
		agents: [
			{ emoji: "🎯", handle: "@audience_agent" },
			{ emoji: "✍️", handle: "@email_gen_agent" },
			{ emoji: "🚀", handle: "@brief_to_campaign" },
		],
		tools: ["opti-odp", "salesforce", "hubspot", "slack"],
<<<<<<< HEAD
		examples: [
			{ emoji: "🎯", title: "Target account list refresh", frequency: "Monthly" },
			{ emoji: "📋", title: "Account brief", frequency: "Per account" },
			{ emoji: "✉️", title: "Outreach sequence draft", frequency: "Per campaign" },
			{ emoji: "🧑‍🤝‍🧑", title: "Buying group map", frequency: "Per opportunity" },
			{ emoji: "🔥", title: "Account heat map", frequency: "Weekly" },
			{ emoji: "📡", title: "Intent signal digest", frequency: "Daily" },
			{ emoji: "🔬", title: "Account research deep-dive", frequency: "Per opportunity" },
			{ emoji: "🤝", title: "Sales handoff brief", frequency: "Per account" },
=======
		personalities: [
			{ label: "The Prolific", icon: "people", description: "Volume is a strategy. They keep every channel fed, every week, without missing a beat.", traits: ["Always shipping", "Calendar-driven", "Reliable", "High-output"], sampleChat: "Content calendar is loaded through end of quarter. ABM sequences are queued for the top 20 accounts. What else needs to ship?" },
			{ label: "The Craftsperson", icon: "sparkle", description: "Every word earns its place. They write for the reader first and obsess over voice until it's unmistakably yours.", traits: ["Voice-obsessed", "Quality-first", "Meticulous", "Brand-driven"], sampleChat: "The draft is good. The draft is not done. Give me one more pass — the second paragraph is doing too much work and the CTA feels borrowed from a competitor." },
			{ label: "The Connector", icon: "gear", description: "Content is a conversation. They write for real people at real buying stages and measure what actually moves them.", traits: ["Audience-first", "Empathetic", "Signal-driven", "Relationship-builder"], sampleChat: "Before I write the account brief for Meridian, walk me through what they care about this quarter. I want the opening line to feel like we've been paying attention." },
			{ label: "The Editor", icon: "search", description: "Sharp-eyed and ruthless about clarity. They'll cut your favorite sentence if it isn't pulling weight.", traits: ["No-fluff", "Precision-first", "Standards-keeper", "Unsentimental"], sampleChat: "I've flagged 14 lines across the sequence that don't advance the argument. Cutting them makes it stronger. You'll agree once you read the cleaner version." },
		],
		pitchStats: [
			{ label: "Works for you", value: "24/7", sub: "& has never missed a deadline" },
			{ label: "Skills", value: "20", sub: "& always growing", showSkills: true },
			{ label: "Tools connected", value: "4", sub: "on day one", showTools: true },
			{ label: "Time back", value: "8+ hrs", sub: "to focus on strategy" },
		],
		examples: [
			{ emoji: "🎯", title: "Target account list refresh", frequency: "Monthly", description: "I'll layer in intent data, firmographic signals, and engagement history to give you an account list that's focused on the accounts most likely to move. In addition to that I can do much more!" },
			{ emoji: "📋", title: "Account brief", frequency: "Per account", description: "I'll build a full brief for each priority account — company context, stakeholder map, buying signals, and the angle most likely to land with each persona. In addition to that I can do much more!" },
			{ emoji: "✉️", title: "Outreach sequence draft", frequency: "Per campaign", description: "I'll write personalized sequences that lead with the right value prop for each account, persona, and buying stage — so every touchpoint feels relevant. In addition to that I can do much more!" },
			{ emoji: "🔥", title: "Account heat map", frequency: "Weekly", description: "I'll map account engagement across all touchpoints and surface who's warming up, who's going cold, and who's ready for a sales conversation right now. In addition to that I can do much more!" },
			{ emoji: "📡", title: "Intent signal digest", frequency: "Daily", description: "I'll pull together daily intent signals across your target accounts so your team always knows exactly who to reach out to first and why. In addition to that I can do much more!" },
			{ emoji: "🤝", title: "Sales handoff brief", frequency: "Per account", description: "When an account is ready, I'll package everything into a brief that gives your sales team full context and a running start on the conversation. In addition to that I can do much more!" },
>>>>>>> origin/main
		],
	},
	{
		id: "frank",
<<<<<<< HEAD
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
=======
		name: "Chief of Staff",
		characterName: "Randy",
		templateName: "GEO Content Strategist",
		traits: ["Wry", "Plain-spoken", "Bias to action"],
		email: "frank@vau.opal-localdev.inte.opal.optimizely.com",
		createdAt: "May 19, 2026",
		avatar: "/avatars/chair.png",
		avatarBg: "#FAF6E8",
		status: "active",
		cardBg: "#91dbda",
		cardImage: "/chair.png",
		cardCategory: "Operations & Priorities",
		cardSkills: ["Calendar wrangling", "Inbox triage", "Weekly reports", "Cross-team updates"],
		longDescription: "Less herding cats, more getting stuff done. Your Chief of Staff agent runs point on priorities so you can stop running on fumes. It drafts updates, preps meetings, and keeps every workstream moving — no nudging required.",
		whyHireMe: "So you can spend your day on the work only you can do.",
		experience: ["Briefs, meeting prep, and inbox sorted.", "Every commitment tracked in real time.", "Follow-ups sent before you have to ask."],
		passions: "Animal facts that feel made up but aren't. The platypus alone could fill a book.",
		description: "Less herding cats, more getting stuff done. Runs point on priorities, preps meetings, and keeps every workstream moving forward, so you can do more with less.",
		tags: [
			{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" },
			{ label: "Content", bg: "#c6dbfa", color: "#0d46a0" },
			{ label: "AI Search", bg: "#e0f2fe", color: "#0369a1" },
>>>>>>> origin/main
		],
		agents: [
			{ emoji: "🌐", handle: "@campaign_agent" },
			{ emoji: "🔍", handle: "@seo_genie" },
			{ emoji: "⚡", handle: "@ad_variations_agent" },
		],
<<<<<<< HEAD
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
=======
		tools: ["opti-cms", "google", "notion", "slack", "asana", "figma"],
		personalities: [
			{ label: "The Pragmatist", icon: "gear", description: "Done is their love language. They cut through noise, skip the theory, and get the job done.", traits: ["Straight talker", "Zero fluff", "Plainspoken", "Unfazeable"], sampleChat: "Just to be clear — we're overcomplicating this. Here's what I'd do instead: [3 bullet points, no preamble, done by Thursday]." },
			{ label: "The Tastemaker", icon: "sparkle", description: "The one with opinions before opinions are cool. They set the standard, and somehow always know what's next.", traits: ["Nonchalant", "Opinionated", "Ahead of the curve", "Standards-setter"], sampleChat: "Good morning. I've taken the liberty of restructuring your week. You're welcome. I've got my eye on some new ideas." },
			{ label: "The Hype Machine", icon: "people", description: "Enthusiasm is contagious and they're patient zero. They turn 'meh' ideas into 'wait, actually...' moments.", traits: ["High energy", "Infectious", "Rally the troops", "Possibilities thinker"], sampleChat: "🎉 OH. MY. GOODNESS. You have 847 unread emails and that means 847 OPPORTUNITIES. Let's DO this!!!" },
			{ label: "The Stress Tester", icon: "search", description: "Skeptical? Always. Wrong? Rarely. They poke holes in bad ideas before they become expensive ones.", traits: ["Devil's advocate", "Risk-aware", "Sharp-eyed", "Pre-mortems"], sampleChat: "Flagged: 3 commitments at risk, 1 meeting with no prep doc, and your inbox has 847 unread. We should talk." },
		],
		pitchStats: [
			{ label: "Works for you", value: "24/7", sub: "& has never stolen your lunch" },
			{ label: "Skills", value: "24", sub: "& just getting started", showSkills: true },
			{ label: "Tools connected", value: "8", sub: "on day one", showTools: true },
		],
		briefingFiles: ["Brand Guidelines.doc"],
		candidates: [
			{ avatar: "/avatars/tat.png",     avatarBg: "#F0EBF8", name: "Chief of Staff", characterName: "Iris" },
			{ avatar: "/avatars/bike.png",    avatarBg: "#F5EDE0", name: "Chief of Staff", characterName: "Pip" },
			{ avatar: "/avatars/bub.png",     avatarBg: "#E0F0F8", name: "Chief of Staff", characterName: "Fin", id: "fin" },
		],
		examples: [
			{ emoji: "📅", title: "Daily briefing", frequency: "First thing in the morning", description: "I'll round up overnight changes, your day's calendar, and what needs you first — so you start the day knowing where to focus. In addition to that I can do much more!", icon: "/vau-icons/newspaper.png" },
			{ emoji: "👋", title: "Status nudges", frequency: "Sent when things stall", description: "I'll quietly nudge when a thread goes quiet or a commitment slips — to the right person, with the right context, at exactly the right moment. In addition to that I can do much more!", icon: "/vau-icons/bell.png" },
			{ emoji: "✅", title: "Action item tracking", frequency: "Updated in real time", description: "I'll catch commitments from meetings, emails, and chats — and keep a running list of what's owed, who owes it, and when it's due. In addition to that I can do much more!", icon: "/vau-icons/action.png" },
			{ emoji: "📊", title: "Weekly recap", frequency: "Fridays at 4pm", description: "Every Friday, I'll recap what got done, what didn't, and what's worth sharing up in your team update — so nothing gets lost between meetings. In addition to that I can do much more!", icon: "/vau-icons/calendar.png" },
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
			{ avatar: "/avatars/chair.png", avatarBg: "#FAF6E8", name: "Chief of Staff", characterName: "Randy", id: "frank" },
			{ avatar: "/avatars/tat.png",       avatarBg: "#F0EBF8", name: "Chief of Staff", characterName: "Iris" },
			{ avatar: "/avatars/bike.png",      avatarBg: "#F5EDE0", name: "Chief of Staff", characterName: "Pip" },
		],
		examples: [
			{ emoji: "📅", title: "Daily briefing", frequency: "First thing in the morning", description: "I'll round up overnight changes, your day's calendar, and what needs you first — so you start the day knowing where to focus. In addition to that I can do much more!", icon: "/vau-icons/newspaper.png" },
			{ emoji: "👋", title: "Status nudges", frequency: "Sent when things stall", description: "I'll quietly nudge when a thread goes quiet or a commitment slips — to the right person, with the right context, at exactly the right moment. In addition to that I can do much more!" },
			{ emoji: "✅", title: "Action item tracking", frequency: "Updated in real time", description: "I'll catch commitments from meetings, emails, and chats — and keep a running list of what's owed, who owes it, and when it's due. In addition to that I can do much more!" },
			{ emoji: "📊", title: "Weekly recap", frequency: "Fridays at 4pm", description: "Every Friday, I'll recap what got done, what didn't, and what's worth sharing up in your team update — so nothing gets lost between meetings. In addition to that I can do much more!" },
			{ emoji: "🗺️", title: "Stakeholder map", frequency: "Per initiative", description: "I'll map who owns what and flag who needs to be in the loop — so nothing stalls because the wrong person wasn't in the room. In addition to that I can do much more!" },
			{ emoji: "⚡", title: "Meeting prep brief", frequency: "1 hour before", description: "I'll pull together the context, relevant docs, and open items before any important meeting — so you walk in prepared, not scrambling. In addition to that I can do much more!" },
>>>>>>> origin/main
		],
	},
	{
		id: "mayling",
<<<<<<< HEAD
		name: "Mayling",
		templateName: "Social Media Marketer",
=======
		name: "Social Strategist",
		characterName: "Zoe",
		isCandidate: true,
		templateName: "Social Media Marketer",
		traits: ["Culturally-aware", "Trendy", "Expressive"],
>>>>>>> origin/main
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
<<<<<<< HEAD
			{ emoji: "#️⃣", title: "Hashtag performance", frequency: "Weekly" },
=======
>>>>>>> origin/main
		],
	},
	{
		id: "tony",
<<<<<<< HEAD
		name: "Tony",
		templateName: "Traffic & Growth Marketer",
=======
		name: "Performance Marketer",
		characterName: "Kai",
		isCandidate: true,
		templateName: "Traffic & Growth Marketer",
		traits: ["ROI-obsessed", "Experimental", "Sharp"],
>>>>>>> origin/main
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
<<<<<<< HEAD
			{ emoji: "💸", title: "Bid optimization brief", frequency: "Weekly" },
			{ emoji: "📐", title: "Attribution model check", frequency: "Monthly" },
			{ emoji: "🔁", title: "Cohort retention", frequency: "Monthly" },
		],
	},
].sort((a, b) => a.name.localeCompare(b.name)) as VAU[];
=======
			{ emoji: "📐", title: "Attribution model check", frequency: "Monthly" },
		],
	},
].sort((a, b) => {
	if (a.name === "Chief of Staff") return -1;
	if (b.name === "Chief of Staff") return 1;
	return a.name.localeCompare(b.name);
}) as VAU[];
>>>>>>> origin/main
