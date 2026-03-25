"use client";

import { useState, useMemo } from "react";
import {
	Box,
	Button,
	Field,
	Input,
	Select,
	SelectTrigger,
	SelectContent,
	Heading,
	Text,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import { IconPlus, IconDots, IconSearch, IconHelp } from "@tabler/icons-react";
import usePersistentState from "@/app/usePersistentState";
import AbstractDialog from "@/app/components/AbstractDialog";
import { Table, Tr, Th, Td } from "@/app/components/Table";

export type PropertyGroup = {
	id: string;
	name: string;
	displayName: string;
	sortIndex: number;
	accessLevel: "Read" | "Create" | "Edit" | "Delete" | "Publish" | "Admin";
	fromCode: boolean;
};

const initialPropertyGroups: PropertyGroup[] = [
	{
		id: "content-settings",
		name: "ContentSettings",
		displayName: "Content Settings",
		sortIndex: 10,
		accessLevel: "Read",
		fromCode: false,
	},
	{
		id: "geo-seo",
		name: "GeoSeo",
		displayName: "GEO & SEO",
		sortIndex: 20,
		accessLevel: "Read",
		fromCode: false,
	},
	{
		id: "categories-tags",
		name: "CategoriesTags",
		displayName: "Categories & Tags",
		sortIndex: 30,
		accessLevel: "Read",
		fromCode: false,
	},
];

export default function PropertyGroupsPage() {
	const [propertyGroups, setPropertyGroups] = usePersistentState(
		"propertyGroups",
		initialPropertyGroups
	) as [PropertyGroup[], (value: PropertyGroup[]) => void];

	const [search, setSearch] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState<PropertyGroup | null>(null);
	const [deletingGroup, setDeleteingGroup] = useState<PropertyGroup | null>(null);

	// Form state
	const [formName, setFormName] = useState("");
	const [formDisplayName, setFormDisplayName] = useState("");
	const [formSortIndex, setFormSortIndex] = useState("10");
	const [formAccessLevel, setFormAccessLevel] = useState<PropertyGroup["accessLevel"]>("Read");

	const accessLevelOptions = [
		{ label: "Read", value: "Read" },
		{ label: "Create", value: "Create" },
		{ label: "Edit", value: "Edit" },
		{ label: "Delete", value: "Delete" },
		{ label: "Publish", value: "Publish" },
		{ label: "Admin", value: "Admin" },
	];

	// Filter property groups
	const filteredGroups = useMemo(() => {
		return propertyGroups.filter((group) => {
			const searchLower = search.toLowerCase();
			return (
				group.name.toLowerCase().includes(searchLower) ||
				group.displayName.toLowerCase().includes(searchLower)
			);
		});
	}, [propertyGroups, search]);

	// Sort by sort index
	const sortedGroups = useMemo(() => {
		return [...filteredGroups].sort((a, b) => a.sortIndex - b.sortIndex);
	}, [filteredGroups]);

	const resetForm = () => {
		setFormName("");
		setFormDisplayName("");
		setFormSortIndex("10");
		setFormAccessLevel("Read");
	};

	const openCreateDialog = () => {
		resetForm();
		setIsCreateDialogOpen(true);
	};

	const openEditDialog = (group: PropertyGroup) => {
		setEditingGroup(group);
		setFormName(group.name);
		setFormDisplayName(group.displayName);
		setFormSortIndex(group.sortIndex.toString());
		setFormAccessLevel(group.accessLevel);
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (group: PropertyGroup) => {
		setDeleteingGroup(group);
		setIsDeleteDialogOpen(true);
	};

	const handleCreate = () => {
		if (!formName.trim() || !formDisplayName.trim()) return;

		const newGroup: PropertyGroup = {
			id: formName.toLowerCase().replace(/\s+/g, "-"),
			name: formName,
			displayName: formDisplayName,
			sortIndex: parseInt(formSortIndex) || 10,
			accessLevel: formAccessLevel,
			fromCode: false,
		};

		setPropertyGroups([...propertyGroups, newGroup]);
		setIsCreateDialogOpen(false);
		resetForm();
	};

	const handleEdit = () => {
		if (!editingGroup || !formName.trim() || !formDisplayName.trim()) return;

		const updatedGroups = propertyGroups.map((group) =>
			group.id === editingGroup.id
				? {
						...group,
						name: formName,
						displayName: formDisplayName,
						sortIndex: parseInt(formSortIndex) || 10,
						accessLevel: formAccessLevel,
					}
				: group
		);

		setPropertyGroups(updatedGroups);
		setIsEditDialogOpen(false);
		setEditingGroup(null);
		resetForm();
	};

	const handleDelete = () => {
		if (!deletingGroup) return;

		const updatedGroups = propertyGroups.filter((group) => group.id !== deletingGroup.id);
		setPropertyGroups(updatedGroups);
		setIsDeleteDialogOpen(false);
		setDeleteingGroup(null);
	};

	return (
		<Box>
			<Text mb="24" color="fg.secondary">
				Define the property groups that organize properties in the Properties panel. When you create or edit a property, you
				can assign it to a group to organize the editing interface.
			</Text>

			<Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mb="16">
				<Box maxW="md">
					<Input
						placeholder="Filter by name"
						value={search}
						onChange={(e: any) => setSearch(e.target.value)}
						addonBefore={<IconSearch size={16} />}
					/>
				</Box>
				<Button
					appearance="primary"
					icon={<IconPlus size={16} />}
					onClick={openCreateDialog}
				>
					Create Property Group
				</Button>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Display Name</Th>
						<Th>Sort Index</Th>
						<Th>Requires Access Level</Th>
						<Th>From code</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{sortedGroups.map((group) => (
						<Tr key={group.id}>
							<Td>{group.name}</Td>
							<Td>{group.displayName}</Td>
							<Td>{group.sortIndex}</Td>
							<Td>{group.accessLevel}</Td>
							<Td>{group.fromCode ? "Yes" : "No"}</Td>
							<Td>
								<Menu
									options={[
										{
											label: "Edit",
											execute: () => openEditDialog(group),
										},
										{
											label: "Delete",
											execute: () => openDeleteDialog(group),
											},
									]}
								>
									<MenuTrigger
										icon={<IconDots size={16} />}
										appearance="subtle"
										size="sm"
									/>
									<MenuContent />
								</Menu>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			{/* Create Dialog */}
			<AbstractDialog
				title="Create Property Group"
				description="Create a new property group."
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				footerPrimaryText="Create"
				footerPrimaryAction={handleCreate}
				footerAppearance="primary"
				blockPrimaryAction={!formName.trim() || !formDisplayName.trim()}
				size="md"
			>
				<Box display="flex" flexDirection="column" gap="16" pt="16">
					<Field label="Name" required>
						<Input
							placeholder="ContentSettings"
							value={formName}
							onChange={(e: any) => setFormName(e.target.value)}
							autoFocus
						/>
					</Field>

					<Field label="Display Name" required>
						<Input
							placeholder="Content Settings"
							value={formDisplayName}
							onChange={(e: any) => setFormDisplayName(e.target.value)}
						/>
					</Field>

					<Field label="Sort Index" description="Lower numbers appear first">
						<Input
							type="number"
							placeholder="10"
							value={formSortIndex}
							onChange={(e: any) => setFormSortIndex(e.target.value)}
						/>
					</Field>

					<Field label="Requires Access Level">
						<Select
							value={formAccessLevel}
							options={accessLevelOptions}
							onValueChange={(value: any) => setFormAccessLevel(value)}
						>
							<SelectTrigger />
							<SelectContent />
						</Select>
					</Field>
				</Box>
			</AbstractDialog>

			{/* Edit Dialog */}
			<AbstractDialog
				title="Edit Property Group"
				description="Edit property group settings."
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				footerPrimaryText="Save"
				footerPrimaryAction={handleEdit}
				footerAppearance="primary"
				blockPrimaryAction={!formName.trim() || !formDisplayName.trim()}
				size="md"
			>
				<Box display="flex" flexDirection="column" gap="16" pt="16">
					<Field label="Name" required>
						<Input
							placeholder="ContentSettings"
							value={formName}
							onChange={(e: any) => setFormName(e.target.value)}
							autoFocus
						/>
					</Field>

					<Field label="Display Name" required>
						<Input
							placeholder="Content Settings"
							value={formDisplayName}
							onChange={(e: any) => setFormDisplayName(e.target.value)}
						/>
					</Field>

					<Field label="Sort Index" description="Lower numbers appear first">
						<Input
							type="number"
							placeholder="10"
							value={formSortIndex}
							onChange={(e: any) => setFormSortIndex(e.target.value)}
						/>
					</Field>

					<Field label="Requires Access Level">
						<Select
							value={formAccessLevel}
							options={accessLevelOptions}
							onValueChange={(value: any) => setFormAccessLevel(value)}
						>
							<SelectTrigger />
							<SelectContent />
						</Select>
					</Field>
				</Box>
			</AbstractDialog>

			{/* Delete Dialog */}
			<AbstractDialog
				isAlert
				title="Delete Property Group"
				description="Are you sure you want to delete this property group?"
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
				footerPrimaryText="Delete"
				footerPrimaryAction={handleDelete}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Text>
					You are about to delete "{deletingGroup?.displayName}". This action cannot be
					undone.
				</Text>
			</AbstractDialog>
		</Box>
	);
}
