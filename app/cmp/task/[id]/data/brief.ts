import { formatInitialBriefHtml } from "../utils/html";

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

export const initialBriefHtml = formatInitialBriefHtml(initialBriefContent);

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
	border-left: 3px solid var(--ax-colors-border-default);
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
	color: var(--ax-colors-fg-default);
	text-decoration: underline;
}
`;
