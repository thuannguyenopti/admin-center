"use client";

import {Box, SearchInput, Badge} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Table, Th, Tr, Td} from "../../../components/Table";

const columns = [
	{label: "Source"},
	{label: "ID"},
	{label: "Status"},
	{label: "Last Result"},
	{label: "Last Synced"},
];
const rows = [
	{
		url: "/graph/content-sources/sources/odp/details",
		children: [
			{label: "ODP (Integration)", description: "Some note text", type: "header"},
			{label: "1234"},
			{label: "Fail", type: "badge", data: "danger"},
			{label: "Last Result"},
			{label: "Jan 11, 2024", description: "15:50:45"},
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
							<Th key={col.label}>{col.label}</Th>
						))}
					</Tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<Tr
							url={row.url}
							key={row.children[0].label}
						>
							{row.children.map((col, i) => (
								<Td
									type={col.type}
									data={col.data}
									key={i + col.label}
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
