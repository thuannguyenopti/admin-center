"use client";

import {useState, Dispatch, SetStateAction} from "react";
import {
	Box,
	SearchInput,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Table, Th, Tr, Td} from "@/app/components/Table";
import {opalActions as initialOpalActions, OpalAction} from "./mockData";
import {IconDots, IconSparkles} from "@tabler/icons-react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import usePersistentState from "@/app/usePersistentState";
import OpalActionDialog from "./OpalActionDialog";
import EmptyList from "@/app/components/EmptyList";

export default function OpalActionsPage() {
	const router = useRouter();
	const [opalActions, setOpalActions] = usePersistentState(
		"opal-actions",
		initialOpalActions
	) as [OpalAction[], Dispatch<SetStateAction<OpalAction[]>>];
	const [typeFilter, setTypeFilter] = useState("All");
	const [visibleAtFilter, setVisibleAtFilter] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAction, setEditingAction] = useState<OpalAction | null>(null);

	const handleSave = (action: Omit<OpalAction, "id" | "modified">) => {
		if (editingAction) {
			// Update existing
			setOpalActions((prev) =>
				prev.map((a) =>
					a.id === editingAction.id
						? {...action, id: a.id, modified: new Date().toISOString(), isSystemAction: a.isSystemAction}
						: a
				)
			);
		} else {
			// Create new
			const newAction: OpalAction = {
				...action,
				id: Date.now().toString(),
				modified: new Date().toISOString(),
			};
			setOpalActions([...opalActions, newAction]);
		}
		setIsDialogOpen(false);
		setEditingAction(null);
	};

	const handleEdit = (action: OpalAction) => {
		setEditingAction(action);
		setIsDialogOpen(true);
	};

	const handleAdd = () => {
		setEditingAction(null);
		setIsDialogOpen(true);
	};

	const handleDelete = () => {
		if (deleteId) {
			setOpalActions((prev) => prev.filter((a) => a.id !== deleteId));
			setDeleteId(null);
		}
	};

	const filteredActions = opalActions.filter((action) => {
		// Search filter
		if (searchQuery && !action.name.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}

		// Visible At filter
		if (visibleAtFilter !== "All" && action.visibleAt !== visibleAtFilter) {
			return false;
		}

		return true;
	});

	const getAgentCount = (action: OpalAction) => {
		const count = action.agents.length;
		return count === 1 ? "1 Agent" : `${count} Agent(s)`;
	};

	const getLocationsText = (action: OpalAction) => {
		const locations: string[] = [];
		if (action.locations.toolbar.contextMenu) locations.push("Context Menu");
		if (action.locations.toolbar.improveButton) locations.push("Toolbar");
		if (action.locations.assetPanel) locations.push("Asset Panel");
		if (action.locations.propertyEditor?.enabled) {
			const typeCount = action.locations.propertyEditor.propertyTypes.length;
			locations.push(
				typeCount > 0 ? `Properties (${typeCount} types)` : "Properties (all types)"
			);
		}
		return locations.join(", ") || "None";
	};

	// Show empty state when no actions exist
	if (opalActions.length === 0) {
		return (
			<>
				<EmptyList
					heading="No Opal Actions"
					body="Enable Opal agents in the CMS by adding them to a location."
				>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						bg="bg.accent.subtle"
						color="fg.secondary"
						rounded="full"
						mb="16"
						style={{
							width: "80px",
							height: "80px",
						}}
					>
						<IconSparkles size={40} stroke={1.5} />
					</Box>
					<Button appearance="primary" onClick={handleAdd}>
						Add Opal Action
					</Button>
				</EmptyList>

				<OpalActionDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					action={editingAction}
					onSave={handleSave}
				/>
			</>
		);
	}

	return (
		<>
			<Box display="flex" justifyContent="space-between" pb="24">
				<Box display="flex" gap="8">
					<Box style={{width: "300px"}}>
						<SearchInput
							size="lg"
							placeholder="Filter by name"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</Box>
					<Menu
						options={[
							{label: "All", execute: () => setTypeFilter("All")},
							{label: "Enabled", execute: () => setTypeFilter("Enabled")},
							{label: "Disabled", execute: () => setTypeFilter("Disabled")},
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Type">{typeFilter}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu
						options={[
							{label: "All", execute: () => setVisibleAtFilter("All")},
							{label: "Everyone", execute: () => setVisibleAtFilter("Everyone")},
							{label: "Editors", execute: () => setVisibleAtFilter("Editors")},
							{
								label: "Administrators",
								execute: () => setVisibleAtFilter("Administrators"),
							},
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Visible At">{visibleAtFilter}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
				<Button appearance="primary" onClick={handleAdd}>
					Add Opal Action
				</Button>
			</Box>
			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Type</Th>
						<Th>Visible at</Th>
						<Th>Modified</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{filteredActions.map((action) => (
						<Tr key={action.id} onClick={() => handleEdit(action)}>
							<Td type="header" description={action.helpText}>
								<Box display="flex" alignItems="center" gap="8">
									{action.isSystemAction && (
										<Image src="/logo.svg" alt="Optimizely" width={16} height={16} />
									)}
									{action.name}
								</Box>
							</Td>
							<Td>
								<Box display="flex" flexDirection="column" gap="4">
									<Box fontSize="sm">{getAgentCount(action)}</Box>
									<Box fontSize="xs" color="fg.secondary">
										{getLocationsText(action)}
									</Box>
								</Box>
							</Td>
							<Td>{action.visibleAt}</Td>
							<Td>
								{new Date(action.modified).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Td>
							<Td type="button">
								<Box onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											{
												label: "Edit",
												execute: () => handleEdit(action),
											},
											{
												label: "Delete",
												intent: "danger",
												execute: () => setDeleteId(action.id),
											},
										]}
									>
										<MenuTrigger
											icon={<IconDots />}
											size="sm"
											aria-label="Action Options"
											appearance="subtle"
										/>
										<MenuContent />
									</Menu>
								</Box>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete Opal Action</AlertDialogHeader>
					<AlertDialogBody>
						Are you sure you want to delete this Opal Action? This action cannot be
						undone.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction appearance="danger" onClick={handleDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<OpalActionDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				action={editingAction}
				onSave={handleSave}
			/>
		</>
	);
}
