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
