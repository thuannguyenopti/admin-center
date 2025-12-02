"use client";

import {Box, Button, DataTable, DataTableBody, Flex, Input, Text} from "@optiaxiom/react";
import {IconSearch, IconAlertCircle} from "@tabler/icons-react";
import {useReactTable, getCoreRowModel, createColumnHelper} from "@tanstack/react-table";
import {useState, useMemo} from "react";

type ZeroResultQuery = {
	query: string;
	frequency: number;
	lastSeen: string;
	algorithm: string;
};

const columnHelper = createColumnHelper<ZeroResultQuery>();

const columns = [
	columnHelper.accessor("query", {
		header: "Query",
		cell: (info) => (
			<Flex gap="8" alignItems="center">
				<IconAlertCircle size={16} style={{color: "var(--color-fg-error)"}} />
				<Text>{info.getValue()}</Text>
			</Flex>
		),
	}),
	columnHelper.accessor("frequency", {
		header: "Frequency",
		cell: (info) => `${info.getValue()} times`,
	}),
	columnHelper.accessor("lastSeen", {header: "Last Seen"}),
	columnHelper.accessor("algorithm", {
		header: "Algorithm Reference",
		cell: (info) => (
			<Text fontFamily="mono" fontSize="sm" color="fg.secondary">
				{info.getValue()}
			</Text>
		),
	}),
];

const allData: ZeroResultQuery[] = [
	{
		query: "vintage leather wallet",
		frequency: 127,
		lastSeen: "2024-11-27 14:32",
		algorithm: "Semantic Search v2",
	},
	{
		query: "waterproof hiking boots size 12",
		frequency: 98,
		lastSeen: "2024-11-27 13:45",
		algorithm: "Product Boost Algorithm",
	},
	{
		query: "organic cotton t-shirt blue",
		frequency: 84,
		lastSeen: "2024-11-27 12:18",
		algorithm: "Category Relevance",
	},
	{
		query: "wireless earbuds noise cancelling",
		frequency: 76,
		lastSeen: "2024-11-27 11:02",
		algorithm: "Semantic Search v2",
	},
	{
		query: "bamboo cutting board large",
		frequency: 62,
		lastSeen: "2024-11-27 09:54",
		algorithm: "Personalized Ranking",
	},
	{
		query: "stainless steel water bottle 32oz",
		frequency: 58,
		lastSeen: "2024-11-27 08:21",
		algorithm: "Trending Items Boost",
	},
	{
		query: "memory foam pillow king size",
		frequency: 51,
		lastSeen: "2024-11-26 22:15",
		algorithm: "Category Relevance",
	},
	{
		query: "yoga mat extra thick purple",
		frequency: 47,
		lastSeen: "2024-11-26 19:33",
		algorithm: "Semantic Search v2",
	},
	{
		query: "ceramic coffee mug set of 4",
		frequency: 43,
		lastSeen: "2024-11-26 16:47",
		algorithm: "Product Boost Algorithm",
	},
	{
		query: "electric standing desk adjustable",
		frequency: 39,
		lastSeen: "2024-11-26 14:28",
		algorithm: "Personalized Ranking",
	},
];

export default function ZeroResultPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = useMemo(() => {
		if (!searchQuery) return allData;

		const query = searchQuery.toLowerCase();
		return allData.filter(
			(item) =>
				item.query.toLowerCase().includes(query) ||
				item.algorithm.toLowerCase().includes(query)
		);
	}, [searchQuery]);

	const table = useReactTable({
		columns,
		data: filteredData,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Box>
			<Flex flexDirection="row" justifyContent="space-between" alignItems="center" gap="16" mb="24">
				<Input
					size="lg"
					addonBefore={<IconSearch size={16} />}
					placeholder="Search queries..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</Flex>

			<DataTable table={table}>
				<DataTableBody />
			</DataTable>
		</Box>
	);
}
