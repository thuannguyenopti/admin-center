"use client";

import {
	Box,
	DataTable,
	DataTableBody,
	Badge,
	Menu,
	MenuTrigger,
	LabelMenuButton,
	MenuContent,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconSearch, IconArrowRight} from "@tabler/icons-react";
import {useReactTable, getCoreRowModel, createColumnHelper} from "@tanstack/react-table";
import {useState, useMemo} from "react";
import {reformulationQueries, ReformulationQuery, scaleValue} from "@/app/db/analyticsData";

const columnHelper = createColumnHelper<ReformulationQuery>();

const columns = [
	columnHelper.accessor("originalQuery", {
		header: "Original Query",
		cell: (info) => <Text color="fg.secondary">{info.getValue()}</Text>,
	}),
	columnHelper.display({
		id: "arrow",
		cell: () => (
			<IconArrowRight
				size={16}
				color="var(--color-fg-secondary)"
			/>
		),
	}),
	columnHelper.accessor("reformulatedQuery", {
		header: "Reformulated To",
		cell: (info) => <Text fontWeight="500">{info.getValue()}</Text>,
	}),
	columnHelper.accessor("count", {
		header: "Occurrences",
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor("confidence", {
		header: "Confidence",
		cell: (info) => (
			<Badge intent={info.getValue() > 0.9 ? "success" : "warning"}>
				{(info.getValue() * 100).toFixed(0)}%
			</Badge>
		),
	}),
];

const allData: ReformulationQuery[] = reformulationQueries;

const timeRangeLabels: Record<string, string> = {
	"24h": "Last 24 hours",
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	"90d": "Last 90 days",
};

export default function ReformulationRatePage() {
	const [timeRange, setTimeRange] = useState("7d");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = useMemo(() => {
		let data = allData;

		// Filter by Time Range
		const now = new Date();
		data = data
			.filter((item) => {
				const itemDate = new Date(item.lastSeen);
				const diffTime = Math.abs(now.getTime() - itemDate.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

				switch (timeRange) {
					case "24h":
						return diffDays <= 1;
					case "7d":
						return diffDays <= 7;
					case "30d":
						return diffDays <= 30;
					case "90d":
						return diffDays <= 90;
					default:
						return true;
				}
			})
			.map((item) => ({
				...item,
				count: scaleValue(item.count, timeRange),
			}));

		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter(
			(item) =>
				item.originalQuery.toLowerCase().includes(query) ||
				item.reformulatedQuery.toLowerCase().includes(query)
		);
	}, [searchQuery, timeRange]);

	const table = useReactTable({
		columns,
		data: filteredData,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Flex
					gap="8"
					flexDirection="row"
				>
					<Input
						addonBefore={<IconSearch size={16} />}
						placeholder="Search queries..."
						style={{width: "320px"}}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
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
			</Flex>

			<DataTable table={table}>
				<DataTableBody />
			</DataTable>
		</Box>
	);
}
