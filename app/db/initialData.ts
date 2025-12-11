export type Algorithm = {
	id: string;
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
	type?: "Search" | "Custom";
};

export type BestBet = {
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

export type AlgorithmBestBetReference = {
	bestBetId: string;
	status: "Active" | "Inactive";
};

export type AlgorithmBestBet = BestBet & {
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

export const initialBestBets: BestBet[] = [
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

export type PageType = {
	id: string;
	name: string;
	parentId: string | null;
	status: "Published" | "Draft" | "Review" | "Changed";
	lastModified: string;
	contentTypeId: string;
	slug?: string;
	data: Record<string, any>;
	content?: any;
};

export const initialPages: PageType[] = [
	{
		id: "page-blog-1",
		name: "Welcome to Our Blog",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-20",
		contentTypeId: "ct-blog-post",
		slug: "blog/welcome",
		data: {
			title: "Welcome to Our Blog",
			subtitle: "Thoughts, news and updates",
			body: "<p>This is the first blog post. Welcome!</p>",
			author: "1",
		},
	},
	{
		id: "page-about-1",
		name: "About Us",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-18",
		contentTypeId: "ct-about-page",
		slug: "about",
		data: {
			title: "About Stride",
			about: "<p>Stride is a company focused on building delightful shopping experiences.</p>",
			history: "Started in 2019 as a small team...",
			orgAddress: "123 Stride Way, Portland, OR, 97201",
		},
	},

	// Additional sample blog posts (sports related)
	{
		id: "page-blog-2",
		name: "Marathon Training Basics",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-15",
		contentTypeId: "ct-blog-post",
		slug: "blog/marathon-training-basics",
		data: {
			title: "Marathon Training Basics",
			subtitle: "How to prepare for your first 26.2 miles",
			body: "<p>Start with a solid base, progressively increase mileage, and prioritise recovery.</p>",
			author: "2",
		},
	},
	{
		id: "page-blog-3",
		name: "Mountain Biking the Grand Canyon",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-10",
		contentTypeId: "ct-blog-post",
		slug: "blog/grand-canyon-mountain-bike",
		data: {
			title: "Mountain Biking the Grand Canyon",
			subtitle: "A guide to routes, gear, and safety",
			body: "<p>The Grand Canyon offers epic descents — bring technical skills, hydration, and respect for the environment.</p>",
			author: "3",
		},
	},
	{
		id: "page-blog-4",
		name: "High Jump Competition Tips",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-05",
		contentTypeId: "ct-blog-post",
		slug: "blog/high-jump-competition-tips",
		data: {
			title: "High Jump Competition Tips",
			subtitle: "Improve your approach and clearance",
			body: "<p>Work on speed-to-bar rhythm, take-off mechanics, and consistent landing drills to boost clearance.</p>",
			author: "1",
		},
	},
	{
		id: "page-blog-5",
		name: "Essential Trail Running Skills",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-01",
		contentTypeId: "ct-blog-post",
		slug: "blog/trail-running-skills",
		data: {
			title: "Essential Trail Running Skills",
			subtitle: "Downhill technique, footing and pacing",
			body: "<p>Focus on shorter, quicker steps downhill, look ahead for line choices, and build ankle strength.</p>",
			author: "4",
		},
	},
	{
		id: "page-blog-6",
		name: "Triathlon Training: Swim, Bike, Run",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-28",
		contentTypeId: "ct-blog-post",
		slug: "blog/triathlon-swim-bike-run-plan",
		data: {
			title: "Triathlon Training: Swim, Bike, Run",
			subtitle: "Balancing three disciplines without overtraining",
			body: "<p>Use block sessions, prioritise weaker disciplines, and keep consistent brick workouts to adapt to race demands.</p>",
			author: "2",
		},
	},
	{
		id: "page-blog-7",
		name: "Preparing for a Rowing Regatta",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-25",
		contentTypeId: "ct-blog-post",
		slug: "blog/rowing-regatta-prep",
		data: {
			title: "Preparing for a Rowing Regatta",
			subtitle: "Race day routines and crew coordination",
			body: "<p>Sync your cadence, practise race starts, and refine cox/crew calls during head-to-head pieces.</p>",
			author: "3",
		},
	},
	{
		id: "page-blog-8",
		name: "Soccer Tactics: Pressing and Possession",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-20",
		contentTypeId: "ct-blog-post",
		slug: "blog/soccer-tactics-overview",
		data: {
			title: "Soccer Tactics: Pressing and Possession",
			subtitle: "When to press high and when to control possession",
			body: "<p>Pressing traps opponents but requires fitness; possession gains control — mix both depending on match context.</p>",
			author: "1",
		},
	},
	{
		id: "page-blog-9",
		name: "Rock Climbing for Beginners",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-15",
		contentTypeId: "ct-blog-post",
		slug: "blog/rock-climbing-beginners",
		data: {
			title: "Rock Climbing for Beginners",
			subtitle: "Technique, gear, and safety essentials",
			body: "<p>Learn footwork, efficient movement, and proper belaying before pushing grades outdoors.</p>",
			author: "4",
		},
	},
	{
		id: "page-blog-10",
		name: "Open Water Swimming Tips",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-10",
		contentTypeId: "ct-blog-post",
		slug: "blog/open-water-swimming-tips",
		data: {
			title: "Open Water Swimming Tips",
			subtitle: "Sighting, drafting and race strategies",
			body: "<p>Practice sighting, warm up properly, and draft when possible to save energy on long swims.</p>",
			author: "2",
		},
	},
	{
		id: "page-blog-11",
		name: "Cycling Nutrition for Endurance Rides",
		parentId: null,
		status: "Published",
		lastModified: "2023-09-05",
		contentTypeId: "ct-blog-post",
		slug: "blog/ultra-running-nutrition",
		data: {
			title: "Ultra Running Nutrition Essentials",
			subtitle: "Fueling strategies for 50km+ events",
			body: "<p>Test fueling plans in training, use a mix of solids and gels, and adapt to GI tolerance on long efforts.</p>",
			author: "3",
		},
	},
];


export const initialPages2: PageType[] = [
	{
		id: "1",
		name: "Homepage",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
		data: {},
		content: [
			{
				id: "section-1",
				open: true,
				children: [
					{
						id: "row-1",
						open: true,
						children: [
							{
								id: "col-1",
								open: true,
								children: [
									{
										id: "ele-1",
										type: "Heading",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Unleash Your Potential",
											},
										],
									},
									{
										id: "ele-2",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Premium athletic wear for the modern runner.",
											},
										],
									},
									{
										id: "ele-101",
										type: "Button",
										props: [{ type: "text", label: "Label", value: "Shop Now" }],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "2",
		name: "About Us",
		parentId: null,
		status: "Draft",
		lastModified: "2023-10-26",
		content: [
			{
				id: "section-2",
				open: true,
				children: [
					{
						id: "row-2",
						open: true,
						children: [
							{
								id: "col-2",
								open: true,
								children: [
									{
										id: "ele-3",
										type: "Heading",
										props: [{ type: "text", label: "Text", value: "Our Story" }],
									},
									{
										id: "ele-4",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Born on the track, designed for the street. Stride empowers athletes everywhere.",
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "3",
		name: "Contact",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-25",
		content: [
			{
				id: "section-3",
				open: true,
				children: [
					{
						id: "row-3",
						open: true,
						children: [
							{
								id: "col-3",
								open: true,
								children: [
									{
										id: "ele-5",
										type: "Heading",
										props: [
											{ type: "text", label: "Text", value: "Get in Touch" },
										],
									},
									{
										id: "ele-6",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Questions about your order? We're here to help.",
											},
										],
									},
									{
										id: "ele-7",
										type: "Input",
										props: [
											{ type: "text", label: "Label", value: "Name" },
											{
												type: "text",
												label: "Placeholder",
												value: "Your Name",
											},
										],
									},
									{
										id: "ele-8",
										type: "Input",
										props: [
											{ type: "text", label: "Label", value: "Email" },
											{
												type: "text",
												label: "Placeholder",
												value: "you@example.com",
											},
										],
									},
									{
										id: "ele-9",
										type: "Button",
										props: [
											{ type: "text", label: "Label", value: "Send Message" },
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "4",
		name: "Blog",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-24",
		content: [
			{
				id: "section-4",
				open: true,
				children: [
					{
						id: "row-4",
						open: true,
						children: [
							{
								id: "col-4",
								open: true,
								children: [
									{
										id: "ele-10",
										type: "Heading",
										props: [
											{ type: "text", label: "Text", value: "The Stride Blog" },
										],
									},
									{
										id: "ele-11",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Tips, training guides, and gear reviews.",
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "5",
		name: "Blog Post 1",
		parentId: "4",
		status: "Published",
		lastModified: "2023-10-24",
		content: [
			{
				id: "section-5",
				open: true,
				children: [
					{
						id: "row-5",
						open: true,
						children: [
							{
								id: "col-5",
								open: true,
								children: [
									{
										id: "ele-12",
										type: "Heading",
										props: [
											{
												type: "text",
												label: "Text",
												value: "5 Tips for Your First Marathon",
											},
										],
									},
									{
										id: "ele-13",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Training for 26.2 miles starts with a single step. Here is how to prepare.",
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "6",
		name: "Products",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-23",
		content: [
			{
				id: "section-6",
				open: true,
				children: [
					{
						id: "row-6",
						open: true,
						children: [
							{
								id: "col-6",
								open: true,
								children: [
									{
										id: "ele-14",
										type: "Heading",
										props: [
											{ type: "text", label: "Text", value: "New Arrivals" },
										],
									},
									{
										id: "ele-15",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Check out the latest gear for this season.",
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "7",
		name: "Product A",
		parentId: "6",
		status: "Review",
		lastModified: "2023-10-23",
		content: [
			{
				id: "section-7",
				open: true,
				children: [
					{
						id: "row-7",
						open: true,
						children: [
							{
								id: "col-7",
								open: true,
								children: [
									{
										id: "ele-16",
										type: "Heading",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Stride Elite Runner",
											},
										],
									},
									{
										id: "ele-17",
										type: "Text",
										props: [
											{
												type: "text",
												label: "Text",
												value: "Our most advanced running shoe yet. Lightweight, responsive, and durable.",
											},
										],
									},
									{
										id: "ele-18",
										type: "Button",
										props: [
											{ type: "text", label: "Label", value: "Add to Cart" },
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
];
