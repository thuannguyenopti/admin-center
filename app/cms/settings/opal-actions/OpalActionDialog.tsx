"use client";

import {useState, useEffect} from "react";
import {
	Box,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Field,
	Checkbox,
	Text,
	Heading,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {OpalAction, availableAgents} from "./mockData";

interface OpalActionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: OpalAction | null;
	onSave: (action: Omit<OpalAction, "id" | "modified">) => void;
}

export default function OpalActionDialog({
	open,
	onOpenChange,
	action,
	onSave,
}: OpalActionDialogProps) {
	const [name, setName] = useState("");
	const [enabled, setEnabled] = useState(true);
	const [helpText, setHelpText] = useState("");
	const [contextMenu, setContextMenu] = useState(false);
	const [improveButton, setImproveButton] = useState(false);
	const [assetPanel, setAssetPanel] = useState(false);
	const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
	const [visibleAt, setVisibleAt] = useState<"Everyone" | "Editors" | "Administrators">(
		"Everyone"
	);
	const [toolbarExpanded, setToolbarExpanded] = useState(true);
	const [assetPanelExpanded, setAssetPanelExpanded] = useState(false);

	// Reset form when dialog opens/closes or action changes
	useEffect(() => {
		if (action) {
			setName(action.name);
			setEnabled(action.enabled);
			setHelpText(action.helpText || "");
			setContextMenu(action.locations.toolbar.contextMenu);
			setImproveButton(action.locations.toolbar.improveButton);
			setAssetPanel(action.locations.assetPanel);
			setSelectedAgents(action.agents);
			setVisibleAt(action.visibleAt);
		} else {
			setName("");
			setEnabled(true);
			setHelpText("");
			setContextMenu(false);
			setImproveButton(false);
			setAssetPanel(false);
			setSelectedAgents([]);
			setVisibleAt("Everyone");
		}
	}, [action, open]);

	const handleSave = () => {
		if (!name.trim()) return;

		onSave({
			name: name.trim(),
			enabled,
			helpText: helpText.trim() || undefined,
			locations: {
				toolbar: {
					contextMenu,
					improveButton,
				},
				assetPanel,
			},
			agents: selectedAgents,
			visibleAt,
		});
	};

	const toggleAgent = (agentId: string) => {
		setSelectedAgents((prev) =>
			prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
		);
	};

	// Group agents by category
	const agentsByCategory = availableAgents.reduce(
		(acc, agent) => {
			if (!acc[agent.category]) {
				acc[agent.category] = [];
			}
			acc[agent.category].push(agent);
			return acc;
		},
		{} as Record<string, typeof availableAgents>
	);

	const getLocationCount = () => {
		let count = 0;
		if (contextMenu || improveButton) count++;
		if (assetPanel) count++;
		return count;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>{action ? "Edit Opal Action" : "Add Opal Action"}</DialogHeader>
				<DialogBody>
					<Box display="flex" flexDirection="column" gap="16">
						{/* Name field */}
						<Field label="Name" required>
							<Input
								placeholder="e.g. GEO Optimization"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>

						{/* Enabled checkbox */}
						<Checkbox checked={enabled} onCheckedChange={(checked) => setEnabled(!!checked)}>
							Enabled
						</Checkbox>

						{/* Help Text field */}
						<Field label="Help Text" description="Optional description shown to users">
							<Input
								placeholder="e.g. Improve your content for search engines"
								value={helpText}
								onChange={(e) => setHelpText(e.target.value)}
							/>
						</Field>

						{/* Locations section */}
						<Box>
							<Heading level="4" mb="8">
								Locations
							</Heading>
							<Text fontSize="sm" color="fg.secondary" mb="12">
								Choose where this Opal Action CTA should appear ({getLocationCount()}{" "}
								location(s) selected)
							</Text>

							{/* Visual diagram placeholder */}
							<Box
								bg="bg.secondary"
								p="16"
								rounded="md"
								mb="12"
								display="flex"
								alignItems="center"
								justifyContent="center"
								style={{minHeight: "120px"}}
							>
								<Text fontSize="sm" color="fg.tertiary">
									Location diagram visual
								</Text>
							</Box>

							{/* Toolbar section */}
							<Box
								bg="bg.page"
								rounded="md"
								border="1"
								borderColor="border.tertiary"
								mb="8"
							>
								<Box
									p="12"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									cursor="pointer"
									onClick={() => setToolbarExpanded(!toolbarExpanded)}
								>
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="500">Toolbar</Text>
										<Text fontSize="sm" color="fg.secondary">
											{contextMenu || improveButton ? "2 locations" : "0 locations"}
										</Text>
									</Box>
									<Text fontSize="sm">{toolbarExpanded ? "▼" : "▶"}</Text>
								</Box>
								{toolbarExpanded && (
									<Box px="12" pb="12" display="flex" flexDirection="column" gap="8">
										<Checkbox
											checked={contextMenu}
											onCheckedChange={(checked) => setContextMenu(!!checked)}
										>
											Context Menu
										</Checkbox>
										<Checkbox
											checked={improveButton}
											onCheckedChange={(checked) => setImproveButton(!!checked)}
										>
											Improve Button
										</Checkbox>
									</Box>
								)}
							</Box>

							{/* Asset Panel section */}
							<Box
								bg="bg.page"
								rounded="md"
								border="1"
								borderColor="border.tertiary"
							>
								<Box
									p="12"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									cursor="pointer"
									onClick={() => setAssetPanelExpanded(!assetPanelExpanded)}
								>
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="500">Asset panel</Text>
										<Text fontSize="sm" color="fg.secondary">
											{assetPanel ? "3 locations" : "0 locations"}
										</Text>
									</Box>
									<Text fontSize="sm">{assetPanelExpanded ? "▼" : "▶"}</Text>
								</Box>
								{assetPanelExpanded && (
									<Box px="12" pb="12">
										<Checkbox
											checked={assetPanel}
											onCheckedChange={(checked) => setAssetPanel(!!checked)}
										>
											Show in Asset Panel
										</Checkbox>
									</Box>
								)}
							</Box>
						</Box>

						{/* Agents section */}
						<Box>
							<Heading level="4" mb="8">
								Agent(s)
							</Heading>
							<Text fontSize="sm" color="fg.secondary" mb="12">
								Select the agents to include in this action
							</Text>

							{Object.entries(agentsByCategory).map(([category, agents]) => {
								const selectedCount = agents.filter((a) =>
									selectedAgents.includes(a.id)
								).length;
								return (
									<Box key={category} mb="12">
										<Box
											display="flex"
											alignItems="center"
											gap="8"
											mb="8"
											pb="4"
											borderB="1"
											borderColor="border.tertiary"
										>
											<Text fontWeight="500" fontSize="sm">
												{category}
											</Text>
											<Text fontSize="sm" color="fg.secondary">
												{selectedCount} of {agents.length} agent(s)
											</Text>
										</Box>
										<Box display="flex" flexDirection="column" gap="8" pl="8">
											{agents.map((agent) => (
												<Checkbox
													key={agent.id}
													checked={selectedAgents.includes(agent.id)}
													onCheckedChange={() => toggleAgent(agent.id)}
												>
													{agent.name}
												</Checkbox>
											))}
										</Box>
									</Box>
								);
							})}
						</Box>
					</Box>
				</DialogBody>
				<DialogFooter>
					<DialogClose appearance="subtle">Cancel</DialogClose>
					<Button appearance="primary" onClick={handleSave} disabled={!name.trim()}>
						{action ? "Save" : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
