export type Algorithm = {
	id: string;
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
	type?: "Search" | "Custom";
};

export type PinnedResult = {
	id: string;
	query: string;
	destination: string;
	owner: string;
};

export type RelatedQuery = {
	id: string;
	query: string;
	synonyms: string[];
	owner: string;
};

export type AlgorithmRelatedQueryReference = {
	relatedQueryId: string;
};

export type Synonym = {
	id: string;
	term: string;
	synonyms: string[];
	type: "One-way" | "Two-way";
	owner: string;
};

export type AlgorithmSynonymReference = {
	synonymId: string;
};

export type AutocompletePhrase = {
	id: string;
	phrase: string;
	owner: string;
};

export type AlgorithmAutocompletePhraseReference = {
	autocompletePhraseId: string;
};

export type AlgorithmPinnedResultReference = {
	pinnedResultId: string;
	status: "Active" | "Inactive";
};

export type AlgorithmPinnedResult = PinnedResult & {
	status: "Active" | "Inactive";
};

export const initialAlgorithms: Algorithm[] = [
	{
		id: "1",
		name: "Main Site Search",
		publishState: "Published",
		creationDate: "2023-10-25",
		owner: "Alice Johnson",
	},
	{
		id: "2",
		name: "Cycling Gear Optimization",
		publishState: "Draft",
		creationDate: "2023-11-02",
		owner: "Bob Smith",
		type: "Custom",
	},
];

export const initialPinnedResults: PinnedResult[] = [
	{
		id: "1",
		query: "return policy",
		destination: "https://stride.com/help/returns",
		owner: "Support Team",
	},
	{
		id: "2",
		query: "shipping rates",
		destination: "https://stride.com/help/shipping",
		owner: "Logistics",
	},
	{
		id: "3",
		query: "running shoes",
		destination: "https://stride.com/products/runner-elite",
		owner: "Marketing",
	},
];

export const initialRelatedQueries: RelatedQuery[] = [
	{
		id: "1",
		query: "sneakers",
		synonyms: ["shoes", "trainers", "kicks"],
		owner: "Merchandising",
	},
	{
		id: "2",
		query: "jacket",
		synonyms: ["coat", "parka", "windbreaker"],
		owner: "Merchandising",
	},
];

export const initialSynonyms: Synonym[] = [
	{
		id: "1",
		term: "trousers",
		synonyms: ["pants", "slacks", "chinos"],
		type: "Two-way",
		owner: "Merchandising",
	},
	{
		id: "2",
		term: "mobile",
		synonyms: ["phone", "cellphone", "smartphone"],
		type: "One-way",
		owner: "IT",
	},
];

export const initialAutocompletePhrases: AutocompletePhrase[] = [
	{
		id: "1",
		phrase: "running shoes for men",
		owner: "Marketing",
	},
	{
		id: "2",
		phrase: "winter jackets sale",
		owner: "Merchandising",
	},
];

export type User = {
	id: string;
	name: string;
	email: string;
	role: "Admin" | "Editor" | "Viewer";
	avatar?: string;
};

export const initialUsers: User[] = [
	{
		id: "1",
		name: "Alice Johnson",
		email: "alice.johnson@example.com",
		role: "Admin",
	},
	{
		id: "2",
		name: "Bob Smith",
		email: "bob.smith@example.com",
		role: "Editor",
	},
	{
		id: "3",
		name: "Carol Williams",
		email: "carol.williams@example.com",
		role: "Editor",
	},
	{
		id: "4",
		name: "David Brown",
		email: "david.brown@example.com",
		role: "Viewer",
	},
];


export type Property = {
	id: string;
	name: string;
	type: "text" | "textarea" | "richtext" | "reference" | "address" | "outline";
	required?: boolean;
	/** when type is reference this points to a collection like 'users' */
	of?: string;
};

export type ContentType = {
	id: string;
	name: string;
	baseType: "Page" | "Experience" | "Media" | "Product" | "Block";
	description?: string;
	properties: Property[];
};

export const initialContentTypes: ContentType[] = [
	{
		id: "ct-page",
		name: "Page",
		baseType: "Experience",
		description: "Standard page (uses outlines)",
		properties: [
			{ id: "title", name: "Title", type: "text", required: true },
			{ id: "mainOutline", name: "Main", type: "outline" },
		],
	},
	{
		id: "ct-blog-post",
		name: "Blog Post",
		baseType: "Page",
		description: "A standard blog/article page",
		properties: [
			{ id: "title", name: "Title", type: "text", required: true },
			{ id: "subtitle", name: "Subtitle", type: "text" },
			{ id: "body", name: "Body", type: "richtext", required: true },
			{ id: "author", name: "Author", type: "reference", of: "users", required: true },
		],
	},
	{
		id: "ct-about-page",
		name: "About Page",
		baseType: "Page",
		description: "Company about page",
		properties: [
			{ id: "title", name: "Title", type: "text", required: true },
			{ id: "about", name: "About (Stride)", type: "richtext" },
			{ id: "history", name: "History", type: "textarea" },
			{ id: "orgAddress", name: "Org address", type: "address" },
		],
	},
	{
		id: "exp-landing-page",
		name: "Landing Page",
		baseType: "Experience",
		description: "Landing page experience with main and aside outlines",
		properties: [
			{ id: "mainOutline", name: "Main", type: "outline" },
			{ id: "asideOutline", name: "Aside", type: "outline" },
		],
	},
	{
		id: "ct-product",
		name: "Product",
		baseType: "Product",
		description: "A standard product",
		properties: [
			{ id: "name", name: "Name", type: "text", required: true },
			{ id: "description", name: "Description", type: "richtext" },
			{ id: "price", name: "Price", type: "text" },
		],
	},
	{
		id: "ct-block",
		name: "Block",
		baseType: "Block",
		description: "A reusable content block",
		properties: [
			{ id: "title", name: "Title", type: "text", required: true },
		],
	},
	{
		id: "ct-image",
		name: "Image",
		baseType: "Media",
		description: "An image asset",
		properties: [
			{ id: "title", name: "Title", type: "text", required: true },
			{ id: "alt", name: "Alt Text", type: "text" },
		],
	},
	{
		id: "ct-heading",
		name: "Heading",
		baseType: "Block",
		description: "A heading block",
		properties: [
			{ id: "text", name: "Text", type: "text", required: true },
		],
	},
	{
		id: "ct-text",
		name: "Text",
		baseType: "Block",
		description: "A text block",
		properties: [
			{ id: "text", name: "Text", type: "text", required: true },
		],
	},
	{
		id: "ct-button",
		name: "Button",
		baseType: "Block",
		description: "A button block",
		properties: [
			{ id: "label", name: "Label", type: "text", required: true },
		],
	},
	{
		id: "ct-input",
		name: "Input",
		baseType: "Block",
		description: "An input block",
		properties: [
			{ id: "label", name: "Label", type: "text", required: true },
			{ id: "placeholder", name: "Placeholder", type: "text" },
		],
	},
];

export type EleProp = {
	type: "text" | "checkbox";
	label: string;
	value?: any;
};

export type EleDef = {
	type: "Heading" | "Text" | "Input" | "Button" | "Image" | string;
	props: EleProp[];
};

export type EleMap = Record<string, EleDef>;

export type OutlineNode = {
	id: string;
	name?: string;
	open?: boolean;
	children?: OutlineNode[]; // section/row/col nodes
} | {
	id: string; // element ref node (ele id)
};

export type OutlineId = string;

export type Outline = {
	id: OutlineId;
	title: string;
	tree: any[];       // or OutlineNode[] if you want to type it tighter
	elements: EleMap;  // <-- this fixes "Cannot find name 'EleMap'"
};

export type Page = {
	id: string;
	name: string;
	parentId: string | null;
	status: "Published" | "Draft" | "Review" | "Changed";
	lastModified: string;
	contentTypeId: string;
	slug?: string;
	data?: Record<string, any>;
	outlines?: Outline[]; // ALWAYS this for layouts
};

export const initialPages: Page[] = [
	{
		id: "page-site-home",
		name: "Homepage",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-home-main",
				title: "Main",
				tree: [
					{
						id: "sec-home-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-home-hero",
								open: true,
								children: [
									{
										id: "col-home-hero",
										open: true,
										children: [
											{ id: "ele-home-hero-heading" },
											{ id: "ele-home-hero-subtext" },
											{ id: "ele-home-hero-cta" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-home-hero-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Unleash Your Potential" }],
					},
					"ele-home-hero-subtext": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Premium athletic wear for the modern runner." }],
					},
					"ele-home-hero-cta": {
						type: "Button",
						props: [{ type: "text", label: "Label", value: "Shop Now" }],
					},
				},
			},
		],
	},

	{
		id: "page-site-about",
		name: "About Us",
		parentId: null,
		status: "Draft",
		lastModified: "2023-10-26",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-about-main",
				title: "Main",
				tree: [
					{
						id: "sec-about-story",
						name: "Our Story",
						open: true,
						children: [
							{
								id: "row-about-story",
								open: true,
								children: [
									{
										id: "col-about-story",
										open: true,
										children: [{ id: "ele-about-heading" }, { id: "ele-about-body" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-about-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Our Story" }],
					},
					"ele-about-body": {
						type: "Text",
						props: [
							{
								type: "text",
								label: "Text",
								value: "Born on the track, designed for the street. Stride empowers athletes everywhere.",
							},
						],
					},
				},
			},
		],
	},

	{
		id: "page-site-contact",
		name: "Contact",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-25",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-contact-main",
				title: "Main",
				tree: [
					{
						id: "sec-contact-form",
						name: "Contact Form",
						open: true,
						children: [
							{
								id: "row-contact-form",
								open: true,
								children: [
									{
										id: "col-contact-form",
										open: true,
										children: [
											{ id: "ele-contact-heading" },
											{ id: "ele-contact-subtext" },
											{ id: "ele-contact-name" },
											{ id: "ele-contact-email" },
											{ id: "ele-contact-submit" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-contact-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Get in Touch" }],
					},
					"ele-contact-subtext": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Questions about your order? We're here to help." }],
					},
					"ele-contact-name": {
						type: "Input",
						props: [
							{ type: "text", label: "Label", value: "Name" },
							{ type: "text", label: "Placeholder", value: "Your Name" },
						],
					},
					"ele-contact-email": {
						type: "Input",
						props: [
							{ type: "text", label: "Label", value: "Email" },
							{ type: "text", label: "Placeholder", value: "you@example.com" },
						],
					},
					"ele-contact-submit": {
						type: "Button",
						props: [{ type: "text", label: "Label", value: "Send Message" }],
					},
				},
			},
		],
	},

	{
		id: "page-site-blog",
		name: "Blog",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-24",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-blog-main",
				title: "Main",
				tree: [
					{
						id: "sec-blog-header",
						name: "Header",
						open: true,
						children: [
							{
								id: "row-blog-header",
								open: true,
								children: [
									{
										id: "col-blog-header",
										open: true,
										children: [{ id: "ele-blog-heading" }, { id: "ele-blog-subtext" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-blog-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "The Stride Blog" }],
					},
					"ele-blog-subtext": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Tips, training guides, and gear reviews." }],
					},
				},
			},
		],
	},


	{
		id: "page-site-products",
		name: "Products",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-23",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-products-main",
				title: "Main",
				tree: [
					{
						id: "sec-products-arrivals",
						name: "New Arrivals",
						open: true,
						children: [
							{
								id: "row-products-arrivals",
								open: true,
								children: [
									{
										id: "col-products-arrivals",
										open: true,
										children: [{ id: "ele-products-heading" }, { id: "ele-products-subtext" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-products-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "New Arrivals" }],
					},
					"ele-products-subtext": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Check out the latest gear for this season." }],
					},
				},
			},
		],
	},

	{
		id: "page-site-product-a",
		name: "Product A",
		parentId: "page-site-products",
		status: "Review",
		lastModified: "2023-10-23",
		contentTypeId: "ct-page",
		data: {},
		outlines: [
			{
				id: "ol-product-a-main",
				title: "Main",
				tree: [
					{
						id: "sec-product-a-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-product-a-hero",
								open: true,
								children: [
									{
										id: "col-product-a-hero",
										open: true,
										children: [{ id: "ele-product-a-heading" }, { id: "ele-product-a-body" }, { id: "ele-product-a-cta" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-product-a-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Stride Elite Runner" }],
					},
					"ele-product-a-body": {
						type: "Text",
						props: [
							{ type: "text", label: "Text", value: "Our most advanced running shoe yet. Lightweight, responsive, and durable." },
						],
					},
					"ele-product-a-cta": {
						type: "Button",
						props: [{ type: "text", label: "Label", value: "Add to Cart" }],
					},
				},
			},
		],
	},

	{
		id: "page-exp-landing-default",
		contentTypeId: "exp-landing-page",
		name: "Default Landing",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
		data: {},
		outlines: [
			{
				id: "ol-landing-main",
				title: "Main",
				tree: [
					{
						id: "sec-landing-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-landing-hero",
								open: true,
								children: [
									{
										id: "col-landing-hero",
										open: true,
										children: [{ id: "ele-landing-hero-heading" }, { id: "ele-landing-hero-sub" }, { id: "ele-landing-hero-cta" }],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-activities",
						name: "Activities",
						open: true,
						children: [
							{
								id: "row-landing-activities",
								open: true,
								children: [
									{
										id: "col-landing-activities",
										open: true,
										children: [{ id: "ele-landing-activities-heading" }, { id: "ele-landing-activities-text" }],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-community",
						name: "Community",
						open: true,
						children: [
							{
								id: "row-landing-community",
								open: true,
								children: [
									{
										id: "col-landing-community",
										open: true,
										children: [{ id: "ele-landing-community-heading" }, { id: "ele-landing-community-text" }],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-partners",
						name: "Partners",
						open: true,
						children: [
							{
								id: "row-landing-partners",
								open: true,
								children: [
									{
										id: "col-landing-partners",
										open: true,
										children: [{ id: "ele-landing-partners-heading" }, { id: "ele-landing-partners-text" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-landing-hero-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Welcome to Stride" }]
					},
					"ele-landing-hero-sub": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Move faster with premium gear." }]
					},
					"ele-landing-hero-cta": {
						type: "Button",
						props: [{ type: "text", label: "Label", value: "Shop Now" }]
					},
					"ele-landing-activities-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Activities" }]
					},
					"ele-landing-activities-text": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Explore training plans and community events." }]
					},
					"ele-landing-community-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Community" }]
					},
					"ele-landing-community-text": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "Join runners in your area and share progress." }]
					},
					"ele-landing-partners-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "Partners" }]
					},
					"ele-landing-partners-text": {
						type: "Text",
						props: [{ type: "text", label: "Text", value: "We collaborate with the best brands." }]
					},
				},
			},

			{
				id: "ol-landing-aside",
				title: "Aside",
				tree: [
					{
						id: "sec-aside-latest-blogposts",
						name: "Latest Blogposts",
						open: true,
						children: [
							{
								id: "row-aside-latest-blogposts",
								open: true,
								children: [
									{
										id: "col-aside-latest-blogposts",
										open: true,
										children: [{ id: "ele-aside-latest-heading" }],
									},
								],
							},
						],
					},
					{
						id: "sec-aside-join-race",
						name: "Join Race",
						open: true,
						children: [
							{
								id: "row-aside-join-race",
								open: true,
								children: [
									{
										id: "col-aside-join-race",
										open: true,
										children: [{ id: "ele-aside-join-heading" }, { id: "ele-aside-join-cta" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-aside-latest-heading": { type: "Heading", props: [{ type: "text", label: "Text", value: "Latest Blogposts" }] },
					// blog post refs still come from initialPages by contentTypeId === "ct-blog-post"

					"ele-aside-join-heading": { type: "Heading", props: [{ type: "text", label: "Text", value: "Join Race" }] },
					"ele-aside-join-cta": { type: "Button", props: [{ type: "text", label: "Label", value: "Sign Up" }] },
				},
			},
		],
	},
	{
		id: "page-site-blog-post-1",
		name: "5 Tips for Your First Marathon",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2023-10-24",
		contentTypeId: "ct-blog-post",
		slug: "5-tips-for-your-first-marathon",
		data: {
			title: "5 Tips for Your First Marathon",
			subtitle: "Build confidence, stay consistent, and make race day feel familiar.",
			body: `<p>Training for 26.2 miles starts with a single step — and a plan you can actually stick to. Here are five practical tips that help first-timers build fitness without burning out.</p>
<h2>1) Keep the easy runs easy</h2>
<p>Your easy pace should feel conversational. That’s where most of your aerobic gains come from.</p>
<h2>2) Long runs are practice, not a test</h2>
<p>Focus on time-on-feet and fueling. Don’t race your long run.</p>
<h2>3) Fuel early and often</h2>
<ul>
  <li><p>Start fueling around 30–45 minutes in</p></li>
  <li><p>Aim for consistent carbs + water</p></li>
</ul>
<h2>4) Don’t skip recovery</h2>
<p>Sleep, easy days, and lower-intensity weeks are part of the training.</p>
<h2>5) Rehearse race day</h2>
<p>Try your breakfast, gels, and outfit on a long run so there are no surprises.</p>`,
			author: "1",
		},
	},
	{
		id: "page-site-blog-post-2",
		name: "Intervals for Beginners",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2023-10-28",
		contentTypeId: "ct-blog-post",
		slug: "intervals-for-beginners",
		data: {
			title: "Intervals for Beginners",
			subtitle: "A simple approach to speedwork that won’t fry your legs.",
			body: `<p>Intervals don’t have to be scary. Think of them as controlled effort followed by recovery, repeated a few times. The goal is better form, efficiency, and confidence — not exhaustion.</p>
<h2>A starter workout</h2>
<ul>
  <li><p><strong>Warm up:</strong> 10 minutes easy + 3 short strides</p></li>
  <li><p><strong>Main set:</strong> 6 × (1 min steady-hard, 2 min easy)</p></li>
  <li><p><strong>Cool down:</strong> 10 minutes easy</p></li>
</ul>
<p>During the hard minute, aim for “comfortably hard” — you should finish feeling like you could do one more rep.</p>
<h2>Common mistakes</h2>
<ul>
  <li><p>Starting too fast on rep 1</p></li>
  <li><p>Skipping the warm-up</p></li>
  <li><p>Doing intervals on tired legs every week</p></li>
</ul>
<p>One interval session per week is plenty for most runners.</p>`,
			author: "2",
		},
	},

	{
		id: "page-site-blog-post-3",
		name: "Race Day Checklist",
		parentId: "page-site-blog",
		status: "Draft",
		lastModified: "2023-10-29",
		contentTypeId: "ct-blog-post",
		slug: "race-day-checklist",
		data: {
			title: "Race Day Checklist",
			subtitle: "Remove the stress by planning the small stuff ahead of time.",
			body: `<p>Race mornings get chaotic fast. The best way to stay calm is to remove decisions and make the day feel like a routine workout.</p>
<h2>The night before</h2>
<ul>
  <li><p>Lay out your kit (shoes, socks, top, shorts/tights)</p></li>
  <li><p>Pin your bib and pack safety pins (or your belt)</p></li>
  <li><p>Charge your watch and phone</p></li>
  <li><p>Plan breakfast + pack a backup snack</p></li>
</ul>
<h2>Race morning</h2>
<ul>
  <li><p>Arrive early and find toilets first</p></li>
  <li><p>Do 5–10 minutes easy jogging + a few strides (if appropriate)</p></li>
  <li><p>Start conservatively for the first 5–10 minutes</p></li>
</ul>
<blockquote><p><strong>Pro tip:</strong> Write your plan (pace + fueling) on a note in your phone. When nerves spike, you’ll follow the plan.</p></blockquote>`,
			author: "3",
		},
	},

	{
		id: "page-site-blog-post-4",
		name: "How to Choose Running Shoes",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2023-10-30",
		contentTypeId: "ct-blog-post",
		slug: "how-to-choose-running-shoes",
		data: {
			title: "How to Choose Running Shoes",
			subtitle: "Comfort first, then match the shoe to your training.",
			body: `<p>The “best” shoe is the one that fits your foot and your running. Start with comfort and stability, then refine based on your training goals.</p>
<h2>Fit comes first</h2>
<p>Look for a secure heel, a roomy toe box, and no hot spots. Your toes should be able to wiggle, and the shoe shouldn’t slip when you walk or jog.</p>
<h2>Match the shoe to the session</h2>
<ul>
  <li><p><strong>Daily trainer:</strong> comfortable, durable, forgiving</p></li>
  <li><p><strong>Workout shoe:</strong> lighter, snappier, more responsive</p></li>
  <li><p><strong>Trail shoe:</strong> grip, protection, stable platform</p></li>
</ul>
<h2>Don’t overthink pronation labels</h2>
<p>Unless you have a specific injury history, prioritize what feels natural and stable. If possible, test-run them on a treadmill or outside.</p>`,
			author: "1",
		},
	},


];

// --- Merged Content Data ---

export type PublishStatus = "Draft" | "Published";

export interface UnifiedContentItem {
	id: string;
	name: string;
	baseType: ContentType["baseType"];
	contentTypeId: string;
	publishStatus: PublishStatus;
	workflowStatus: "draft" | "in-review" | "approved" | "scheduled";
	modifiedBy: string;
	language: string;
	lastModified: string;
}

const reportNames = ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Maria Garcia", "Sarah Chen", "Marcus Johnson", "Alex Rivera", "Emily Brown", "James Wilson", "Lisa Anderson", "David Kim", "Michelle Taylor", "Robert Garcia", "Jessica Moore", "Chris Lee", "Patricia White", "Kevin Davis", "Jennifer Martin", "Thomas Brown", "Steven Clark", "Nancy Rodriguez", "Daniel Lewis"];

const getRandomName = (id: string) => {
	const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return reportNames[hash % reportNames.length];
};

export const initialOtherContent: UnifiedContentItem[] = [
	{ id: "3", name: "Heart Rate Monitor - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("3"), language: "en", lastModified: "Jan 11, 2025" },
	{ id: "5", name: "Pricing Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("5"), language: "en", lastModified: "Jan 11, 2025" },
	{ id: "9", name: "Cycling Hero - Image", baseType: "Media", contentTypeId: "ct-image", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("9"), language: "en", lastModified: "Jan 11, 2025" },
	{ id: "13", name: "Route Planning Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("13"), language: "en", lastModified: "Jan 8, 2025" },
	{ id: "26", name: "Leaderboards Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("26"), language: "en", lastModified: "Dec 26, 2024" },
	{ id: "31", name: "Cycle Computer Pro - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("31"), language: "en", lastModified: "Dec 21, 2024" },
	{ id: "32", name: "HR Monitor Band - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("32"), language: "en", lastModified: "Dec 20, 2024" },
	{ id: "33", name: "Smart Bike Trainer - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("33"), language: "en", lastModified: "Dec 19, 2024" },
	{ id: "34", name: "Cadence Sensor - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("34"), language: "en", lastModified: "Dec 18, 2024" },
	{ id: "35", name: "Power Meter - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("35"), language: "en", lastModified: "Dec 17, 2024" },
	{ id: "36", name: "Speed Sensor - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("36"), language: "en", lastModified: "Dec 16, 2024" },
	{ id: "37", name: "Aero Helmet - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("37"), language: "en", lastModified: "Dec 15, 2024" },
	{ id: "38", name: "Bike Lights - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("38"), language: "en", lastModified: "Dec 14, 2024" },
	{ id: "39", name: "Water Bottle Holder - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("39"), language: "en", lastModified: "Dec 13, 2024" },
	{ id: "40", name: "Repair Tool Kit - Product", baseType: "Product", contentTypeId: "ct-product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("40"), language: "en", lastModified: "Dec 12, 2024" },
	{ id: "41", name: "Weekly Challenge Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("41"), language: "en", lastModified: "Dec 11, 2024" },
	{ id: "42", name: "Achievement Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("42"), language: "en", lastModified: "Dec 10, 2024" },
	{ id: "43", name: "Social Feed Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("43"), language: "en", lastModified: "Dec 9, 2024" },
	{ id: "44", name: "Leaderboard Widget Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("44"), language: "en", lastModified: "Dec 8, 2024" },
	{ id: "45", name: "Stats Summary Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("45"), language: "en", lastModified: "Dec 7, 2024" },
	{ id: "46", name: "Upcoming Events Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("46"), language: "en", lastModified: "Dec 6, 2024" },
	{ id: "47", name: "Testimonial Carousel Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("47"), language: "en", lastModified: "Dec 5, 2024" },
	{ id: "48", name: "Payment Plans Block", baseType: "Block", contentTypeId: "ct-block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("48"), language: "en", lastModified: "Dec 4, 2024" },
	{ id: "49", name: "Mountain Pass Scenery - Image", baseType: "Media", contentTypeId: "ct-image", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("49"), language: "en", lastModified: "Dec 3, 2024" },
	{ id: "50", name: "Pro Cyclist In Action - Image", baseType: "Media", contentTypeId: "ct-image", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("50"), language: "en", lastModified: "Dec 2, 2024" },
];

export const getAllContentItems = (pages: Page[] = initialPages): UnifiedContentItem[] => {
	const pageItems: UnifiedContentItem[] = pages.map(p => {
		const ct = initialContentTypes.find(c => c.id === p.contentTypeId);
		const date = new Date(p.lastModified);
		const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

		return {
			id: p.id,
			name: p.name,
			baseType: ct?.baseType || "Page",
			contentTypeId: p.contentTypeId,
			publishStatus: p.status === "Published" ? "Published" : "Draft",
			workflowStatus: p.status === "Published" ? "approved" : "draft",
			modifiedBy: getRandomName(p.id),
			language: "en",
			lastModified: formattedDate
		};
	});
	return [...pageItems, ...initialOtherContent];
};




export const siteConfig = {
	header: {
		logo: "STRIDE",
		links: [
			{ label: "Activities", href: "#" },
			{ label: "Community", href: "#" },
			{ label: "Challenges", href: "#" },
			{ label: "Pricing", href: "#" },
			{ label: "Stories", href: "#" },
		],
		auth: {
			signIn: "Sign In",
			cta: "Get Started",
		},
	},
};
