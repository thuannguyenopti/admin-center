// Mock data for the DAM Library Dashboard tab (Figma "Account Information" board,
// Library — Master node 4464:46730). Illustrative only — this prototype has no real
// analytics pipeline, so values are shaped to read as plausible, not pulled from anywhere.

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export interface LineChartSpec {
	title: string;
	author: string;
	seriesLabels: string[];
	series: number[][];
	annotation?: { monthIndex: number; label: string };
}

export interface BarChartSpec {
	title: string;
	author: string;
	seriesLabels: string[];
	values: number[];
}

export interface StatSpec {
	value: string;
	label: string;
	info?: string;
}

export const TOP_STATS: StatSpec[] = [
	{ value: "698,332", label: "Asset Views", info: "Total asset views across the account." },
	{ value: "23,344", label: "Asset Downloads", info: "Total asset downloads across the account." },
	{ value: "49", label: "Asset Uploads", info: "New assets uploaded this period." },
	{ value: "6", label: "Asset Deletions", info: "Assets deleted this period." },
];

export const VIEWS_VS_DOWNLOADS: LineChartSpec = {
	title: "View vs Downloads",
	author: "XYZ",
	seriesLabels: ["Views", "Downloads"],
	series: [
		[450, 520, 480, 600, 550, 500],
		[2800, 2400, 1900, 1600, 2000, 2600],
	],
};

export const UPLOADS_VS_DELETIONS: LineChartSpec = {
	title: "Uploads vs Deletions",
	author: "XYZ",
	seriesLabels: ["Uploads", "Deletions"],
	series: [
		[500, 480, 550, 520, 490, 530],
		[2600, 2200, 1800, 1500, 2100, 2900],
	],
};

export const MID_STATS: StatSpec[] = [
	{ value: "156", label: "Asset Views" },
	{ value: "23", label: "Asset Downloads" },
	{ value: "89", label: "Asset Views" },
	{ value: "14", label: "Asset Downloads" },
];

export const ASSETS_BY_CUSTOMER_FIELDS: BarChartSpec = {
	title: "Assets by Customer Fields #1234",
	author: "XYZ",
	seriesLabels: ["Field #1", "Field #2", "Field #3"],
	values: [55, 78, 62],
};

export const TOP_VIEWED_COLLECTIONS: BarChartSpec = {
	title: "Top Viewed Collections",
	author: "XYZ",
	seriesLabels: ["Field #1", "Field #2", "Field #3"],
	values: [48, 75, 58],
};

export const BOTTOM_STATS: StatSpec[] = [
	{ value: "0", label: "Styleguide Views" },
	{ value: "0", label: "Styleguide Shares" },
	{ value: "123 GB", label: "Searches", info: "Total storage used by indexed search content." },
];

export const USER_CREATED_VS_LOGINS: LineChartSpec = {
	title: "User Created vs User Logins",
	author: "XYZ",
	seriesLabels: ["Views", "Downloads", "Unique Downloads"],
	series: [
		[6, 5, 6, 5, 6, 5],
		[5, 4, 5, 4, 5, 4],
		[3, 4, 3, 4, 3, 3],
	],
	annotation: { monthIndex: 3, label: "Average: 88%" },
};

export const ARCHIVES_VS_SHARES: LineChartSpec = {
	title: "Archives vs Shares",
	author: "XYZ",
	seriesLabels: ["Views", "Downloads", "Unique Downloads"],
	series: [
		[40, 35, 42, 38, 44, 40],
		[35, 30, 33, 32, 36, 34],
		[25, 28, 24, 27, 25, 26],
	],
	annotation: { monthIndex: 3, label: "Average: 88%" },
};
