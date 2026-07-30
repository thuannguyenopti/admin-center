"use client";

import {useState, useMemo} from "react";
import {Box, Input, Card, CardPreview, CardImage, CardHeader, Checkbox} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import AbstractDialog from "@/app/components/AbstractDialog";
import {ContentInstance} from "@/app/db/cmpInitialData";
import {
	IconSearch,
	IconLayoutGrid,
	IconLayoutList,
	IconFilter,
	IconCheck,
} from "@/app/lib/axiom-icons";
import Image from "next/image";

type ViewMode = "list" | "grid";

interface ContentInstancePickerProps {
	open: boolean;
	onClose: () => void;
	instances: ContentInstance[];
	onSelect: (instance: ContentInstance | ContentInstance[]) => void;
	multiSelect?: boolean;
	title?: string;
	description?: string;
	primaryActionText?: string;
}

export default function ContentInstancePicker({
	open,
	onClose,
	instances,
	onSelect,
	multiSelect = false,
	title = "Select Content",
	description = "Choose content instances from the library.",
	primaryActionText = "Select",
}: ContentInstancePickerProps) {
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [typeFilter, setTypeFilter] = useState<string>("");

	// Get unique content types for filtering
	const contentTypes = useMemo(() => {
		const types = new Set(instances.map((i) => i.modelDisplayName));
		return Array.from(types).sort();
	}, [instances]);

	// Filter instances by search term and type filter
	const filteredInstances = useMemo(() => {
		let filtered = instances;

		// Filter by type
		if (typeFilter) {
			filtered = filtered.filter((i) => i.modelDisplayName === typeFilter);
		}

		// Filter by search
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter((instance) => {
				// Search in model display name
				if (instance.modelDisplayName.toLowerCase().includes(searchLower)) {
					return true;
				}

				// Search in common field values
				const searchableFields = ["title", "headline", "name", "subject_line", "message"];
				for (const field of searchableFields) {
					const value = instance.fields[field];
					if (value && String(value).toLowerCase().includes(searchLower)) {
						return true;
					}
				}

				return false;
			});
		}

		return filtered;
	}, [instances, search, typeFilter]);

	const handleSelect = () => {
		if (selectedIds.size === 0) return;

		if (multiSelect) {
			const selected = instances.filter((i) => selectedIds.has(i.id));
			onSelect(selected);
		} else {
			const instance = instances.find((i) => selectedIds.has(i.id));
			if (instance) {
				onSelect(instance);
			}
		}

		setSelectedIds(new Set());
		setSearch("");
		setTypeFilter("");
	};

	const handleClose = () => {
		setSelectedIds(new Set());
		setSearch("");
		setTypeFilter("");
		onClose();
	};

	const toggleSelection = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			if (!multiSelect) {
				newSelected.clear();
			}
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	// Get display title for an instance
	const getInstanceTitle = (instance: ContentInstance): string => {
		const titleFields = ["title", "headline", "name", "subject_line", "message"];
		for (const field of titleFields) {
			if (instance.fields[field]) {
				return String(instance.fields[field]);
			}
		}
		return instance.id;
	};

	// Get thumbnail URL from instance fields
	const getThumbnailUrl = (instance: ContentInstance): string | null => {
		const imageFields = [
			"featured_image",
			"hero_image",
			"background_image",
			"thumbnail",
			"image",
		];
		for (const field of imageFields) {
			const value = instance.fields[field];
			if (
				value &&
				typeof value === "string" &&
				(value.startsWith("http") || value.startsWith("/"))
			) {
				return value;
			}
		}
		return null;
	};

	return (
		<AbstractDialog
			title={title}
			description={description}
			open={open}
			setOpen={handleClose}
			footerPrimaryText={primaryActionText}
			footerPrimaryAction={handleSelect}
			footerAppearance="primary"
			blockPrimaryAction={selectedIds.size === 0}
			size="xl"
		>
			<Box display="flex" flexDirection="column" gap="16" pt="16">
				{/* Toolbar */}
				<Box display="flex" alignItems="center" gap="8">
					{/* Search */}
					<Box flex="1">
						<Input
							placeholder="Search content..."
							value={search}
							onChange={(e: any) => setSearch(e.target.value)}
							addonBefore={<IconSearch size={16} />}
						/>
					</Box>

					{/* Type Filter */}
					{contentTypes.length > 1 && (
						<Box style={{minWidth: "180px"}}>
							<select
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value)}
								style={{
									width: "100%",
									padding: "8px 12px",
									borderRadius: "4px",
									border: "1px solid var(--border-default)",
									background: "var(--bg-default)",
									color: "var(--fg-default)",
									fontSize: "14px",
									cursor: "pointer",
								}}
							>
								<option value="">All Types</option>
								{contentTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</Box>
					)}

					{/* View Toggle */}
					<Box
						display="flex"
						gap="4"
						border="1"
						borderColor="border.tertiary"
						rounded="md"
						p="4"
					>
						<Button
							appearance={viewMode === "list" ? "default" : "subtle"}
							size="sm"
							onClick={() => setViewMode("list")}
							aria-label="List view"
						>
							<IconLayoutList size={16} />
						</Button>
						<Button
							appearance={viewMode === "grid" ? "default" : "subtle"}
							size="sm"
							onClick={() => setViewMode("grid")}
							aria-label="Grid view"
						>
							<IconLayoutGrid size={16} />
						</Button>
					</Box>
				</Box>

				{/* Selection Count */}
				{selectedIds.size > 0 && (
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="8"
						bg="bg.information.subtle"
						rounded="md"
					>
						<IconCheck size={16} />
						<Text fontSize="sm" fontWeight="500">
							{selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
						</Text>
					</Box>
				)}

				{/* Content List/Grid */}
				{filteredInstances.length === 0 ? (
					<Box p="32" textAlign="center" bg="bg.secondary" rounded="md">
						<Text color="fg.secondary">
							{search || typeFilter
								? "No content found matching your criteria."
								: "No content instances available."}
						</Text>
					</Box>
				) : viewMode === "list" ? (
					<Box style={{maxHeight: "500px"}} overflow="auto">
						<Table>
							<thead>
								<Tr>
									<Th style={{width: "50px"}}></Th>
									<Th>Content</Th>
									<Th>Type</Th>
									<Th>Created</Th>
								</Tr>
							</thead>
							<tbody>
								{filteredInstances.map((instance) => {
									const isSelected = selectedIds.has(instance.id);
									const title = getInstanceTitle(instance);
									const createdDate = new Date(
										instance.createdAt
									).toLocaleDateString();

									return (
										<Tr
											key={instance.id}
											style={{
												cursor: "pointer",
												backgroundColor: isSelected
													? "var(--colors-bg-accent-subtle)"
													: undefined,
											}}
											onClick={() => toggleSelection(instance.id)}
										>
											<Td>
												{multiSelect ? (
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() =>
															toggleSelection(instance.id)
														}
														style={{cursor: "pointer"}}
														onClick={(e) => e.stopPropagation()}
													/>
												) : (
													<input
														type="radio"
														checked={isSelected}
														onChange={() =>
															toggleSelection(instance.id)
														}
														style={{cursor: "pointer"}}
														onClick={(e) => e.stopPropagation()}
													/>
												)}
											</Td>
											<Td type="header">{title}</Td>
											<Td>{instance.modelDisplayName}</Td>
											<Td>{createdDate}</Td>
										</Tr>
									);
								})}
							</tbody>
						</Table>
					</Box>
				) : (
					<Box
						display="grid"
						gap="16"
						style={{
							gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
							maxHeight: "500px",
							overflow: "auto",
						}}
					>
						{filteredInstances.map((instance) => {
							const isSelected = selectedIds.has(instance.id);
							const title = getInstanceTitle(instance);
							const thumbnailUrl = getThumbnailUrl(instance);

							return (
								<Box
									key={instance.id}
									style={{
										position: "relative",
										cursor: "pointer",
									}}
									onClick={() => toggleSelection(instance.id)}
								>
									<Card
										style={{
											border: isSelected
												? "2px solid var(--colors-border-accent)"
												: undefined,
											backgroundColor: isSelected
												? "var(--colors-bg-accent-subtle)"
												: undefined,
										}}
									>
										<CardPreview
											style={{position: "relative", height: "160px"}}
										>
											{thumbnailUrl ? (
												<CardImage asChild>
													<Image
														src={thumbnailUrl}
														alt={title}
														fill
														unoptimized
														style={{objectFit: "cover"}}
													/>
												</CardImage>
											) : (
												<Box
													display="flex"
													alignItems="center"
													justifyContent="center"
													style={{
														height: "100%",
														background: "var(--colors-bg-secondary)",
														color: "var(--colors-fg-tertiary)",
													}}
												>
													<Text fontSize="xs">
														{instance.modelDisplayName}
													</Text>
												</Box>
											)}

											{/* Checkbox overlay */}
											<Box
												style={{
													position: "absolute",
													top: "8px",
													left: "8px",
													zIndex: 1,
												}}
												onClick={(e) => e.stopPropagation()}
											>
												<input
													type={multiSelect ? "checkbox" : "radio"}
													checked={isSelected}
													onChange={() => toggleSelection(instance.id)}
													style={{
														cursor: "pointer",
														width: "18px",
														height: "18px",
													}}
												/>
											</Box>
										</CardPreview>
										<CardHeader>
											<Box display="flex" flexDirection="column" gap="4">
												<Text
													fontSize="sm"
													fontWeight="500"
													style={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{title}
												</Text>
												<Text fontSize="xs" color="fg.secondary">
													{instance.modelDisplayName}
												</Text>
											</Box>
										</CardHeader>
									</Card>
								</Box>
							);
						})}
					</Box>
				)}
			</Box>
		</AbstractDialog>
	);
}
