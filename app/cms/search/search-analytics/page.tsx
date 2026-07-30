<<<<<<< HEAD
"use client";

import {Box, Heading, Menu, MenuTrigger, MenuContent, LabelMenuButton} from "@optiaxiom/react";
import {useState, useMemo} from "react";
import MetricCard from "../../../components/MetricCard";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import {metricsData, topQueries, TopQuery} from "@/app/db/analyticsData";
import {Flex} from "@/app/components/Flex";
import {Button} from "@/app/components/Button";
import {IconSparkles} from "@tabler/icons-react";

type SortColumn = keyof TopQuery;
type SortDirection = "asc" | "desc";

type TimeRange = "24h" | "7d" | "30d" | "90d";

const parseNumeric = (val: string) => parseFloat(val.replace(/[^\d.]/g, ""));

export default function SearchAnalytics() {
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [sortColumn, setSortColumn] = useState<SortColumn>("ctr");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sortedQueries = useMemo(() => {
		return [...topQueries].sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;
			if (sortColumn === "query") {
				return dir * a.query.localeCompare(b.query);
			}
			return dir * (parseNumeric(a[sortColumn]) - parseNumeric(b[sortColumn]));
		});
	}, [sortColumn, sortDirection]);

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
			<Heading level="2" mb="16">
				Problematic Queries
			</Heading>
			<Table>
				<thead>
					<Tr>
						<Th
							onSort={() => handleSort("query")}
							sortDirection={sortColumn === "query" ? sortDirection : null}
						>
							Query
						</Th>
						<Th
							onSort={() => handleSort("ctr")}
							sortDirection={sortColumn === "ctr" ? sortDirection : null}
							tooltip="CTR (Click-Through Rate) — The percentage of searches for this query that resulted in a user clicking a result. Lower CTR may indicate poor relevance, weak result presentation, or missing intent match."
						>
							CTR
						</Th>
						<Th
							onSort={() => handleSort("zeroResult")}
							sortDirection={sortColumn === "zeroResult" ? sortDirection : null}
							tooltip="Zero-Result Rate — The percentage of times this query returned no results. High rates indicate gaps in the index or query parsing failures."
						>
							Zero-Result
						</Th>
						<Th
							onSort={() => handleSort("avgLatency")}
							sortDirection={sortColumn === "avgLatency" ? sortDirection : null}
							tooltip="Avg Latency — The average time in milliseconds to return results for this query. Higher latency can negatively impact user experience and conversion."
						>
							Avg Latency
						</Th>
					</Tr>
				</thead>
				<tbody>
					{sortedQueries.map((row) => (
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
=======
"use client";

import {Box, Heading, Menu, MenuTrigger, MenuContent, LabelMenuButton} from "@optiaxiom/react";
import {useState, useMemo} from "react";
import MetricCard from "../../../components/MetricCard";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import {metricsData, topQueries, TopQuery} from "@/app/db/analyticsData";
import {Flex} from "@/app/components/Flex";
import {Button} from "@/app/components/Button";
import {IconSparkles} from "@/app/lib/axiom-icons";

type SortColumn = keyof TopQuery;
type SortDirection = "asc" | "desc";

type TimeRange = "24h" | "7d" | "30d" | "90d";

const parseNumeric = (val: string) => parseFloat(val.replace(/[^\d.]/g, ""));

export default function SearchAnalytics() {
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [sortColumn, setSortColumn] = useState<SortColumn>("ctr");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sortedQueries = useMemo(() => {
		return [...topQueries].sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;
			if (sortColumn === "query") {
				return dir * a.query.localeCompare(b.query);
			}
			return dir * (parseNumeric(a[sortColumn]) - parseNumeric(b[sortColumn]));
		});
	}, [sortColumn, sortDirection]);

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
			<Heading level="2" mb="16">
				Problematic Queries
			</Heading>
			<Table>
				<thead>
					<Tr>
						<Th
							onSort={() => handleSort("query")}
							sortDirection={sortColumn === "query" ? sortDirection : null}
						>
							Query
						</Th>
						<Th
							onSort={() => handleSort("ctr")}
							sortDirection={sortColumn === "ctr" ? sortDirection : null}
							tooltip="CTR (Click-Through Rate) — The percentage of searches for this query that resulted in a user clicking a result. Lower CTR may indicate poor relevance, weak result presentation, or missing intent match."
						>
							CTR
						</Th>
						<Th
							onSort={() => handleSort("zeroResult")}
							sortDirection={sortColumn === "zeroResult" ? sortDirection : null}
							tooltip="Zero-Result Rate — The percentage of times this query returned no results. High rates indicate gaps in the index or query parsing failures."
						>
							Zero-Result
						</Th>
						<Th
							onSort={() => handleSort("avgLatency")}
							sortDirection={sortColumn === "avgLatency" ? sortDirection : null}
							tooltip="Avg Latency — The average time in milliseconds to return results for this query. Higher latency can negatively impact user experience and conversion."
						>
							Avg Latency
						</Th>
					</Tr>
				</thead>
				<tbody>
					{sortedQueries.map((row) => (
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
>>>>>>> origin/main
