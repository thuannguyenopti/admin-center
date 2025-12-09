export type ZeroResultQuery = {
	query: string;
	frequency: number;
	lastSeen: string;
	algorithm: string;
};

export const zeroResultQueries: ZeroResultQuery[] = [
	{
		query: "kids running shoes",
		frequency: 145,
		lastSeen: "2025-12-05 09:15",
		algorithm: "Summer Sale Boost",
	},
	{
		query: "yoga mat",
		frequency: 89,
		lastSeen: "2025-12-04 16:20",
		algorithm: "Cycling Gear Optimization",
	},
	{
		query: "gift card",
		frequency: 76,
		lastSeen: "2025-12-05 11:05",
		algorithm: "Wearables Launch",
	},
	{
		query: "swimming goggles",
		frequency: 62,
		lastSeen: "2025-12-03 14:45",
		algorithm: "Summer Sale Boost",
	},
	{
		query: "protein powder",
		frequency: 54,
		lastSeen: "2025-12-05 08:30",
		algorithm: "Holiday Gift Guide",
	},
	{
		query: "track order",
		frequency: 48,
		lastSeen: "2025-12-05 10:10",
		algorithm: "Summer Sale Boost",
	},
	{
		query: "return policy",
		frequency: 42,
		lastSeen: "2025-12-04 13:55",
		algorithm: "Wearables Launch",
	},
	{
		query: "store hours",
		frequency: 35,
		lastSeen: "2025-12-02 17:20",
		algorithm: "Summer Sale Boost",
	},
	{
		query: "runing shoes",
		frequency: 28,
		lastSeen: "2025-12-05 12:00",
		algorithm: "Cycling Gear Optimization",
	},
	{
		query: "trail running poles",
		frequency: 21,
		lastSeen: "2025-12-01 09:45",
		algorithm: "Wearables Launch",
	},
	{
		query: "marathon training plan",
		frequency: 18,
		lastSeen: "2025-11-30 15:10",
		algorithm: "Summer Sale Boost",
	},
	{
		query: "hydration pack",
		frequency: 15,
		lastSeen: "2025-11-29 11:25",
		algorithm: "Holiday Gift Guide",
	},
];

export type TopQuery = {
	query: string;
	ctr: string;
	zeroResult: string;
	avgLatency: string;
};

export const topQueries: TopQuery[] = [
	{query: "running shoes", ctr: "12.5%", zeroResult: "0.5%", avgLatency: "45ms"},
	{query: "mens shorts", ctr: "8.2%", zeroResult: "1.2%", avgLatency: "52ms"},
	{query: "womens leggings", ctr: "10.8%", zeroResult: "0.8%", avgLatency: "48ms"},
	{query: "water bottle", ctr: "15.3%", zeroResult: "0.2%", avgLatency: "38ms"},
	{query: "hoodie", ctr: "9.1%", zeroResult: "2.5%", avgLatency: "60ms"},
	{query: "socks", ctr: "18.5%", zeroResult: "0.1%", avgLatency: "35ms"},
	{query: "gym bag", ctr: "7.4%", zeroResult: "3.1%", avgLatency: "55ms"},
	{query: "sports bra", ctr: "11.2%", zeroResult: "1.5%", avgLatency: "50ms"},
];

export type CTRQuery = {
	query: string;
	impressions: number;
	clicks: number;
	ctr: number;
	position: number;
	lastSeen: string;
};

export const ctrQueries: CTRQuery[] = [
	{
		query: "running shoes",
		impressions: 15420,
		clicks: 1927,
		ctr: 12.5,
		position: 1.2,
		lastSeen: "2025-12-05 10:30",
	},
	{
		query: "mens shorts",
		impressions: 8540,
		clicks: 700,
		ctr: 8.2,
		position: 2.5,
		lastSeen: "2025-12-04 14:15",
	},
	{
		query: "womens leggings",
		impressions: 12300,
		clicks: 1328,
		ctr: 10.8,
		position: 1.8,
		lastSeen: "2025-12-05 09:45",
	},
	{
		query: "water bottle",
		impressions: 5600,
		clicks: 856,
		ctr: 15.3,
		position: 1.1,
		lastSeen: "2025-12-03 16:20",
	},
	{
		query: "hoodie",
		impressions: 9200,
		clicks: 837,
		ctr: 9.1,
		position: 3.2,
		lastSeen: "2025-11-28 11:10",
	},
	{
		query: "socks",
		impressions: 4500,
		clicks: 832,
		ctr: 18.5,
		position: 1.0,
		lastSeen: "2025-12-05 08:05",
	},
	{
		query: "gym bag",
		impressions: 3200,
		clicks: 236,
		ctr: 7.4,
		position: 4.5,
		lastSeen: "2025-11-15 13:40",
	},
	{
		query: "sports bra",
		impressions: 7800,
		clicks: 873,
		ctr: 11.2,
		position: 2.1,
		lastSeen: "2025-12-01 10:55",
	},
	{
		query: "trail runners",
		impressions: 2100,
		clicks: 189,
		ctr: 9.0,
		position: 2.8,
		lastSeen: "2025-10-20 09:30",
	},
	{
		query: "cycling jersey",
		impressions: 1500,
		clicks: 210,
		ctr: 14.0,
		position: 1.5,
		lastSeen: "2025-09-15 15:25",
	},
];

export type ReformulationQuery = {
	originalQuery: string;
	reformulatedQuery: string;
	count: number;
	confidence: number;
	lastSeen: string;
};

export const reformulationQueries: ReformulationQuery[] = [
	{
		originalQuery: "runing shoes",
		reformulatedQuery: "running shoes",
		count: 450,
		confidence: 0.98,
		lastSeen: "2025-12-05 11:20",
	},
	{
		originalQuery: "mens shorts",
		reformulatedQuery: "men's shorts",
		count: 320,
		confidence: 0.95,
		lastSeen: "2025-12-04 13:10",
	},
	{
		originalQuery: "watter bottle",
		reformulatedQuery: "water bottle",
		count: 210,
		confidence: 0.99,
		lastSeen: "2025-12-02 09:50",
	},
	{
		originalQuery: "joga mat",
		reformulatedQuery: "yoga mat",
		count: 180,
		confidence: 0.92,
		lastSeen: "2025-11-30 16:45",
	},
	{
		originalQuery: "swiming suit",
		reformulatedQuery: "swimming suit",
		count: 150,
		confidence: 0.97,
		lastSeen: "2025-12-05 08:15",
	},
	{
		originalQuery: "protien powder",
		reformulatedQuery: "protein powder",
		count: 120,
		confidence: 0.96,
		lastSeen: "2025-11-25 14:30",
	},
	{
		originalQuery: "dumbells",
		reformulatedQuery: "dumbbells",
		count: 95,
		confidence: 0.99,
		lastSeen: "2025-10-10 11:00",
	},
	{
		originalQuery: "t shirt",
		reformulatedQuery: "t-shirt",
		count: 85,
		confidence: 0.9,
		lastSeen: "2025-09-05 10:20",
	},
];

export type VolumeQuery = {
	query: string;
	count: number;
	trend: number;
	lastSeen: string;
};

export const volumeQueries: VolumeQuery[] = [
	{query: "running shoes", count: 15420, trend: 12, lastSeen: "2025-12-05 12:10"},
	{query: "womens leggings", count: 12300, trend: 8, lastSeen: "2025-12-04 15:45"},
	{query: "hoodie", count: 9200, trend: -5, lastSeen: "2025-11-29 10:30"},
	{query: "mens shorts", count: 8540, trend: 15, lastSeen: "2025-12-05 09:20"},
	{query: "sports bra", count: 7800, trend: 3, lastSeen: "2025-12-01 14:50"},
	{query: "water bottle", count: 5600, trend: 25, lastSeen: "2025-12-03 11:15"},
	{query: "socks", count: 4500, trend: 2, lastSeen: "2025-12-05 08:40"},
	{query: "gym bag", count: 3200, trend: -2, lastSeen: "2025-11-10 16:00"},
	{query: "trail runners", count: 2100, trend: 18, lastSeen: "2025-10-25 13:20"},
	{query: "cycling jersey", count: 1500, trend: 5, lastSeen: "2025-09-20 10:10"},
];

const generateDailyData = (days: number) => {
	const data = {
		totalQueries: [] as number[],
		ctr: [] as number[],
		zeroResult: [] as number[],
		reformulation: [] as number[],
	};

	for (let i = 0; i < days; i++) {
		// Simulate weekend dip (assuming start is a Monday for simplicity, or just cyclic)
		const isWeekend = i % 7 >= 5;
		const weekendFactor = isWeekend ? 0.7 : 1.0;
		const trend = i / days; // 0 to 1

		// Total Queries: Base 1500, growing, with weekend dips
		data.totalQueries.push(
			Math.round((1500 + trend * 500 + Math.sin(i) * 300) * weekendFactor)
		);

		// CTR: Base 12%, improving slightly to 15%
		data.ctr.push(Number((12 + trend * 3 + Math.cos(i) * 1.5).toFixed(1)));

		// Zero Result: Base 12%, improving (dropping) to 8%
		data.zeroResult.push(Number((12 - trend * 4 + Math.sin(i * 2) * 1.5).toFixed(1)));

		// Reformulation: Base 20%, improving (dropping) to 15%
		data.reformulation.push(Number((20 - trend * 5 + Math.cos(i * 3) * 2).toFixed(1)));
	}
	return data;
};

const dailyHistory = generateDailyData(90);

export const metricsData = {
	"24h": {
		totalQueries: [
			45, 32, 21, 15, 12, 18, 45, 89, 145, 189, 210, 234, 245, 238, 220, 205, 198, 185, 160,
			140, 110, 85, 65, 50,
		],
		ctr: [
			12, 11.5, 11, 10.5, 10, 11, 12.5, 13.5, 14, 14.5, 15, 15.2, 15.5, 15.3, 15, 14.8, 14.5,
			14.2, 14, 13.5, 13, 12.5, 12, 11.5,
		],
		zeroResult: [
			12, 12.5, 13, 13.5, 14, 13, 11, 9, 8, 7.5, 7.2, 7, 6.8, 7, 7.2, 7.5, 7.8, 8, 8.5, 9, 10,
			11, 11.5, 12,
		],
		reformulation: [
			18, 18.5, 19, 19.5, 20, 19, 17, 15, 14, 13.5, 13.2, 13, 12.8, 13, 13.2, 13.5, 13.8, 14,
			14.5, 15, 16, 17, 17.5, 18,
		],
	},
	"7d": {
		totalQueries: dailyHistory.totalQueries.slice(-7),
		ctr: dailyHistory.ctr.slice(-7),
		zeroResult: dailyHistory.zeroResult.slice(-7),
		reformulation: dailyHistory.reformulation.slice(-7),
	},
	"30d": {
		totalQueries: dailyHistory.totalQueries.slice(-30),
		ctr: dailyHistory.ctr.slice(-30),
		zeroResult: dailyHistory.zeroResult.slice(-30),
		reformulation: dailyHistory.reformulation.slice(-30),
	},
	"90d": dailyHistory,
};

export const scaleValue = (value: number, timeRange: string) => {
	switch (timeRange) {
		case "24h":
			return Math.max(1, Math.round(value / 90));
		case "7d":
			return Math.max(1, Math.round(value / 12));
		case "30d":
			return Math.max(1, Math.round(value / 3));
		case "90d":
		default:
			return value;
	}
};
