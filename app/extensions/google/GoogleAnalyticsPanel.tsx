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
	Separator,
	Spinner,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {useState, useMemo} from "react";
import {Flex} from "@/app/components/Flex";
import MetricCard from "@/app/components/MetricCard";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import Property from "@/app/components/Property";
import {Button} from "@/app/components/Button";
import {
	IconSparkles,
	IconArrowLeft,
	IconX,
	IconChevronDown,
	IconChevronUp,
} from "@tabler/icons-react";
import Flow from "@/app/components/Flow";

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
	const [summaryState, setSummaryState] = useState<"initial" | "loading" | "result">("initial");
	const [summaryData, setSummaryData] = useState<any>(null);

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

	// Calculate conversion rates for each day
	const conversionRates = useMemo(() => {
		return currentData.sessions.map((sessions, i) => {
			const conversions = currentData.conversions[i];
			return sessions > 0 ? (conversions / sessions) * 100 : 0;
		});
	}, [currentData]);

	const previousConversionRate = useMemo(() => {
		const prevSessions = previousValues.sessions;
		const prevConversions = previousValues.conversions;
		return prevSessions > 0 ? (prevConversions / prevSessions) * 100 : 0;
	}, [previousValues]);

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
			.sort((a, b) => b.sessions - a.sessions);
	}, [filterText, range]);

	const totalSessions = useMemo(() => {
		return filteredTraffic.reduce((sum, row) => sum + row.sessions, 0);
	}, [filteredTraffic]);

	const realtimeData = useMemo(() => {
		return [
			12, 15, 18, 24, 20, 25, 28, 35, 30, 42, 45, 52, 48, 42, 38, 40, 45, 50, 55, 60, 58, 52,
			50, 55, 62, 65, 60, 58, 55, 53,
		];
	}, []);

	const graphHeight = 32;

	const handleGenerateSummary = async () => {
		setSummaryState("loading");

		// Prepare data for analysis
		const totalUsers = currentData.users.reduce((a, b) => a + b, 0);
		const totalSessions = currentData.sessions.reduce((a, b) => a + b, 0);
		const totalViews = currentData.views.reduce((a, b) => a + b, 0);
		const totalConversions = currentData.conversions.reduce((a, b) => a + b, 0);
		const avgConversionRate =
			conversionRates.reduce((a, b) => a + b, 0) / conversionRates.length;

		const prompt = `Analyze this Google Analytics data for the last ${range} and provide a concise executive summary in JSON format with the following structure:
{
  "headline": "One-sentence overall performance headline",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "topPerformer": "Which traffic channel is performing best",
  "recommendation": "One key recommendation for improvement"
}

Data:
- Time Range: ${range}
- Total Users: ${totalUsers} (${previousValues.users} previous period, ${(((totalUsers - previousValues.users) / previousValues.users) * 100).toFixed(1)}% change)
- Total Sessions: ${totalSessions} (${previousValues.sessions} previous period, ${(((totalSessions - previousValues.sessions) / previousValues.sessions) * 100).toFixed(1)}% change)
- Total Views: ${totalViews} (${previousValues.views} previous period, ${(((totalViews - previousValues.views) / previousValues.views) * 100).toFixed(1)}% change)
- Total Conversions: ${totalConversions} (${previousValues.conversions} previous period, ${(((totalConversions - previousValues.conversions) / previousValues.conversions) * 100).toFixed(1)}% change)
- Average Conversion Rate: ${avgConversionRate.toFixed(1)}% (${previousConversionRate.toFixed(1)}% previous period)

Traffic Sources (by sessions):
${filteredTraffic.map((row) => `- ${row.channel}: ${row.sessions} sessions (${((row.sessions / totalSessions) * 100).toFixed(1)}%), ${((row.conversions / row.sessions) * 100).toFixed(1)}% conversion rate`).join("\n")}

Provide actionable insights based on trends and performance.`;

		try {
			const response = await fetch("/api/llm", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content:
								"You are a Google Analytics expert. Provide insights in the exact JSON format requested. Be concise and actionable.",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					response_format: {type: "json_object"},
				}),
			});

			const data = await response.json();

			// Strip markdown code blocks if present
			let content = data.content;
			if (content.startsWith("```")) {
				content = content.replace(/^```(?:json)?\s*\n/, "").replace(/\n```\s*$/, "");
			}

			const summary = JSON.parse(content);
			setSummaryData(summary);
			setSummaryState("result");
		} catch (error) {
			console.error("Error generating summary:", error);
			setSummaryState("initial");
		}
	};

	const handleBackToData = () => {
		setSummaryState("initial");
	};

	return (
		<>
			<Box
				display="flex"
				flexDirection="column"
				flex="1"
				maxH="full"
				style={{position: "relative"}}
			>
				<Tabs
					onValueChange={setValue}
					value={value}
					display="flex"
					flexDirection="column"
					flex="1"
					maxH="full"
				>
					<Box className="relative" pt="8">
						<Button
							className="!absolute right-0 bottom-6"
							appearance="default"
							size="md"
							icon={<IconSparkles />}
							onClick={handleGenerateSummary}
							loading={summaryState === "loading"}
							disabled={summaryState !== "initial"}
						>
							Summary
						</Button>
						<TabsList mb="16">
							<TabsTrigger value="performance">Performance</TabsTrigger>
							<TabsTrigger value="traffic">Traffic</TabsTrigger>
						</TabsList>
					</Box>
					<Box flex="1" overflow="auto" style={{margin: "0 -24px", padding: "0 24px"}}>
						<TabsContent value="performance">
							{/* REALTIME */}
							<Box>
								<MetricCard
									label="Active Users (Last 30 min)"
									data={realtimeData}
									interval="minute"
									aggregation="last"
									showComparison={false}
									height={graphHeight}
								/>
							</Box>
							<Disclosure maxW="sm" w="full">
								<DisclosureTrigger>Details</DisclosureTrigger>
								<DisclosureContent>
									<Box mb="8" className="grid grid-cols-2 gap-4">
										<Box>
											<Text fontWeight="600" mb="8" fontSize="sm">
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
											<Text fontWeight="600" mb="8" fontSize="sm">
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
									</Box>
								</DisclosureContent>
							</Disclosure>
							<Separator mb="16" mt="0" />
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
								<Text fontWeight="600">Time Range</Text>
								<SegmentedControl
									defaultValue={range}
									onValueChange={(value: string) => {
										if (value) setRange(value as TimeRange);
									}}
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
									label="Total Users"
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
									label="Views"
									data={currentData.views}
									interval={currentData.interval}
									height={graphHeight}
									aggregation="sum"
									previousValue={previousValues.views}
								/>
								<MetricCard
									label="Conversion Rate"
									data={conversionRates}
									interval={currentData.interval}
									height={graphHeight}
									aggregation="average"
									previousValue={previousConversionRate}
									unit="%"
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
								<Text fontWeight="600">Time Range</Text>
								<SegmentedControl
									defaultValue={range}
									onValueChange={(value: string) => {
										if (value) setRange(value as TimeRange);
									}}
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
											<Th align="right">Sessions</Th>
											<Th align="right">% of Total</Th>
											<Th align="right">Conv. Rate</Th>
										</Tr>
									</thead>
									<tbody>
										{filteredTraffic.map((row, i) => {
											const conversionRate =
												row.sessions > 0
													? (
															(row.conversions / row.sessions) *
															100
														).toFixed(1)
													: "0.0";
											const percentOfTotal =
												totalSessions > 0
													? (
															(row.sessions / totalSessions) *
															100
														).toFixed(1)
													: "0.0";
											return (
												<Tr key={i}>
													<Td type="header" description={row.source}>
														{row.channel}
													</Td>
													<Td type="numeric">
														{formatNumber(row.sessions)}
													</Td>
													<Td type="numeric">{percentOfTotal}%</Td>
													<Td type="numeric">{conversionRate}%</Td>
												</Tr>
											);
										})}
									</tbody>
								</Table>
							</Box>
						</TabsContent>
					</Box>
				</Tabs>
			</Box>
			{/* SUMMARY OVERLAY */}
			{summaryState !== "initial" && (
				<Box
					bg="bg.default"
					style={{
						position: "absolute",
						top: "12px",
						left: "12px",
						right: "12px",
						bottom: "12px",
						borderRadius: "12px",
						boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
						zIndex: 1000,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					<Box flex="1" overflow="auto" p="24">
						{summaryState === "loading" && (
							<Box
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								style={{minHeight: "400px"}}
							>
								<Spinner size="lg" mb="16" />
								<Text fontSize="lg" fontWeight="600" mb="8">
									Analyzing your data...
								</Text>
								<Text color="fg.secondary">
									Generating insights from your analytics
								</Text>
							</Box>
						)}

						{summaryState === "result" && summaryData && (
							<Box>
								<Box
									mb="24"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Heading level="3">Analytics Summary</Heading>
									<Button
										appearance="subtle"
										icon={<IconX />}
										onClick={handleBackToData}
										aria-label="close"
									/>
								</Box>

								<Flow>
									<Heading level="4" mb="8">
										Overall Performance
									</Heading>
									<Text>{summaryData.headline}</Text>

									<Heading level="4" mb="12">
										Key Insights
									</Heading>
									<Flex flexDirection="column" gap="8">
										{summaryData.keyInsights?.map(
											(insight: string, i: number) => (
												<Box key={i} display="flex" gap="8">
													<Text color="fg.secondary">•</Text>
													<Text>{insight}</Text>
												</Box>
											)
										)}
									</Flex>

									<Heading level="4" mb="8">
										Top Performer
									</Heading>
									<Text>{summaryData.topPerformer}</Text>

									<Card p="16" bg="bg.accent.subtle">
										<Heading level="4" mb="8">
											Recommendation
										</Heading>
										<Text>{summaryData.recommendation}</Text>
									</Card>
								</Flow>
							</Box>
						)}
					</Box>
				</Box>
			)}
		</>
	);
}
