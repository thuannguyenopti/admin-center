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
	FieldLabel,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {useState, useMemo} from "react";
import {Flex} from "@/app/components/Flex";
import MetricCard from "@/app/components/MetricCard";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import Property from "@/app/components/Property";

type TimeRange = "7d" | "28d" | "90d";

const formatNumber = (val: number) => {
	if (val >= 10000) {
		return new Intl.NumberFormat("en-US", {
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(val);
	}
	return val.toLocaleString();
};

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
		users: generateSeries(7, 1200, 150),
		sessions: generateSeries(7, 1600, 200),
		views: generateSeries(7, 5200, 800),
		conversions: generateSeries(7, 45, 10),
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

const BASE_TRAFFIC_DATA = [
	{channel: "Organic Search", source: "google", users: 12450, sessions: 15200, conversions: 320},
	{channel: "Direct", source: "(direct)", users: 8200, sessions: 9100, conversions: 150},
	{channel: "Referral", source: "linkedin.com", users: 4100, sessions: 4300, conversions: 90},
	{channel: "Social", source: "twitter.com", users: 3200, sessions: 3400, conversions: 45},
	{channel: "Email", source: "newsletter", users: 2100, sessions: 2200, conversions: 80},
	{channel: "Paid Search", source: "google", users: 1500, sessions: 1600, conversions: 25},
	{channel: "Display", source: "google", users: 800, sessions: 850, conversions: 10},
	{channel: "Affiliates", source: "partner-a", users: 400, sessions: 420, conversions: 5},
];

const TRAFFIC_RATIOS: Record<TimeRange, number> = {
	"7d": 0.25,
	"28d": 1,
	"90d": 3.2,
};

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

	// Calculate pseudo-previous values for "sum" aggregation to ensure realistic change %
	// comparisons (since default MetricCard behavior compares Sum vs Last Day otherwise)
	const previousValues = useMemo(() => {
		const getPrev = (arr: number[], growth: number) => {
			const total = arr.reduce((a, b) => a + b, 0);
			return Math.round(total / (1 + growth));
		};
		return {
			users: getPrev(currentData.users, 0.12), // 12% growth
			sessions: getPrev(currentData.sessions, 0.08), // 8% growth
			views: getPrev(currentData.views, 0.15), // 15% growth
			conversions: getPrev(currentData.conversions, -0.05), // 5% drop
		};
	}, [currentData]);

	// Traffic Sources filtering
	const filteredTraffic = useMemo(() => {
		const ratio = TRAFFIC_RATIOS[range];
		const scaledData = BASE_TRAFFIC_DATA.map((row) => ({
			...row,
			users: Math.round(row.users * ratio),
			sessions: Math.round(row.sessions * ratio),
			conversions: Math.round(row.conversions * ratio),
		}));
		return scaledData
			.filter(
				(row) =>
					row.channel.toLowerCase().includes(filterText.toLowerCase()) ||
					row.source.toLowerCase().includes(filterText.toLowerCase())
			)
			.sort((a, b) => b.users - a.users);
	}, [filterText, range]);

	const realtimeData = useMemo(() => {
		return [
			12, 15, 18, 24, 20, 25, 28, 35, 30, 42, 45, 52, 48, 42, 38, 40, 45, 50, 55, 60, 58, 52,
			50, 55, 62, 65, 60, 58, 55, 53,
		];
	}, []);

	const graphHeight = 32;

	return (
		<Tabs
			onValueChange={setValue}
			value={value}
			display="flex"
			flexDirection="column"
			flex="1"
			maxH="full"
		>
			<Box>
				<TabsList mb="16">
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="traffic">Traffic</TabsTrigger>
					<TabsTrigger value="realtime">Realtime</TabsTrigger>
				</TabsList>
			</Box>
			<Box flex="1" overflow="auto" style={{margin: "0 -24px", padding: "0 24px"}}>
				<TabsContent value="performance">
					{/* RANGE SELECTOR */}
					<Card
						mb="8"
						display="flex"
						py="8"
						pr="8"
						justifyContent="space-between"
						alignItems="center"
						flexDirection="row"
						gap="16"
					>
						<FieldLabel>Time Range</FieldLabel>
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
					</Card>
					{/* 1) KPI CARDS */}
					<Grid gridTemplateColumns="1" gap="8">
						<MetricCard
							label="Active Users"
							data={currentData.users}
							interval={currentData.interval}
							height={graphHeight}
							aggregation="sum"
							previousValue={previousValues.users}
						/>
						<MetricCard
							label="Sessions"
							data={currentData.sessions}
							interval={currentData.interval}
							height={graphHeight}
							aggregation="sum"
							previousValue={previousValues.sessions}
						/>
						<MetricCard
							label="Page Views"
							data={currentData.views}
							interval={currentData.interval}
							height={graphHeight}
							aggregation="sum"
							previousValue={previousValues.views}
						/>
						<MetricCard
							label="Conversions"
							data={currentData.conversions}
							interval={currentData.interval}
							height={graphHeight}
							aggregation="sum"
							previousValue={previousValues.conversions}
						/>
					</Grid>
				</TabsContent>
				<TabsContent value="traffic">
					{/* 2) TRAFFIC SOURCES */}
					{/* RANGE SELECTOR */}
					<Card
						mb="8"
						display="flex"
						py="8"
						pr="8"
						justifyContent="space-between"
						alignItems="center"
						flexDirection="row"
						gap="16"
					>
						<FieldLabel>Time Range</FieldLabel>
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
					</Card>
					<Box>
						<Box mb="12">
							<SearchInput
								value={filterText}
								onChange={(e) => setFilterText(e.target.value)}
								placeholder="Filter channel or source..."
								size="lg"
							/>
						</Box>
						<Table>
							<thead>
								<Tr>
									<Th>Channel</Th>
									<Th align="right">Users</Th>
									<Th align="right">Conv.</Th>
								</Tr>
							</thead>
							<tbody>
								{filteredTraffic.map((row, i) => (
									<Tr key={i}>
										<Td type="header" description={row.source}>
											{row.channel}
										</Td>
										<Td type="numeric">{formatNumber(row.users)}</Td>
										<Td type="numeric">{formatNumber(row.conversions)}</Td>
									</Tr>
								))}
							</tbody>
						</Table>
					</Box>
				</TabsContent>
				<TabsContent value="realtime">
					{/* 3) REALTIME */}
					<Box>
						<Flex alignItems="start" mb="16">
							<Text>Last 30 minutes</Text>
							<Badge intent="success">Live</Badge>
						</Flex>
						<Flex gap="16" mb="16" alignItems="end">
							<Box flex="1" pb="4">
								<MetricCard
									label="Active Users"
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
								<Flex flexDirection="column" gap="12">
									{MOCK_REALTIME_EVENTS.map((evt) => (
										<Property
											key={evt.name}
											title={evt.name}
											description={formatNumber(evt.count)}
										/>
									))}
								</Flex>
							</Box>
							<Box>
								<Text fontWeight="600" mb="8">
									Top Countries
								</Text>
								<Flex flexDirection="column" gap="12">
									{MOCK_COUNTRIES.map((c) => (
										<Property
											key={c.name}
											title={c.name}
											description={formatNumber(c.count)}
										/>
									))}
								</Flex>
							</Box>
						</div>
					</Box>
				</TabsContent>
			</Box>
		</Tabs>
	);
}
