"use client";

import {Box, Button, Card, Flex, DataTable, DataTableBody, Input} from "@optiaxiom/react";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {
	useReactTable,
	getCoreRowModel,
	createColumnHelper,
	getFilteredRowModel,
} from "@tanstack/react-table";
import {useState, useMemo} from "react";

type Algorithm = {
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
};

const columnHelper = createColumnHelper<Algorithm>();

const columns = [
	columnHelper.accessor("name", {header: "Name"}),
	columnHelper.accessor("publishState", {header: "Publish State"}),
	columnHelper.accessor("creationDate", {header: "Creation Date"}),
	columnHelper.accessor("owner", {header: "Owner"}),
];

const allData: Algorithm[] = [
	{
		name: "Semantic Search v2",
		publishState: "Published",
		creationDate: "2024-11-15",
		owner: "Alice Johnson",
	},
	{
		name: "Product Boost Algorithm",
		publishState: "Draft",
		creationDate: "2024-11-20",
		owner: "Bob Smith",
	},
	{
		name: "Category Relevance",
		publishState: "Published",
		creationDate: "2024-10-28",
		owner: "Carol Williams",
	},
	{
		name: "Personalized Ranking",
		publishState: "Testing",
		creationDate: "2024-11-22",
		owner: "David Brown",
	},
	{
		name: "Trending Items Boost",
		publishState: "Published",
		creationDate: "2024-09-14",
		owner: "Alice Johnson",
	},
];

export default function OptimizeSearchPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = useMemo(() => {
		if (!searchQuery) return allData;

		const query = searchQuery.toLowerCase();
		return allData.filter(
			(algorithm) =>
				algorithm.name.toLowerCase().includes(query) ||
				algorithm.publishState.toLowerCase().includes(query) ||
				algorithm.owner.toLowerCase().includes(query)
		);
	}, [searchQuery]);

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
				<Input
					size="lg"
					addonBefore={<IconSearch size={16} />}
					placeholder="Search algorithms..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Algorithm"
				>
					Create Algorithm
				</Button>
			</Flex>

			<DataTable table={table}>
				<DataTableBody />
			</DataTable>
		</Box>
	);
}
