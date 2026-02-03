export const webhooks = [
	{
		id: "1",
		name: "Deploy Stride Storefront",
		description: "Triggers a deploy of the main Stride e-commerce site on Vercel",
		status: "Active",
		successRate: 98,
		lastRun: "2026-01-09 10:30:00",
		url: "https://api.vercel.com/v1/integrations/deploy/...",
	},
	{
		id: "2",
		name: "Inventory Level Sync",
		description: "Syncs shoe inventory levels from ERP",
		status: "Active",
		successRate: 100,
		lastRun: "2026-01-09 11:15:00",
		url: "https://api.stride.com/webhooks/inventory",
	},
	{
		id: "3",
		name: "New Fall Collection Alert",
		description: "Notifies marketing systems when Fall collection items are published",
		status: "Inactive",
		successRate: 0,
		lastRun: "2025-11-20 14:00:00",
		url: "https://marketing.stride.com/webhooks/products",
	},
];

export const errorLogs = [
	{
		date: "Jan 11, 2024 15:50:45",
		result: "HTTP 5XX",
	},
	{
		date: "Jan 11, 2024 15:50:45",
		result: "HTTP 5XX",
	},
	{
		date: "Jan 11, 2024 15:50:45",
		result: "HTTP 5XX",
	},
	{
		date: "Jan 11, 2024 15:50:45",
		result: "HTTP 5XX",
	},
	{
		date: "Jan 11, 2024 15:50:45",
		result: "HTTP 5XX",
	},
];
