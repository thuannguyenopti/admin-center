"use client";

import {Box, Heading, Menu, MenuTrigger, MenuContent, LabelMenuButton} from "@optiaxiom/react";
import {useState, useMemo} from "react";
import MetricCard from "../../../components/MetricCard";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import {metricsData, topQueries} from "@/app/db/analyticsData";
import {Flex} from "@/app/components/Flex";
import {Button} from "@/app/components/Button";
import {IconSparkles} from "@tabler/icons-react";

type TimeRange = "24h" | "7d" | "30d" | "90d";

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

			<Flex mb="24" justifyContent="space-between">
				<Flex gap="8">
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
				</Flex>
				<Button icon={<IconSparkles />} appearance="primary-opal">
					Suggest Optimization
				</Button>
			</Flex>

			{/* Metric Cards */}
			<Box display="grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}} gap="16" mb="32">
				<MetricCard
					href="/cms/search/search-analytics/total-queries"
					label="Total Queries"
					unit=""
					interval={intervalMap[timeRange]}
					data={currentMetrics.totalQueries}
					aggregation="sum"
					previousValue={prevTotalQueries}
				/>
				<MetricCard
					href="/cms/search/search-analytics/click-through-rate"
					label="Click-Through Rate"
					unit="%"
					interval={intervalMap[timeRange]}
					data={currentMetrics.ctr}
					aggregation="average"
					previousValue={prevCtr}
				/>
				<MetricCard
					href="/cms/search/search-analytics/zero-result"
					label="Zero-Result Rate"
					unit="%"
					desiredDirection="down"
					interval={intervalMap[timeRange]}
					data={currentMetrics.zeroResult}
					aggregation="average"
					previousValue={prevZeroResult}
				/>
				<MetricCard
					href="/cms/search/search-analytics/reformulation-rate"
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
			<Heading level="4" mb="16">
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
					{topQueries.map((row) => (
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
