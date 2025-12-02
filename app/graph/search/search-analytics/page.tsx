"use client";

import {
	Box,
	Text,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Card,
	Input,
	Separator,
} from "@optiaxiom/react";
import {useState, useMemo} from "react";
import MetricCard from "../../../components/MetricCard";
import Link from "next/link";
import {Table, Tr, Td, Th} from "@/app/components/Table";

type QueryData = {
	query: string;
	ctr: string;
	zeroResult: string;
	avgLatency: string;
};

const data: QueryData[] = [
	{query: "ProductDetailsPage", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
	{query: "ProductListingPage", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
	{query: "AddToCart", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
];

type TimeRange = "24h" | "7d" | "30d" | "90d";

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

		// CTR: Base 72%, improving slightly to 78%
		data.ctr.push(Number((72 + trend * 6 + Math.cos(i) * 2).toFixed(1)));

		// Zero Result: Base 12%, improving (dropping) to 8%
		data.zeroResult.push(Number((12 - trend * 4 + Math.sin(i * 2) * 1.5).toFixed(1)));

		// Reformulation: Base 20%, improving (dropping) to 15%
		data.reformulation.push(Number((20 - trend * 5 + Math.cos(i * 3) * 2).toFixed(1)));
	}
	return data;
};

const dailyHistory = generateDailyData(90);

const metricsData = {
	"24h": {
		totalQueries: [
			45, 32, 21, 15, 12, 18, 45, 89, 145, 189, 210, 234, 245, 238, 220, 205, 198, 185, 160,
			140, 110, 85, 65, 50,
		],
		ctr: [
			72, 71, 70, 69, 68, 70, 73, 75, 76, 77, 78, 78.5, 79, 78.8, 78.5, 78.2, 78, 77.5, 77,
			76, 75, 74, 73, 72.5,
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

export default function SearchAnalytics() {
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");

	const timeRangeLabels = {
		"24h": "Last 24 hours",
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
	};

	const intervalMap: Record<TimeRange, "hour" | "day" | "week"> = {
		"24h": "hour",
		"7d": "day",
		"30d": "day",
		"90d": "day",
	};

	const currentMetrics = metricsData[timeRange];

	const getAggregation = (data: number[], type: "sum" | "average") => {
		if (data.length === 0) return 0;
		const sum = data.reduce((a, b) => a + b, 0);
		return type === "sum" ? sum : sum / data.length;
	};

	const totalQueriesVal = getAggregation(currentMetrics.totalQueries, "sum");
	const ctrVal = getAggregation(currentMetrics.ctr, "average");
	const zeroResultVal = getAggregation(currentMetrics.zeroResult, "average");
	const reformulationVal = getAggregation(currentMetrics.reformulation, "average");

	// Mock previous values for demo purposes
	const prevTotalQueries = Math.round(totalQueriesVal * 0.92);
	const prevCtr = ctrVal * 0.98;
	const prevZeroResult = zeroResultVal * 1.1;
	const prevReformulation = reformulationVal * 1.05;

	return (
		<Box>
			{/* Filters */}

			<Box
				display="flex"
				gap="12"
				mb="24"
			>
				<Menu
					options={[
						{label: "Last 24 hours", execute: () => setTimeRange("24h")},
						{label: "Last 7 days", execute: () => setTimeRange("7d")},
						{label: "Last 30 days", execute: () => setTimeRange("30d")},
						{label: "Last 90 days", execute: () => setTimeRange("90d")},
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Time Range">
							{timeRangeLabels[timeRange]}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Menu
					options={[
						{label: "Production", execute: () => {}},
						{label: "Staging", execute: () => {}},
						{label: "Development", execute: () => {}},
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Environment">Production</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			{/* Metric Cards */}
			<Box
				display="grid"
				style={{gridTemplateColumns: "repeat(4, 1fr)"}}
				gap="16"
				mb="32"
			>
				<MetricCard
					label="Total Queries"
					unit=""
					interval={intervalMap[timeRange]}
					data={currentMetrics.totalQueries}
					aggregation="sum"
					previousValue={prevTotalQueries}
				/>
				<MetricCard
					label="Click-Through Rate"
					unit="%"
					interval={intervalMap[timeRange]}
					data={currentMetrics.ctr}
					aggregation="average"
					previousValue={prevCtr}
				/>
				<Link href="/graph/search/search-analytics/zero-result">
					<MetricCard
						label="Zero-Result Rate"
						unit="%"
						desiredDirection="down"
						interval={intervalMap[timeRange]}
						data={currentMetrics.zeroResult}
						aggregation="average"
						previousValue={prevZeroResult}
					/>
				</Link>
				<MetricCard
					label="Reformulation Rate"
					unit="%"
					desiredDirection="down"
					interval={intervalMap[timeRange]}
					data={currentMetrics.reformulation}
					aggregation="average"
					previousValue={prevReformulation}
				/>
			</Box>
			{/* Problematic Queries Table */}
			<Heading
				level="4"
				mb="16"
			>
				Problematic Queries
			</Heading>
			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>CTR ↓</Th>
						<Th>Zero-Result</Th>
						<Th>Avg Latency</Th>
					</Tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<Tr key={row.query}>
							<Td>{row.query}</Td>
							<Td>{row.ctr}</Td>
							<Td>{row.zeroResult}</Td>
							<Td>{row.avgLatency}</Td>
						</Tr>
					))}
				</tbody>
			</Table>
		</Box>
	);
}
