"use client";

import React, {useState, useEffect, useCallback, useMemo} from "react";
import {
	Box,
	Text,
	Button,
	Field,
	Menu,
	MenuTrigger,
	MenuContent,
	Input,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Checkbox,
	Badge,
} from "@optiaxiom/react";
import {IconXmark, IconPlus, IconGripVertical, IconEllipsisSolid} from "@/app/lib/axiom-icons";
import {LocationMenu, LocationId, MenuGroup, UserGroup, GroupAgent} from "../types";
import {availableAgents} from "../mockData";
import {AgentPicker} from "./AgentPicker";
import {LocationHelpPopover} from "./LocationHelpPopover";

interface LocationMenuEditorProps {
	location: LocationMenu;
	onClose: () => void;
	onSave: (location: LocationMenu) => void;
	onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

export const LocationMenuEditor: React.FC<LocationMenuEditorProps> = ({
	location,
	onClose,
	onSave,
	onUnsavedChangesChange,
}) => {
	const [editedLocation, setEditedLocation] = useState<LocationMenu>(location);
	const [originalLocation, setOriginalLocation] = useState<LocationMenu>(location);
	const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
	const [draggedAgentId, setDraggedAgentId] = useState<string | null>(null);
	const [draggedFromGroupId, setDraggedFromGroupId] = useState<string | null>(null);
	const [groupDropIndex, setGroupDropIndex] = useState<number | null>(null);
	const [agentDropTarget, setAgentDropTarget] = useState<{groupId: string; agentIndex: number} | null>(null);

	// Permissions modal state
	const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
	const [editingPermissions, setEditingPermissions] = useState<{
		groupId: string;
		agentId: string;
		currentPermissions: UserGroup[];
	} | null>(null);

	// Update local state when location prop changes and normalize data
	useEffect(() => {
		// Normalize agents to ensure they have GroupAgent structure
		const normalizedLocation = {
			...location,
			groups: location.groups.map((group) => ({
				...group,
				agents: group.agents.map((agent) => {
					// If agent is a string (old format), convert to GroupAgent
					if (typeof agent === "string") {
						return {id: agent, permissions: ["Everyone"] as UserGroup[]};
					}
					// If agent is already a GroupAgent but missing permissions
					if (!agent.permissions) {
						return {...agent, permissions: ["Everyone"] as UserGroup[]};
					}
					return agent;
				}),
			})),
		};
		setEditedLocation(normalizedLocation);
		setOriginalLocation(normalizedLocation);
	}, [location]);

	// Check if there are unsaved changes
	const hasUnsavedChanges = useMemo(() => {
		return JSON.stringify(editedLocation) !== JSON.stringify(originalLocation);
	}, [editedLocation, originalLocation]);

	// Notify parent of unsaved changes
	useEffect(() => {
		onUnsavedChangesChange?.(hasUnsavedChanges);
	}, [hasUnsavedChanges, onUnsavedChangesChange]);

	const handleSave = useCallback(() => {
		onSave(editedLocation);
		onClose();
	}, [editedLocation, onSave, onClose]);

	const handleStartRename = useCallback((groupId: string, currentName: string) => {
		setRenamingGroupId(groupId);
		setRenameValue(currentName);
	}, []);

	const handleSaveRename = useCallback((groupId: string) => {
		if (renameValue.trim()) {
			setEditedLocation((prev) => ({
				...prev,
				groups: prev.groups.map((g) =>
					g.id === groupId ? {...g, name: renameValue.trim()} : g
				),
			}));
		}
		setRenamingGroupId(null);
		setRenameValue("");
	}, [renameValue]);

	const handleRemoveGroup = useCallback((groupId: string) => {
		setEditedLocation((prev) => ({
			...prev,
			groups: prev.groups.filter((g) => g.id !== groupId),
		}));
	}, []);

	// Calculate which agents are already in this location
	const usedAgentIds = useMemo(() => {
		const ids = new Set<string>();
		editedLocation.groups.forEach((group) => {
			group.agents.forEach((groupAgent) => ids.add(groupAgent.id));
		});
		return Array.from(ids);
	}, [editedLocation.groups]);

	const handleAddAgent = useCallback((agentId: string) => {
		const agent = availableAgents.find((a) => a.id === agentId);
		const agentName = agent?.name || "Agent";

		setEditedLocation((prev) => {
			// Create a new group with this single agent
			const newGroup: MenuGroup = {
				id: `group-${Date.now()}`,
				name: agentName,
				agents: [{id: agentId, permissions: ["Everyone"]}],
				enabled: true,
				visibleAt: "Everyone",
				order: 0,
			};

			// Shift all existing groups down by incrementing their order
			const updatedGroups = prev.groups.map((g) => ({
				...g,
				order: g.order + 1,
			}));

			return {
				...prev,
				groups: [newGroup, ...updatedGroups],
			};
		});
	}, []);

	// Drag and drop handlers for groups
	const handleGroupDragStart = useCallback((e: React.DragEvent, groupId: string) => {
		setDraggedGroupId(groupId);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("application/x-opal-group", groupId);
	}, []);

	const handleGroupDragOver = useCallback((e: React.DragEvent, groupId: string, groupIndex: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		if (draggedGroupId && draggedGroupId !== groupId) {
			// Calculate if we should insert before or after based on mouse position
			const rect = e.currentTarget.getBoundingClientRect();
			const midpoint = rect.top + rect.height / 2;
			const insertBefore = e.clientY < midpoint;

			setGroupDropIndex(insertBefore ? groupIndex : groupIndex + 1);
		} else if (draggedAgentId) {
			// Agent dragged over group - determine if creating new group between
			const rect = e.currentTarget.getBoundingClientRect();
			const threshold = 20; // pixels from edge

			if (e.clientY < rect.top + threshold) {
				// Near top - insert before this group
				setGroupDropIndex(groupIndex);
				setAgentDropTarget(null);
			} else if (e.clientY > rect.bottom - threshold) {
				// Near bottom - insert after this group
				setGroupDropIndex(groupIndex + 1);
				setAgentDropTarget(null);
			}
		}
	}, [draggedGroupId, draggedAgentId]);

	const handleGroupDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (draggedGroupId && groupDropIndex !== null) {
			// Moving a group
			setEditedLocation((prev) => {
				const groups = [...prev.groups].sort((a, b) => a.order - b.order);
				const draggedIndex = groups.findIndex((g) => g.id === draggedGroupId);

				if (draggedIndex === -1) return prev;

				// Remove dragged group
				const [draggedGroup] = groups.splice(draggedIndex, 1);

				// Adjust target index if dragging down
				let targetIndex = groupDropIndex;
				if (draggedIndex < groupDropIndex) {
					targetIndex--;
				}

				// Insert at new position
				groups.splice(targetIndex, 0, draggedGroup);

				// Update order
				const reordered = groups.map((g, idx) => ({
					...g,
					order: idx,
				}));

				return {
					...prev,
					groups: reordered,
				};
			});
		} else if (draggedAgentId && draggedFromGroupId && groupDropIndex !== null) {
			// Creating a new group from an agent
			const agent = availableAgents.find((a) => a.id === draggedAgentId);
			const agentName = agent?.name || "Agent";

			setEditedLocation((prev) => {
				const groups = [...prev.groups].sort((a, b) => a.order - b.order);
				const sourceGroup = groups.find((g) => g.id === draggedFromGroupId);

				if (!sourceGroup) return prev;

				// Remove agent from source group
				const draggedAgent = sourceGroup.agents.find((ga) => ga.id === draggedAgentId);
				sourceGroup.agents = sourceGroup.agents.filter((ga) => ga.id !== draggedAgentId);

				if (!draggedAgent) return prev;

				// Create new group
				const newGroup: MenuGroup = {
					id: `group-${Date.now()}`,
					name: agentName,
					agents: [draggedAgent],
					enabled: true,
					visibleAt: "Everyone",
					order: groupDropIndex,
				};

				// Insert new group
				groups.splice(groupDropIndex, 0, newGroup);

				// Update order
				const reordered = groups.map((g, idx) => ({
					...g,
					order: idx,
				}));

				return {
					...prev,
					groups: reordered,
				};
			});
		}

		setDraggedGroupId(null);
		setDraggedAgentId(null);
		setDraggedFromGroupId(null);
		setGroupDropIndex(null);
	}, [draggedGroupId, draggedAgentId, draggedFromGroupId, groupDropIndex]);

	const handleGroupDragEnd = useCallback(() => {
		setDraggedGroupId(null);
		setGroupDropIndex(null);
	}, []);

	// Drag and drop handlers for agents
	const handleAgentDragStart = useCallback((e: React.DragEvent, agentId: string, groupId: string) => {
		setDraggedAgentId(agentId);
		setDraggedFromGroupId(groupId);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("application/x-opal-agent", agentId);
		e.stopPropagation();
	}, []);

	const handleAgentDragOver = useCallback((e: React.DragEvent, groupId: string, agentId?: string, agentIndex?: number) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";

		if (!draggedAgentId) return;

		if (agentId && agentIndex !== undefined) {
			// Dragging over a specific agent - calculate if insert before or after
			const rect = e.currentTarget.getBoundingClientRect();
			const midpoint = rect.top + rect.height / 2;
			const hysteresis = 16; // pixels of deadzone around midpoint

			// Only update if we're clearly above or below midpoint (with hysteresis)
			const currentTargetIndex = agentDropTarget?.groupId === groupId ? agentDropTarget.agentIndex : null;
			let newTargetIndex: number;

			if (e.clientY < midpoint - hysteresis) {
				// Clearly above - insert before
				newTargetIndex = agentIndex;
			} else if (e.clientY > midpoint + hysteresis) {
				// Clearly below - insert after
				newTargetIndex = agentIndex + 1;
			} else if (currentTargetIndex !== null) {
				// In deadzone - keep current position
				newTargetIndex = currentTargetIndex;
			} else {
				// In deadzone with no current - default to before
				newTargetIndex = agentIndex;
			}

			// Only update state if the target actually changed
			if (!agentDropTarget || agentDropTarget.groupId !== groupId || agentDropTarget.agentIndex !== newTargetIndex) {
				setAgentDropTarget({
					groupId,
					agentIndex: newTargetIndex,
				});
			}
		} else {
			// Dragging over empty group area - insert at end
			if (!agentDropTarget || agentDropTarget.groupId !== groupId || agentDropTarget.agentIndex !== 0) {
				setAgentDropTarget({groupId, agentIndex: 0});
			}
		}
	}, [draggedAgentId, agentDropTarget]);

	const handleAgentDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!draggedAgentId || !draggedFromGroupId || !agentDropTarget) return;

		setEditedLocation((prev) => {
			const groups = prev.groups.map((g) => ({...g, agents: [...g.agents]}));
			const sourceGroup = groups.find((g) => g.id === draggedFromGroupId);
			const targetGroup = groups.find((g) => g.id === agentDropTarget.groupId);

			if (!sourceGroup || !targetGroup) return prev;

			// Check if agent already exists in target group (and it's a different group)
			if (targetGroup.agents.some((ga) => ga.id === draggedAgentId) && draggedFromGroupId !== agentDropTarget.groupId) {
				return prev;
			}

			// Find and remove from source
			const draggedIndex = sourceGroup.agents.findIndex((ga) => ga.id === draggedAgentId);
			const [draggedAgent] = sourceGroup.agents.splice(draggedIndex, 1);

			if (!draggedAgent) return prev;

			// Calculate target index
			let targetIndex = agentDropTarget.agentIndex;

			// If moving within same group and dragging down, adjust index
			if (draggedFromGroupId === agentDropTarget.groupId && draggedIndex < targetIndex) {
				targetIndex--;
			}

			// Insert at target position
			targetGroup.agents.splice(targetIndex, 0, draggedAgent);

			return {
				...prev,
				groups,
			};
		});

		setDraggedAgentId(null);
		setDraggedFromGroupId(null);
		setAgentDropTarget(null);
		setGroupDropIndex(null);
	}, [draggedAgentId, draggedFromGroupId, agentDropTarget]);

	const handleAgentDragEnd = useCallback(() => {
		setDraggedAgentId(null);
		setDraggedFromGroupId(null);
		setAgentDropTarget(null);
	}, []);

	const handleRemoveAgent = useCallback((groupId: string, agentId: string) => {
		setEditedLocation((prev) => ({
			...prev,
			groups: prev.groups.map((g) =>
				g.id === groupId
					? {...g, agents: g.agents.filter((ga) => ga.id !== agentId)}
					: g
			),
		}));
	}, []);

	const handleOpenPermissions = useCallback((groupId: string, agentId: string) => {
		const group = editedLocation.groups.find((g) => g.id === groupId);
		const groupAgent = group?.agents.find((ga) => ga.id === agentId);

		if (groupAgent) {
			setEditingPermissions({
				groupId,
				agentId,
				currentPermissions: groupAgent.permissions ? [...groupAgent.permissions] : ["Everyone"],
			});
			setPermissionsDialogOpen(true);
		}
	}, [editedLocation.groups]);

	const handleSavePermissions = useCallback((permissions: UserGroup[]) => {
		if (!editingPermissions) return;

		setEditedLocation((prev) => ({
			...prev,
			groups: prev.groups.map((g) =>
				g.id === editingPermissions.groupId
					? {
							...g,
							agents: g.agents.map((ga) =>
								ga.id === editingPermissions.agentId
									? {...ga, permissions}
									: ga
							),
						}
					: g
			),
		}));

		setPermissionsDialogOpen(false);
		setEditingPermissions(null);
	}, [editingPermissions]);

	const handleCancelPermissions = useCallback(() => {
		setPermissionsDialogOpen(false);
		setEditingPermissions(null);
	}, []);

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
		>

			{/* Header */}
			<Box
				p="24"
				pb="16"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{flexShrink: 0}}
			>
				<Text fontWeight="600" fontSize="lg">
					Edit Menu
				</Text>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconXmark size={16} />}
					onClick={onClose}
					aria-label="Close"
				/>
			</Box>

			{/* Body (scrollable) */}
			<Box flex="1" overflow="auto" px="24" pb="24">
				<Box display="flex" flexDirection="column" gap="16">
					{/* Location field */}
					<Field label="Location">
						<Box display="flex" alignItems="center" gap="8">
							<Text fontSize="sm">{location.name}</Text>
							<LocationHelpPopover locationId={location.id} />
						</Box>
					</Field>

					{/* Actions buttons */}
					<Box display="flex" gap="8">
						<AgentPicker onAdd={handleAddAgent} excludeAgentIds={usedAgentIds}>
							<Button
								size="sm"
								appearance="default"
								icon={<IconPlus size={16} />}
							>
								Add Agent
							</Button>
						</AgentPicker>
					</Box>

					{/* Groups and agents section */}
					<Box>
						{editedLocation.groups.length === 0 ? (
							<Box
								p="24"
								border="1"
								borderColor="border.secondary"
								rounded="md"
								bg="bg.secondary"
								display="flex"
								flexDirection="column"
								alignItems="center"
								gap="8"
							>
								<Text color="fg.secondary" textAlign="center">
									No agents yet
								</Text>
								<Text fontSize="sm" color="fg.tertiary" textAlign="center">
									Add agents or groups to organize this location's menu
								</Text>
							</Box>
						) : (
							<Box display="flex" flexDirection="column" gap="4">
								{editedLocation.groups
									.sort((a, b) => a.order - b.order)
									.map((group, groupIndex) => (
										<React.Fragment key={group.id}>
											{/* Drop zone before group */}
											<Box
												style={{minHeight: "8px", position: "relative"}}
												onDragOver={(e) => {
													e.preventDefault();
													if (draggedAgentId || draggedGroupId) {
														setGroupDropIndex(groupIndex);
													}
												}}
												onDrop={handleGroupDrop}
											>
												{groupDropIndex === groupIndex && !agentDropTarget && (
													<Box
														style={{
															position: "absolute",
															top: "50%",
															left: 0,
															right: 0,
															height: "2px",
															transform: "translateY(-50%)",
															pointerEvents: "none",
														}}
														bg="bg.accent"
														rounded="full"
													/>
												)}
											</Box>

											<Box
												p="16"
												border="1"
												borderColor="border.secondary"
												rounded="md"
												bg="bg.secondary"
												display="flex"
												flexDirection="column"
												gap="12"
												draggable
												onDragStart={(e) => handleGroupDragStart(e, group.id)}
												onDragOver={(e) => handleGroupDragOver(e, group.id, groupIndex)}
												onDrop={handleGroupDrop}
												onDragEnd={handleGroupDragEnd}
												style={{
													cursor: "move",
													opacity: draggedGroupId === group.id ? 0.5 : 1,
												}}
											>
											{/* Group header */}
											<Box display="flex" alignItems="center" justifyContent="space-between">
												{renamingGroupId === group.id ? (
													<Input
														value={renameValue}
														onChange={(e) => setRenameValue(e.target.value)}
														onBlur={() => handleSaveRename(group.id)}
														onKeyDown={(e) => {
															if (e.key === "Enter") {
																handleSaveRename(group.id);
															} else if (e.key === "Escape") {
																setRenamingGroupId(null);
																setRenameValue("");
															}
														}}
														autoFocus
													/>
												) : (
													<Text
														fontSize="sm"
														fontWeight="600"
														color="fg.default"
														style={{cursor: "pointer"}}
														onClick={() => handleStartRename(group.id, group.name)}
													>
														{group.name}
													</Text>
												)}
												<Menu
													options={[
														{
															label: "Rename",
															execute: () => handleStartRename(group.id, group.name),
														},
														{
															label: "Remove",
															execute: () => handleRemoveGroup(group.id),
														},
													]}
												>
													<MenuTrigger asChild>
														<Button
															appearance="subtle"
															size="sm"
															icon={<IconEllipsisSolid size={16} />}
															aria-label="Group options"
														/>
													</MenuTrigger>
													<MenuContent />
												</Menu>
											</Box>

											{/* Agent cards */}
											<Box
												display="flex"
												flexDirection="column"
												gap="8"
												onDragOver={(e) => handleAgentDragOver(e, group.id)}
												onDrop={handleAgentDrop}
												style={{minHeight: "40px"}}
											>
												{group.agents.map((groupAgent, agentIndex) => {
													// Handle both old (string) and new (GroupAgent) formats
													const agentId = typeof groupAgent === "string" ? groupAgent : groupAgent.id;
													const agent = availableAgents.find((a) => a.id === agentId);
													// Ensure we're working with GroupAgent format
													const normalizedAgent: GroupAgent = typeof groupAgent === "string"
														? {id: groupAgent, permissions: ["Everyone"]}
														: groupAgent;
													return (
														<React.Fragment key={`${agentId}-${agentIndex}`}>
															{/* Insertion bar before agent */}
															{agentDropTarget?.groupId === group.id && agentDropTarget.agentIndex === agentIndex && (
																<Box style={{height: "2px", pointerEvents: "none"}} bg="bg.accent" rounded="full" mx="12" />
															)}

															<Box
																p="12"
																border="1"
																borderColor="border.secondary"
																rounded="md"
																bg="bg.default"
																display="flex"
																alignItems="center"
																justifyContent="space-between"
																draggable
																onDragStart={(e) => handleAgentDragStart(e, normalizedAgent.id, group.id)}
																onDragOver={(e) => handleAgentDragOver(e, group.id, normalizedAgent.id, agentIndex)}
																onDrop={handleAgentDrop}
																onDragEnd={handleAgentDragEnd}
																style={{
																	cursor: "move",
																	opacity: draggedAgentId === normalizedAgent.id ? 0.5 : 1,
																}}
															>
																<Box display="flex" alignItems="center" gap="12">
																	<IconGripVertical size={20} color="var(--ax-colors-fg-tertiary)" />
																	<Box display="flex" flexDirection="column" gap="4">
																		<Text fontSize="md">{agent?.name || normalizedAgent.id}</Text>
																		{normalizedAgent.permissions && normalizedAgent.permissions.length > 0 && (
																			<Box display="flex" gap="4" flexWrap="wrap">
																				{normalizedAgent.permissions.map((permission, idx) => (
																					<Badge key={`${permission}-${idx}`} intent="neutral" variant="subtle">
																						{permission}
																					</Badge>
																				))}
																			</Box>
																		)}
																	</Box>
																</Box>
																<Menu
																	options={[
																		{
																			execute: () => handleOpenPermissions(group.id, normalizedAgent.id),
																			label: "Permissions...",
																		},
																		{
																			execute: () => handleRemoveAgent(group.id, normalizedAgent.id),
																			intent: "danger",
																			label: "Remove",
																		},
																	]}
																>
																	<MenuTrigger asChild>
																		<Button
																			appearance="subtle"
																			size="sm"
																			icon={<IconEllipsisSolid size={16} />}
																			aria-label="Agent options"
																			onClick={(e) => e.stopPropagation()}
																		/>
																	</MenuTrigger>
																	<MenuContent />
																</Menu>
															</Box>

													</React.Fragment>
												)})}

												{/* Insertion bar after all agents */}
												{agentDropTarget?.groupId === group.id && agentDropTarget.agentIndex === group.agents.length && (
													<Box style={{height: "2px", pointerEvents: "none"}} bg="bg.accent" rounded="full" mx="12" />
												)}
											</Box>
										</Box>
									</React.Fragment>
								))}

								{/* Drop zone at the end */}
								<Box
									style={{minHeight: "8px", position: "relative"}}
									onDragOver={(e) => {
										e.preventDefault();
										if (draggedAgentId || draggedGroupId) {
											setGroupDropIndex(editedLocation.groups.length);
										}
									}}
									onDrop={handleGroupDrop}
								>
									{groupDropIndex === editedLocation.groups.length && !agentDropTarget && (
										<Box
											style={{
												position: "absolute",
												top: "0",
												left: 0,
												right: 0,
												height: "2px",
												pointerEvents: "none",
											}}
											bg="bg.accent"
											rounded="full"
										/>
									)}
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* Footer (sticky) */}
			<Box
				px="24"
				pb="24"
				pt="16"
				borderT="1"
				borderColor="border.secondary"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{flexShrink: 0}}
			>
				<Text fontSize="sm" color="fg.error">
					* Required Field
				</Text>
				<Box display="flex" gap="8">
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
						Save
					</Button>
				</Box>
			</Box>

			{/* Permissions Dialog */}
			<Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
				<DialogContent>
					<DialogHeader>Agent Permissions</DialogHeader>
					<DialogBody>
						<Text fontSize="sm" color="fg.secondary" mb="16">
							Select which user groups can see this agent:
						</Text>
						<Box display="flex" flexDirection="column" gap="12">
							{(["Everyone", "Editors", "Marketers", "Administrators", "Developers", "Designers"] as UserGroup[]).map(
								(userGroup) => (
									<Checkbox
										key={userGroup}
										checked={editingPermissions?.currentPermissions.includes(userGroup) || false}
										onCheckedChange={(checked) => {
											if (!editingPermissions) return;
											const newPermissions = checked
												? [...editingPermissions.currentPermissions, userGroup]
												: editingPermissions.currentPermissions.filter((p) => p !== userGroup);
											setEditingPermissions({
												...editingPermissions,
												currentPermissions: newPermissions,
											});
										}}
									>
										{userGroup}
									</Checkbox>
								)
							)}
						</Box>
					</DialogBody>
					<DialogFooter>
						<DialogClose asChild>
							<Button appearance="subtle">Cancel</Button>
						</DialogClose>
						<Button
							appearance="primary"
							onClick={() => {
								if (editingPermissions) {
									handleSavePermissions(editingPermissions.currentPermissions);
								}
							}}
							disabled={!editingPermissions?.currentPermissions.length}
						>
							Save Permissions
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
};
