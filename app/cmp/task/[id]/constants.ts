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

export const taskBriefContents: Record<string, string> = {
	"1": initialBriefContent,
	"2": `Objective:
Curate and organize recommended content assets for the upcoming product launch.

Content Strategy:
Identify and recommend high-performing content pieces that align with campaign goals:

Content #1: Product Feature Highlights
• Title: Key Features Overview
• Asset Type: Web Page
• Brief: Compile a set of product feature highlights suitable for the landing page, email campaigns, and social media.
• Target Audience: Existing customers and prospects evaluating the product.
• Distribution Channels: Website, email newsletters, and partner portals.`,
	"3": `Objective:
Design and produce a hotel brochure for the Miami Grand Resort partnership.

Brochure Strategy:
Create a visually appealing brochure showcasing accommodation options for event participants:

Content #1: Hotel Overview
• Title: Miami Grand Resort — Your Home During the Event
• Asset Type: PDF Brochure
• Brief: Highlight room categories, amenities, proximity to event venues, and exclusive athlete discounts.
• Target Audience: Event participants, sponsors, and VIP guests.
• Distribution Channels: Event registration confirmation emails, partner websites, and on-site distribution.`,
	"4": `Objective:
Test and validate structured content types in the CMS pipeline.

Testing Strategy:
Create sample content instances using various content models to verify rendering and field mapping:

Content #1: Structured Content Validation
• Title: SC Pipeline Test Cases
• Asset Type: Mixed content types
• Brief: Create instances of each content model, verify field rendering, and validate content type mappings.
• Target Audience: Internal QA and development teams.
• Distribution Channels: Staging environment only.`,
	"5": `Objective:
Launch a series of blog posts to build excitement for the STRIDE running community.

Blog Launch Strategy:
Publish engaging blog content targeting running enthusiasts and first-time triathlon participants:

Content #1: Getting Started with Running
• Title: From Couch to 5K — A Beginner's Guide
• Asset Type: Blog Post
• Brief: Write an approachable guide for beginners looking to start running, with tips on gear, training plans, and motivation.
• Target Audience: Fitness beginners and casual runners.
• Distribution Channels: Company blog, social media, and email newsletter.
• Social Channels: Instagram, Twitter, and Facebook.`,
	"6": `Objective:
Publish a comprehensive blog post on post-run recovery and nutrition for the STRIDE blog.

Blog Post Strategy:
Create an informative, SEO-optimized blog post that positions Stride as a trusted resource for runners at all levels:

Content #1: Recovery & Nutrition Guide
• Title: The Runner's Guide to Recovery — What to Eat, When to Rest
• Asset Type: Blog Post
• Brief: Write an in-depth guide covering post-run nutrition (protein timing, hydration, anti-inflammatory foods), active recovery techniques, and rest-day planning. Include practical meal ideas and a sample weekly recovery schedule.
• Target Audience: Intermediate runners and Stride community members looking to improve performance through better recovery habits.
• Distribution Channels: Stride blog, email newsletter, and CMS website.
• Social Channels: Instagram, Facebook.
• SEO Keywords: running recovery, post-run nutrition, runner's diet, active recovery for runners.`,
};

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
