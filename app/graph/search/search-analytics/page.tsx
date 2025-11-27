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
	DataTable,
	DataTableBody,
	Input,
	Separator,
} from "@optiaxiom/react";
import {useReactTable, getCoreRowModel, createColumnHelper} from "@tanstack/react-table";
import MetricCard from "../../../components/MetricCard";

type QueryData = {
	query: string;
	ctr: string;
	zeroResult: string;
	avgLatency: string;
};

const columnHelper = createColumnHelper<QueryData>();

const columns = [
	columnHelper.accessor("query", {header: "Query"}),
	columnHelper.accessor("ctr", {header: "CTR ↓"}),
	columnHelper.accessor("zeroResult", {header: "Zero-Result"}),
	columnHelper.accessor("avgLatency", {header: "Avg Latency"}),
];

const data: QueryData[] = [
	{query: "ProductDetailsPage", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
	{query: "ProductListingPage", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
	{query: "AddToCart", ctr: "1.3%", zeroResult: "50%", avgLatency: "123ms"},
];

export default function SearchAnalytics() {
	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
	});
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
						{label: "Last 24 hours", execute: () => {}},
						{label: "Last 7 days", execute: () => {}},
						{label: "Last 30 days", execute: () => {}},
						{label: "Last 90 days", execute: () => {}},
						{label: "Custom range", execute: () => {}},
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Time Range">Last 7 days</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Menu
					options={[
						{label: "All queries", execute: () => {}},
						{label: "Zero-result queries", execute: () => {}},
						{label: "Low CTR queries", execute: () => {}},
						{label: "Slow queries", execute: () => {}},
						{label: "High-volume queries", execute: () => {}},
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Query Type">All queries</LabelMenuButton>
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
					unit="k"
					data={[153, 3, 125, 123]}
				/>
				<MetricCard
					label="Click-Through Rate"
					unit="%"
					data={[75, 76, 77, 77.5, 78, 78.5, 79, 79.5, 79.8, 80, 80, 80]}
				/>
				<MetricCard
					label="Zero-Result Rate"
					unit="%"
					data={[12.4, 8.3, 8.1]}
				/>
				<MetricCard
					label="Reformulation Rate"
					unit="%"
					data={[19, 18.8, 18.5, 18.2, 18, 17.8, 17.5, 17.3, 17.2, 17.1, 17, 17]}
				/>
			</Box>

			{/* Charts */}
			<Box
				display="grid"
				style={{gridTemplateColumns: "repeat(2, 1fr)"}}
				gap="16"
				mb="32"
			>
				<Card p="16">
					<Text
						fontSize="md"
						fontWeight="500"
						mb="16"
					>
						Query Volume Over Time
					</Text>
					<Box
						bg="bg.tertiary"
						rounded="sm"
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{height: "200px"}}
					>
						<Text color="fg.tertiary">Chart Placeholder</Text>
					</Box>
				</Card>
				<Card p="16">
					<Text
						fontSize="md"
						fontWeight="500"
						mb="16"
					>
						First Click Position Distribution
					</Text>
					<Box
						bg="bg.tertiary"
						rounded="sm"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Text color="fg.tertiary">Chart Placeholder</Text>
					</Box>
				</Card>
			</Box>

			{/* Problematic Queries Table */}
			<Heading
				level="4"
				mb="16"
			>
				Problematic Queries
			</Heading>
			<DataTable table={table}>
				<DataTableBody />
			</DataTable>
		</Box>
	);
}
