export type CmpTaskOwner = {
	name: string;
	src: string;
};

export type CmpTask = {
	id: string;
	title: string;
	reference: string;
	status: string;
	owner: CmpTaskOwner;
	creationDate: string;
	startDate: string;
	endDate: string;
	lastModified: string;
	parentCampaignId?: string;
};

export type CmpCampaign = {
	id: string;
	title: string;
	reference: string;
	status: string;
	owner: CmpTaskOwner;
	creationDate: string;
	startDate: string;
	endDate: string;
	lastModified: string;
	badge?: number;
};

export const avatarImages = [
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

export const initialCmpTasks: CmpTask[] = [
	{
		id: "1",
		title: "Ironman Miami triathlon 2026 Sponsor Package task",
		reference: "TSK-2702",
		status: "Not Started",
		owner: { name: "David Steinberg", src: avatarImages[0] },
		creationDate: "Sep 15, 2025",
		startDate: "No start date",
		endDate: "No end date",
		lastModified: "Nov 25, 2025",
	},
	{
		id: "2",
		title: "Content Rec",
		reference: "TSK-2695",
		status: "In Progress",
		owner: { name: "Hsiao-Pei Chien", src: avatarImages[1] },
		creationDate: "Mar 20, 2025",
		startDate: "No start date",
		endDate: "No end date",
		lastModified: "Sep 15, 2025",
	},
	{
		id: "3",
		title: "Hotel Brochure",
		reference: "TSK-2691",
		status: "At Risk",
		owner: { name: "David Steinberg", src: avatarImages[0] },
		creationDate: "Feb 27, 2025",
		startDate: "No start date",
		endDate: "No end date",
		lastModified: "May 5, 2025",
	},
	{
		id: "4",
		title: "SC content testing",
		reference: "TSK-2689",
		status: "Overdue",
		owner: { name: "Kamrul Hasan", src: avatarImages[3] },
		creationDate: "Feb 18, 2025",
		startDate: "No start date",
		endDate: "No end date",
		lastModified: "Feb 19, 2025",
	},
	{
		id: "5",
		title: "STRIDE Blog Launch",
		reference: "TSK-2710",
		status: "In Progress",
		owner: { name: "Hsiao-Pei Chien", src: avatarImages[1] },
		creationDate: "Mar 10, 2025",
		startDate: "Mar 15, 2025",
		endDate: "Apr 30, 2025",
		lastModified: "Apr 2, 2025",
	},
	{
		id: "6",
		title: "STRIDE Blog — Recovery & Nutrition Guide",
		reference: "TSK-2715",
		status: "Not Started",
		owner: { name: "David Steinberg", src: avatarImages[0] },
		creationDate: "Apr 1, 2025",
		startDate: "Apr 14, 2025",
		endDate: "Apr 28, 2025",
		lastModified: "Apr 1, 2025",
	},
];

export const initialCmpCampaigns: CmpCampaign[] = [
	{
		id: "social",
		title: "Social",
		reference: "CPN-39",
		status: "On Track",
		owner: { name: "Hsiao-Pei Chien", src: avatarImages[1] },
		creationDate: "Mar 20, 2025",
		startDate: "Mar 20, 2025",
		endDate: "No end date",
		lastModified: "Mar 20, 2025",
		badge: 1,
	},
	{
		id: "m",
		title: "m",
		reference: "CPN-38",
		status: "Not Started",
		owner: { name: "Md Nadim Sakib", src: avatarImages[2] },
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		lastModified: "Feb 19, 2025",
		badge: 1,
	},
	{
		id: "test-camp",
		title: "Test camp",
		reference: "CPN-37",
		status: "Not Started",
		owner: { name: "Md Nadim Sakib", src: avatarImages[2] },
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		lastModified: "Feb 19, 2025",
	},
	{
		id: "axiom",
		title: "Axiom",
		reference: "CPN-36",
		status: "On Track",
		owner: { name: "Abu Jafar Safi", src: avatarImages[4] },
		creationDate: "Feb 17, 2025",
		startDate: "Feb 17, 2025",
		endDate: "No end date",
		lastModified: "Feb 17, 2025",
		badge: 1,
	},
	{
		id: "test",
		title: "Test",
		reference: "CPN-35",
		status: "On Track",
		owner: { name: "Abu Jafar Safi", src: avatarImages[4] },
		creationDate: "Feb 13, 2025",
		startDate: "Feb 13, 2025",
		endDate: "No end date",
		lastModified: "Feb 18, 2025",
		badge: 4,
	},
];

export type CmpContentModel = {
	id: string;
	name: string;
	displayName: string;
	baseType: string;
	description?: string;
	properties: any[];
	modifiedAt: string;
	modifiedBy: string;
	isActive?: boolean;
	apiIdentifier?: string;
	version?: string;
	defaultLocale?: string;
	modelType?: "component" | "content";
	coverImage?: string;
};

export type ContentInstance = {
	id: string;
	modelId: string; // References CmpContentModel.id or ContentType.id
	modelDisplayName: string;
	createdAt: string;
	modifiedAt?: string;
	taskId?: string; // Which CMP task this instance belongs to
	fields: Record<string, any>; // Field values conforming to model properties
};

export const initialCmpContentModels: CmpContentModel[] = [
	{
		id: "cm-blog-post",
		name: "blog_post",
		displayName: "Blog Post",
		baseType: "Page",
		description: "Short-form, author-driven content with publish dates and SEO metadata",
		properties: [
			{
				id: "field-bp-hero-image",
				name: "hero_image",
				displayName: "Hero Image",
				type: "libraryAsset",
				required: false,
				list: false,
				localized: false,
				description: "Main image for the blog post",
			},
			{
				id: "field-bp-headline",
				name: "headline",
				displayName: "Headline",
				type: "text",
				required: true,
				list: false,
				localized: true,
				description: "The main title of the blog post",
			},
			{
				id: "field-bp-byline",
				name: "byline",
				displayName: "Byline",
				type: "text",
				required: true,
				list: false,
				localized: false,
				description: "Author name",
			},
			{
				id: "field-bp-publish-date",
				name: "publish_date",
				displayName: "Publish Date",
				type: "datetime",
				required: true,
				list: false,
				localized: false,
				description: "When the post should be published",
			},
			{
				id: "field-bp-excerpt",
				name: "excerpt",
				displayName: "Excerpt",
				type: "longText",
				required: false,
				list: false,
				localized: true,
				description: "Short summary for previews and SEO",
			},
			{
				id: "field-bp-category",
				name: "category",
				displayName: "Category",
				type: "choice",
				required: false,
				list: false,
				localized: false,
				description: "Blog post category",
				options: ["News", "Tips", "Guides", "Stories", "Updates"],
			},
			{
				id: "field-bp-body",
				name: "body",
				displayName: "Body",
				type: "richText",
				required: true,
				list: false,
				localized: true,
				description: "The main blog post content",
			},
			{
				id: "field-bp-tags",
				name: "tags",
				displayName: "Tags",
				type: "text",
				required: false,
				list: true,
				localized: false,
				description: "Tags for categorizing the post",
			},
			{
				id: "field-bp-seo-keywords",
				name: "seo_keywords",
				displayName: "SEO Keywords",
				type: "text",
				required: false,
				list: true,
				localized: true,
				description: "Keywords for search engine optimization",
			},
		],
		modifiedAt: new Date("2024-03-20T10:00:00Z").toISOString(),
		modifiedBy: "System",
		isActive: true,
		apiIdentifier: "blog_post",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
	},
	{
		id: "cm-article",
		name: "article",
		displayName: "Article",
		baseType: "Page",
		description: "Long-form editorial content with sections and rich media",
		properties: [
			{
				id: "field-art-hero-image",
				name: "hero_image",
				displayName: "Hero Image",
				type: "libraryAsset",
				required: false,
				list: false,
				localized: false,
				description: "Large header image",
			},
			{
				id: "field-art-headline",
				name: "headline",
				displayName: "Headline",
				type: "text",
				required: true,
				list: false,
				localized: true,
				description: "Main article headline",
			},
			{
				id: "field-art-subheadline",
				name: "subheadline",
				displayName: "Subheadline",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Supporting headline text",
			},
			{
				id: "field-art-byline",
				name: "byline",
				displayName: "Byline",
				type: "text",
				required: true,
				list: false,
				localized: false,
				description: "Author and publication information",
			},
			{
				id: "field-art-body",
				name: "body",
				displayName: "Body",
				type: "richText",
				required: true,
				list: false,
				localized: true,
				description: "Main article content",
			},
			{
				id: "field-art-tags",
				name: "tags",
				displayName: "Tags",
				type: "text",
				required: false,
				list: true,
				localized: false,
				description: "Tags for categorizing the article",
			},
			{
				id: "field-art-excerpt",
				name: "excerpt",
				displayName: "Excerpt",
				type: "longText",
				required: false,
				list: false,
				localized: true,
				description: "Short summary for listings and SEO",
			},
			{
				id: "field-art-publish-date",
				name: "publish_date",
				displayName: "Publish Date",
				type: "datetime",
				required: false,
				list: false,
				localized: false,
				description: "Publication date",
			},
			{
				id: "field-art-seo-keywords",
				name: "seo_keywords",
				displayName: "SEO Keywords",
				type: "text",
				required: false,
				list: true,
				localized: true,
				description: "Keywords for search engine optimization",
			},
			{
				id: "field-art-related-articles",
				name: "related_articles",
				displayName: "Related Articles",
				type: "contentReference",
				required: false,
				list: true,
				localized: false,
				description: "Links to related content",
			},
		],
		modifiedAt: new Date("2024-03-20T10:30:00Z").toISOString(),
		modifiedBy: "System",
		isActive: true,
		apiIdentifier: "article",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
	},
	{
		id: "cm-banner",
		name: "banner",
		displayName: "Banner",
		baseType: "Block",
		description: "Promotional banner for campaigns and announcements",
		properties: [
			{
				id: "field-ban-message",
				name: "message",
				displayName: "Message",
				type: "text",
				required: true,
				list: false,
				localized: true,
				description: "Banner message text",
			},
			{
				id: "field-ban-cta-text",
				name: "cta_text",
				displayName: "CTA Text",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Call-to-action button text",
			},
			{
				id: "field-ban-cta-link",
				name: "cta_link",
				displayName: "CTA Link",
				type: "url",
				required: false,
				list: false,
				localized: false,
				description: "Call-to-action destination URL",
			},
			{
				id: "field-ban-background-image",
				name: "background_image",
				displayName: "Background Image",
				type: "libraryAsset",
				required: false,
				list: false,
				localized: false,
				description: "Optional background image",
			},
			{
				id: "field-ban-dismissible",
				name: "dismissible",
				displayName: "Dismissible",
				type: "boolean",
				required: false,
				list: false,
				localized: false,
				description: "Allow users to dismiss the banner",
			},
			{
				id: "field-ban-display-duration",
				name: "display_duration",
				displayName: "Display Duration",
				type: "number",
				required: false,
				list: false,
				localized: false,
				description: "How long to show banner (in days)",
			},
		],
		modifiedAt: new Date("2024-03-20T11:00:00Z").toISOString(),
		modifiedBy: "System",
		isActive: true,
		apiIdentifier: "banner",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "component",
	},
	{
		id: "cm-hero-component",
		name: "hero_component",
		displayName: "Hero Component",
		baseType: "Block",
		description: "Large hero section with image, headline, and call-to-action",
		properties: [
			{
				id: "field-hero-headline",
				name: "headline",
				displayName: "Headline",
				type: "text",
				required: true,
				list: false,
				localized: true,
				description: "Main hero headline",
			},
			{
				id: "field-hero-subheadline",
				name: "subheadline",
				displayName: "Subheadline",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Supporting text below headline",
			},
			{
				id: "field-hero-description",
				name: "description",
				displayName: "Description",
				type: "longText",
				required: false,
				list: false,
				localized: true,
				description: "Detailed description text",
			},
			{
				id: "field-hero-background",
				name: "background_image",
				displayName: "Background Image",
				type: "libraryAsset",
				required: true,
				list: false,
				localized: false,
				description: "Large background image",
			},
			{
				id: "field-hero-primary-cta",
				name: "primary_cta_text",
				displayName: "Primary CTA Text",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Primary button text",
			},
			{
				id: "field-hero-primary-link",
				name: "primary_cta_link",
				displayName: "Primary CTA Link",
				type: "url",
				required: false,
				list: false,
				localized: false,
				description: "Primary button destination",
			},
			{
				id: "field-hero-secondary-cta",
				name: "secondary_cta_text",
				displayName: "Secondary CTA Text",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Secondary button text",
			},
			{
				id: "field-hero-secondary-link",
				name: "secondary_cta_link",
				displayName: "Secondary CTA Link",
				type: "url",
				required: false,
				list: false,
				localized: false,
				description: "Secondary button destination",
			},
		],
		modifiedAt: new Date("2024-03-20T11:30:00Z").toISOString(),
		modifiedBy: "System",
		isActive: true,
		apiIdentifier: "hero_component",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "component",
	},
	{
		id: "cm-email",
		name: "email",
		displayName: "Email",
		baseType: "Media",
		description: "Email template for marketing campaigns",
		properties: [
			{
				id: "field-email-subject",
				name: "subject_line",
				displayName: "Subject Line",
				type: "text",
				required: true,
				list: false,
				localized: true,
				description: "Email subject line",
			},
			{
				id: "field-email-preheader",
				name: "preheader",
				displayName: "Preheader Text",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Preview text shown in inbox",
			},
			{
				id: "field-email-from-name",
				name: "from_name",
				displayName: "From Name",
				type: "text",
				required: true,
				list: false,
				localized: false,
				description: "Sender name",
			},
			{
				id: "field-email-from-address",
				name: "from_address",
				displayName: "From Address",
				type: "text",
				required: true,
				list: false,
				localized: false,
				description: "Sender email address",
			},
			{
				id: "field-email-body",
				name: "body",
				displayName: "Email Body",
				type: "richText",
				required: true,
				list: false,
				localized: true,
				description: "Main email content (HTML)",
			},
			{
				id: "field-email-cta",
				name: "cta_text",
				displayName: "CTA Text",
				type: "text",
				required: false,
				list: false,
				localized: true,
				description: "Call-to-action button text",
			},
			{
				id: "field-email-cta-link",
				name: "cta_link",
				displayName: "CTA Link",
				type: "url",
				required: false,
				list: false,
				localized: false,
				description: "Call-to-action destination",
			},
			{
				id: "field-email-footer",
				name: "footer_text",
				displayName: "Footer Text",
				type: "longText",
				required: false,
				list: false,
				localized: true,
				description: "Email footer content",
			},
			{
				id: "field-email-unsubscribe",
				name: "unsubscribe_link",
				displayName: "Unsubscribe Link",
				type: "url",
				required: true,
				list: false,
				localized: false,
				description: "Unsubscribe page URL",
			},
		],
		modifiedAt: new Date("2024-03-20T12:00:00Z").toISOString(),
		modifiedBy: "System",
		isActive: true,
		apiIdentifier: "email",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
	},
];

export const initialContentInstances: ContentInstance[] = [
	{
		id: "ci-blog-1",
		modelId: "cm-blog-post",
		modelDisplayName: "Blog Post",
		createdAt: "2024-03-20T10:00:00Z",
		taskId: "5",
		fields: {
			headline: "Getting Started with Running",
			byline: "Alice Johnson",
			publish_date: "2024-03-20",
			excerpt: "Everything you need to know to start your running journey",
			category: "Guides",
			body: "<p>Welcome to our comprehensive guide for beginner runners...</p>",
			hero_image: "https://picsum.photos/seed/running-beginner/800/600",
			tags: ["running", "beginner", "fitness"],
			seo_keywords: ["running tips", "beginner running", "fitness guide"]
		}
	},
	{
		id: "ci-blog-2",
		modelId: "cm-blog-post",
		modelDisplayName: "Blog Post",
		createdAt: "2024-03-21T14:30:00Z",
		taskId: "5",
		fields: {
			headline: "Marathon Training Tips",
			byline: "Bob Smith",
			publish_date: "2024-03-21",
			excerpt: "Expert advice for marathon preparation",
			category: "Tips",
			body: "<p>Training for a marathon requires dedication and proper planning...</p>",
			hero_image: "https://picsum.photos/seed/marathon-training/800/600",
			tags: ["marathon", "training", "advanced"],
			seo_keywords: ["marathon training", "running tips", "endurance"]
		}
	},
	{
		id: "ci-article-1",
		modelId: "cm-article",
		modelDisplayName: "Article",
		createdAt: "2024-03-22T09:00:00Z",
		taskId: "1",
		fields: {
			headline: "The Science of Running Form",
			subheadline: "How biomechanics can improve your performance",
			byline: "Dr. Carol Williams, Sports Scientist",
			body: "<p>Understanding proper running form is crucial for injury prevention...</p>",
			hero_image: "https://picsum.photos/seed/running-form-science/800/600",
			tags: ["Running", "Biomechanics", "Fitness", "Science", "Training"],
			related_articles: ["ci-blog-1", "ci-blog-2"]
		}
	},
	{
		id: "ci-article-sponsor",
		modelId: "cm-article",
		modelDisplayName: "Article",
		createdAt: "2024-03-19T08:00:00Z",
		taskId: "1",
		fields: {
			headline: "The runner sponsoring package",
			subheadline: "Ironman Miami 2026 Triathlon Sponsorship Tiers",
			byline: "STRIDE Marketing Team",
			body: "<p>When the whole world is gearing up for the Ironman Miami 2026 triathlon, here's a sneak peek at the Runner Sponsorship Package:</p><p><strong>Title Sponsor: The 'Victory Lap' Package ($5M)</strong></p><ul><li>Headline billing on all event promotions.</li><li>Logo placement on runner jerseys.</li><li>Exclusive naming rights for the finish line.</li><li>VIP access for 50 guests.</li><li>Full-page ad in the event program.</li></ul><p><strong>Platinum Tier: The 'Sprint' Package ($3M)</strong></p><ul><li>Prominent logo placement on event banners.</li><li>Opportunity to set up an interactive booth at the event.</li><li>VIP access for 30 guests.</li><li>Half-page ad in the event program.</li></ul><p><strong>Gold Tier: The 'Marathon' Package ($1.5M)</strong></p><ul><li>Logo placement on event signage.</li><li>Opportunity to distribute promotional materials.</li></ul>",
			hero_image: "/hero-cycling.jpg",
			tags: ["Image", "Marathoner", "Millennials", "Triathlon", "Sponsorship", "Cycling", "Fitness", "Endurance", "Event"],
			related_articles: ["ci-blog-1", "ci-blog-2"]
		}
	},
	{
		id: "ci-banner-1",
		modelId: "cm-banner",
		modelDisplayName: "Banner",
		createdAt: "2024-03-23T08:00:00Z",
		taskId: "3",
		fields: {
			message: "Spring Sale! Up to 40% off running gear",
			cta_text: "Shop Now",
			cta_link: "https://stride.com/sale",
			background_image: "https://picsum.photos/seed/spring-sale-gear/1200/400",
			dismissible: true,
			display_duration: 7
		}
	},
	{
		id: "ci-hero-1",
		modelId: "cm-hero-component",
		modelDisplayName: "Hero Component",
		createdAt: "2024-03-24T10:00:00Z",
		taskId: "4",
		fields: {
			headline: "Run Faster, Go Further",
			subheadline: "Introducing the new Stride Elite Runner",
			description: "Our most advanced running shoe featuring cutting-edge cushioning and energy return technology",
			background_image: "https://picsum.photos/seed/elite-runner-shoe/1200/600",
			primary_cta_text: "Shop Elite Runner",
			primary_cta_link: "https://stride.com/products/elite-runner",
			secondary_cta_text: "Learn More",
			secondary_cta_link: "https://stride.com/technology"
		}
	},
	{
		id: "ci-blog-recovery",
		modelId: "cm-blog-post",
		modelDisplayName: "Blog Post",
		createdAt: "2025-04-10T09:00:00Z",
		taskId: "6",
		fields: {
			headline: "The Runner's Guide to Recovery — What to Eat, When to Rest",
			byline: "STRIDE Wellness Team",
			publish_date: "2025-04-28",
			excerpt: "A practical guide to post-run nutrition, active recovery, and rest-day planning for runners who want to perform at their best every time they lace up.",
			category: "Guides",
			body: `<h2>Why Recovery Matters as Much as the Run</h2>
<p>Every stride you take breaks your body down a little — micro-tears in muscle fibers, depleted glycogen stores, elevated cortisol. That's by design. The magic happens <em>after</em> you stop running, when your body rebuilds stronger than before. But only if you give it the right fuel and enough rest.</p>

<h2>The 30-Minute Window: What to Eat Right After a Run</h2>
<p>Your muscles are most receptive to nutrient uptake in the first 30 minutes post-exercise. Aim for a 3:1 ratio of carbohydrates to protein to kick-start glycogen replenishment and muscle repair.</p>
<ul>
<li><strong>Chocolate milk</strong> — a surprisingly effective recovery drink with the ideal carb-to-protein ratio.</li>
<li><strong>Greek yogurt with banana and honey</strong> — fast-digesting carbs plus 15–20 g of protein.</li>
<li><strong>Rice cakes with almond butter</strong> — portable and easy on the stomach after intense sessions.</li>
</ul>

<h3>Hydration First</h3>
<p>Before you eat, drink. For every pound lost during a run, aim for 16–24 oz of fluid. Add a pinch of sea salt or an electrolyte tablet if you ran longer than 60 minutes or sweated heavily.</p>

<h2>Anti-Inflammatory Foods for Faster Recovery</h2>
<p>Chronic inflammation slows healing and increases injury risk. Build these foods into your weekly rotation:</p>
<ul>
<li><strong>Tart cherry juice</strong> — studies show it reduces muscle soreness and speeds recovery.</li>
<li><strong>Fatty fish (salmon, mackerel)</strong> — rich in omega-3s that calm systemic inflammation.</li>
<li><strong>Turmeric and ginger</strong> — natural anti-inflammatories you can add to smoothies, soups, or tea.</li>
<li><strong>Leafy greens and berries</strong> — packed with antioxidants that neutralize exercise-induced oxidative stress.</li>
</ul>

<h2>Active Recovery: Move to Heal</h2>
<p>Rest doesn't mean doing nothing. Active recovery — low-intensity movement on your off days — increases blood flow to sore muscles without adding training stress.</p>
<ul>
<li><strong>Easy walking or cycling</strong> (20–30 min at conversational pace)</li>
<li><strong>Yoga or gentle stretching</strong> — focus on hips, hamstrings, and calves</li>
<li><strong>Foam rolling</strong> — spend 1–2 minutes on each major muscle group</li>
<li><strong>Swimming</strong> — zero-impact and great for flushing out lactic acid</li>
</ul>

<h2>Sample Weekly Recovery Schedule</h2>
<p>Here's how a balanced week might look for an intermediate runner logging 25–35 miles per week:</p>
<ul>
<li><strong>Monday:</strong> Rest or easy 20-min walk</li>
<li><strong>Tuesday:</strong> Speed/tempo run + post-run smoothie</li>
<li><strong>Wednesday:</strong> Active recovery — yoga or swim</li>
<li><strong>Thursday:</strong> Mid-distance run + foam rolling</li>
<li><strong>Friday:</strong> Rest day — focus on sleep and nutrition</li>
<li><strong>Saturday:</strong> Long run + recovery meal within 30 min</li>
<li><strong>Sunday:</strong> Active recovery — easy bike ride or walk</li>
</ul>

<h2>Sleep: The Ultimate Recovery Tool</h2>
<p>No amount of tart cherry juice can replace quality sleep. During deep sleep your body releases human growth hormone (HGH), which drives tissue repair and muscle growth. Aim for 7–9 hours per night, and consider these habits:</p>
<ul>
<li>Keep your bedroom cool (65–68 °F / 18–20 °C).</li>
<li>Avoid screens for 30 minutes before bed.</li>
<li>Finish hard training sessions at least 3 hours before bedtime.</li>
</ul>

<h2>Listen to Your Body</h2>
<p>Recovery isn't one-size-fits-all. Some days you'll feel ready to tackle hills; other days your legs will tell you to take it easy. Track metrics like resting heart rate, sleep quality, and perceived soreness. Over time you'll learn your own recovery patterns — and that self-awareness will make you a stronger, more resilient runner.</p>

<p><em>Run smart. Recover smarter. That's the Stride way.</em></p>`,
			hero_image: "https://picsum.photos/seed/runner-recovery-nutrition/800/600",
			tags: ["recovery", "nutrition", "running", "wellness", "training"],
			seo_keywords: ["running recovery", "post-run nutrition", "runner's diet", "active recovery for runners", "rest day for runners"]
		}
	}
];
