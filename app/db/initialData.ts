export type Algorithm = {
	id: string;
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
};

export type BestBet = {
	query: string;
	destination: string;
	owner: string;
};

export type RelatedQuery = {
	query: string;
	synonyms: string[];
	owner: string;
};

export type AlgorithmBestBet = BestBet & {
	status: "Active" | "Inactive";
};

export const initialAlgorithms: Algorithm[] = [
	{
		id: "1",
		name: "Summer Sale Boost",
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
	},
	{
		id: "3",
		name: "Wearables Launch",
		publishState: "Testing",
		creationDate: "2023-11-15",
		owner: "Carol Williams",
	},
	{
		id: "4",
		name: "Holiday Gift Guide",
		publishState: "Published",
		creationDate: "2023-09-10",
		owner: "David Brown",
	},
	{
		id: "5",
		name: "Clearance Logic",
		publishState: "Archived",
		creationDate: "2023-01-20",
		owner: "Alice Johnson",
	},
];

export const initialBestBets: BestBet[] = [
	{
		query: "return policy",
		destination: "https://stride.com/help/returns",
		owner: "Support Team",
	},
	{
		query: "shipping rates",
		destination: "https://stride.com/help/shipping",
		owner: "Logistics",
	},
	{
		query: "running shoes",
		destination: "https://stride.com/products/runner-elite",
		owner: "Marketing",
	},
];

export const initialRelatedQueries: RelatedQuery[] = [
	{
		query: "sneakers",
		synonyms: ["shoes", "trainers", "kicks"],
		owner: "Merchandising",
	},
	{
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

export type Page = {
	id: string;
	name: string;
	parentId: string | null;
	status: "Published" | "Draft" | "Review" | "Changed";
	lastModified: string;
	content?: any;
};

export const initialPages: Page[] = [
	{
		id: "1",
		name: "Homepage",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
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
										props: [{type: "text", label: "Label", value: "Shop Now"}],
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
										props: [{type: "text", label: "Text", value: "Our Story"}],
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
											{type: "text", label: "Text", value: "Get in Touch"},
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
											{type: "text", label: "Label", value: "Name"},
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
											{type: "text", label: "Label", value: "Email"},
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
											{type: "text", label: "Label", value: "Send Message"},
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
											{type: "text", label: "Text", value: "The Stride Blog"},
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
											{type: "text", label: "Text", value: "New Arrivals"},
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
											{type: "text", label: "Label", value: "Add to Cart"},
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
