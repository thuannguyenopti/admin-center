import type { BrandPack, CmpOrgChannel } from "./types";

/**
 * The org's connected CMP publishing channels.
 * Mirrors what you'd see in CMP → Settings → Integrations → Website, CMS & Feed
 * plus the social accounts the team has connected.
 * In production this would be fetched from the CMP API.
 */
export const orgCmpChannels: CmpOrgChannel[] = [
	// Social
	{ id: "cmp-linkedin",  name: "LinkedIn",       platform: "linkedin",  type: "social",   connected: true,  channelCategory: "Social" },
	{ id: "cmp-twitter",   name: "Twitter / X",    platform: "twitter",   type: "social",   connected: true,  channelCategory: "Social" },
	{ id: "cmp-instagram", name: "Instagram",      platform: "instagram", type: "social",   connected: true,  channelCategory: "Social" },
	{ id: "cmp-facebook",  name: "Facebook",       platform: "facebook",  type: "social",   connected: false, channelCategory: "Social" },
	// Web / Feed / CMS
	{ id: "cmp-opti-cms",  name: "Optimizely CMS 12", platform: "cms",    type: "webhook",  connected: true,  channelCategory: "Web" },
	{ id: "cmp-rss",       name: "sample",         platform: "rss",       type: "feed",     connected: true,  channelCategory: "Web" },
	{ id: "cmp-wordpress", name: "WordPress",      platform: "wordpress", type: "feed",     connected: false, channelCategory: "Web" },
	// Email
	{ id: "cmp-marketo",   name: "Marketo",        platform: "marketo",   type: "email",    connected: true,  channelCategory: "Email" },
	{ id: "cmp-hubspot",   name: "HubSpot",        platform: "hubspot",   type: "email",    connected: false, channelCategory: "Email" },
	// Events (email can also route to events comms)
	{ id: "cmp-events-marketo", name: "Marketo (Events)", platform: "marketo", type: "email", connected: true, channelCategory: "Events" },
];

export const brandPacks: BrandPack[] = [
	{
		id: "stride-core",
		name: "Stride Core Brand",
		status: "active",
		description: "Primary brand identity for all Stride endurance products. The canonical source of truth for color, type, and tone.",
		colors: [
			{ hex: "#ABFF44", name: "Lime Active", role: "primary" },
			{ hex: "#202320", name: "Deep Forest", role: "text" },
			{ hex: "#F9FCF8", name: "Paper White", role: "background" },
			{ hex: "#347300", name: "Forest Dark", role: "accent" },
			{ hex: "#6FCF35", name: "Meadow", role: "secondary" },
			{ hex: "#DFFCB3", name: "Soft Lime", role: "neutral" },
		],
		typography: { heading: "Inter", body: "Inter", mono: "JetBrains Mono" },
		channels: ["Social", "Email", "Paid", "Web"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter", "cmp-instagram"],
			Email:  ["cmp-marketo"],
			Paid:   [],
			Web:    ["cmp-opti-cms", "cmp-rss"],
		},
		toneKeywords: ["Bold", "Energetic", "Authentic", "Performance-driven"],
		templateCount: 30,
		templates: [
			{ id: "t1", name: "AI Instructions Blog", format: "Blog", channel: "Social", thumb: "/brand-packs/templates/ai-instructions-sq.png", ratio: "1:1" },
			{ id: "t2", name: "AI Benchmarking Report", format: "Infographic", channel: "Paid", thumb: "/brand-packs/templates/benchmarking-sq.png", ratio: "1:1" },
			{ id: "t3", name: "Hype to Hero Series", format: "Social Post", channel: "Social", thumb: "/brand-packs/templates/hype-hero-sq.png", ratio: "1:1" },
			{ id: "t4", name: "Gartner MQ 2025", format: "Social Post", channel: "Paid", thumb: "/brand-packs/templates/gartner-sq.png", ratio: "1:1" },
			{ id: "t5", name: "Webinar & Event Post", format: "Social Post", channel: "Social", thumb: "/brand-packs/templates/webinar-event-sq.png", ratio: "1:1" },
			{ id: "t6", name: "Email Content Banner", format: "Email Hero", channel: "Email", thumb: "/brand-packs/templates/email-banner.png", ratio: "16:9" },
		],
		assets: [
			{ id: "a1", name: "Stride Logo – Light", type: "logo", url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=200&q=70", format: "SVG" },
			{ id: "a2", name: "Stride Logo – Dark", type: "logo", url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=200&q=70", format: "SVG" },
			{ id: "a3", name: "Race Day Hero", type: "photo", url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=70", format: "JPG" },
			{ id: "a4", name: "Open Water Sprint", type: "photo", url: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=400&q=70", format: "JPG" },
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
	},
	{
		id: "stride-social",
		name: "Stride Social Pack",
		status: "published",
		description: "Optimised for Instagram, LinkedIn, and TikTok. Warmer palette with stronger contrast for thumb-stopping performance.",
		colors: [
			{ hex: "#FF6B35", name: "Track Orange", role: "primary" },
			{ hex: "#1A1A2E", name: "Night Start", role: "text" },
			{ hex: "#FFF5F0", name: "Warm White", role: "background" },
			{ hex: "#FF9A5C", name: "Dusk Run", role: "secondary" },
			{ hex: "#8B3A0F", name: "Ember", role: "accent" },
			{ hex: "#FFE0CC", name: "Mist", role: "neutral" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Social", "Paid"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter", "cmp-instagram", "cmp-facebook"],
			Paid:   [],
		},
		toneKeywords: ["Punchy", "Visual", "Conversational", "Bold"],
		templateCount: 18,
		templates: [
			{ id: "s1", name: "Race Week Countdown", format: "Story", channel: "Social", thumb: "/brand-packs/templates/ai-instructions-port.png", ratio: "4:5" },
			{ id: "s2", name: "Athlete Spotlight", format: "Feed Post", channel: "Social", thumb: "/brand-packs/templates/hype-hero-sq.png", ratio: "1:1" },
			{ id: "s3", name: "Performance Stat Card", format: "LinkedIn", channel: "Social", thumb: "/brand-packs/templates/paid-ad-port.png", ratio: "4:5" },
		],
		assets: [
			{ id: "s-a1", name: "Social Logo Mark", type: "logo", url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=200&q=70", format: "PNG" },
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
		description: "Live events, sponsorships, and race-day activations. Deep purple energy — built to own physical spaces.",
		colors: [
			{ hex: "#7B2FBE", name: "Race Purple", role: "primary" },
			{ hex: "#1A0533", name: "Deep Night", role: "text" },
			{ hex: "#F8F0FF", name: "Lavender Mist", role: "background" },
			{ hex: "#C77DFF", name: "Sprint Violet", role: "secondary" },
			{ hex: "#E0AAFF", name: "Soft Violet", role: "neutral" },
			{ hex: "#4A0080", name: "Deep Purple", role: "accent" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Events", "OOH", "Social"],
		approvedChannelConnections: {
			Events: ["cmp-events-marketo"],
			OOH:    [],
			Social: ["cmp-linkedin", "cmp-instagram"],
		},
		toneKeywords: ["Electric", "Immersive", "Premium", "Exciting"],
		templateCount: 14,
		templates: [
			{ id: "e1", name: "Event Poster", format: "Print", channel: "Events", thumb: "/brand-packs/templates/webinar-event-sq.png", ratio: "1:1" },
			{ id: "e2", name: "Lobby Screen", format: "Digital OOH", channel: "Events", thumb: "/brand-packs/templates/ai-instructions-port.png", ratio: "4:5" },
			{ id: "e3", name: "Event Email Banner", format: "Email", channel: "Events", thumb: "/brand-packs/templates/email-banner.png", ratio: "16:9" },
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
		description: "Performance marketing across Google, Meta, and LinkedIn. Conversion-focused layouts with strong CTAs.",
		colors: [
			{ hex: "#0066CC", name: "Trust Blue", role: "primary" },
			{ hex: "#001A33", name: "Navy Deep", role: "text" },
			{ hex: "#E8F4FD", name: "Sky Tint", role: "background" },
			{ hex: "#3399FF", name: "Bright Blue", role: "secondary" },
			{ hex: "#CCE5FF", name: "Mist Blue", role: "neutral" },
			{ hex: "#004080", name: "Ocean", role: "accent" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Paid", "Display", "SEM"],
		approvedChannelConnections: { Paid: [], Display: [], SEM: [] },
		toneKeywords: ["Direct", "Credible", "Clear", "Action-oriented"],
		templateCount: 22,
		templates: [
			{ id: "p1", name: "Google Display Banner", format: "Display", channel: "Paid", thumb: "/brand-packs/templates/email-banner.png", ratio: "16:9" },
			{ id: "p2", name: "Meta Feed Ad", format: "Feed Ad", channel: "Paid", thumb: "/brand-packs/templates/gartner-sq.png", ratio: "1:1" },
			{ id: "p3", name: "LinkedIn Sponsored", format: "Sponsored Content", channel: "Paid", thumb: "/brand-packs/templates/paid-ad-port.png", ratio: "4:5" },
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
		description: "Seasonal push for summer race season. Work in progress — awaiting final colour approval from brand team.",
		colors: [
			{ hex: "#FF3366", name: "Coral Sprint", role: "primary" },
			{ hex: "#1A0010", name: "Deep Berry", role: "text" },
			{ hex: "#FFF0F5", name: "Blush", role: "background" },
			{ hex: "#FF6699", name: "Flamingo", role: "secondary" },
			{ hex: "#FFB3CC", name: "Petal", role: "neutral" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Social", "Email"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-instagram"],
			Email:  ["cmp-marketo"],
		},
		toneKeywords: ["Fresh", "Fun", "Seasonal", "Upbeat"],
		templateCount: 7,
		templates: [
			{ id: "su1", name: "Summer Kickoff", format: "Story", channel: "Social", thumb: "/brand-packs/templates/ai-instructions-sq.png", ratio: "1:1" },
			{ id: "su2", name: "Race Day Email", format: "Email", channel: "Email", thumb: "/brand-packs/templates/email-banner.png", ratio: "16:9" },
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
		description: "Previous brand identity from Q1. Archived after the V3 rebrand. Retained for historical reference only.",
		colors: [
			{ hex: "#595959", name: "Slate", role: "primary" },
			{ hex: "#1A1A1A", name: "Charcoal", role: "text" },
			{ hex: "#F5F5F5", name: "Off White", role: "background" },
			{ hex: "#888888", name: "Mid Gray", role: "secondary" },
			{ hex: "#BBBBBB", name: "Light Gray", role: "neutral" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Social", "Email", "Web"],
		approvedChannelConnections: {
			Social: ["cmp-linkedin", "cmp-twitter"],
			Email:  ["cmp-marketo", "cmp-hubspot"],
			Web:    ["cmp-opti-cms", "cmp-rss", "cmp-wordpress"],
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
		description: "Official campaign assets for the Stride Tour de France 2026 partnership. Yellow-first palette built for maximum visibility across digital and OOH.",
		colors: [
			{ hex: "#F9D900", name: "TDF Yellow", role: "primary" },
			{ hex: "#1A1A1A", name: "Peloton Black", role: "text" },
			{ hex: "#FFFFFF", name: "Alpine White", role: "background" },
			{ hex: "#FFE566", name: "Jersey Yellow", role: "secondary" },
			{ hex: "#FFF4B0", name: "Pale Yellow", role: "neutral" },
			{ hex: "#B39800", name: "Gold Stage", role: "accent" },
		],
		typography: { heading: "Inter", body: "Inter" },
		channels: ["Social", "Paid", "Events", "OOH"],
		approvedChannelConnections: {
			Social:  ["cmp-linkedin", "cmp-twitter", "cmp-instagram"],
			Paid:    [],
			Events:  ["cmp-events-marketo"],
			OOH:     [],
		},
		toneKeywords: ["Iconic", "Epic", "Bold", "Championship"],
		templateCount: 12,
		templates: [
			{ id: "tdf1", name: "Engineered for the Long Game", format: "Display Ad", channel: "Paid", thumb: "/brand-packs/templates/tdf-engineered-wide.png", ratio: "16:9" },
			{ id: "tdf2", name: "Upcoming Race – Register Now", format: "Feed Post", channel: "Social", thumb: "/brand-packs/templates/tdf-stride-race-sq.png", ratio: "1:1" },
			{ id: "tdf3", name: "Stage Victory – Race Finish", format: "Social Post", channel: "Social", thumb: "/brand-packs/templates/tdf-finish-port.png", ratio: "4:5" },
			{ id: "tdf4", name: "Summit Champion", format: "Feed Post", channel: "Social", thumb: "/brand-packs/templates/tdf-cyclist-mountain-sq.png", ratio: "1:1" },
			{ id: "tdf5", name: "Race Registration Story", format: "Story", channel: "Social", thumb: "/brand-packs/templates/tdf-race-register-port.png", ratio: "4:5" },
			{ id: "tdf6", name: "Mountain Stage Wide", format: "Banner", channel: "Paid", thumb: "/brand-packs/templates/tdf-cyclist-road-wide.png", ratio: "16:9" },
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
