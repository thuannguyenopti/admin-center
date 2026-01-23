"use client";

import {
	Box,
	Heading,
	SearchInput,
	Badge,
	SegmentedControl,
	SegmentedControlItem,
	Tooltip,
	Grid,
	Card,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {useState, useMemo} from "react";
import {Flex} from "@/app/components/Flex";
import MetricCard from "@/app/components/MetricCard";

type TimeRange = "7d" | "28d" | "90d";

// ----------------------------------------------------------------------
// Mock Data Helpers
// ----------------------------------------------------------------------
const generateSeries = (length: number, start: number, volatility: number) => {
	const data: number[] = [start];
	for (let i = 1; i < length; i++) {
		const change = (Math.random() - 0.5) * volatility;
		const val = Math.max(0, Math.round(data[i - 1] + change));
		data.push(val);
	}
	return data;
};

// Generate deterministic-ish data for each range so it "feels" real but consistent
const DATA_SETS: Record<
	TimeRange,
	{
		users: number[];
		sessions: number[];
		views: number[];
		conversions: number[];
		interval: "day" | "week";
	}
> = {
	"7d": {
		users: generateSeries(7, 2400, 300),
		sessions: generateSeries(7, 3100, 400),
		views: generateSeries(7, 12000, 2000),
		conversions: generateSeries(7, 85, 20),
		interval: "day",
	},
	"28d": {
		users: generateSeries(28, 2200, 400),
		sessions: generateSeries(28, 3000, 500),
		views: generateSeries(28, 11500, 2500),
		conversions: generateSeries(28, 80, 25),
		interval: "day",
	},
	"90d": {
		users: generateSeries(90, 2000, 600),
		sessions: generateSeries(90, 2800, 700),
		views: generateSeries(90, 10000, 3000),
		conversions: generateSeries(90, 75, 30),
		interval: "day",
	},
};

const MOCK_TRAFFIC_DATA = [
	{channel: "Organic Search", source: "google", users: 12450, sessions: 15200, conversions: 320},
	{channel: "Direct", source: "(direct)", users: 8200, sessions: 9100, conversions: 150},
	{channel: "Referral", source: "linkedin.com", users: 4100, sessions: 4300, conversions: 90},
	{channel: "Social", source: "twitter.com", users: 3200, sessions: 3400, conversions: 45},
	{channel: "Email", source: "newsletter", users: 2100, sessions: 2200, conversions: 80},
	{channel: "Paid Search", source: "google", users: 1500, sessions: 1600, conversions: 25},
	{channel: "Display", source: "google", users: 800, sessions: 850, conversions: 10},
	{channel: "Affiliates", source: "partner-a", users: 400, sessions: 420, conversions: 5},
];

const MOCK_REALTIME_EVENTS = [
	{name: "view_item", count: 145},
	{name: "add_to_cart", count: 32},
	{name: "page_view", count: 289},
	{name: "scroll", count: 120},
];

const MOCK_COUNTRIES = [
	{name: "United States", count: 45},
	{name: "Germany", count: 12},
	{name: "United Kingdom", count: 8},
];

export default function GoogleAnalyticsPanel() {
	const [range, setRange] = useState<TimeRange>("28d");
	const [filterText, setFilterText] = useState("");
	const [value, setValue] = useState<string>("performance");

	const currentData = DATA_SETS[range];

	// Traffic Sources filtering
	const filteredTraffic = useMemo(() => {
		return MOCK_TRAFFIC_DATA.filter(
			(row) =>
				row.channel.toLowerCase().includes(filterText.toLowerCase()) ||
				row.source.toLowerCase().includes(filterText.toLowerCase())
		).sort((a, b) => b.users - a.users);
	}, [filterText]);

	const realtimeData = useMemo(() => {
		return [
			12, 15, 18, 24, 20, 25, 28, 35, 30, 42, 45, 52, 48, 42, 38, 40, 45, 50, 55, 60, 58, 52,
			50, 55, 62, 65, 60, 58, 55, 53,
		];
	}, []);

	const graphHeight = 40;

	return (
		<Box flex="1" display="flex" flexDirection="column" gap="8">
			{/* RANGE SELECTOR */}
			<SegmentedControl
				defaultValue={range}
				onValueChange={(value: string) => setRange(value as TimeRange)}
			>
				<Tooltip content="Last 7 days">
					<SegmentedControlItem value="7d">7d</SegmentedControlItem>
				</Tooltip>
				<Tooltip content="Last 28 days">
					<SegmentedControlItem value="28d">28d</SegmentedControlItem>
				</Tooltip>
				<Tooltip content="Last 90 days">
					<SegmentedControlItem value="90d">90d</SegmentedControlItem>
				</Tooltip>
			</SegmentedControl>
			<Tabs onValueChange={setValue} value={value}>
				<TabsList>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="traffic">Traffic</TabsTrigger>
					<TabsTrigger value="realtime">Realtime</TabsTrigger>
				</TabsList>

				<TabsContent value="performance">
					{/* 1) KPI CARDS */}
					<Grid gridTemplateColumns="1" gap="16">
						<MetricCard
							label="Active Users"
							data={currentData.users}
							interval={currentData.interval}
							height={graphHeight}
						/>
						<MetricCard
							label="Sessions"
							data={currentData.sessions}
							interval={currentData.interval}
							height={graphHeight}
						/>
						<MetricCard
							label="Page Views"
							data={currentData.views}
							interval={currentData.interval}
							height={graphHeight}
						/>
						<MetricCard
							label="Conversions"
							data={currentData.conversions}
							interval={currentData.interval}
							height={graphHeight}
						/>
					</Grid>
				</TabsContent>

				<TabsContent value="traffic">
					{/* 2) TRAFFIC SOURCES */}
					<Box>
						<Box mb="12">
							<SearchInput
								value={filterText}
								onChange={(e) => setFilterText(e.target.value)}
								placeholder="Filter channel or source..."
								size="md"
							/>
						</Box>
						<Box
							border="1"
							borderColor="border.tertiary"
							rounded="md"
							overflow="hidden"
						>
							<div className="overflow-x-auto">
								<table className="w-full text-sm text-left">
									<thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
										<tr>
											<th className="p-2 font-medium">Channel</th>
											<th className="p-2 font-medium text-right">Users</th>
											<th className="p-2 font-medium text-right">Conv.</th>
										</tr>
									</thead>
									<tbody>
										{filteredTraffic.map((row, i) => (
											<tr
												key={i}
												className="border-b border-[#e5e5e5] last:border-0 hover:bg-[#fafafa]"
											>
												<td className="p-2">
													<div className="font-medium">{row.channel}</div>
													<div className="text-xs text-gray-500">
														{row.source}
													</div>
												</td>
												<td className="p-2 text-right">
													{row.users.toLocaleString()}
												</td>
												<td className="p-2 text-right">
													{row.conversions}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Box>
					</Box>
				</TabsContent>

				<TabsContent value="realtime">
					{/* 3) REALTIME */}
					<Box>
						<Flex justifyContent="space-between" alignItems="start" mb="16">
							<Box>
								<Heading level="4">Realtime</Heading>
								<Text color="fg.secondary">Last 30 minutes</Text>
							</Box>
							<Badge intent="information" variant="strong" size="lg">
								Live
							</Badge>
						</Flex>

						<Flex gap="16" mb="16" alignItems="end">
							<Box>
								<Text color="fg.secondary">Active Users</Text>
								<Heading level="1">53</Heading>
							</Box>
							<Box flex="1" pb="4">
								<MetricCard
									label=""
									data={realtimeData}
									interval="hour"
									smooth
									aggregation="last"
								/>
							</Box>
						</Flex>

						<div className="grid grid-cols-2 gap-4">
							<Box>
								<Text fontWeight="600" mb="8">
									Top Events
								</Text>
								<Flex flexDirection="column" gap="4">
									{MOCK_REALTIME_EVENTS.map((evt) => (
										<Flex key={evt.name} justifyContent="space-between">
											<Text color="fg.secondary">{evt.name}</Text>
											<Text fontWeight="600">{evt.count}</Text>
										</Flex>
									))}
								</Flex>
							</Box>
							<Box>
								<Text fontWeight="600" mb="8">
									Top Countries
								</Text>
								<Flex flexDirection="column" gap="4">
									{MOCK_COUNTRIES.map((c) => (
										<Flex key={c.name} justifyContent="space-between">
											<Text color="fg.secondary">{c.name}</Text>
											<Text fontWeight="600">{c.count}</Text>
										</Flex>
									))}
								</Flex>
							</Box>
						</div>
					</Box>
				</TabsContent>
			</Tabs>
		</Box>
	);
}
