"use client";

import { Box, Heading, SearchInput } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { IconFilter, IconWand } from "@tabler/icons-react";
import { Aside } from "@/app/context/LayoutContext";
import RightToolbar from "@/app/components/RightToolbar";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import Item from "@/app/components/Item";
import { IconFile } from "@tabler/icons-react";
import { Flex } from "@/app/components/Flex";


const files = [
	{ name: "Homepage", type: "Page", lastModified: "2023-10-27", status: "Published" },
	{ name: "About Us", type: "Page", lastModified: "2023-10-26", status: "Draft" },
	{ name: "Contact", type: "Page", lastModified: "2023-10-25", status: "Published" },
	{ name: "Blog Post 1", type: "Article", lastModified: "2023-10-24", status: "Published" },
	{ name: "Product A", type: "Product", lastModified: "2023-10-23", status: "Review" },
];

export default function ContentPage() {
	return (
		<>
			<Text
				mb="24"
				color="fg.secondary"
			>
				Edit and manage your content using the visual builder.
			</Text>
			<Flex
				mb="24"
				gap="8"
			>
				<SearchInput
					size="lg"
					placeholder="Search content..."
				/>
				<Button
					aria-label="Filter content"
					icon={<IconFilter />}
				/>
			</Flex>
			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Type</Th>
						<Th>Last Modified</Th>
						<Th>Status</Th>
					</Tr>
				</thead>
				<tbody>
					{files.map((file, index) => (
						<Tr key={index}>
							<Td type="header">
								<Item
									icon={<IconFile size={16} />}
									title={file.name}
								/>
							</Td>
							<Td>{file.type}</Td>
							<Td>{file.lastModified}</Td>
							<Td>{file.status}</Td>
						</Tr>
					))}
				</tbody>
			</Table>
			<Aside>
				<Box p="24">details pane</Box>
			</Aside>
		</>
	);
}
