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
	description?: string;
	properties: Property[];
};

export const initialContentTypes: ContentType[] = [
	{
		id: "ct-blog-post",
		name: "Blog Post",
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
		description: "Landing page experience with main and aside outlines",
		properties: [
			{ id: "mainOutline", name: "Main", type: "outline" },
			{ id: "asideOutline", name: "Aside", type: "outline" },
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
		contentTypeId: "",
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
		contentTypeId: "",
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
		contentTypeId: "",
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
		contentTypeId: "",
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
		id: "page-site-blog-post-1",
		name: "Blog Post 1",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2023-10-24",
		contentTypeId: "",
		data: {},
		outlines: [
			{
				id: "ol-blogpost1-main",
				title: "Main",
				tree: [
					{
						id: "sec-blogpost1-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-blogpost1-hero",
								open: true,
								children: [
									{
										id: "col-blogpost1-hero",
										open: true,
										children: [{ id: "ele-blogpost1-heading" }, { id: "ele-blogpost1-subtext" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-blogpost1-heading": {
						type: "Heading",
						props: [{ type: "text", label: "Text", value: "5 Tips for Your First Marathon" }],
					},
					"ele-blogpost1-subtext": {
						type: "Text",
						props: [
							{
								type: "text",
								label: "Text",
								value: "Training for 26.2 miles starts with a single step. Here is how to prepare.",
							},
						],
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
		contentTypeId: "",
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
		contentTypeId: "",
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
];


