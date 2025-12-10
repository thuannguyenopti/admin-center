"use client";

import {Box, SearchInput} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Table, Th, Tr, Td} from "../../../components/Table";

const rows: Array<{
	url: string;
	children: Array<{
		label: string;
		type?: "header" | "badge" | "avatar" | "button" | "numeric" | "raw";
	}>;
}> = [
	{
		url: "/cms/settings/applications/mosey-bank/settings",
		children: [
			{label: "Mosey Bank", type: "header"},
			{label: "1234"},
			{label: "www"},
			{label: "...", type: "button"},
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
				<Button appearance="primary">Create Application...</Button>
			</Box>
			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>App ID</Th>
						<Th>URL</Th>
						<Th />
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
									key={col.label}
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
