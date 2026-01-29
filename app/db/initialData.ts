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
	type: "text" | "textarea" | "richtext" | "reference" | "address" | "outline" | "checkbox";
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
			{ id: "description", name: "Description", type: "text" },
			{ id: "price", name: "Price", type: "text" },
		],
	},
	{
		id: "ct-block",
		name: "Block",
		baseType: "Block",
		description: "A reusable content block",
		properties: [{ id: "title", name: "Title", type: "text", required: true }],
	},
	{
		id: "ct-image",
		name: "Image",
		baseType: "Media",
		description: "An image asset",
		properties: [
			{ id: "imageUrl", name: "Image URL", type: "text", required: true },
			{ id: "altText", name: "Alt Text", type: "text" },
			{ id: "width", name: "Width", type: "text" },
			{ id: "height", name: "Height", type: "text" },
		],
	},
	{
		id: "ct-heading",
		name: "Heading",
		baseType: "Block",
		description: "A heading block",
		properties: [{ id: "text", name: "Text", type: "text", required: true }],
	},
	{
		id: "ct-text",
		name: "Text",
		baseType: "Block",
		description: "A text block",
		properties: [{ id: "text", name: "Text", type: "text", required: true }],
	},
	{
		id: "ct-rich-text",
		name: "Rich Text",
		baseType: "Block",
		description: "A rich text block supporting simple markup",
		properties: [{ id: "richtext", name: "Rich Text", type: "richtext", required: true }],
	},
	{
		id: "ct-button",
		name: "Button",
		baseType: "Block",
		description: "A button block",
		properties: [{ id: "label", name: "Label", type: "text", required: true }],
	},
	{
		id: "ct-input",
		name: "Input",
		baseType: "Block",
		description: "An input block",
		properties: [
			{ id: "label", name: "Label", type: "text", required: true },
			{ id: "placeholder", name: "Placeholder", type: "text" },
			{ id: "tooltip", name: "Tooltip", type: "text" },
			{ id: "required", name: "Required", type: "checkbox" },
		],
	},
];

export type EleProp = {
	type: "text" | "checkbox";
	label: string;
	value?: any;
};

export type EleDef = {
	type: "ct-heading" | "ct-text" | "ct-rich-text" | "ct-input" | "ct-button" | "ct-image" | "ct-product" | string;
	properties: Record<string, { value: any }>;
};

export type EleMap = Record<string, EleDef>;

export type OutlineNode =
	| {
		id: string;
		name?: string;
		open?: boolean;
		children?: OutlineNode[]; // section/row nodes
		elements?: { id: string }[]; // column nodes
	}
	| {
		id: string; // element ref node (ele id)
	};

export type OutlineId = string;

export type Outline = {
	id: OutlineId;
	title: string;
	tree: any[]; // or OutlineNode[] if you want to type it tighter
	elements: EleMap; // <-- this fixes "Cannot find name 'EleMap'"
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
										elements: [
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
						type: "ct-heading",
						properties: {
							text: { value: "Unleash Your Potential" }
						},
					},
					"ele-home-hero-subtext": {
						type: "ct-text",
						properties: {
							text: { value: "Premium athletic wear for the modern runner." }
						},
					},
					"ele-home-hero-cta": {
						type: "ct-button",
						properties: {
							label: { value: "Shop Now" }
						},
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
										elements: [
											{ id: "ele-about-heading" },
											{ id: "ele-about-body" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-about-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Our Story" }
						},
					},
					"ele-about-body": {
						type: "ct-text",
						properties: {
							text: { value: "Born on the track, designed for the street. Stride empowers athletes everywhere." }
						},
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
										elements: [
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
						type: "ct-heading",
						properties: {
							text: { value: "Get in Touch" }
						},
					},
					"ele-contact-subtext": {
						type: "ct-text",
						properties: {
							text: { value: "Questions about your order? We're here to help." }
						},
					},
					"ele-contact-name": {
						type: "ct-input",
						properties: {
							label: { value: "Name" },
							placeholder: { value: "Your Name" }
						},
					},
					"ele-contact-email": {
						type: "ct-input",
						properties: {
							label: { value: "Email" },
							placeholder: { value: "you@example.com" }
						},
					},
					"ele-contact-submit": {
						type: "ct-button",
						properties: {
							label: { value: "Send Message" }
						},
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
										elements: [
											{ id: "ele-blog-heading" },
											{ id: "ele-blog-subtext" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-blog-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "The Stride Blog" }
						},
					},
					"ele-blog-subtext": {
						type: "ct-text",
						properties: {
							text: { value: "Tips, training guides, and gear reviews." }
						},
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
										elements: [
											{ id: "ele-products-heading" },
											{ id: "ele-products-subtext" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-products-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "New Arrivals" }
						},
					},
					"ele-products-subtext": {
						type: "ct-text",
						properties: {
							text: { value: "Check out the latest gear for this season." }
						},
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
										elements: [
											{ id: "ele-product-a-heading" },
											{ id: "ele-product-a-body" },
											{ id: "ele-product-a-cta" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-product-a-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Stride Elite Runner" }
						},
					},
					"ele-product-a-body": {
						type: "ct-text",
						properties: {
							text: { value: "Our most advanced running shoe yet. Lightweight, responsive, and durable." }
						},
					},
					"ele-product-a-cta": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
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
						bgImage: "/hero-cycling.jpg",
						open: true,
						children: [
							{
								id: "row-landing-hero",
								open: true,
								children: [
									{
										id: "col-landing-hero",
										open: true,
										elements: [
											{ id: "ele-landing-hero-badge" },
											{ id: "ele-landing-hero-sub" },
											{ id: "ele-landing-hero-heading" },
										],
									},
								],
							},
							{
								id: "row-landing-hero-cta",
								open: true,
								children: [
									{ id: "col-landing-hero-cta-1", open: true, elements: [{ id: "ele-landing-hero-cta-primary" }] },
									{ id: "col-landing-hero-cta-2", open: true, elements: [{ id: "ele-landing-hero-cta-secondary" }] },
								],
							},
							{
								id: "row-landing-hero-stats",
								open: true,
								children: [
									{
										id: "col-landing-hero-stat-1",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-1-heading" },
											{ id: "ele-landing-hero-stat-1-text" },
										],
									},
									{
										id: "col-landing-hero-stat-2",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-2-heading" },
											{ id: "ele-landing-hero-stat-2-text" },
										],
									},
									{
										id: "col-landing-hero-stat-3",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-3-heading" },
											{ id: "ele-landing-hero-stat-3-text" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-features-intro",
						name: "Features Intro",
						open: true,
						children: [
							{
								id: "row-landing-features-intro",
								open: true,
								children: [
									{
										id: "col-landing-features-intro",
										open: true,
										elements: [
											{ id: "ele-landing-features-heading" },
											{ id: "ele-landing-features-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-features-grid",
						name: "Features Grid",
						open: true,
						children: [
							{
								id: "row-landing-features-1",
								open: true,
								children: [
									{ id: "col-feat-1", open: true, elements: [{ id: "ele-feat-1" }] },
									{ id: "col-feat-2", open: true, elements: [{ id: "ele-feat-2" }] },
									{ id: "col-feat-3", open: true, elements: [{ id: "ele-feat-3" }] },
								],
							},
							{
								id: "row-landing-features-2",
								open: true,
								children: [
									{ id: "col-feat-4", open: true, elements: [{ id: "ele-feat-4" }] },
									{ id: "col-feat-5", open: true, elements: [{ id: "ele-feat-5" }] },
									{ id: "col-feat-6", open: true, elements: [{ id: "ele-feat-6" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-testimonials",
						name: "Testimonials",
						open: true,
						children: [
							{
								id: "row-landing-testimonials-intro",
								open: true,
								children: [
									{
										id: "col-landing-testimonials-intro",
										open: true,
										elements: [
											{ id: "ele-landing-testimonials-heading" },
											{ id: "ele-landing-testimonials-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-testimonials-cards",
								open: true,
								children: [
									{ id: "col-test-1", open: true, elements: [{ id: "ele-test-1" }] },
									{ id: "col-test-2", open: true, elements: [{ id: "ele-test-2" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-cta",
						name: "CTA",
						open: true,
						children: [
							{
								id: "row-landing-cta",
								open: true,
								children: [
									{
										id: "col-landing-cta",
										open: true,
										elements: [
											{ id: "ele-landing-cta-heading" },
											{ id: "ele-landing-cta-sub" },
											{ id: "ele-landing-cta-button" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-challenges",
						name: "Challenges",
						open: true,
						children: [
							{
								id: "row-landing-challenges-intro",
								open: true,
								children: [
									{
										id: "col-landing-challenges-intro",
										open: true,
										elements: [
											{ id: "ele-landing-challenges-heading" },
											{ id: "ele-landing-challenges-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-challenges-cards",
								open: true,
								children: [
									{ id: "col-chal-1", open: true, elements: [{ id: "ele-chal-1" }] },
									{ id: "col-chal-2", open: true, elements: [{ id: "ele-chal-2" }] },
									{ id: "col-chal-3", open: true, elements: [{ id: "ele-chal-3" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-pricing",
						name: "Pricing",
						open: true,
						children: [
							{
								id: "row-landing-pricing-intro",
								open: true,
								children: [
									{
										id: "col-landing-pricing-intro",
										open: true,
										elements: [
											{ id: "ele-landing-pricing-heading" },
											{ id: "ele-landing-pricing-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-pricing-cards",
								open: true,
								children: [
									{ id: "col-price-1", open: true, elements: [{ id: "ele-price-1" }] },
									{ id: "col-price-2", open: true, elements: [{ id: "ele-price-2" }] },
									{ id: "col-price-3", open: true, elements: [{ id: "ele-price-3" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-stories",
						name: "Stories",
						open: true,
						children: [
							{
								id: "row-landing-stories-intro",
								open: true,
								children: [
									{
										id: "col-landing-stories-intro",
										open: true,
										elements: [
											{ id: "ele-landing-stories-heading" },
											{ id: "ele-landing-stories-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-stories-cards",
								open: true,
								children: [
									{ id: "col-story-1", open: true, elements: [{ id: "ele-story-1" }] },
									{ id: "col-story-2", open: true, elements: [{ id: "ele-story-2" }] },
									{ id: "col-story-3", open: true, elements: [{ id: "ele-story-3" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-footer-cta",
						name: "Footer CTA",
						open: true,
						children: [
							{
								id: "row-landing-footer-cta",
								open: true,
								children: [
									{
										id: "col-landing-footer-cta",
										open: true,
										elements: [
											{ id: "ele-landing-footer-cta-heading" },
											{ id: "ele-landing-footer-cta-sub" },
											{ id: "ele-landing-footer-cta-stats" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-landing-hero-badge": {
						type: "ct-text",
						properties: {
							text: { value: "● Join 2M+ active users worldwide" }
						},
					},
					"ele-landing-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Ready. Set. Go." }
						},
					},
					"ele-landing-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Join thousands of runners in the most iconic triathlon of the year. Challenge yourself and cross the finish line!" }
						},
					},
					"ele-landing-hero-cta-primary": {
						type: "ct-button",
						properties: {
							label: { value: "Register for your bib" }
						},
					},
					"ele-landing-hero-cta-secondary": {
						type: "ct-button",
						properties: {
							label: { value: "Learn More" }
						},
					},
					"ele-landing-hero-stat-1-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "500K+" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-hero-stat-1-text": {
						type: "ct-text",
						properties: {
							text: { value: "Annual participants" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-hero-stat-2-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "45+" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-hero-stat-2-text": {
						type: "ct-text",
						properties: {
							text: { value: "Countries represented" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-hero-stat-3-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "4.9/5" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-hero-stat-3-text": {
						type: "ct-text",
						properties: {
							text: { value: "Average rating" },
							variant: { value: "stat" }
						},
					},
					"ele-landing-features-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Everything you need to stay motivated" }
						},
					},
					"ele-landing-features-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Track your progress, connect with friends, and push your limits with our comprehensive fitness platform." }
						},
					},
					"ele-feat-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "GPS Tracking: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Accurate route mapping and distance tracking for all your outdoor activities." },
											],
										},
									],
								}
							}
						},
					},
					"ele-feat-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Heart Rate Monitoring: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Real-time heart rate tracking to optimize your workout intensity." },
											],
										},
									],
								}
							}
						},
					},
					"ele-feat-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Performance Analytics: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Detailed insights and progress tracking to help you improve over time." },
											],
										},
									],
								}
							}
						},
					},
					"ele-feat-4": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Achievement System: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Unlock badges and celebrate milestones as you reach your fitness goals." },
											],
										},
									],
								}
							}
						},
					},
					"ele-feat-5": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Social Features: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Share your achievements and connect with a community of fitness enthusiasts." },
											],
										},
									],
								}
							}
						},
					},
					"ele-feat-6": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Cross-Platform Sync: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Seamlessly sync your data across all your devices and platforms." },
											],
										},
									],
								}
							}
						},
					},
					"ele-landing-testimonials-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Join millions of active users" }
						},
					},
					"ele-landing-testimonials-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Connect, compete, and get motivated by our global community of fitness enthusiasts." }
						},
					},
					"ele-test-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Sarah M.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Amazing run through Central Park this morning! The GPS tracking was spot-on and I love seeing my progress over time. 🏃‍♀️✨" },
											],
										},
									],
								}
							}
						},
					},
					"ele-test-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Mike R.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Crushed my half-marathon goal! The community challenges really pushed me to go further than I thought possible. 💪🏆" },
											],
										},
									],
								}
							}
						},
					},
					"ele-landing-cta-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Ready to join the community?" }
						},
					},
					"ele-landing-cta-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Start sharing your fitness journey and get inspired by others." }
						},
					},
					"ele-landing-cta-button": {
						type: "ct-button",
						properties: {
							label: { value: "Join Now" }
						},
					},
					"ele-landing-challenges-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Push your limits" }
						},
					},
					"ele-landing-challenges-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Join exciting challenges and compete with users worldwide to reach new fitness milestones." }
						},
					},
					"ele-chal-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "October Run Streak: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Run at least 1 mile every day this month. Progress: 65%" },
											],
										},
									],
								}
							}
						},
					},
					"ele-chal-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "100 Mile Challenge: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Complete 100 miles in 30 days. Progress: 42%" },
											],
										},
									],
								}
							}
						},
					},
					"ele-chal-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Weekend Warrior: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "Double your weekend mileage. Progress: 0%" },
											],
										},
									],
								}
							}
						},
					},
					"ele-landing-pricing-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Choose your plan" }
						},
					},
					"ele-landing-pricing-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Select the perfect plan for your fitness journey. Upgrade or downgrade anytime." }
						},
					},
					"ele-price-1": {
						type: "ct-product",
						properties: {
							name: { value: "Free" },
							price: { value: "$0/mo" },
							description: { value: "Basic activity tracking, Community access, 5 challenges per month." }
						},
					},
					"ele-price-2": {
						type: "ct-product",
						properties: {
							name: { value: "Pro" },
							price: { value: "$9.99/mo" },
							description: { value: "Everything in Free, Unlimited challenges, Advanced analytics, Heart rate monitoring." }
						},
					},
					"ele-price-3": {
						type: "ct-product",
						properties: {
							name: { value: "Team" },
							price: { value: "$24.99/mo" },
							description: { value: "Everything in Pro, Up to 10 team members, Team challenges, Admin dashboard." }
						},
					},
					"ele-landing-stories-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Real results from real people" }
						},
					},
					"ele-landing-stories-sub": {
						type: "ct-text",
						properties: {
							text: { value: "See how STRIDE has transformed the fitness journeys of our amazing community members." }
						},
					},
					"ele-story-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Jessica T.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "STRIDE helped me train for my first marathon. The personalized plans kept me motivated!" },
											],
										},
									],
								}
							}
						},
					},
					"ele-story-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Marcus R.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "The analytics features are incredible. Being able to track my performance has helped me identify areas for improvement." },
											],
										},
									],
								}
							}
						},
					},
					"ele-story-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Amanda K.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "I love the social aspect of STRIDE. Connecting with other fitness enthusiasts has completely transformed my workout routine." },
											],
										},
									],
								}
							}
						},
					},
					"ele-landing-footer-cta-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Join over 2 million users achieving their goals" }
						},
					},
					"ele-landing-footer-cta-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Start your fitness journey today and become part of our success stories." }
						},
					},
					"ele-landing-footer-cta-stats": {
						type: "ct-text",
						properties: {
							text: { value: "4.9/5 App Store Rating | 50K+ 5-Star Reviews | 2M+ Active Users" }
						},
					},
				},
			},

			{
				id: "ol-landing-aside",
				title: "Aside",
				tree: [
					{
						id: "sec-aside-blog",
						name: "Latest Blog Posts",
						open: true,
						children: [
							{
								id: "row-aside-blog",
								open: true,
								children: [
									{
										id: "col-aside-blog",
										open: true,
										elements: [
											{ id: "ele-aside-blog-heading" },
											{ id: "ele-aside-blog-1" },
											{ id: "ele-aside-blog-2" },
											{ id: "ele-aside-blog-3" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-aside-signup",
						name: "Join STRIDE Today",
						open: true,
						children: [
							{
								id: "row-aside-signup",
								open: true,
								children: [
									{
										id: "col-aside-signup",
										open: true,
										elements: [
											{ id: "ele-aside-signup-heading" },
											{ id: "ele-aside-signup-sub" },
											{ id: "ele-aside-signup-name" },
											{ id: "ele-aside-signup-email" },
											{ id: "ele-aside-signup-pass" },
											{ id: "ele-aside-signup-btn" },
											{ id: "ele-aside-signup-footer" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-aside-blog-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Latest Blog Posts" }
						},
					},
					"ele-aside-blog-1": {
						type: "ct-text",
						properties: {
							text: { value: "10 Tips For Your First Marathon (2 days ago)" }
						},
					},
					"ele-aside-blog-2": {
						type: "ct-text",
						properties: {
							text: { value: "Cycling Workouts for Beginners (5 days ago)" }
						},
					},
					"ele-aside-blog-3": {
						type: "ct-text",
						properties: {
							text: { value: "The Science of Running Form (1 week ago)" }
						},
					},
					"ele-aside-signup-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Join STRIDE Today" }
						},
					},
					"ele-aside-signup-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Start your fitness journey with our community" }
						},
					},
					"ele-aside-signup-name": {
						type: "ct-input",
						properties: {
							placeholder: { value: "Full Name" }
						},
					},
					"ele-aside-signup-email": {
						type: "ct-input",
						properties: {
							placeholder: { value: "Email Address" }
						},
					},
					"ele-aside-signup-pass": {
						type: "ct-input",
						properties: {
							placeholder: { value: "Password" }
						},
					},
					"ele-aside-signup-btn": {
						type: "ct-button",
						properties: {
							label: { value: "Create Account" }
						},
					},
					"ele-aside-signup-footer": {
						type: "ct-text",
						properties: {
							text: { value: "By signing up, you agree to our Terms of Service and Privacy Policy" }
						},
					},
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

	{
		id: "page-activities",
		contentTypeId: "exp-landing-page",
		name: "Activities",
		slug: "activities",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-activities-main",
				title: "Main",
				tree: [
					{
						id: "sec-activities-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-activities-hero",
								open: true,
								children: [
									{
										id: "col-activities-hero",
										open: true,
										elements: [
											{ id: "ele-activities-hero-badge" },
											{ id: "ele-activities-hero-heading" },
											{ id: "ele-activities-hero-sub" },
											{ id: "ele-activities-hero-cta" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-activities-stats",
						name: "Stats",
						open: true,
						children: [
							{
								id: "row-activities-stats",
								open: true,
								children: [
									{
										id: "col-activities-stats-1",
										open: true,
										elements: [{ id: "ele-activities-stat-1" }],
									},
									{
										id: "col-activities-stats-2",
										open: true,
										elements: [{ id: "ele-activities-stat-2" }],
									},
									{
										id: "col-activities-stats-3",
										open: true,
										elements: [{ id: "ele-activities-stat-3" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-activities-hero-badge": {
						type: "ct-text",
						properties: {
							text: { value: "Join 2M+ active users worldwide" }
						},
					},
					"ele-activities-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Ready. Set. Go." }
						},
					},
					"ele-activities-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Join thousands of runners in the most iconic triathlon of the year. Challenge yourself and cross the finish line!" }
						},
					},
					"ele-activities-hero-cta": {
						type: "ct-button",
						properties: {
							label: { value: "Register for your bib" }
						},
					},
					"ele-activities-stat-1": {
						type: "ct-heading",
						properties: {
							text: { value: "500K+ Annual participants" }
						},
					},
					"ele-activities-stat-2": {
						type: "ct-heading",
						properties: {
							text: { value: "45+ Countries represented" }
						},
					},
					"ele-activities-stat-3": {
						type: "ct-heading",
						properties: {
							text: { value: "4.9/5 Average rating" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-community",
		contentTypeId: "exp-landing-page",
		name: "Community",
		slug: "community",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-community-main",
				title: "Main",
				tree: [
					{
						id: "sec-community-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-community-hero",
								open: true,
								children: [
									{
										id: "col-community-hero",
										open: true,
										elements: [
											{ id: "ele-community-hero-heading" },
											{ id: "ele-community-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-community-testimonials",
						name: "Testimonials",
						open: true,
						children: [
							{
								id: "row-community-testimonials",
								open: true,
								children: [
									{
										id: "col-community-test-1",
										open: true,
										elements: [{ id: "ele-community-test-1" }],
									},
									{
										id: "col-community-test-2",
										open: true,
										elements: [{ id: "ele-community-test-2" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-community-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Join millions of active users" }
						},
					},
					"ele-community-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Connect, compete, and get motivated by our global community of fitness enthusiasts." }
						},
					},
					"ele-community-test-1": {
						type: "ct-text",
						properties: {
							text: { value: "Sarah M.: Amazing run through Central Park this morning! The GPS tracking was spot-on." }
						},
					},
					"ele-community-test-2": {
						type: "ct-text",
						properties: {
							text: { value: "Mike R.: Crushed my half-marathon goal! The community challenges really pushed me." }
						},
					},
				},
			},
		],
	},

	{
		id: "page-challenges",
		contentTypeId: "exp-landing-page",
		name: "Challenges",
		slug: "challenges",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-challenges-main",
				title: "Main",
				tree: [
					{
						id: "sec-challenges-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-challenges-hero",
								open: true,
								children: [
									{
										id: "col-challenges-hero",
										open: true,
										elements: [
											{ id: "ele-challenges-hero-heading" },
											{ id: "ele-challenges-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-challenges-list",
						name: "Active Challenges",
						open: true,
						children: [
							{
								id: "row-challenges-list",
								open: true,
								children: [
									{
										id: "col-challenge-1",
										open: true,
										elements: [{ id: "ele-challenge-1" }],
									},
									{
										id: "col-challenge-2",
										open: true,
										elements: [{ id: "ele-challenge-2" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-challenges-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Push your limits" }
						},
					},
					"ele-challenges-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Join exciting challenges and compete with users worldwide to reach new fitness milestones." }
						},
					},
					"ele-challenge-1": {
						type: "ct-heading",
						properties: {
							text: { value: "October Run Streak" }
						},
					},
					"ele-challenge-2": {
						type: "ct-heading",
						properties: {
							text: { value: "100 Mile Challenge" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-pricing",
		contentTypeId: "exp-landing-page",
		name: "Pricing",
		slug: "pricing",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-pricing-main",
				title: "Main",
				tree: [
					{
						id: "sec-pricing-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-pricing-hero",
								open: true,
								children: [
									{
										id: "col-pricing-hero",
										open: true,
										elements: [
											{ id: "ele-pricing-hero-heading" },
											{ id: "ele-pricing-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-pricing-plans",
						name: "Plans",
						open: true,
						children: [
							{
								id: "row-pricing-plans",
								open: true,
								children: [
									{
										id: "col-plan-free",
										open: true,
										elements: [{ id: "ele-plan-free" }],
									},
									{
										id: "col-plan-pro",
										open: true,
										elements: [{ id: "ele-plan-pro" }],
									},
									{
										id: "col-plan-team",
										open: true,
										elements: [{ id: "ele-plan-team" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-pricing-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Choose your plan" }
						},
					},
					"ele-pricing-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "Select the perfect plan for your fitness journey. Upgrade or downgrade anytime." }
						},
					},
					"ele-plan-free": {
						type: "ct-heading",
						properties: {
							text: { value: "Free - $0" }
						},
					},
					"ele-plan-pro": {
						type: "ct-heading",
						properties: {
							text: { value: "Pro - $9.99/mo" }
						},
					},
					"ele-plan-team": {
						type: "ct-heading",
						properties: {
							text: { value: "Team - $24.99/mo" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-stories",
		contentTypeId: "exp-landing-page",
		name: "Stories",
		slug: "stories",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-stories-main",
				title: "Main",
				tree: [
					{
						id: "sec-stories-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-stories-hero",
								open: true,
								children: [
									{
										id: "col-stories-hero",
										open: true,
										elements: [
											{ id: "ele-stories-hero-heading" },
											{ id: "ele-stories-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-stories-list",
						name: "Success Stories",
						open: true,
						children: [
							{
								id: "row-stories-list",
								open: true,
								children: [
									{
										id: "col-story-1",
										open: true,
										elements: [{ id: "ele-story-1" }],
									},
									{
										id: "col-story-2",
										open: true,
										elements: [{ id: "ele-story-2" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-stories-hero-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Real results from real people" }
						},
					},
					"ele-stories-hero-sub": {
						type: "ct-text",
						properties: {
							text: { value: "See how STRIDE has transformed the fitness journeys of our amazing community members." }
						},
					},
					"ele-story-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Jessica T.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "STRIDE helped me train for my first marathon. The personalized plans kept me motivated!" },
											],
										},
									],
								}
							}
						},
					},
					"ele-story-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
								value: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{ type: "text", text: "Marcus R.: ", marks: [{ type: "bold" }] },
												{ type: "text", text: "The analytics features are incredible. Being able to track my performance across swimming, cycling, and running has helped me identify areas for improvement." },
											],
										},
									],
								}
							}
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-31",
		contentTypeId: "exp-landing-page",
		name: "Cycle Computer Pro",
		slug: "products/cycle-computer-pro",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-31-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-31-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-31-hero",
								open: true,
								children: [
									{
										id: "col-prod-31-hero",
										open: true,
										elements: [
											{ id: "ele-prod-31-img" },
											{ id: "ele-prod-31-heading" },
											{ id: "ele-prod-31-price" },
											{ id: "ele-prod-31-desc" },
											{ id: "ele-prod-31-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-31-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling1/400/300" },
							alt: { value: "Cycle Computer Pro" }
						},
					},
					"ele-prod-31-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Cycle Computer Pro" }
						},
					},
					"ele-prod-31-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$199.00" }
						},
					},
					"ele-prod-31-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Advanced GPS cycling computer with performance tracking and navigation." }
						},
					},
					"ele-prod-31-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-32",
		contentTypeId: "exp-landing-page",
		name: "HR Monitor Band",
		slug: "products/hr-monitor-band",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-32-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-32-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-32-hero",
								open: true,
								children: [
									{
										id: "col-prod-32-hero",
										open: true,
										elements: [
											{ id: "ele-prod-32-img" },
											{ id: "ele-prod-32-heading" },
											{ id: "ele-prod-32-price" },
											{ id: "ele-prod-32-desc" },
											{ id: "ele-prod-32-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-32-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling3/400/300" },
							alt: { value: "HR Monitor Band" }
						},
					},
					"ele-prod-32-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "HR Monitor Band" }
						},
					},
					"ele-prod-32-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$79.00" }
						},
					},
					"ele-prod-32-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Precision heart rate monitoring for your most intense workouts." }
						},
					},
					"ele-prod-32-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-33",
		contentTypeId: "exp-landing-page",
		name: "Smart Bike Trainer",
		slug: "products/smart-bike-trainer",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-33-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-33-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-33-hero",
								open: true,
								children: [
									{
										id: "col-prod-33-hero",
										open: true,
										elements: [
											{ id: "ele-prod-33-img" },
											{ id: "ele-prod-33-heading" },
											{ id: "ele-prod-33-price" },
											{ id: "ele-prod-33-desc" },
											{ id: "ele-prod-33-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-33-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling2/400/300" },
							alt: { value: "Smart Bike Trainer" }
						},
					},
					"ele-prod-33-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Smart Bike Trainer" }
						},
					},
					"ele-prod-33-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$599.00" }
						},
					},
					"ele-prod-33-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Transform your bike into a powerful indoor training machine." }
						},
					},
					"ele-prod-33-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-34",
		contentTypeId: "exp-landing-page",
		name: "Cadence Sensor",
		slug: "products/cadence-sensor",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-34-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-34-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-34-hero",
								open: true,
								children: [
									{
										id: "col-prod-34-hero",
										open: true,
										elements: [
											{ id: "ele-prod-34-img" },
											{ id: "ele-prod-34-heading" },
											{ id: "ele-prod-34-price" },
											{ id: "ele-prod-34-desc" },
											{ id: "ele-prod-34-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-34-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling4/400/300" },
							alt: { value: "Cadence Sensor" }
						},
					},
					"ele-prod-34-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Cadence Sensor" }
						},
					},
					"ele-prod-34-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$39.00" }
						},
					},
					"ele-prod-34-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Track your pedaling cadence with precision and ease." }
						},
					},
					"ele-prod-34-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-35",
		contentTypeId: "exp-landing-page",
		name: "Power Meter",
		slug: "products/power-meter",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-35-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-35-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-35-hero",
								open: true,
								children: [
									{
										id: "col-prod-35-hero",
										open: true,
										elements: [
											{ id: "ele-prod-35-img" },
											{ id: "ele-prod-35-heading" },
											{ id: "ele-prod-35-price" },
											{ id: "ele-prod-35-desc" },
											{ id: "ele-prod-35-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-35-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling8/400/300" },
							alt: { value: "Power Meter" }
						},
					},
					"ele-prod-35-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Power Meter" }
						},
					},
					"ele-prod-35-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$449.00" }
						},
					},
					"ele-prod-35-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Measure your power output and optimize your cycling performance." }
						},
					},
					"ele-prod-35-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-36",
		contentTypeId: "exp-landing-page",
		name: "Speed Sensor",
		slug: "products/speed-sensor",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-36-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-36-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-36-hero",
								open: true,
								children: [
									{
										id: "col-prod-36-hero",
										open: true,
										elements: [
											{ id: "ele-prod-36-img" },
											{ id: "ele-prod-36-heading" },
											{ id: "ele-prod-36-price" },
											{ id: "ele-prod-36-desc" },
											{ id: "ele-prod-36-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-36-img": {
						type: "ct-image",
						properties: {
							src: { value: "https://picsum.photos/seed/cycling9/400/300" },
							alt: { value: "Speed Sensor" }
						},
					},
					"ele-prod-36-heading": {
						type: "ct-heading",
						properties: {
							text: { value: "Speed Sensor" }
						},
					},
					"ele-prod-36-price": {
						type: "ct-heading",
						properties: {
							text: { value: "$39.00" }
						},
					},
					"ele-prod-36-desc": {
						type: "ct-text",
						properties: {
							text: { value: "Accurate speed tracking for your outdoor and indoor rides." }
						},
					},
					"ele-prod-36-buy": {
						type: "ct-button",
						properties: {
							label: { value: "Add to Cart" }
						},
					},
				},
			},
		],
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
	tags: string[];      // array of tag slugs
	categories: string[]; // array of category slugs
}

const reportNames = [
	"Alice Johnson",
	"Bob Smith",
	"Carol Williams",
	"David Brown",
	"Maria Garcia",
	"Sarah Chen",
	"Marcus Johnson",
	"Alex Rivera",
	"Emily Brown",
	"James Wilson",
	"Lisa Anderson",
	"David Kim",
	"Michelle Taylor",
	"Robert Garcia",
	"Jessica Moore",
	"Chris Lee",
	"Patricia White",
	"Kevin Davis",
	"Jennifer Martin",
	"Thomas Brown",
	"Steven Clark",
	"Nancy Rodriguez",
	"Daniel Lewis",
];

const getRandomName = (id: string) => {
	const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return reportNames[hash % reportNames.length];
};

export const initialOtherContent: UnifiedContentItem[] = [
	{
		id: "3",
		name: "Heart Rate Monitor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("3"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: ["fitness-tracking", "cardio-workout"],
		categories: ["equipment"],
	},
	{
		id: "5",
		name: "Pricing Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("5"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "9",
		name: "Cycling Hero - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("9"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: ["cycling-training", "road-cycling"],
		categories: ["media"],
	},
	{
		id: "13",
		name: "Route Planning Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Draft",
		workflowStatus: "in-review",
		modifiedBy: getRandomName("13"),
		language: "en",
		lastModified: "Jan 8, 2025",
		tags: ["outdoor-training", "cycling-training"],
		categories: ["features"],
	},
	{
		id: "26",
		name: "Leaderboards Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("26"),
		language: "en",
		lastModified: "Dec 26, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "31",
		name: "Cycle Computer Pro - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("31"),
		language: "en",
		lastModified: "Dec 21, 2024",
		tags: ["cycling-training", "cycling-performance", "fitness-tracking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "32",
		name: "HR Monitor Band - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("32"),
		language: "en",
		lastModified: "Dec 20, 2024",
		tags: ["fitness-tracking", "cardio-workout"],
		categories: ["equipment"],
	},
	{
		id: "33",
		name: "Smart Bike Trainer - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("33"),
		language: "en",
		lastModified: "Dec 19, 2024",
		tags: ["indoor-training", "cycling-training", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "34",
		name: "Cadence Sensor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("34"),
		language: "en",
		lastModified: "Dec 18, 2024",
		tags: ["cycling-training", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "35",
		name: "Power Meter - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("35"),
		language: "en",
		lastModified: "Dec 17, 2024",
		tags: ["cycling-training", "cycling-performance", "endurance-training"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "36",
		name: "Speed Sensor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("36"),
		language: "en",
		lastModified: "Dec 16, 2024",
		tags: ["cycling-training", "fitness-tracking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "37",
		name: "Aero Helmet - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("37"),
		language: "en",
		lastModified: "Dec 15, 2024",
		tags: ["road-cycling", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "38",
		name: "Bike Lights - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("38"),
		language: "en",
		lastModified: "Dec 14, 2024",
		tags: ["road-cycling", "mountain-biking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "39",
		name: "Water Bottle Holder - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("39"),
		language: "en",
		lastModified: "Dec 13, 2024",
		tags: ["cycling-training"],
		categories: ["equipment"],
	},
	{
		id: "40",
		name: "Repair Tool Kit - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("40"),
		language: "en",
		lastModified: "Dec 12, 2024",
		tags: ["road-cycling", "mountain-biking"],
		categories: ["equipment"],
	},
	{
		id: "41",
		name: "Weekly Challenge Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("41"),
		language: "en",
		lastModified: "Dec 11, 2024",
		tags: ["fitness-tracking", "exercise-routine"],
		categories: ["features"],
	},
	{
		id: "42",
		name: "Achievement Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("42"),
		language: "en",
		lastModified: "Dec 10, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "43",
		name: "Social Feed Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("43"),
		language: "en",
		lastModified: "Dec 9, 2024",
		tags: [],
		categories: ["features"],
	},
	{
		id: "44",
		name: "Leaderboard Widget Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("44"),
		language: "en",
		lastModified: "Dec 8, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "45",
		name: "Stats Summary Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("45"),
		language: "en",
		lastModified: "Dec 7, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "46",
		name: "Upcoming Events Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("46"),
		language: "en",
		lastModified: "Dec 6, 2024",
		tags: [],
		categories: ["features"],
	},
	{
		id: "47",
		name: "Testimonial Carousel Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("47"),
		language: "en",
		lastModified: "Dec 5, 2024",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "48",
		name: "Payment Plans Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("48"),
		language: "en",
		lastModified: "Dec 4, 2024",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "49",
		name: "Mountain Pass Scenery - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("49"),
		language: "en",
		lastModified: "Dec 3, 2024",
		tags: ["mountain-biking", "outdoor-training"],
		categories: ["media"],
	},
	{
		id: "50",
		name: "Pro Cyclist In Action - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("50"),
		language: "en",
		lastModified: "Dec 2, 2024",
		tags: ["road-cycling", "cycling-performance"],
		categories: ["media"],
	},
];

// Sample tag/category assignments for pages based on content type
const getPageTagsAndCategories = (pageId: string, contentTypeId: string): { tags: string[], categories: string[] } => {
	// Map some pages to specific tags for demo purposes
	const pageTagMap: Record<string, string[]> = {
		"page-site-home": ["spring-reset", "fitness-tracking"],
		"page-site-about": [],
		"page-site-contact": [],
		"page-site-blog": ["exercise-routine"],
		"page-site-products": ["cycling-training"],
		"page-site-product-a": ["cycling-performance", "road-cycling"],
		"page-exp-landing-default": ["spring-reset", "summer-shred", "fitness-tracking"],
		"page-site-blog-post-1": ["exercise-routine", "endurance-training"],
		"page-site-blog-post-2": ["sprint-training", "exercise-routine"],
		"page-site-blog-post-3": ["outdoor-training"],
		"page-site-blog-post-4": ["road-cycling", "cycling-training"],
		"page-activities": ["outdoor-training", "fitness-tracking"],
		"page-community": ["fitness-tracking"],
		"page-challenges": ["exercise-routine", "fitness-tracking"],
		"page-pricing": [],
		"page-stories": ["fitness-tracking"],
		"page-product-31": ["cycling-training", "cycling-performance", "fitness-tracking"],
		"page-product-32": ["fitness-tracking", "cardio-workout"],
		"page-product-33": ["indoor-training", "cycling-training"],
		"page-product-34": ["cycling-training", "cycling-performance"],
		"page-product-35": ["cycling-training", "endurance-training"],
		"page-product-36": ["cycling-training", "fitness-tracking"],
	};

	const pageCategoryMap: Record<string, string[]> = {
		"page-site-home": ["marketing"],
		"page-site-about": ["company"],
		"page-site-contact": ["company"],
		"page-site-blog": ["content"],
		"page-site-products": ["products"],
		"page-site-product-a": ["products"],
		"page-exp-landing-default": ["marketing"],
		"page-site-blog-post-1": ["content", "training"],
		"page-site-blog-post-2": ["content", "training"],
		"page-site-blog-post-3": ["content"],
		"page-site-blog-post-4": ["content", "products"],
		"page-activities": ["features"],
		"page-community": ["features"],
		"page-challenges": ["features"],
		"page-pricing": ["marketing"],
		"page-stories": ["marketing"],
		"page-product-31": ["products", "cycling"],
		"page-product-32": ["products"],
		"page-product-33": ["products", "cycling"],
		"page-product-34": ["products", "cycling"],
		"page-product-35": ["products", "cycling"],
		"page-product-36": ["products", "cycling"],
	};

	return {
		tags: pageTagMap[pageId] || [],
		categories: pageCategoryMap[pageId] || [],
	};
};

export const getAllContentItems = (pages: Page[] = initialPages): UnifiedContentItem[] => {
	const pageItems: UnifiedContentItem[] = pages.map((p) => {
		const ct = initialContentTypes.find((c) => c.id === p.contentTypeId);
		const date = new Date(p.lastModified);
		const formattedDate = date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		const { tags, categories } = getPageTagsAndCategories(p.id, p.contentTypeId);

		return {
			id: p.id,
			name: p.name,
			baseType: ct?.baseType || "Page",
			contentTypeId: p.contentTypeId,
			publishStatus: p.status === "Published" ? "Published" : "Draft",
			workflowStatus: p.status === "Published" ? "approved" : "draft",
			modifiedBy: getRandomName(p.id),
			language: "en",
			lastModified: formattedDate,
			tags,
			categories,
		};
	});
	return [...pageItems, ...initialOtherContent];
};




export const siteConfig = {
	header: {
		logo: "STRIDE",
		links: [
			{ label: "Activities", href: "/activities" },
			{ label: "Community", href: "/community" },
			{ label: "Challenges", href: "/challenges" },
			{ label: "Pricing", href: "/pricing" },
			{ label: "Stories", href: "/stories" },
		],
		auth: {
			signIn: "Sign In",
			cta: "Get Started",
		},
	},
};

// Initial Tags
export const initialTags = [
	{
		id: 'tag-1',
		name: 'Spring Reset',
		slug: 'spring-reset',
		visibility: 'private' as const,
		modifiedBy: 'Tien Le',
		usage: 85,
		lastModified: 'Jan 11, 2025',
	},
	{
		id: 'tag-2',
		name: 'Summer Shred',
		slug: 'summer-shred',
		visibility: 'private' as const,
		modifiedBy: 'Sofia Kim',
		usage: 90,
		lastModified: 'Feb 15, 2025',
	},
	{
		id: 'tag-3',
		name: 'Beach Body',
		slug: 'beach-body',
		visibility: 'public' as const,
		modifiedBy: 'Amir Patel',
		usage: 78,
		lastModified: 'Mar 1, 2025',
	},
	{
		id: 'tag-4',
		name: 'Outdoor Training',
		slug: 'outdoor-training',
		visibility: 'private' as const,
		modifiedBy: 'Lara Chen',
		usage: 88,
		lastModified: 'Mar 20, 2025',
	},
	{
		id: 'tag-5',
		name: 'Back to Fitness',
		slug: 'back-to-fitness',
		visibility: 'public' as const,
		modifiedBy: 'Raj Singh',
		usage: 83,
		lastModified: 'Apr 5, 2025',
	},
	{
		id: 'tag-6',
		name: 'Fall Focus',
		slug: 'fall-focus',
		visibility: 'public' as const,
		modifiedBy: 'Emma Brown',
		usage: 95,
		lastModified: 'Apr 22, 2025',
	},
	{
		id: 'tag-7',
		name: 'Routine Reboot',
		slug: 'routine-reboot',
		visibility: 'private' as const,
		modifiedBy: 'David Lee',
		usage: 80,
		lastModified: 'May 10, 2025',
	},
	{
		id: 'tag-8',
		name: 'Holiday Hustle',
		slug: 'holiday-hustle',
		visibility: 'public' as const,
		modifiedBy: 'Nina Roberts',
		usage: 89,
		lastModified: 'May 30, 2025',
	},
	{
		id: 'tag-9',
		name: 'New Year Reset',
		slug: 'new-year-reset',
		visibility: 'private' as const,
		modifiedBy: 'Tom Green',
		usage: 92,
		lastModified: 'Jun 15, 2025',
	},
	{
		id: 'tag-10',
		name: 'Resolution Challenge',
		slug: 'resolution-challenge',
		visibility: 'public' as const,
		modifiedBy: 'Hannah White',
		usage: 87,
		lastModified: 'Jul 1, 2025',
	},
	{
		id: 'tag-11',
		name: 'Festive Fitness',
		slug: 'festive-fitness',
		visibility: 'private' as const,
		modifiedBy: 'Jake Wilson',
		usage: 91,
		lastModified: 'Jul 20, 2025',
	},
	{
		id: 'tag-12',
		name: 'Cycling Training',
		slug: 'cycling-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 15,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-13',
		name: 'Cycling Performance',
		slug: 'cycling-performance',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 12,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-14',
		name: 'Exercise Routine',
		slug: 'exercise-routine',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 20,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-15',
		name: 'Cardio Workout',
		slug: 'cardio-workout',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 18,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-16',
		name: 'Mountain Biking',
		slug: 'mountain-biking',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 10,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-17',
		name: 'Road Cycling',
		slug: 'road-cycling',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 14,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-18',
		name: 'Indoor Training',
		slug: 'indoor-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 16,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-19',
		name: 'Fitness Tracking',
		slug: 'fitness-tracking',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 22,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-20',
		name: 'Endurance Training',
		slug: 'endurance-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 13,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-21',
		name: 'Sprint Training',
		slug: 'sprint-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 11,
		lastModified: 'Jan 28, 2026',
	},
];

// Initial Categories
export const initialCategories = [
	{
		id: 'cat-1',
		name: 'Equipment',
		slug: 'equipment',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Alice Johnson',
		usage: 18,
		lastModified: 'Jan 15, 2025',
		parentId: null,
		isExpanded: true,
	},
	{
		id: 'cat-2',
		name: 'Cycling',
		slug: 'cycling',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Bob Smith',
		usage: 14,
		lastModified: 'Jan 14, 2025',
		parentId: null,
		isExpanded: true,
	},
	{
		id: 'cat-3',
		name: 'Features',
		slug: 'features',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Carol Williams',
		usage: 12,
		lastModified: 'Jan 13, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-4',
		name: 'Marketing',
		slug: 'marketing',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'David Brown',
		usage: 8,
		lastModified: 'Jan 12, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-5',
		name: 'Content',
		slug: 'content',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Emma Wilson',
		usage: 6,
		lastModified: 'Jan 11, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-6',
		name: 'Training',
		slug: 'training',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Frank Miller',
		usage: 4,
		lastModified: 'Jan 10, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-7',
		name: 'Products',
		slug: 'products',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Grace Lee',
		usage: 10,
		lastModified: 'Jan 9, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-8',
		name: 'Media',
		slug: 'media',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Henry Chen',
		usage: 5,
		lastModified: 'Jan 8, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-9',
		name: 'Company',
		slug: 'company',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Ivy Park',
		usage: 2,
		lastModified: 'Jan 7, 2025',
		parentId: null,
		isExpanded: false,
	},
];
