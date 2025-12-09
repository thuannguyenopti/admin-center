"use client";

import {
	Box,
	DataTable,
	DataTableBody,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconSearch, IconAlertCircle} from "@tabler/icons-react";
import {useReactTable, getCoreRowModel, createColumnHelper} from "@tanstack/react-table";
import {useState, useMemo} from "react";
import {ctrQueries, CTRQuery, scaleValue} from "@/app/db/analyticsData";

const columnHelper = createColumnHelper<CTRQuery>();

const columns = [
	columnHelper.accessor("query", {
		header: "Query",
		cell: (info) => (
			<Flex
				gap="8"
				alignItems="center"
			>
				<Text>{info.getValue()}</Text>
			</Flex>
		),
	}),
	columnHelper.accessor("impressions", {
		header: "Impressions",
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor("clicks", {
		header: "Clicks",
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor("ctr", {
		header: "CTR",
		cell: (info) => `${info.getValue()}%`,
	}),
	columnHelper.accessor("position", {
		header: "Avg. Position",
		cell: (info) => info.getValue().toFixed(1),
	}),
];

const allData: CTRQuery[] = ctrQueries;

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function ClickThroughRatePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");

	const timeRangeLabels = {
		"24h": "Last 24 hours",
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
	};

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
				impressions: scaleValue(item.impressions, timeRange),
				clicks: scaleValue(item.clicks, timeRange),
			}));

		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter((item) => item.query.toLowerCase().includes(query));
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
