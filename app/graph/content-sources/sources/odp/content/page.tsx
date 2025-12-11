"use client";

import { Box, SearchInput, Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Th, Tr, Td } from "../../../../../components/Table";

type CellType = "header" | "badge" | "avatar" | "button" | "numeric" | "raw";

interface Column {
	label: string;
	type?: CellType;
}

interface Cell {
	label: string;
	type?: CellType;
	description?: string;
}

interface Row {
	url: string;
	children: Cell[];
}

const columns: Column[] = [
	{ label: "Name" },
	{ label: "ID" },
	{ label: "Updated" },
	{ label: "Content Items", type: "numeric" },
];
const rows: Row[] = [
	{
		url: "/graph/content-sources/opd/details",
		children: [
			{ label: "Article", type: "header" },
			{ label: "1234" },
			{ label: "Jan 11, 2024", description: "15:50:45" },
			{ label: "5678", type: "numeric" },
		],
	},
	{
		url: "/graph/content-sources/opd/details",
		children: [
			{ label: "Article", type: "header" },
			{ label: "1234" },
			{ label: "Jan 11, 2024", description: "15:50:45" },
			{ label: "5678", type: "numeric" },
		],
	},
	{
		url: "/graph/content-sources/opd/details",
		children: [
			{ label: "Article", type: "header" },
			{ label: "1234" },
			{ label: "Jan 11, 2024", description: "15:50:45" },
			{ label: "5678", type: "numeric" },
		],
	},
	{
		url: "/graph/content-sources/opd/details",
		children: [
			{ label: "Article", type: "header" },
			{ label: "1234" },
			{ label: "Jan 11, 2024", description: "15:50:45" },
			{ label: "5678", type: "numeric" },
		],
	},
];

export default function Home() {
	return (
		<>
			<Box
				display="flex"
				justifyContent="space-between"
				pb="16"
			>
				<SearchInput />
				<Button
					size="lg"
					appearance="primary"
				>
					Create Application...
				</Button>
			</Box>
			<Table>
				<thead>
					<Tr>
						{columns.map((col) => (
							<Th
								key={col.label}
								align={col.type === "numeric" ? "right" : "left"}
							>
								{col.label}
							</Th>
						))}
					</Tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<Tr
							url={row.url}
							key={row.children[0].label + i}
						>
							{row.children.map((col) => (
								<Td
									type={
										col.type as
											| "button"
											| "header"
											| "numeric"
											| "badge"
											| "avatar"
											| "raw"
											| undefined
									}
									key={col.label}
									description={col.description}
								>
									{col.label}
								</Td>
							))}
						</Tr>
					))}
				</tbody>
			</Table>
		</>
	);
}
