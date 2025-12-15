"use client";

import { SearchInput, Checkbox, Pagination } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconFilter, IconFile, IconBox, IconLayoutGrid, IconPhoto } from "@tabler/icons-react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import Item from "@/app/components/Item";
import { Flex } from "@/app/components/Flex";
import { Aside } from "@/app/context/LayoutContext";
import DetailsPane from "./DetailsPane";
import { useState } from "react";
import { allContentItems, type ContentType } from "@/app/cms/sharedContentData";

export type ContentItem = {
	id: string;
	name: string;
	type: ContentType;
	status: "Draft" | "Published";
	modifiedBy: string;
	language: string;
	lastModified: string;
};

const contentItems: ContentItem[] = allContentItems.map(item => ({
	id: item.id,
	name: item.name,
	type: item.type,
	status: item.publishStatus,
	modifiedBy: item.modifiedBy,
	language: item.language,
	lastModified: item.lastModified,
}));

function getIconForType(type: ContentItem["type"]) {
	switch (type) {
		case "Page":
			return <IconFile size={16} />;
		case "Product":
			return <IconBox size={16} />;
		case "Block":
			return <IconLayoutGrid size={16} />;
		case "Image":
			return <IconPhoto size={16} />;
	}
}

function getStatusIntent(status: ContentItem["status"]) {
	return status === "Published" ? "success" : "neutral";
}

export default function ContentPage() {
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
	const itemsPerPage = 10;
	const totalPages = Math.ceil(contentItems.length / itemsPerPage);
	const paginatedItems = contentItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	const selectedContent = contentItems.find(item => item.id === selectedContentId);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIds = new Set(paginatedItems.map((item) => item.id));
			setSelectedRows(allIds);
			setSelectedContentId(null);
		} else {
			setSelectedRows(new Set());
			setSelectedContentId(null);
		}
	};

	const handleSelectRow = (id: string, checked: boolean) => {
		const newSet = new Set(selectedRows);
		if (checked) {
			newSet.add(id);
			setSelectedRows(newSet);
			setSelectedContentId(id);
		} else {
			newSet.delete(id);
			setSelectedRows(newSet);
			// If exactly one item remains selected, show that item
			if (newSet.size === 1) {
				const remainingId = Array.from(newSet)[0];
				setSelectedContentId(remainingId);
			} else if (newSet.size === 0) {
				// If no items selected, close the panel
				setSelectedContentId(null);
			} else {
				// Multiple items still selected, keep showing multi-select view
				setSelectedContentId(null);
			}
		}
	};

	const isAllSelected =
		selectedRows.size === paginatedItems.length && paginatedItems.length > 0;
	const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

	return (
		<>
			<Text mb="24" color="fg.secondary">
				Edit and manage your content using the visual builder.
			</Text>
			<Flex mb="24" gap="8">
				<SearchInput size="lg" placeholder="Search content..." />
				<Button aria-label="Filter content" icon={<IconFilter />} />
			</Flex>
			<Table>
				<thead>
					<Tr>
						<Th style={{ width: "40px" }}>
							<Checkbox
								checked={isAllSelected}
								indeterminate={isSomeSelected}
								onCheckedChange={handleSelectAll}
							/>
						</Th>
						<Th>Name</Th>
						<Th>Type</Th>
						<Th>Status</Th>
						<Th>Modified by</Th>
						<Th>Language</Th>
						<Th>Last Modified</Th>
						<Th style={{ width: "56px" }} />
					</Tr>
				</thead>
				<tbody>
					{paginatedItems.map((item) => (
						<Tr 
							key={item.id}
							onClick={() => {
								if (selectedContentId === item.id) {
									setSelectedContentId(null);
								} else {
									setSelectedContentId(item.id);
								}
							}}
							style={{ cursor: "pointer" }}
						>
							<Td type="raw" style={{ width: "40px" }}>
								<Checkbox
									checked={selectedRows.has(item.id)}
									onCheckedChange={(checked) => {
										handleSelectRow(item.id, !!checked);
									}}
								/>
							</Td>
							<Td type="header">
								<Item icon={getIconForType(item.type)} title={item.name} />
							</Td>
							<Td>{item.type}</Td>
							<Td type="badge" data={getStatusIntent(item.status)}>
								{item.status}
							</Td>
							<Td>{item.modifiedBy}</Td>
							<Td>{item.language}</Td>
							<Td>{item.lastModified}</Td>
							<Td type="button" />
						</Tr>
					))}
				</tbody>
			</Table>
			<Pagination
				total={totalPages}
				page={currentPage}
				onPageChange={setCurrentPage}
				mt="24"
			/>
			
			{(selectedContentId || selectedRows.size > 1) && (
				<Aside>
					<DetailsPane 
						content={selectedContent}
						selectedIds={selectedRows}
						allContent={paginatedItems}
						onClose={() => {
							setSelectedContentId(null);
							setSelectedRows(new Set());
						}} 
					/>
				</Aside>
			)}
		</>
	);
}