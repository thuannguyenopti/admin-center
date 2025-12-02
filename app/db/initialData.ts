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
	status: "Active" | "Inactive";
	owner: string;
};

export const initialAlgorithms: Algorithm[] = [
	{
		id: "1",
		name: "Semantic Search v2",
		publishState: "Published",
		creationDate: "2024-11-15",
		owner: "Alice Johnson",
	},
	{
		id: "2",
		name: "Product Boost Algorithm",
		publishState: "Draft",
		creationDate: "2024-11-20",
		owner: "Bob Smith",
	},
	{
		id: "3",
		name: "Category Relevance",
		publishState: "Published",
		creationDate: "2024-10-28",
		owner: "Carol Williams",
	},
	{
		id: "4",
		name: "Personalized Ranking",
		publishState: "Testing",
		creationDate: "2024-11-22",
		owner: "David Brown",
	},
	{
		id: "5",
		name: "Trending Items Boost",
		publishState: "Published",
		creationDate: "2024-09-14",
		owner: "Alice Johnson",
	},
];

export const initialBestBets: BestBet[] = [
	{
		query: "return policy",
		destination: "/help/returns",
		status: "Active",
		owner: "Support Team",
	},
	{
		query: "shipping rates",
		destination: "/help/shipping",
		status: "Active",
		owner: "Logistics",
	},
	{
		query: "gift cards",
		destination: "/shop/gift-cards",
		status: "Inactive",
		owner: "Marketing",
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
