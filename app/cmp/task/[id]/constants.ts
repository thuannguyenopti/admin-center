export const initialBriefContent = `Objective:
Enhance sponsorship opportunities and visibility for the 2026 March IRONMAN/STRIDE triathlon.

Event Sponsor Package Strategy:
This package will include key marketing materials designed to attract potential sponsors:

Content #1: Sponsorship Overview Document
• Title: Unlocking Opportunities: Sponsor the 2026 IRONMAN/STRIDE Triathlon
• Asset Type: PDF Brochure
• Brief: Create a comprehensive overview that outlines the benefits of sponsoring the event, including brand exposure, audience engagement, and community impact. Use an enthusiastic and engaging tone.
• Target Audience: Brands looking to enhance their visibility and connect with active lifestyle consumers.
• Distribution Channels: Direct outreach to potential sponsors, event website, and email campaigns.
• Social Channels: Instagram, Facebook, and LinkedIn.`;

export const currentTaskId = "1";
export const currentTaskName = "Ironman Miami triathlon 2026 Sponsor Package task";

export const richTextContentStyles = `
.brief-rich-content,
.brief-editor-content {
	color: var(--ax-colors-fg-default);
	font-family: Inter, sans-serif;
	font-size: 14px;
	letter-spacing: -0.1px;
	line-height: 20px;
}

.brief-rich-content h2,
.brief-editor-content h2 {
	font-size: 24px;
	font-weight: 600;
	line-height: 32px;
	letter-spacing: -0.4px;
	margin: 0 0 12px;
}

.brief-rich-content h3,
.brief-editor-content h3 {
	font-size: 18px;
	font-weight: 600;
	line-height: 26px;
	letter-spacing: -0.2px;
	margin: 12px 0 8px;
}

.brief-rich-content p,
.brief-editor-content p,
.brief-rich-content ul,
.brief-editor-content ul,
.brief-rich-content ol,
.brief-editor-content ol,
.brief-rich-content blockquote,
.brief-editor-content blockquote {
	margin: 0 0 12px;
}

.brief-rich-content ul,
.brief-editor-content ul,
.brief-rich-content ol,
.brief-editor-content ol {
	padding-left: 22px;
}

.brief-rich-content li,
.brief-editor-content li {
	margin: 0 0 8px;
}

.brief-rich-content blockquote,
.brief-editor-content blockquote {
	border-left: 3px solid var(--ax-colors-border-accent);
	color: var(--ax-colors-fg-secondary);
	padding-left: 12px;
}

.brief-rich-content hr,
.brief-editor-content hr {
	border: 0;
	border-top: 1px solid var(--ax-colors-border-default);
	margin: 16px 0;
}

.brief-editor-content a,
.brief-rich-content a {
	color: var(--ax-colors-fg-accent);
	text-decoration: underline;
}
`;

export const recommendationAssets = {
	hero: "/cmp/assets/recommendation/search-01-image.jpg",
	emptyState: "/cmp/assets/recommendation/search-12-image.jpg",
	document: "/cmp/assets/recommendation/search-07-image.jpg",
	panel01: "/cmp/assets/recommendation/panel-01-image.jpg",
	panel02: "/cmp/assets/recommendation/panel-02-image.jpg",
	panel03: "/cmp/assets/recommendation/panel-03-image.jpg",
	panel04: "/cmp/assets/recommendation/panel-04-image.jpg",
	panel05: "/cmp/assets/recommendation/panel-05-image.jpg",
	panel06: "/cmp/assets/recommendation/panel-06-image.jpg",
	panel07: "/cmp/assets/recommendation/panel-07-image.jpg",
	panel08: "/cmp/assets/recommendation/panel-08-image.jpg",
	search01Thumb: "/cmp/assets/recommendation/search-01-thumb.jpg",
	search01Image: "/cmp/assets/recommendation/search-01-image.jpg",
	search02Image: "/cmp/assets/recommendation/search-02-image.jpg",
	search03Thumb: "/cmp/assets/recommendation/search-03-thumb.jpg",
	search03Image: "/cmp/assets/recommendation/search-03-image.jpg",
	search04Image: "/cmp/assets/recommendation/search-04-image.jpg",
	search05Image: "/cmp/assets/recommendation/search-05-image.jpg",
	search06Image: "/cmp/assets/recommendation/search-06-image.jpg",
	search07Thumb: "/cmp/assets/recommendation/search-07-thumb.jpg",
	search07Image: "/cmp/assets/recommendation/search-07-image.jpg",
	search08Image: "/cmp/assets/recommendation/search-08-image.jpg",
	search09Image: "/cmp/assets/recommendation/search-09-image.jpg",
	search10Image: "/cmp/assets/recommendation/search-10-image.jpg",
	search11Thumb: "/cmp/assets/recommendation/search-11-thumb.jpg",
	search11Image: "/cmp/assets/recommendation/search-11-image.jpg",
	search12Image: "/cmp/assets/recommendation/search-12-image.jpg",
	search13Image: "/cmp/assets/recommendation/search-13-image.jpg",
	search14Thumb: "/cmp/assets/recommendation/search-14-thumb.jpg",
	search14Image: "/cmp/assets/recommendation/search-14-image.jpg",
	search15Image: "/cmp/assets/recommendation/search-15-image.jpg",
} as const;

export const perspectiveSeeds = [
	"Images related to fitness, healthy people, runners, outdoor activities, professional events",
	"Top things to know about cycling",
	"Sales collateral for selling bicycles during Miami 2025 triathlon event",
	"Webinar sign up event pages",
];
