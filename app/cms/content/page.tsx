"use client";

import { SearchInput, Checkbox, Pagination } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconFilter, IconFile, IconBox, IconLayoutGrid, IconPhoto, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import Item from "@/app/components/Item";
import { Flex } from "@/app/components/Flex";
import { Aside } from "@/app/context/LayoutContext";
import DetailsPane from "./DetailsPane";
import { useState, useEffect, useMemo } from "react";
import { type UnifiedContentItem } from "@/app/db/initialData";
import FilterPills from "./components/FilterPills";
import { useFilterPanel } from "./context/FilterPanelContext";

export type ContentItem = UnifiedContentItem & {
	status: "Draft" | "Published";
};

function getIconForType(type: UnifiedContentItem["baseType"]) {
	switch (type) {
		case "Page":
		case "Experience":
			return <IconFile size={16} />;
		case "Product":
			return <IconBox size={16} />;
		case "Block":
			return <IconLayoutGrid size={16} />;
		case "Media":
			return <IconPhoto size={16} />;
	}
}

function getStatusIntent(status: ContentItem["status"]) {
	return status === "Published" ? "success" : "neutral";
}

export default function ContentPage() {
	// Filter management - now from context (single source of truth)
	const {
		isFilterPanelOpen,
		setIsFilterPanelOpen,
		filters,
		filteredContent,
		activePills,
		hasActiveFilters,
		removeFilter,
		clearAllFilters,
	} = useFilterPanel();

	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
	const [sortColumn, setSortColumn] = useState<string>('name');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const itemsPerPage = 10;

	// Sort filtered content
	const sortedContent = useMemo(() => {
		const sorted = [...filteredContent];
		sorted.sort((a: ContentItem, b: ContentItem) => {
			let aValue: any;
			let bValue: any;

			switch (sortColumn) {
				case 'name':
					aValue = a.name?.toLowerCase() || '';
					bValue = b.name?.toLowerCase() || '';
					break;
				case 'type':
					aValue = a.baseType?.toLowerCase() || '';
					bValue = b.baseType?.toLowerCase() || '';
					break;
				case 'status':
					aValue = a.status || '';
					bValue = b.status || '';
					break;
				case 'modifiedBy':
					aValue = a.modifiedBy?.toLowerCase() || '';
					bValue = b.modifiedBy?.toLowerCase() || '';
					break;
				case 'language':
					aValue = a.language?.toLowerCase() || '';
					bValue = b.language?.toLowerCase() || '';
					break;
				case 'lastModified':
					aValue = new Date(a.lastModified || 0).getTime();
					bValue = new Date(b.lastModified || 0).getTime();
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
		return sorted;
	}, [filteredContent, sortColumn, sortDirection]);

	// Use sorted content instead of filtered content
	const displayContent = sortedContent;
	const totalPages = Math.ceil(displayContent.length / itemsPerPage);
	const paginatedItems = displayContent.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	const selectedContent = displayContent.find(item => item.id === selectedContentId);

	// Reset pagination when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	const handleSelectAll = (checked: boolean) => {
		const newSet = new Set(selectedRows);
		if (checked) {
			paginatedItems.forEach((item) => newSet.add(item.id));
		} else {
			paginatedItems.forEach((item) => newSet.delete(item.id));
		}
		setSelectedRows(newSet);
		setSelectedContentId(null);
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
		paginatedItems.length > 0 &&
		paginatedItems.every((item) => selectedRows.has(item.id));
	const isSomeSelected =
		paginatedItems.some((item) => selectedRows.has(item.id)) && !isAllSelected;

	const handleSort = (column: string) => {
		if (sortColumn === column) {
			// Toggle direction if same column
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// Set new column with ascending as default
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	const renderSortIcon = (column: string) => {
		const isActive = sortColumn === column;
		return (
			<span
				style={{
					visibility: isActive ? 'visible' : 'hidden',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginLeft: '4px',
					width: '14px',
					height: '14px',
					verticalAlign: 'middle',
				}}
			>
				{sortDirection === 'asc' ? (
					<IconChevronUp size={14} />
				) : (
					<IconChevronDown size={14} />
				)}
			</span>
		);
	};

	return (
		<>
			<Text mb="24" color="fg.secondary">
				Edit and manage your content using the visual builder.
			</Text>
			<Flex mb="24" gap="8">
				<SearchInput size="lg" placeholder="Search content..." />
				<Button
					aria-label="Filter content"
					icon={<IconFilter />}
					onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
					style={{
						backgroundColor: isFilterPanelOpen ? "#0037ff" : undefined,
						borderColor: isFilterPanelOpen ? "#0037ff" : undefined,
						color: isFilterPanelOpen ? "#ffffff" : undefined,
					}}
				/>
			</Flex>
			{hasActiveFilters && (
				<Flex mb="16" gap="8">
					<FilterPills
						pills={activePills}
						onRemoveFilter={removeFilter}
						onClearAll={clearAllFilters}
					/>
				</Flex>
			)}
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
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('name')}
						>
							Name{renderSortIcon('name')}
						</Th>
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('type')}
						>
							Type{renderSortIcon('type')}
						</Th>
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('status')}
						>
							Status{renderSortIcon('status')}
						</Th>
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('modifiedBy')}
						>
							Modified by{renderSortIcon('modifiedBy')}
						</Th>
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('language')}
						>
							Language{renderSortIcon('language')}
						</Th>
						<Th
							style={{ cursor: 'pointer', userSelect: 'none' }}
							onClick={() => handleSort('lastModified')}
						>
							Last Modified{renderSortIcon('lastModified')}
						</Th>
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
								<Item icon={getIconForType(item.baseType)} title={item.name} />
							</Td>
							<Td>{item.baseType}</Td>
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