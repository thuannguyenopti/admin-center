"use client";

import { useState, useMemo } from "react";
import { Box, Input } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import AbstractDialog from "@/app/components/AbstractDialog";
import { ContentInstance } from "@/app/db/cmpInitialData";
import { IconSearch } from "@tabler/icons-react";

interface ContentInstancePickerProps {
	open: boolean;
	onClose: () => void;
	instances: ContentInstance[];
	onSelect: (instance: ContentInstance) => void;
}

export default function ContentInstancePicker({
	open,
	onClose,
	instances,
	onSelect,
}: ContentInstancePickerProps) {
	const [search, setSearch] = useState("");
	const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

	// Filter instances by search term
	const filteredInstances = useMemo(() => {
		if (!search) return instances;

		const searchLower = search.toLowerCase();
		return instances.filter((instance) => {
			// Search in model display name
			if (instance.modelDisplayName.toLowerCase().includes(searchLower)) {
				return true;
			}

			// Search in common field values (title, headline, name, etc.)
			const searchableFields = ["title", "headline", "name", "subject_line", "message"];
			for (const field of searchableFields) {
				const value = instance.fields[field];
				if (value && String(value).toLowerCase().includes(searchLower)) {
					return true;
				}
			}

			return false;
		});
	}, [instances, search]);

	const handleConnect = () => {
		if (!selectedInstanceId) return;

		const instance = instances.find(i => i.id === selectedInstanceId);
		if (instance) {
			onSelect(instance);
			setSelectedInstanceId(null);
			setSearch("");
		}
	};

	const handleClose = () => {
		setSelectedInstanceId(null);
		setSearch("");
		onClose();
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

	return (
		<AbstractDialog
			title="Connect Content"
			description="Select a CMP content instance to connect to this page."
			open={open}
			setOpen={handleClose}
			footerPrimaryText="Connect"
			footerPrimaryAction={handleConnect}
			footerAppearance="primary"
			blockPrimaryAction={!selectedInstanceId}
			size="lg"
		>
			<Box display="flex" flexDirection="column" gap="16" pt="16">
				{/* Search */}
				<Box>
					<Input
						placeholder="Search content..."
						value={search}
						onChange={(e: any) => setSearch(e.target.value)}
						addonBefore={<IconSearch size={16} />}
					/>
				</Box>

				{/* Instance List */}
				{filteredInstances.length === 0 ? (
					<Box p="32" textAlign="center" bg="bg.secondary" rounded="md">
						<Text color="fg.secondary">
							{search ? "No content found matching your search." : "No compatible content instances available."}
						</Text>
					</Box>
				) : (
					<Box style={{ maxHeight: "400px" }} overflow="auto">
						<Table>
							<thead>
								<Tr>
									<Th style={{ width: "50px" }}></Th>
									<Th>Content</Th>
									<Th>Type</Th>
									<Th>Created</Th>
								</Tr>
							</thead>
							<tbody>
								{filteredInstances.map((instance) => {
									const isSelected = selectedInstanceId === instance.id;
									const title = getInstanceTitle(instance);
									const createdDate = new Date(instance.createdAt).toLocaleDateString();

									return (
										<Tr
											key={instance.id}
											style={{
												cursor: "pointer",
												backgroundColor: isSelected ? "var(--colors-bg-accent)" : undefined,
											}}
											onClick={() => setSelectedInstanceId(instance.id)}
										>
											<Td>
												<input
													type="radio"
													checked={isSelected}
													onChange={() => setSelectedInstanceId(instance.id)}
													style={{ cursor: "pointer" }}
												/>
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
				)}
			</Box>
		</AbstractDialog>
	);
}
